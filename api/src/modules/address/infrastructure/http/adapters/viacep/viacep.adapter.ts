import {
  AddressAdapter,
  findAddressInput,
} from '@/modules/address/domain/adapters/address.adapter';
import {
  Address,
  AddressData,
} from '@/modules/address/domain/entities/address.entity';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FindAddressResponse } from './interfaces/find-address-response.interface';

@Injectable()
export class ViaCepAdapter implements AddressAdapter {
  private readonly apiUrl = 'https://viacep.com.br/ws';

  constructor(private readonly httpService: HttpService) {}

  async findAddress(input: findAddressInput): Promise<AddressData> {
    try {
      const { zipCode } = input;

      const url = `${this.apiUrl}/${zipCode}/json/`;

      const response =
        await this.httpService.axiosRef.get<FindAddressResponse>(url);

      const data = response.data;

      if (data.erro) {
        throw new NotFoundException(
          `Address not found for the provided zip code: ${zipCode}`,
        );
      }

      const address = new Address({
        zipCode: data.cep,
        state: data.uf,
        city: data.localidade,
        neighborhood: data.bairro,
        street: data.logradouro,
      });

      return address.toJSON();
    } catch (error) {
      if (error.response?.status === 400) {
        throw new BadRequestException(
          `Invalid zip code format: ${input.zipCode}`,
        );
      }

      if (error.response?.status === 500) {
        throw new ServiceUnavailableException(
          `Failed to retrieve address data for the provided zip code: ${input.zipCode}`,
        );
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }
}

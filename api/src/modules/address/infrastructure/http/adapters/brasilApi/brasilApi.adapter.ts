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
export class BrasilApiAdapter implements AddressAdapter {
  private readonly apiUrl = 'https://brasilapi.com.br/api/cep/v1';

  constructor(private readonly httpService: HttpService) {}

  async findAddress(input: findAddressInput): Promise<AddressData> {
    try {
      const { zipCode } = input;

      const url = `${this.apiUrl}/${zipCode}`;

      const response =
        await this.httpService.axiosRef.get<FindAddressResponse>(url);

      const data = response.data;

      const address = new Address({
        zipCode: data.cep,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        street: data.street,
      });

      return address.toJSON();
    } catch (error) {
      if (error.response?.status === 400) {
        throw new BadRequestException(
          `Invalid zip code format: ${input.zipCode}`,
        );
      }

      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Address not found for the provided zip code: ${input.zipCode}`,
        );
      }

      if (error.response?.status === 500) {
        throw new ServiceUnavailableException(
          `Failed to retrieve address data for the provided zip code: ${input.zipCode}`,
        );
      }

      throw error;
    }
  }
}

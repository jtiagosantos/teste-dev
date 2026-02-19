import {
  AddressAdapter,
  findAddressInput,
} from '@/modules/address/domain/adapters/address.adapter';
import {
  Address,
  AddressData,
} from '@/modules/address/domain/entities/address.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { FindAddressResponse } from './interfaces/find-address-response.interface';

@Injectable()
export class BrasilApiAdapter implements AddressAdapter {
  private readonly apiUrl = 'https://brasilapi.com.br/api/cep/v1';

  constructor(private readonly httpService: HttpService) {}

  async findAddress(input: findAddressInput): Promise<AddressData> {
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
  }
}

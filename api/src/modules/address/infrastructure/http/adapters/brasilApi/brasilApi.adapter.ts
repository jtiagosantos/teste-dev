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
import {
  AddressNotFoundException,
  InvalidZipCodeException,
  AddressProviderTimeoutException,
  AddressProviderUnavailableException,
  RateLimitException,
  NetworkErrorException,
} from '@/modules/address/domain/exceptions/address.exceptions';
import { AxiosError } from 'axios';

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
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 400) {
        throw new InvalidZipCodeException(input.zipCode);
      }

      if (axiosError.response?.status === 404) {
        throw new AddressNotFoundException(input.zipCode);
      }

      if (axiosError.response?.status === 429) {
        throw new RateLimitException('BrasilAPI', input.zipCode);
      }

      if (
        axiosError.response?.status === 500 ||
        axiosError.response?.status === 503
      ) {
        throw new AddressProviderUnavailableException(
          'BrasilAPI',
          input.zipCode,
          'Service returned an error',
        );
      }

      if (
        axiosError.code === 'ETIMEDOUT' ||
        axiosError.code === 'ECONNABORTED'
      ) {
        throw new AddressProviderTimeoutException('BrasilAPI', input.zipCode);
      }

      const networkErrorCodes = [
        'ECONNREFUSED',
        'ENOTFOUND',
        'ECONNRESET',
        'ENETUNREACH',
        'EHOSTUNREACH',
      ];

      if (networkErrorCodes.includes(axiosError.code ?? '')) {
        throw new NetworkErrorException(
          'BrasilAPI',
          input.zipCode,
          axiosError.code,
        );
      }

      throw error;
    }
  }
}

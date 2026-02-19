import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AddressAdapter,
  findAddressInput,
} from '../../domain/adapters/address.adapter';
import { AddressData } from '../../domain/entities/address.entity';
import { AxiosError } from 'axios';

interface AdapterError {
  adapterName: string;
  error: AxiosError;
  timestamp: Date;
}

@Injectable()
export class AddressAdapterStrategy implements AddressAdapter {
  private currentIndex = 0;

  constructor(private readonly adapters: AddressAdapter[]) {}

  async findAddress(input: findAddressInput): Promise<AddressData> {
    const errors: AdapterError[] = [];

    for (let attempt = 0; attempt < this.adapters.length; attempt++) {
      const adapter = this.adapters[this.currentIndex];
      const adapterName = adapter.constructor.name;

      try {
        console.log(`Trying adapter: ${adapterName}`);

        const result = await adapter.findAddress(input);

        this.moveToNextAdapter();

        return result;
      } catch (error) {
        console.log(`Adapter ${adapter.constructor.name} failed:`, error);

        errors.push({
          adapterName,
          error,
          timestamp: new Date(),
        });

        this.moveToNextAdapter();
      }
    }

    this.handleAllFailures(errors, input.zipCode);
  }

  private moveToNextAdapter() {
    this.currentIndex = (this.currentIndex + 1) % this.adapters.length;
  }

  private handleAllFailures(errors: AdapterError[], zipCode: string): never {
    const allNotFound = errors.every((e) => this.isNotFoundError(e.error));

    if (allNotFound) {
      throw new NotFoundException({
        message: 'Address not found',
        detail: `No provider could find address for zipCode: ${zipCode}`,
        zipCode,
      });
    }

    const allTimeouts = errors.every((e) => this.isTimeoutError(e.error));

    if (allTimeouts) {
      throw new ServiceUnavailableException({
        message: 'All providers timed out',
        detail: 'Services are slow or unavailable. Please try again later',
        providers: errors.map((e) => e.adapterName),
        zipCode,
      });
    }

    const allNetworkErrors = errors.every((e) => this.isNetworkError(e.error));

    if (allNetworkErrors) {
      throw new ServiceUnavailableException({
        message: 'All providers are unreachable',
        detail:
          'Network connectivity issues. Please try again in a few moments',
        providers: errors.map((e) => e.adapterName),
        zipCode,
      });
    }

    const allRateLimited = errors.every((e) => this.isRateLimitError(e.error));

    if (allRateLimited) {
      throw new ServiceUnavailableException({
        message: 'Rate limit exceeded on all providers',
        detail: 'Too many requests. Please try again later',
        providers: errors.map((e) => e.adapterName),
        zipCode,
      });
    }

    throw new BadGatewayException({
      message: 'Unable to fetch address from any provider',
      detail: 'Multiple different errors occurred',
      errors: errors.map((e) => ({
        provider: e.adapterName,
        error: e.error.message,
        timestamp: e.timestamp,
      })),
      zipCode,
    });
  }

  private isNotFoundError(error: AxiosError): boolean {
    return (
      error.status === 404 ||
      error.response?.status === 404 ||
      error.message?.toLowerCase().includes('not found') ||
      error.message?.toLowerCase().includes('cep não encontrado')
    );
  }

  private isTimeoutError(error: AxiosError): boolean {
    return (
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      error.message?.toLowerCase().includes('timeout')
    );
  }

  private isNetworkError(error: AxiosError): boolean {
    const networkErrorCodes = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ECONNRESET',
      'ENETUNREACH',
      'EHOSTUNREACH',
    ];

    return (
      networkErrorCodes.includes(error.code ?? '') ||
      error.message?.toLowerCase().includes('network')
    );
  }

  private isRateLimitError(error: AxiosError): boolean {
    return (
      error.status === 429 ||
      error.response?.status === 429 ||
      error.message?.toLowerCase().includes('rate limit') ||
      error.message?.toLowerCase().includes('too many requests')
    );
  }
}

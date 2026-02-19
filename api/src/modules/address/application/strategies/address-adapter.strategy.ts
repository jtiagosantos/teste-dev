import { Injectable } from '@nestjs/common';
import {
  AddressAdapter,
  findAddressInput,
} from '../../domain/adapters/address.adapter';
import { AddressData } from '../../domain/entities/address.entity';
import { AxiosError } from 'axios';
import { LogExecution } from '@/shared/logging/decorators/log-execution.decorator';
import { Logger, LogStatus } from '@/shared/logging/logger';
import {
  AddressNotFoundException,
  AddressProviderTimeoutException,
  AddressProviderUnavailableException,
  RateLimitException,
  NetworkErrorException,
  AllProvidersFailedException,
  AllProvidersTimeoutException,
  AllProvidersUnavailableException,
  AllProvidersRateLimitedException,
} from '../../domain/exceptions/address.exceptions';

interface AdapterError {
  adapterName: string;
  error: AxiosError;
  timestamp: Date;
}

@Injectable()
export class AddressAdapterStrategy implements AddressAdapter {
  private currentIndex = 0;

  constructor(
    private readonly logger: Logger,
    private readonly adapters: AddressAdapter[],
  ) {}

  @LogExecution()
  async findAddress(input: findAddressInput): Promise<AddressData> {
    const errors: AdapterError[] = [];

    for (let attempt = 0; attempt < this.adapters.length; attempt++) {
      const adapter = this.adapters[this.currentIndex];
      const adapterName = adapter.constructor.name;

      try {
        this.logger.log({
          message: `Attempting to fetch address using adapter: ${adapterName}`,
          origin: this.constructor.name,
          action: 'findAddress',
          status: LogStatus.STARTED,
          payload: { input },
        });

        const result = await adapter.findAddress(input);

        this.moveToNextAdapter();

        return result;
      } catch (error) {
        this.logger.error({
          message: `Failed to fetch address using adapter: ${adapterName}`,
          origin: this.constructor.name,
          action: 'findAddress',
          status: LogStatus.FAILED,
          payload: {
            input,
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
          },
        });

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
      throw new AddressNotFoundException(zipCode);
    }

    const allTimeouts = errors.every((e) => this.isTimeoutError(e.error));

    if (allTimeouts) {
      throw new AllProvidersTimeoutException(
        zipCode,
        errors.map((e) => e.adapterName),
      );
    }

    const allNetworkErrors = errors.every((e) => this.isNetworkError(e.error));

    if (allNetworkErrors) {
      throw new AllProvidersUnavailableException(
        zipCode,
        errors.map((e) => e.adapterName),
      );
    }

    const allRateLimited = errors.every((e) => this.isRateLimitError(e.error));

    if (allRateLimited) {
      throw new AllProvidersRateLimitedException(
        zipCode,
        errors.map((e) => e.adapterName),
      );
    }

    throw new AllProvidersFailedException(
      zipCode,
      errors.map((e) => ({
        provider: e.adapterName,
        error: e.error.message,
        timestamp: e.timestamp,
      })),
    );
  }

  private isNotFoundError(error: any): boolean {
    if (error instanceof AddressNotFoundException) {
      return true;
    }

    const axiosError = error as AxiosError;
    return (
      axiosError.status === 404 ||
      axiosError.response?.status === 404 ||
      axiosError.message?.toLowerCase().includes('not found') ||
      axiosError.message?.toLowerCase().includes('cep não encontrado')
    );
  }

  private isTimeoutError(error: any): boolean {
    if (error instanceof AddressProviderTimeoutException) {
      return true;
    }

    const axiosError = error as AxiosError;
    return (
      axiosError.code === 'ETIMEDOUT' ||
      axiosError.code === 'ECONNABORTED' ||
      axiosError.message?.toLowerCase().includes('timeout')
    );
  }

  private isNetworkError(error: any): boolean {
    if (
      error instanceof NetworkErrorException ||
      error instanceof AddressProviderUnavailableException
    ) {
      return true;
    }

    const axiosError = error as AxiosError;
    const networkErrorCodes = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ECONNRESET',
      'ENETUNREACH',
      'EHOSTUNREACH',
    ];

    return (
      networkErrorCodes.includes(axiosError.code ?? '') ||
      axiosError.message?.toLowerCase().includes('network')
    );
  }

  private isRateLimitError(error: any): boolean {
    if (error instanceof RateLimitException) {
      return true;
    }

    const axiosError = error as AxiosError;
    return (
      axiosError.status === 429 ||
      axiosError.response?.status === 429 ||
      axiosError.message?.toLowerCase().includes('rate limit') ||
      axiosError.message?.toLowerCase().includes('too many requests')
    );
  }
}

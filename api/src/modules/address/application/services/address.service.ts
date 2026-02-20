import { Inject, Injectable } from '@nestjs/common';
import {
  AddressAdapter,
  findAddressInput,
} from '../../domain/adapters/address.adapter';
import { AddressData } from '../../domain/entities/address.entity';
import { LogExecution } from '@/shared/logging/decorators/log-execution.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger, LogStatus } from '@/shared/logging/logger';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressAdapter: AddressAdapter,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  @LogExecution()
  async findAddress(input: findAddressInput): Promise<AddressData> {
    const addressInCache = await this.cacheManager.get<AddressData>(
      input.zipCode,
    );

    if (addressInCache) {
      this.logger.log({
        message: `Address found in cache for zipCode: ${input.zipCode}`,
        origin: this.constructor.name,
        action: 'findAddress',
        status: LogStatus.FINISHED,
        payload: {
          input,
          output: addressInCache,
        },
      });

      return addressInCache;
    }

    const address = await this.addressAdapter.findAddress(input);

    const cacheTtl = this.configService.get<number>('CACHE_TTL_MS');

    await this.cacheManager.set(input.zipCode, address, cacheTtl);

    this.logger.log({
      message: `Address cached for zipCode: ${input.zipCode}`,
      origin: this.constructor.name,
      action: 'findAddress',
      status: LogStatus.FINISHED,
      payload: {
        input,
        output: address,
      },
    });

    return address;
  }
}

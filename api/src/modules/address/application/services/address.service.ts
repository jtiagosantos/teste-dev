import { Injectable } from '@nestjs/common';
import {
  AddressAdapter,
  findAddressInput,
} from '../../domain/adapters/address.adapter';
import { AddressData } from '../../domain/entities/address.entity';
import { LogExecution } from '@/shared/logging/decorators/log-execution.decorator';

@Injectable()
export class AddressService {
  constructor(private readonly addressAdapter: AddressAdapter) {}

  @LogExecution()
  async findAddress(input: findAddressInput): Promise<AddressData> {
    return this.addressAdapter.findAddress(input);
  }
}

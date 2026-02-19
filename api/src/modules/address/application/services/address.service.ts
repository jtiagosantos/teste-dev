import { Injectable } from '@nestjs/common';
import {
  AddressAdapter,
  findAddressInput,
} from '../../domain/adapters/address.adapter';
import { AddressData } from '../../domain/entities/address.entity';

@Injectable()
export class AddressService {
  constructor(private readonly addressAdapter: AddressAdapter) {}

  async findAddress(input: findAddressInput): Promise<AddressData> {
    return this.addressAdapter.findAddress(input);
  }
}

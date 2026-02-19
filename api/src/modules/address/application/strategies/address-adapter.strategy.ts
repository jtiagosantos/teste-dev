import { BadGatewayException, Injectable } from '@nestjs/common';
import {
  AddressAdapter,
  findAddressInput,
} from '../../domain/adapters/address.adapter';
import { AddressData } from '../../domain/entities/address.entity';

@Injectable()
export class AddressAdapterStrategy implements AddressAdapter {
  private currentIndex = 0;

  constructor(private readonly adapters: AddressAdapter[]) {}

  async findAddress(input: findAddressInput): Promise<AddressData> {
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

        this.moveToNextAdapter();
      }
    }

    console.log('All adapters have been tried and failed for input:', input);

    throw new BadGatewayException('All adapters failed to find address');
  }

  private moveToNextAdapter() {
    this.currentIndex = (this.currentIndex + 1) % this.adapters.length;
  }
}

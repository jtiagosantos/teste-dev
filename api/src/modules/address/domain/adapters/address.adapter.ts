import { AddressData } from '../entities/address.entity';

export interface findAddressInput {
  zipCode: string;
}

export abstract class AddressAdapter {
  abstract findAddress(input: findAddressInput): Promise<AddressData>;
}

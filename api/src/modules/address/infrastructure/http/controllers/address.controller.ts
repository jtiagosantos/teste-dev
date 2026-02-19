import { AddressData } from '@/modules/address/domain/entities/address.entity';
import { Controller, Get, Param } from '@nestjs/common';
import { AddressService } from '../../../application/services/address.service';
import { FindAddressDto } from './dtos/find-address.dto';

@Controller()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('/cep/:zipCode')
  async findAddress(@Param() params: FindAddressDto): Promise<AddressData> {
    return this.addressService.findAddress({ zipCode: params.zipCode });
  }
}

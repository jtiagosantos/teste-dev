import { Module } from '@nestjs/common';
import { AddressController } from './infrastructure/http/controllers/address.controller';
import { AddressService } from './application/services/address.service';
import { ViaCepAdapter } from './infrastructure/http/adapters/viacep/viacep.adapter';
import { HttpModule } from '@nestjs/axios';
import { AddressAdapter } from './domain/adapters/address.adapter';

@Module({
  imports: [HttpModule],
  controllers: [AddressController],
  providers: [
    AddressService,
    {
      provide: AddressAdapter,
      useClass: ViaCepAdapter,
    },
  ],
})
export class AddressModule {}

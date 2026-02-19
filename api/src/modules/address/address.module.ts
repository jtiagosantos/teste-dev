import { Module } from '@nestjs/common';
import { AddressController } from './infrastructure/http/controllers/address.controller';
import { AddressService } from './application/services/address.service';
import { ViaCepAdapter } from './infrastructure/http/adapters/viacep/viacep.adapter';
import { HttpModule } from '@nestjs/axios';
import { AddressAdapter } from './domain/adapters/address.adapter';
import { BrasilApiAdapter } from './infrastructure/http/adapters/brasilApi/brasilApi.adapter';
import { AddressAdapterStrategy } from './application/strategies/address-adapter.strategy';
import { Logger } from '@/shared/logging/logger';
import { LoggingModule } from '@/shared/logging/logging.module';

@Module({
  imports: [HttpModule, LoggingModule],
  controllers: [AddressController],
  providers: [
    AddressService,
    ViaCepAdapter,
    BrasilApiAdapter,
    {
      provide: AddressAdapter,
      useFactory: (
        logger: Logger,
        viaCep: ViaCepAdapter,
        brasilApi: BrasilApiAdapter,
      ) => {
        return new AddressAdapterStrategy(logger, [viaCep, brasilApi]);
      },
      inject: [Logger, ViaCepAdapter, BrasilApiAdapter],
    },
  ],
})
export class AddressModule {}

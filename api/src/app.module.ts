import { Module } from '@nestjs/common';
import { AddressModule } from './modules/address/address.module';

@Module({
  imports: [AddressModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

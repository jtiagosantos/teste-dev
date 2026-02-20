import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressModule } from './modules/address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

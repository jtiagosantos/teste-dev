import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class FindAddressDto {
  @ApiProperty({
    description: 'Brazilian ZIP code (CEP - Código de Endereçamento Postal)',
    example: '01310100',
    pattern: '^\\d{8}$',
    minLength: 8,
    maxLength: 8,
  })
  @IsString()
  @Length(8, 8, { message: 'zipCode parameter must be exactly 8 digits' })
  @Matches(/^\d{8}$/, {
    message: 'zipCode parameter must contain only numbers',
  })
  zipCode: string;
}

import { IsString, Length, Matches } from 'class-validator';

export class FindAddressDto {
  @IsString()
  @Length(8, 8, { message: 'zipCode parameter must be exactly 8 digits' })
  @Matches(/^\d{8}$/, {
    message: 'zipCode parameter must contain only numbers',
  })
  zipCode: string;
}

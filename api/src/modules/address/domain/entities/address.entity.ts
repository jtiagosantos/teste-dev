import { ApiProperty } from '@nestjs/swagger';

export class AddressData {
  @ApiProperty({
    description: 'ZIP code (CEP)',
    example: '01310100',
  })
  zipCode: string;

  @ApiProperty({
    description: 'Street name',
    example: 'Avenida Paulista',
  })
  street: string;

  @ApiProperty({
    description: 'Neighborhood',
    example: 'Bela Vista',
  })
  neighborhood: string;

  @ApiProperty({
    description: 'City',
    example: 'São Paulo',
  })
  city: string;

  @ApiProperty({
    description: 'State abbreviation',
    example: 'SP',
  })
  state: string;
}

export class Address {
  constructor(private readonly data: AddressData) {}

  get zipCode(): string {
    return this.data.zipCode;
  }

  get state(): string {
    return this.data.state;
  }

  get city(): string {
    return this.data.city;
  }

  get neighborhood(): string {
    return this.data.neighborhood;
  }

  get street(): string {
    return this.data.street;
  }

  toJSON(): AddressData {
    const zipCode = this.formatZipCode(this.zipCode);

    return {
      zipCode,
      state: this.state,
      city: this.city,
      neighborhood: this.neighborhood,
      street: this.street,
    };
  }

  private formatZipCode(zipCode: string): string {
    return zipCode.replace(/\D/g, '');
  }
}

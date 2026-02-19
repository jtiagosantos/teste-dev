export interface AddressData {
  zipCode: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
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

export interface FindAddressResponse {
  cep: string;
  uf: string;
  localidade: string;
  bairro: string;
  logradouro: string;
  erro?: string;
}

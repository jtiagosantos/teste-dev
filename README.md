# Teste Técnico - NestJS

## Objetivo
Criar uma API REST em NestJS que alterne aleatoriamente entre duas APIs de CEP (ViaCEP e BrasilAPI) e retorne os dados em um formato padronizado.

## APIs a serem utilizadas
- ViaCEP: `https://viacep.com.br/ws/{cep}/json/`
- BrasilAPI: `https://brasilapi.com.br/api/cep/v1/{cep}`

## Requisitos

### Endpoint
- GET `/cep/{cep}`
- Deve alternar aleatoriamente entre as duas APIs
- Em caso de falha em uma API, deve tentar a outra automaticamente

### Contrato de Resposta
- O candidato deve definir um contrato de resposta que unifique os dados das duas APIs
- O contrato deve ser documentado e tipado usando TypeScript

## Pontos de Avaliação
1. Funcionamento da aplicação
2. Design Patterns utilizados
3. Tratamento de erros
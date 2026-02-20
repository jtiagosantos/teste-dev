import { AddressData } from '@/modules/address/domain/entities/address.entity';
import { Controller, Get, Param } from '@nestjs/common';
import { AddressService } from '../../../application/services/address.service';
import { FindAddressDto } from './dtos/find-address.dto';
import { LogExecution } from '@/shared/logging/decorators/log-execution.decorator';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('address')
@Controller()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('/cep/:zipCode')
  @ApiOperation({
    summary: 'Find address by ZIP code',
    description: 'Queries address information using the ZIP code (CEP)',
  })
  @ApiParam({
    name: 'zipCode',
    description: 'Brazilian ZIP code with 8 digits (numbers only)',
    example: '01310100',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Address found successfully',
    type: AddressData,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ZIP code format',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'zipCode parameter must contain only numbers',
          'zipCode parameter must be exactly 8 digits',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found in any provider',
    schema: {
      example: {
        statusCode: 404,
        message: 'Address not found',
        error: 'Not Found',
        detail: 'No provider could find address for zipCode: 00000000',
        zipCode: '00000000',
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded on all providers',
    schema: {
      example: {
        statusCode: 429,
        message: 'Rate limit exceeded on all providers',
        error: 'Too Many Requests',
        detail: 'Too many requests on all providers. Please try again later',
        zipCode: '01310100',
        providers: ['ViaCepAdapter', 'BrasilApiAdapter'],
      },
    },
  })
  @ApiResponse({
    status: 502,
    description: 'All providers failed with different errors',
    schema: {
      example: {
        statusCode: 502,
        message: 'All address providers failed',
        error: 'Bad Gateway',
        detail:
          'Unable to fetch address from any provider. Multiple different errors occurred',
        zipCode: '01310100',
        errors: [
          {
            provider: 'ViaCepAdapter',
            error: 'Network error',
            timestamp: '2026-02-20T12:00:00.000Z',
          },
          {
            provider: 'BrasilApiAdapter',
            error: 'Service unavailable',
            timestamp: '2026-02-20T12:00:01.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'All providers timed out or unavailable',
    schema: {
      example: {
        timeout: {
          summary: 'All providers timed out',
          value: {
            statusCode: 503,
            message: 'All providers timed out',
            error: 'Service Unavailable',
            detail:
              'All services are slow or unavailable. Please try again later',
            zipCode: '01310100',
            providers: ['ViaCepAdapter', 'BrasilApiAdapter'],
          },
        },
        unreachable: {
          summary: 'All providers unreachable',
          value: {
            statusCode: 503,
            message: 'All providers are unreachable',
            error: 'Service Unavailable',
            detail:
              'Network connectivity issues with all providers. Please try again in a few moments',
            zipCode: '01310100',
            providers: ['ViaCepAdapter', 'BrasilApiAdapter'],
          },
        },
      },
    },
  })
  @LogExecution()
  async findAddress(@Param() params: FindAddressDto): Promise<AddressData> {
    return this.addressService.findAddress({ zipCode: params.zipCode });
  }
}

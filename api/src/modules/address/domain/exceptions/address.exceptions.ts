import { HttpException, HttpStatus } from '@nestjs/common';

export class AddressNotFoundException extends HttpException {
  constructor(zipCode: string, detail?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Address not found',
        error: 'Not Found',
        detail:
          detail || `No provider could find address for zipCode: ${zipCode}`,
        zipCode,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InvalidZipCodeException extends HttpException {
  constructor(zipCode: string, detail?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid zip code format',
        error: 'Bad Request',
        detail: detail || `The provided zip code is invalid: ${zipCode}`,
        zipCode,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AddressProviderTimeoutException extends HttpException {
  constructor(provider: string, zipCode: string) {
    super(
      {
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        message: 'Address provider timeout',
        error: 'Request Timeout',
        detail: `Timeout while fetching address from provider: ${provider}`,
        provider,
        zipCode,
      },
      HttpStatus.REQUEST_TIMEOUT,
    );
  }
}

export class AddressProviderUnavailableException extends HttpException {
  constructor(provider: string, zipCode: string, detail?: string) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Address provider unavailable',
        error: 'Service Unavailable',
        detail:
          detail ||
          `Failed to retrieve address data from provider: ${provider}`,
        provider,
        zipCode,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class RateLimitException extends HttpException {
  constructor(provider: string, zipCode: string) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Rate limit exceeded',
        error: 'Too Many Requests',
        detail: `Rate limit exceeded on provider: ${provider}. Please try again later`,
        provider,
        zipCode,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class NetworkErrorException extends HttpException {
  constructor(provider: string, zipCode: string, errorCode?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Network error',
        error: 'Bad Gateway',
        detail: `Network connectivity issues with provider: ${provider}`,
        provider,
        zipCode,
        errorCode,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

export class AllProvidersFailedException extends HttpException {
  constructor(
    zipCode: string,
    errors: Array<{ provider: string; error: string; timestamp: Date }>,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'All address providers failed',
        error: 'Bad Gateway',
        detail:
          'Unable to fetch address from any provider. Multiple different errors occurred',
        zipCode,
        errors,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

export class AllProvidersTimeoutException extends HttpException {
  constructor(zipCode: string, providers: string[]) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'All providers timed out',
        error: 'Service Unavailable',
        detail: 'All services are slow or unavailable. Please try again later',
        zipCode,
        providers,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class AllProvidersUnavailableException extends HttpException {
  constructor(zipCode: string, providers: string[]) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'All providers are unreachable',
        error: 'Service Unavailable',
        detail:
          'Network connectivity issues with all providers. Please try again in a few moments',
        zipCode,
        providers,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class AllProvidersRateLimitedException extends HttpException {
  constructor(zipCode: string, providers: string[]) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Rate limit exceeded on all providers',
        error: 'Too Many Requests',
        detail: 'Too many requests on all providers. Please try again later',
        zipCode,
        providers,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

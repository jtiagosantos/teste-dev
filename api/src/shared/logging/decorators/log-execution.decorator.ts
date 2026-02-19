import { Logger, LogStatus } from '../logger';

export interface LogExecutionOptions {
  includeInput?: boolean;
  includeOutput?: boolean;
}

let loggerInstance: Logger;

export function setLoggerInstance(logger: Logger) {
  loggerInstance = logger;
}

export function LogExecution(
  options: LogExecutionOptions = { includeInput: true, includeOutput: true },
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: unknown[]) {
      if (!loggerInstance) {
        console.warn(
          `Logger instance not found. Make sure to call setLoggerInstance in your application bootstrap.`,
        );

        return originalMethod.apply(this, args);
      }

      const payload: Record<string, unknown> = {};

      if (options.includeInput) {
        payload.input = args;
      }

      loggerInstance.log({
        message: `Started execution of ${propertyKey}`,
        origin: className,
        action: propertyKey,
        status: LogStatus.STARTED,
        payload,
      });

      try {
        const result = await originalMethod.apply(this, args);

        const successPayload = { ...payload };
        if (options.includeOutput) {
          successPayload.output = result;
        }

        loggerInstance.log({
          message: `Finished execution of ${propertyKey}`,
          origin: className,
          action: propertyKey,
          status: LogStatus.FINISHED,
          payload: successPayload,
        });

        return result;
      } catch (error) {
        loggerInstance.error({
          message: `Failed execution of ${propertyKey}: ${error.message}`,
          origin: className,
          action: propertyKey,
          status: LogStatus.FAILED,
          payload: {
            ...payload,
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
          },
        });

        throw error;
      }
    };

    return descriptor;
  };
}

import { useState, useCallback } from 'react';
import { useConsoleCapture } from './useConsoleCapture';
import { transformAndSanitizeCode } from '../utils/codeTransform';

export const useCodeExecution = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const { captureConsole } = useConsoleCapture();

  const executeCode = useCallback(
    async (code: string) => {
      setIsLoading(true);
      setResult(null);
      setError(null);
      setConsoleOutput([]);

      const logs: string[] = [];
      const restoreConsole = captureConsole((message) => logs.push(message));

      try {
        const sanitizationResult = transformAndSanitizeCode(code);

        if (!sanitizationResult.isValid) {
          const errorMessages = sanitizationResult.errors
            .map((err) => {
              if (err.line) {
                return `Line ${err.line}: ${err.message}`;
              }
              return err.message;
            })
            .join('\n');

          setError(`Code validation failed:\n${errorMessages}`);
          setConsoleOutput(logs);
          return;
        }

        const { base } = await import('@base-org/account');

        const realBase = {
          subscription: {
            subscribe: async (options: any) => {
              return await base.subscription.subscribe(options);
            },
            getStatus: async (options: any) => {
              return await base.subscription.getStatus(options);
            },
            charge: async (options: any) => {
              const response = await fetch('/api/charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscriptionId: options.subscriptionId || options.id,
                  amount: options.amount,
                  recipient: options.recipient,
                  testnet: options.testnet,
                }),
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to charge subscription');
              }
              
              return await response.json();
            },
            revoke: async (options: any) => {
              const response = await fetch('/api/revoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscriptionId: options.subscriptionId || options.id,
                  testnet: options.testnet,
                }),
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to revoke subscription');
              }
              
              return await response.json();
            },
            getOrCreateSubscriptionOwnerWallet: async (options: any) => {
              const response = await fetch('/api/create-wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create/retrieve wallet');
              }
              
              return await response.json();
            },
          },
        };

        const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

        const context = {
          base: realBase,
        };

        const sanitizedCode = sanitizationResult.code;

        const userFunction = new AsyncFunction(...Object.keys(context), sanitizedCode);

        const executionResult = await userFunction(...Object.values(context));

        setResult(executionResult);
        setConsoleOutput(logs);
      } catch (error) {
        interface ErrorDetails {
          message: string;
          type: string;
          details?: unknown;
          code?: string | number;
          response?: unknown;
          statusCode?: number;
          stack?: string;
        }
        let errorDetails: ErrorDetails = {
          message: 'Unknown error occurred',
          type: 'unknown',
          details: null,
        };

        if (error instanceof Error) {
          errorDetails.message = error.message;
          errorDetails.type = error.name || 'Error';

          const errorObj = error as {
            code?: string | number;
            details?: unknown;
            response?: unknown;
            statusCode?: number;
          };
          if (errorObj.code) {
            errorDetails.code = errorObj.code;
          }
          if (errorObj.details) {
            errorDetails.details = errorObj.details;
          }
          if (errorObj.response) {
            errorDetails.response = errorObj.response;
          }
          if (errorObj.statusCode) {
            errorDetails.statusCode = errorObj.statusCode;
          }

          if (process.env.NODE_ENV === 'development' && error.stack) {
            errorDetails.stack = error.stack;
          }
        } else if (typeof error === 'string') {
          errorDetails.message = error;
          errorDetails.type = 'string';
        } else if (error && typeof error === 'object') {
          errorDetails = {
            ...errorDetails,
            ...error,
            message: (error as { message?: string }).message || JSON.stringify(error),
          };
        }

        setError(JSON.stringify(errorDetails));
        setConsoleOutput(logs);
      } finally {
        restoreConsole();
        setIsLoading(false);
      }
    },
    [captureConsole]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setConsoleOutput([]);
  }, []);

  return {
    isLoading,
    result,
    error,
    consoleOutput,
    executeCode,
    reset,
  };
};

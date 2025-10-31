import { useCallback } from 'react';

/**
 * Hook to capture console output during code execution
 */
export const useConsoleCapture = () => {
  const captureConsole = useCallback((onMessage: (message: string) => void) => {
    // Store original console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Override console methods
    console.log = (...args: unknown[]) => {
      onMessage(`[LOG] ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`);
      originalLog.apply(console, args);
    };

    console.error = (...args: unknown[]) => {
      onMessage(`[ERROR] ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`);
      originalError.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      onMessage(`[WARN] ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`);
      originalWarn.apply(console, args);
    };

    console.info = (...args: unknown[]) => {
      onMessage(`[INFO] ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`);
      originalInfo.apply(console, args);
    };

    // Return a function to restore console methods
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  return { captureConsole };
};



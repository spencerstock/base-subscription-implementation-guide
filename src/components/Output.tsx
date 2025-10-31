import styles from './Output.module.css';

interface OutputProps {
  result: any;
  error: string | null;
  consoleOutput: string[];
  isLoading: boolean;
  code?: string;
  showConsoleOutput?: boolean;
}

// Helper to extract transaction hash from result
const getTransactionHash = (result: any): string | null => {
  if (!result) return null;
  
  // Check for transactionHash field (from charge)
  if (result.transactionHash) {
    return result.transactionHash;
  }
  
  // Check for revokeResult.id field (from revoke)
  if (result.revokeResult?.id) {
    return result.revokeResult.id;
  }
  
  return null;
};

// Helper to extract testnet flag from code
const isTestnet = (code?: string): boolean => {
  if (!code) return true; // default to testnet
  
  // Look for testnet: false
  const testnetFalseMatch = code.match(/testnet:\s*false/);
  if (testnetFalseMatch) {
    return false;
  }
  
  // Default to true (testnet)
  return true;
};

export const Output = ({ result, error, consoleOutput, isLoading, code, showConsoleOutput = false }: OutputProps) => {
  const txHash = getTransactionHash(result);
  const isTestnetTx = isTestnet(code);
  
  const getBlockExplorerUrl = (hash: string) => {
    const baseUrl = isTestnetTx 
      ? 'https://sepolia.basescan.org/tx/'
      : 'https://basescan.org/tx/';
    return `${baseUrl}${hash}`;
  };

  return (
    <div className={styles.outputPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M9 9l6 6" />
            <path d="M15 9l-6 6" />
          </svg>
          Output
        </h2>
      </div>

      <div className={styles.outputContent}>
        {showConsoleOutput && consoleOutput.length > 0 && (
          <div className={`${styles.resultCard} ${styles.console}`}>
            <div className={styles.resultHeader}>Console Output</div>
            <div className={styles.resultBody}>
              <pre className={styles.consoleOutput}>
                {consoleOutput.join('\n')}
              </pre>
            </div>
          </div>
        )}

        {error && (
          <div className={`${styles.resultCard} ${styles.error}`}>
            <div className={styles.resultBody}>
              <pre className={styles.jsonOutput}>{error}</pre>
            </div>
          </div>
        )}

        {!error && result && (
          <>
            <div className={`${styles.resultCard} ${styles.info}`}>
              <div className={styles.resultBody}>
                <pre className={styles.jsonOutput}>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
            {txHash && (
              <a 
                href={getBlockExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.explorerButton}
              >
                <svg 
                  className={styles.explorerIcon}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <path d="M15 3h6v6"/>
                  <path d="M10 14L21 3"/>
                </svg>
                View on Block Explorer
              </a>
            )}
          </>
        )}

        {!result && !error && !isLoading && consoleOutput.length === 0 && (
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
            <p>Click &quot;Execute Code&quot; to run your code</p>
          </div>
        )}
      </div>
    </div>
  );
};



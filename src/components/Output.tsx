import styles from './Output.module.css';

interface OutputProps {
  result: any;
  error: string | null;
  consoleOutput: string[];
  isLoading: boolean;
}

export const Output = ({ result, error, consoleOutput, isLoading }: OutputProps) => {
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
        {error && (
          <div className={`${styles.resultCard} ${styles.error}`}>
            <div className={styles.resultBody}>
              <pre className={styles.jsonOutput}>{error}</pre>
            </div>
          </div>
        )}

        {!error && result && (
          <div className={`${styles.resultCard} ${styles.info}`}>
            <div className={styles.resultBody}>
              <pre className={styles.jsonOutput}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}

        {!result && !error && !isLoading && (
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



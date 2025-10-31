import { useEffect, useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { Output } from '../components/Output';
import {
  DEFAULT_BE_GET_OR_CREATE_WALLET_CODE,
  DEFAULT_FE_SUBSCRIBE_CODE,
  DEFAULT_FE_GET_STATUS_CODE,
  DEFAULT_BE_CHARGE_CODE,
  DEFAULT_BE_GET_STATUS_CODE,
  DEFAULT_BE_REVOKE_CODE,
  BE_GET_OR_CREATE_WALLET_TIPS,
  FE_SUBSCRIBE_TIPS,
  FE_GET_STATUS_TIPS,
  BE_CHARGE_TIPS,
  BE_GET_STATUS_TIPS,
  BE_REVOKE_TIPS,
} from '../constants';
import { useCodeExecution } from '../hooks/useCodeExecution';
import styles from '../styles/Home.module.css';

export default function Home() {
  // Backend wallet state
  const [beGetOrCreateWalletCode, setBeGetOrCreateWalletCode] = useState(DEFAULT_BE_GET_OR_CREATE_WALLET_CODE);
  
  // Frontend state
  const [feSubscribeCode, setFeSubscribeCode] = useState(DEFAULT_FE_SUBSCRIBE_CODE);
  const [feGetStatusCode, setFeGetStatusCode] = useState(DEFAULT_FE_GET_STATUS_CODE);
  
  // Backend state
  const [beChargeCode, setBeChargeCode] = useState(DEFAULT_BE_CHARGE_CODE);
  const [beGetStatusCode, setBeGetStatusCode] = useState(DEFAULT_BE_GET_STATUS_CODE);
  const [beRevokeCode, setBeRevokeCode] = useState(DEFAULT_BE_REVOKE_CODE);

  // Shared state
  const [subscriptionOwnerWallet, setSubscriptionOwnerWallet] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [showEnvSetup, setShowEnvSetup] = useState(true);

  // Code execution hooks
  const beGetOrCreateWalletExecution = useCodeExecution();
  const feSubscribeExecution = useCodeExecution();
  const feGetStatusExecution = useCodeExecution();
  const beChargeExecution = useCodeExecution();
  const beGetStatusExecution = useCodeExecution();
  const beRevokeExecution = useCodeExecution();

  // Watch for wallet creation
  useEffect(() => {
    if (
      beGetOrCreateWalletExecution.result &&
      'address' in beGetOrCreateWalletExecution.result &&
      beGetOrCreateWalletExecution.result.address
    ) {
      const address = beGetOrCreateWalletExecution.result.address as string;
      setSubscriptionOwnerWallet(address);
    }
  }, [beGetOrCreateWalletExecution.result]);

  // Watch for successful subscription on frontend
  useEffect(() => {
    if (
      feSubscribeExecution.result &&
      'id' in feSubscribeExecution.result &&
      feSubscribeExecution.result.id
    ) {
      const subId = feSubscribeExecution.result.id as string;
      setSubscriptionId(subId);
      
      // Update FE getStatus code
      const updatedFeCode = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.getStatus({
    id: '${subId}', // Auto-filled from subscription
    testnet: true
  })
  
  return result;
} catch (error) {
  console.error('Failed to check subscription status:', error.message);
  throw error;
}`;
      setFeGetStatusCode(updatedFeCode);
    }
  }, [feSubscribeExecution.result]);

  // Pass subscription owner wallet to frontend
  const handlePassWalletToFrontend = () => {
    if (!subscriptionOwnerWallet) {
      alert('Please enter a subscription owner wallet address first');
      return;
    }
    
    const updatedCode = feSubscribeCode.replace(
      /subscriptionOwner:\s*["'][^"']*["']/,
      `subscriptionOwner: "${subscriptionOwnerWallet}"`
    );
    setFeSubscribeCode(updatedCode);
  };

  // Pass subscription ID to backend
  const handlePassIdToBackend = () => {
    if (!subscriptionId) {
      alert('Please create a subscription first');
      return;
    }
    
    // Update BE charge code
    const updatedChargeCode = beChargeCode.replace(
      /subscriptionId:\s*["'][^"']*["']/,
      `subscriptionId: "${subscriptionId}"`
    );
    setBeChargeCode(updatedChargeCode);
    
    // Update BE getStatus code
    const updatedStatusCode = beGetStatusCode.replace(
      /id:\s*["'][^"']*["']/,
      `id: "${subscriptionId}"`
    );
    setBeGetStatusCode(updatedStatusCode);
    
    // Update BE revoke code
    const updatedRevokeCode = beRevokeCode.replace(
      /subscriptionId:\s*["'][^"']*["']/,
      `subscriptionId: "${subscriptionId}"`
    );
    setBeRevokeCode(updatedRevokeCode);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Subscription Playground</h1>
        <p className={styles.subtitle}>
          Follow the steps to explore Frontend and Backend subscription controls
        </p>
      </header>

      {/* Environment Setup */}
      <div className={styles.envSetupContainer}>
        <button 
          className={styles.envSetupHeader}
          onClick={() => setShowEnvSetup(!showEnvSetup)}
        >
          <div className={styles.envSetupHeaderContent}>
            <svg className={styles.envSetupIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div>
              <h2 className={styles.envSetupTitle}>Environment Setup</h2>
              <p className={styles.envSetupSubtitle}>Required environment variables for your backend</p>
            </div>
          </div>
          <svg 
            className={`${styles.chevron} ${showEnvSetup ? styles.chevronOpen : ''}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        
        {showEnvSetup && (
          <div className={styles.envSetupContent}>
            <div className={styles.envSetupWarning}>
              <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p>Create a <code>.env</code> file in your project root with the following variables:</p>
            </div>

            <pre className={styles.envCode}>{`CDP_API_KEY_ID=********-****-****-****-************

CDP_API_KEY_SECRET=*************************************************************

CDP_WALLET_SECRET=*********************************************************************************************************************

PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/************************`}</pre>

            <div className={styles.envSetupLinks}>
              <a 
                href="https://portal.cdp.coinbase.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.envSetupLink}
              >
                <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <path d="M15 3h6v6"/>
                  <path d="M10 14L21 3"/>
                </svg>
                Get API Keys from CDP Portal
              </a>
              <a 
                href="https://portal.cdp.coinbase.com/products/server-wallet/accounts" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.envSetupLink}
              >
                <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <path d="M15 3h6v6"/>
                  <path d="M10 14L21 3"/>
                </svg>
                Get Wallet Secret
              </a>
              <a 
                href="https://portal.cdp.coinbase.com/products/paymaster/configuration" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.envSetupLink}
              >
                <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <path d="M15 3h6v6"/>
                  <path d="M10 14L21 3"/>
                </svg>
                Get Paymaster URL
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Column Headers */}
      <div className={styles.columnHeaders}>
        <div className={styles.columnHeader}>
          <h2 className={styles.columnTitle}>Frontend</h2>
          <p className={styles.columnSubtitle}>Client-Side Operations</p>
        </div>
        <div className={styles.columnHeader}>
          <h2 className={styles.columnTitle}>Backend</h2>
          <p className={styles.columnSubtitle}>Server-Side Operations</p>
        </div>
      </div>

      <main className={styles.main}>
        {/* Step 0: Create Backend Wallet */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.backend}`}>0</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Create or Get Backend Wallet</h3>
              <p className={styles.stepDescription}>Backend creates wallet with <code>base.subscription.getOrCreateSubscriptionOwnerWallet</code></p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <p>Backend operation only</p>
              </div>
            </div>
            <div className={styles.backendColumn}>
              <CodeEditor
                code={beGetOrCreateWalletCode}
                onChange={setBeGetOrCreateWalletCode}
                onExecute={() => beGetOrCreateWalletExecution.executeCode(beGetOrCreateWalletCode)}
                onReset={() => {
                  setBeGetOrCreateWalletCode(DEFAULT_BE_GET_OR_CREATE_WALLET_CODE);
                  beGetOrCreateWalletExecution.reset();
                }}
                isLoading={beGetOrCreateWalletExecution.isLoading}
                tips={BE_GET_OR_CREATE_WALLET_TIPS}
              />
              <Output
                result={beGetOrCreateWalletExecution.result}
                error={beGetOrCreateWalletExecution.error}
                consoleOutput={beGetOrCreateWalletExecution.consoleOutput}
                isLoading={beGetOrCreateWalletExecution.isLoading}
              />
            </div>
          </div>
        </div>

        {/* Step Setup: Pass Wallet to Frontend */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={styles.stepNumber}>Setup</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Pass Wallet to Frontend</h3>
              <p className={styles.stepDescription}>Copy wallet address to subscribe function</p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <div className={styles.setupPanel}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Backend Wallet Address</label>
                  <input
                    type="text"
                    value={subscriptionOwnerWallet}
                    onChange={(e) => setSubscriptionOwnerWallet(e.target.value)}
                    placeholder="Auto-filled from Step 0..."
                    className={styles.input}
                  />
                </div>
                <button onClick={handlePassWalletToFrontend} className={styles.passButton}>
                  <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  Pass to Step 1
                </button>
              </div>
            </div>
            <div className={styles.backendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>Wallet created!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Frontend Subscribe */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.frontend}`}>1</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Request Subscription from User</h3>
              <p className={styles.stepDescription}>User subscribes with <code>base.subscription.subscribe</code></p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <CodeEditor
                code={feSubscribeCode}
                onChange={setFeSubscribeCode}
                onExecute={() => feSubscribeExecution.executeCode(feSubscribeCode)}
                onReset={() => {
                  setFeSubscribeCode(DEFAULT_FE_SUBSCRIBE_CODE);
                  feSubscribeExecution.reset();
                }}
                isLoading={feSubscribeExecution.isLoading}
                tips={FE_SUBSCRIBE_TIPS}
              />
              <Output
                result={feSubscribeExecution.result}
                error={feSubscribeExecution.error}
                consoleOutput={feSubscribeExecution.consoleOutput}
                isLoading={feSubscribeExecution.isLoading}
              />
            </div>
            <div className={styles.backendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <p>Frontend operation only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Frontend Get Status */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.frontend}`}>2</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Check Subscription Status</h3>
              <p className={styles.stepDescription}>User checks status with <code>base.subscription.getStatus</code></p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <CodeEditor
                code={feGetStatusCode}
                onChange={setFeGetStatusCode}
                onExecute={() => feGetStatusExecution.executeCode(feGetStatusCode)}
                onReset={() => {
                  setFeGetStatusCode(DEFAULT_FE_GET_STATUS_CODE);
                  feGetStatusExecution.reset();
                }}
                isLoading={feGetStatusExecution.isLoading}
                tips={FE_GET_STATUS_TIPS}
              />
              <Output
                result={feGetStatusExecution.result}
                error={feGetStatusExecution.error}
                consoleOutput={feGetStatusExecution.consoleOutput}
                isLoading={feGetStatusExecution.isLoading}
              />
            </div>
            <div className={styles.backendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01"/>
                </svg>
                <p>Frontend operation only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Pass ID to Backend */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Pass Subscription ID to Backend</h3>
              <p className={styles.stepDescription}>Send subscription ID to your server</p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>Subscription created!</p>
              </div>
            </div>
            <div className={styles.backendColumn}>
              <div className={styles.setupPanel}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Subscription ID</label>
                  <input
                    type="text"
                    value={subscriptionId}
                    onChange={(e) => setSubscriptionId(e.target.value)}
                    placeholder="Auto-filled after Step 1..."
                    className={styles.input}
                  />
                </div>
                <button onClick={handlePassIdToBackend} className={styles.passButton}>
                  <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  Pass to Backend Steps
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Backend Charge */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.backend}`}>4</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Charge Subscription</h3>
              <p className={styles.stepDescription}>Backend charges with <code>base.subscription.charge</code></p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                <p>Backend operation only</p>
              </div>
            </div>
            <div className={styles.backendColumn}>
              <CodeEditor
                code={beChargeCode}
                onChange={setBeChargeCode}
                onExecute={() => beChargeExecution.executeCode(beChargeCode)}
                onReset={() => {
                  setBeChargeCode(DEFAULT_BE_CHARGE_CODE);
                  beChargeExecution.reset();
                }}
                isLoading={beChargeExecution.isLoading}
                tips={BE_CHARGE_TIPS}
              />
              <Output
                result={beChargeExecution.result}
                error={beChargeExecution.error}
                consoleOutput={beChargeExecution.consoleOutput}
                isLoading={beChargeExecution.isLoading}
              />
            </div>
          </div>
        </div>

        {/* Step 5: Backend Get Status */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.backend}`}>5</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Verify Subscription Status</h3>
              <p className={styles.stepDescription}>Backend verifies with <code>base.subscription.getStatus</code></p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <p>Backend operation only</p>
              </div>
            </div>
            <div className={styles.backendColumn}>
              <CodeEditor
                code={beGetStatusCode}
                onChange={setBeGetStatusCode}
                onExecute={() => beGetStatusExecution.executeCode(beGetStatusCode)}
                onReset={() => {
                  setBeGetStatusCode(DEFAULT_BE_GET_STATUS_CODE);
                  beGetStatusExecution.reset();
                }}
                isLoading={beGetStatusExecution.isLoading}
                tips={BE_GET_STATUS_TIPS}
              />
              <Output
                result={beGetStatusExecution.result}
                error={beGetStatusExecution.error}
                consoleOutput={beGetStatusExecution.consoleOutput}
                isLoading={beGetStatusExecution.isLoading}
              />
            </div>
          </div>
        </div>

        {/* Step 6: Backend Revoke */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.backend}`}>6</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Revoke Subscription</h3>
              <p className={styles.stepDescription}>Backend cancels with <code>base.subscription.revoke</code></p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <div className={styles.emptySpace}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
                <p>Backend operation only</p>
              </div>
            </div>
            <div className={styles.backendColumn}>
              <CodeEditor
                code={beRevokeCode}
                onChange={setBeRevokeCode}
                onExecute={() => beRevokeExecution.executeCode(beRevokeCode)}
                onReset={() => {
                  setBeRevokeCode(DEFAULT_BE_REVOKE_CODE);
                  beRevokeExecution.reset();
                }}
                isLoading={beRevokeExecution.isLoading}
                tips={BE_REVOKE_TIPS}
              />
              <Output
                result={beRevokeExecution.result}
                error={beRevokeExecution.error}
                consoleOutput={beRevokeExecution.consoleOutput}
                isLoading={beRevokeExecution.isLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

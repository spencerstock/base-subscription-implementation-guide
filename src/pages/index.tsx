import { useEffect, useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { Output } from '../components/Output';
import {
  DEFAULT_BE_GET_OR_CREATE_WALLET_CODE,
  WALLET_WITH_CUSTOM_NAME_CODE,
  DEFAULT_FE_SUBSCRIBE_CODE,
  SUBSCRIBE_FAST_TESTING_CODE,
  SUBSCRIBE_NO_BALANCE_CHECK_CODE,
  DEFAULT_FE_GET_STATUS_CODE,
  DEFAULT_BE_CHARGE_CODE,
  CHARGE_WITH_RECIPIENT_CODE,
  CHARGE_MAX_REMAINING_CODE,
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
  const [walletPreset, setWalletPreset] = useState<'default' | 'custom-name'>('default');
  
  // Frontend state
  const [feSubscribeCode, setFeSubscribeCode] = useState(DEFAULT_FE_SUBSCRIBE_CODE);
  const [subscribePreset, setSubscribePreset] = useState<'default' | 'fast-testing' | 'no-balance-check'>('default');
  const [feGetStatusCode, setFeGetStatusCode] = useState(DEFAULT_FE_GET_STATUS_CODE);
  
  // Backend state
  const [beChargeCode, setBeChargeCode] = useState(DEFAULT_BE_CHARGE_CODE);
  const [chargePreset, setChargePreset] = useState<'default' | 'with-recipient' | 'max-remaining'>('default');
  const [beGetStatusCode, setBeGetStatusCode] = useState(DEFAULT_BE_GET_STATUS_CODE);
  const [beRevokeCode, setBeRevokeCode] = useState(DEFAULT_BE_REVOKE_CODE);

  // Shared state
  const [subscriptionOwnerWallet, setSubscriptionOwnerWallet] = useState<string>('');
  const [walletName, setWalletName] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [showEnvSetup, setShowEnvSetup] = useState(true);
  
  // Transfer control flags
  const [isWalletSentToFrontend, setIsWalletSentToFrontend] = useState(false);
  const [isSubscriptionIdSentToBackend, setIsSubscriptionIdSentToBackend] = useState(false);

  // Code execution hooks
  const beGetOrCreateWalletExecution = useCodeExecution();
  const feSubscribeExecution = useCodeExecution();
  const feGetStatusExecution = useCodeExecution();
  const beChargeExecution = useCodeExecution();
  const beGetStatusExecution = useCodeExecution();
  const beRevokeExecution = useCodeExecution();

  // Handle wallet preset changes
  useEffect(() => {
    const presetMap = {
      'default': DEFAULT_BE_GET_OR_CREATE_WALLET_CODE,
      'custom-name': WALLET_WITH_CUSTOM_NAME_CODE,
    };
    setBeGetOrCreateWalletCode(presetMap[walletPreset]);
  }, [walletPreset]);

  // Handle subscribe preset changes
  useEffect(() => {
    const presetMap = {
      'default': DEFAULT_FE_SUBSCRIBE_CODE,
      'fast-testing': SUBSCRIBE_FAST_TESTING_CODE,
      'no-balance-check': SUBSCRIBE_NO_BALANCE_CHECK_CODE,
    };
    const newCode = presetMap[subscribePreset];
    // Preserve subscriptionOwner if it's been sent to frontend
    if (isWalletSentToFrontend && subscriptionOwnerWallet && subscriptionOwnerWallet !== "0xYourAppAddress") {
      setFeSubscribeCode(newCode.replace(
        /subscriptionOwner:\s*["'][^"']*["']/,
        `subscriptionOwner: "${subscriptionOwnerWallet}"`
      ));
    } else {
      setFeSubscribeCode(newCode);
    }
  }, [subscribePreset, subscriptionOwnerWallet, isWalletSentToFrontend]);

  // Handle charge preset changes
  useEffect(() => {
    const presetMap = {
      'default': DEFAULT_BE_CHARGE_CODE,
      'with-recipient': CHARGE_WITH_RECIPIENT_CODE,
      'max-remaining': CHARGE_MAX_REMAINING_CODE,
    };
    let newCode = presetMap[chargePreset];
    // Preserve subscription ID if it's been sent to backend
    if (isSubscriptionIdSentToBackend && subscriptionId && subscriptionId !== "0x...") {
      newCode = newCode.replace(
        /id:\s*["'][^"']*["']/,
        `id: "${subscriptionId}"`
      );
      
      // Also preserve walletName if it exists
      if (walletName) {
        newCode = newCode.replace(
          /testnet:\s*true/,
          `walletName: "${walletName}",\n    testnet: true`
        );
      }
    }
    setBeChargeCode(newCode);
  }, [chargePreset, subscriptionId, walletName, isSubscriptionIdSentToBackend]);

  // Watch for wallet creation
  useEffect(() => {
    if (
      beGetOrCreateWalletExecution.result &&
      'address' in beGetOrCreateWalletExecution.result &&
      beGetOrCreateWalletExecution.result.address
    ) {
      const address = beGetOrCreateWalletExecution.result.address as string;
      setSubscriptionOwnerWallet(address);
      
      // Extract walletName if present
      if ('walletName' in beGetOrCreateWalletExecution.result && beGetOrCreateWalletExecution.result.walletName) {
        setWalletName(beGetOrCreateWalletExecution.result.walletName as string);
      }
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
    id: '${subId}',
    testnet: true
  })
  
  return result;
} catch (error) {
  throw error;
}`;
      setFeGetStatusCode(updatedFeCode);
    }
  }, [feSubscribeExecution.result]);

  // Pass subscription owner wallet to frontend
  const handlePassWalletToFrontend = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!subscriptionOwnerWallet) {
      alert('Enter a subscription owner wallet address first');
      return;
    }
    
    // Add animating class for full animation
    const button = e.currentTarget;
    button.classList.add(styles.animating);
    setTimeout(() => {
      button.classList.remove(styles.animating);
    }, 800);
    
    setIsWalletSentToFrontend(true);
    const updatedCode = feSubscribeCode.replace(
      /subscriptionOwner:\s*["'][^"']*["']/,
      `subscriptionOwner: "${subscriptionOwnerWallet}"`
    );
    setFeSubscribeCode(updatedCode);
  };

  // Pass subscription ID to backend
  const handlePassIdToBackend = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!subscriptionId) {
      alert('Create a subscription first');
      return;
    }
    
    // Add animating class for full animation
    const button = e.currentTarget;
    button.classList.add(styles.animating);
    setTimeout(() => {
      button.classList.remove(styles.animating);
    }, 800);
    
    setIsSubscriptionIdSentToBackend(true);
    
    // Update BE charge code
    let updatedChargeCode = beChargeCode.replace(
      /id:\s*["'][^"']*["']/,
      `id: "${subscriptionId}"`
    );
    
    // Add walletName if present
    if (walletName) {
      updatedChargeCode = updatedChargeCode.replace(
        /testnet:\s*true/,
        `walletName: "${walletName}",\n    testnet: true`
      );
    }
    setBeChargeCode(updatedChargeCode);
    
    // Update BE getStatus code
    const updatedStatusCode = beGetStatusCode.replace(
      /id:\s*["'][^"']*["']/,
      `id: "${subscriptionId}"`
    );
    setBeGetStatusCode(updatedStatusCode);
    
    // Update BE revoke code
    let updatedRevokeCode = beRevokeCode.replace(
      /id:\s*["'][^"']*["']/,
      `id: "${subscriptionId}"`
    );
    
    // Add walletName if present
    if (walletName) {
      updatedRevokeCode = updatedRevokeCode.replace(
        /testnet:\s*true/,
        `walletName: "${walletName}",\n    testnet: true`
      );
    }
    setBeRevokeCode(updatedRevokeCode);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Base Subscription Integration Guide</h1>
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
              <p>This demo has credentials already provided. Your implementation will require the following environment variables:</p>
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
        <div className={styles.columnDivider}></div>
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
              <p className={styles.stepDescription}>
                Backend creates wallet with <code>base.subscription.getOrCreateSubscriptionOwnerWallet</code>
                {' '}
                <a 
                  href="https://docs.base.org/base-account/reference/base-pay/getOrCreateSubscriptionOwnerWallet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '4px', opacity: 0.7 }}
                >
                  <svg style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <path d="M15 3h6v6"/>
                    <path d="M10 14L21 3"/>
                  </svg>
                </a>
              </p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
            </div>
            <div className={styles.verticalDivider}></div>
            <div className={styles.backendColumn}>
              <div className={styles.presetSelector}>
                <span className={styles.presetLabel}>Example:</span>
                <select 
                  className={styles.presetSelect}
                  value={walletPreset}
                  onChange={(e) => setWalletPreset(e.target.value as 'default' | 'custom-name')}
                >
                  <option value="default">Basic Wallet</option>
                  <option value="custom-name">With Custom Name</option>
                </select>
              </div>
              <CodeEditor
                code={beGetOrCreateWalletCode}
                onChange={setBeGetOrCreateWalletCode}
                onExecute={() => beGetOrCreateWalletExecution.executeCode(beGetOrCreateWalletCode)}
                onReset={() => {
                  setBeGetOrCreateWalletCode(DEFAULT_BE_GET_OR_CREATE_WALLET_CODE);
                  setWalletPreset('default');
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

        {/* Step 1: Pass Wallet to Frontend */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Pass Wallet to Frontend</h3>
              <p className={styles.stepDescription}>Send wallet address from backend to frontend</p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              {isWalletSentToFrontend ? (
                <div className={styles.emptySpace}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p>Wallet address received!</p>
                  <code style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem', wordBreak: 'break-all', display: 'block', maxWidth: '300px' }}>{subscriptionOwnerWallet.slice(0, 10)}...{subscriptionOwnerWallet.slice(-8)}</code>
                </div>
              ) : subscriptionOwnerWallet ? (
                <div className={styles.emptySpace}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <p style={{ opacity: 0.7 }}>Wallet ready - click &quot;Send to Frontend&quot; →</p>
                </div>
              ) : (
                <div className={styles.emptySpace}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <p>Waiting for wallet address...</p>
                </div>
              )}
            </div>
            <div className={styles.verticalDivider}></div>
            <div className={styles.backendColumn}>
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
                    <path d="M11 17l-5-5m0 0l5-5m-5 5h18"/>
                  </svg>
                  <span>Send to Frontend</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Frontend Subscribe */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.frontend}`}>2</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Request Subscription from User</h3>
              <p className={styles.stepDescription}>
                User subscribes with <code>base.subscription.subscribe</code>
                {' '}
                <a 
                  href="https://docs.base.org/base-account/reference/base-pay/subscribe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '4px', opacity: 0.7 }}
                >
                  <svg style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <path d="M15 3h6v6"/>
                    <path d="M10 14L21 3"/>
                  </svg>
                </a>
              </p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
              <div className={styles.presetSelector}>
                <span className={styles.presetLabel}>Example:</span>
                <select 
                  className={styles.presetSelect}
                  value={subscribePreset}
                  onChange={(e) => setSubscribePreset(e.target.value as 'default' | 'fast-testing' | 'no-balance-check')}
                >
                  <option value="default">Basic Subscribe (30 days)</option>
                  <option value="fast-testing">Fast Testing (10 seconds) </option>
                  <option value="no-balance-check">Skip Balance Check</option>
                </select>
              </div>
              <CodeEditor
                code={feSubscribeCode}
                onChange={setFeSubscribeCode}
                onExecute={() => feSubscribeExecution.executeCode(feSubscribeCode)}
                onReset={() => {
                  setFeSubscribeCode(DEFAULT_FE_SUBSCRIBE_CODE);
                  setSubscribePreset('default');
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
            <div className={styles.verticalDivider}></div>
            <div className={styles.backendColumn}>
            </div>
          </div>
        </div>

        {/* Step 3: Frontend Get Status */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.frontend}`}>3</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Check Subscription Status</h3>
              <p className={styles.stepDescription}>
                User checks status with <code>base.subscription.getStatus</code>
                {' '}
                <a 
                  href="https://docs.base.org/base-account/reference/base-pay/getStatus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '4px', opacity: 0.7 }}
                >
                  <svg style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <path d="M15 3h6v6"/>
                    <path d="M10 14L21 3"/>
                  </svg>
                </a>
              </p>
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
            <div className={styles.verticalDivider}></div>
            <div className={styles.backendColumn}>
            </div>
          </div>
        </div>

        {/* Step 4: Pass ID to Backend */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Pass Subscription ID to Backend</h3>
              <p className={styles.stepDescription}>Send subscription ID from frontend to backend</p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
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
                  <span>Send to Backend</span>
                </button>
              </div>
            </div>
            <div className={styles.verticalDivider}></div>
            <div className={styles.backendColumn}>
              {isSubscriptionIdSentToBackend ? (
                <div className={styles.emptySpace}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p>Subscription ID received!</p>
                  <code style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem', wordBreak: 'break-all', display: 'block', maxWidth: '300px' }}>{subscriptionId.slice(0, 20)}...</code>
                </div>
              ) : subscriptionId ? (
                <div className={styles.emptySpace}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <p style={{ opacity: 0.7 }}>← Subscription ID ready - click &quot;Send to Backend&quot;</p>
                </div>
              ) : (
                <div className={styles.emptySpace}>
                  <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  <p>Waiting for subscription ID...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Backend Charge */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.backend}`}>5</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Charge Subscription</h3>
              <p className={styles.stepDescription}>
                Backend charges with <code>base.subscription.charge</code>
                {' '}
                <a 
                  href="https://docs.base.org/base-account/reference/base-pay/charge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '4px', opacity: 0.7 }}
                >
                  <svg style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <path d="M15 3h6v6"/>
                    <path d="M10 14L21 3"/>
                  </svg>
                </a>
              </p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
            </div>
            <div className={styles.verticalDivider}></div>
            <div className={styles.backendColumn}>
              <div className={styles.presetSelector}>
                <span className={styles.presetLabel}>Example:</span>
                <select 
                  className={styles.presetSelect}
                  value={chargePreset}
                  onChange={(e) => setChargePreset(e.target.value as 'default' | 'with-recipient' | 'max-remaining')}
                >
                  <option value="default">Basic Charge</option>
                  <option value="with-recipient">With Recipient Address</option>
                  <option value="max-remaining">Max Remaining Charge </option>
                </select>
              </div>
              <CodeEditor
                code={beChargeCode}
                onChange={setBeChargeCode}
                onExecute={() => beChargeExecution.executeCode(beChargeCode)}
                onReset={() => {
                  setBeChargeCode(DEFAULT_BE_CHARGE_CODE);
                  setChargePreset('default');
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
                code={beChargeCode}
              />
            </div>
          </div>
        </div>

        {/* Step 6: Backend Get Status */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.backend}`}>6</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Verify Subscription Status</h3>
              <p className={styles.stepDescription}>
                Backend verifies with <code>base.subscription.getStatus</code>
                {' '}
                <a 
                  href="https://docs.base.org/base-account/reference/base-pay/getStatus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '4px', opacity: 0.7 }}
                >
                  <svg style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <path d="M15 3h6v6"/>
                    <path d="M10 14L21 3"/>
                  </svg>
                </a>
              </p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
            </div>
            <div className={styles.verticalDivider}></div>
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

        {/* Step 7: Backend Revoke */}
        <div className={styles.stepRow}>
          <div className={styles.stepLabel}>
            <div className={`${styles.stepNumber} ${styles.backend}`}>7</div>
            <div className={styles.stepInfo}>
              <h3 className={styles.stepTitle}>Revoke Subscription</h3>
              <p className={styles.stepDescription}>
                Backend cancels with <code>base.subscription.revoke</code>
                {' '}
                <a 
                  href="https://docs.base.org/base-account/reference/base-pay/revoke" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ marginLeft: '4px', opacity: 0.7 }}
                >
                  <svg style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                    <path d="M15 3h6v6"/>
                    <path d="M10 14L21 3"/>
                  </svg>
                </a>
              </p>
            </div>
          </div>
          
          <div className={styles.splitContent}>
            <div className={styles.frontendColumn}>
            </div>
            <div className={styles.verticalDivider}></div>
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
                code={beRevokeCode}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { connect, ConnectedStarknetWindowObject, disconnect } from 'starknetkit';
import { http, toHex } from 'viem';
import { createConfig} from 'wagmi'
import type { CreateConnectorFn } from 'wagmi'
import { injected, safe, walletConnect } from 'wagmi/connectors';

import './App.css'
import { Button } from '@ethsign/ui'
import { InjectedConnector } from 'starknetkit/injected';
import { useEffect } from 'react';
import { mainnet } from 'wagmi/chains';

function App() {
  const signMessage = async (wallet: ConnectedStarknetWindowObject) => {
    // this.address = data.address as string;
    const hexChainId = wallet.provider.chainId || toHex(wallet.chainId!)

    const msg = {
      statement: 'Welcome',
      chainId: hexChainId,
      address: wallet.account?.address,
      issuedAt: new Date().toISOString(),
      domain: window.location.host,
      uri: window.location.origin,
      version: '1',
      nonce: '123',
      // nonce: getCustomNaNoId()
    }
    
    const fullMessage = {
      domain: {
        chainId: hexChainId,
        name: 'TokenTable',
        version: '1'
      },
      message: msg,
      primaryType: 'Sign',
      types: {
        StarkNetDomain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'felt' },
          { name: 'chainId', type: 'felt' }
        ],
        Sign: [
          { name: 'statement', type: 'felt' },
          { name: 'chainId', type: 'felt' },
          { name: 'address', type: 'felt' },
          { name: 'issuedAt', type: 'felt' },
          { name: 'version', type: 'felt' },
          { name: 'nonce', type: 'felt' }
        ]
      }
    };

    const signature = await wallet.account?.signMessage(fullMessage);

    return {
      message: fullMessage,
      signature
    };
  };

  const handleConnect = async () => {
    const connectors = ['argentX', 'braavos']?.map((id) => {
      return new InjectedConnector({
        options: { id }
      });
    });

    const { wallet } = await connect({
      connectors: connectors,
      modalTheme: 'light'
    });

    if (!wallet) return;

    if (wallet?.isConnected) {

      const signResult = await signMessage(wallet);

      const payload = {
        signature: (signResult.signature as string[]).join(','),
        message: JSON.stringify(signResult.message),
        key: wallet.account.address!,
        chainType: 'starknet',
        // network: shortString.decodeShortString(String(wallet.chainId!))
        network: wallet.chainId
      };

      alert('Login Success' + JSON.stringify(payload))
    } else {
      console.log('walletnotconnect!!!!', wallet)
      await disconnect({ clearLastWallet: true })
      await handleConnect()
    }
  };

  const handleDisconnect = async () => {
    await disconnect()
  }

  useEffect(() => {
    const chains = [mainnet];
    const projectId = '6b037f0da1f5fe47510a11cbdb5bca85'
    const metadata = {
      name: 'TokenTable',
      description:
        'A token management platform for founders, investors and community. Elevate your fundraising, token distribution, and contract management with ease.',
      url: 'https://mainnet.tokentable.xyz',
      icons: ['https://mainnet.tokentable.xyz/favicon.ico']
    }
    // const enableSafe = true

    const connectors: CreateConnectorFn[] = [];
    const transportsArr = chains.map((chain) => [chain.id, http()]);
    const transports = Object.fromEntries(transportsArr);
  
    connectors.push(safe({ allowedDomains: [/app.safe.global$/], debug: true }));

    /**
     * @TODO comment this line
     */
    connectors.push(walletConnect({ projectId, metadata, showQrModal: false }));

    connectors.push(injected({ shimDisconnect: true }));
  
    createConfig({
      chains,
      multiInjectedProviderDiscovery: false,
      transports,
      connectors
    });
  }, [])

  return (
    <>
      <Button onClick={handleConnect}>
        Login
      </Button>

      <Button onClick={handleDisconnect}>
        Disconnect
      </Button>
    </>
  )
}

export default App

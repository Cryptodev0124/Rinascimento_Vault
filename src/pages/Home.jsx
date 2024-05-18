import React from "react";
import styles from "./App.module.scss";
import Header from "../container/Header";
import StakingContainer from "../container/AllVaults"
import UsdtVault from "../container/UsdtVault"
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params';
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from "@web3modal/react";

const projectId = '7c7fff7dcdf68099b497f697a163e920'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [w3mProvider({ projectId })],
)


const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: '7c7fff7dcdf68099b497f697a163e920',
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains);

const Home = () => {
  return (
    <Router>
      <QueryParamProvider>
        <div className={styles.App}>
          <WagmiConfig config={config}>
            <Header />
            <Switch>
              <Route path="/">
                <Route index element={<StakingContainer />} />
                <Route path="/UsdtVault" exact element={<UsdtVault />} />
              </Route>
            </Switch>
          </WagmiConfig>
          <Web3Modal
            projectId="7c7fff7dcdf68099b497f697a163e920"
            ethereumClient={ethereumClient}
          />
        </div>
      </QueryParamProvider>
    </Router>
  );
};

export default Home;

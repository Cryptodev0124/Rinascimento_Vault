import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'; // * note on history


import styles from "./pages/App.module.scss";
import Header from "./container/Header";
import AllVaults from "./container/AllVaults"
import UsdtVault from "./container/UsdtVault"
import BtcVault from "./container/BtcVault"
import EthVault from "./container/EthVault"
import { QueryParamProvider } from 'use-query-params';
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { mainnet, sepolia, cronos } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from "@web3modal/react";


const projectId = '7c7fff7dcdf68099b497f697a163e920'

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, sepolia, cronos],
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

export default function App() {
    const hist = createBrowserHistory();
    return (
        <Router history={hist}>
            <QueryParamProvider>
                <div className={styles.App}>
                    <WagmiConfig config={config}>
                        <Header />
                        <div className={styles.heroBackground}>
                            <div className={styles.bgEllipse1}>
                                <img data-src="/assets/img/Ellipse1.png" className={styles.lazyLoaded} data-load-priority="5" alt src="/assets/img/Ellipse1.png" />
                            </div>
                            <div className={styles.bgEllipse2}>
                                <img data-src="/assets/img/Ellipse2.png" className={styles.lazyLoaded} data-load-priority="5" alt src="/assets/img/Ellipse2.png" />
                            </div>
                            <div className={styles.bgCircles}>
                                <picture>
                                    <source data-srcset="/assets/img/bgCircles1.svg" media="(max-width: 1024px)" srcSet="/assets/img/bgCircles1.svg" />
                                    <source data-srcset="/assets/img/bgCircles2.svg" media="(min-width: 1025px)" srcSet="/assets/img/bgCircles2.svg" />
                                    <img className={styles.lazyLoaded} data-load-priority="0" alt="circles" />
                                </picture>
                            </div>
                        </div>
                        <Switch>
                            <Route path="/" exact>
                                <AllVaults />
                            </Route>
                            <Route path="/UsdtVault" exact>
                                <UsdtVault />
                            </Route>
                            <Route path="/EthVault" exact>
                                <EthVault />
                            </Route>
                            <Route path="/BtcVault" exact>
                                <BtcVault />
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
    )
}
import React, { useEffect, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import styles from "../styles/container/Container.module.scss";
import mainLogoImg from "../icons/mainLogoImg.png";
import mainLogoTxt from "../icons/mainLogoTxt.png";
import UsdtLogo from "../icons/usdt.png";
import EthLogo from "../icons/eth.png";
import BtcLogo from "../icons/btc.png";


const Header = () => {
    const { address, isConnected } = useAccount();
    const { open } = useWeb3Modal();
    const [firstConnect, setFirstConnect] = useState(false);
    const onConnect = async () => {
        await open();
    };
    const onConnectWallet = async () => {
        await open();
        setFirstConnect(true);
    };
    const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
    const { chain } = useNetwork();

    useEffect(() => {
        const reloadWindow = async () => {
            try {
                window.location.reload();
            } catch (e) {
                console.error(e)
            }
        }
        if (isConnected === true && firstConnect === true)
            reloadWindow();
    }, [isConnected, firstConnect])

    useEffect(() => {
        const switchChain = async () => {
            try {
                switchNetwork?.(1)
            } catch (e) {
                console.error(e)
            }
        }
        if (isConnected === true) {
            if (chain.id !== 1)
                switchChain();
        }
    }, [isConnected, chain, switchNetwork])

    return (
        <div className={styles.HeaderBox} id="myHeader">
            <div className={styles.HeaderContainer}>
                <section className={styles.BalanceSection}>
                    <a href="/"><img src={mainLogoImg} alt="logo" /></a>
                    <a href="/"><img src={mainLogoTxt} alt="txt" /></a>
                </section>
                <section className={styles.HeaderContent}>
                    <a href={isConnected ? "/UsdtVault" : "/"}><img src={UsdtLogo} alt="" className={styles.headerlogo} /></a>
                    <a href={isConnected ? "/EthVault" : "/"}><img src={EthLogo} alt="" className={styles.headerlogo} /></a>
                    <a href={isConnected ? "/BtcVault" : "/"}><img src={BtcLogo} alt="" className={styles.headerlogo} /></a>
                </section>
                <section className={styles.ButtonContainer}>
                    <div className={styles.connectButtonBox}>
                        {!isConnected ?
                            <>
                                <button className="ConnectButton" type="submit" onClick={() => {
                                    onConnectWallet();
                                }}>Enter App / Connect</button>
                            </>
                            :
                            <section className={styles.ConnectWalletSection}>
                                {chain?.id === 1 ?
                                    <button
                                        className="ConnectButton" type="submit"
                                        onClick={() => onConnect()}
                                    >
                                        {address.slice(0, 5) + '...' + address.slice(-5)}
                                    </button>
                                    :
                                    <button
                                        className="ConnectButton" type="submit"
                                        onClick={() => switchNetwork?.(1)}
                                    >
                                        {'To ETH'}
                                        {isLoading && pendingChainId === 5 && ' (switching)'}
                                    </button>
                                }
                            </section>
                        }
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Header;
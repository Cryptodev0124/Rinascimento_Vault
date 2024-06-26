import React, { useState, useEffect } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import '../App.css'
import styles from "../pages/App.module.scss";
import UsdtAbi from '../config/UsdtAbi.json'
import BtcAbi from '../config/BtcAbi.json'
import StakingAbi from '../config/StakingAbi.json'
import "../styles/StakingContainer.css";
import Input from "../components/Input.tsx";
import ClipLoader from "react-spinners/ClipLoader";
import { useWeb3Modal } from "@web3modal/react";
import { waitForTransaction, readContract, writeContract } from '@wagmi/core'
import UsdtLogo from "../icons/usdt.png";
import EthLogo from "../icons/eth.png";
import BtcLogo from "../icons/btc.png";
import Type from "../Type";

const AllVaults = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [tokenAmount1, setTokenAmount1] = useState(0);
  const [tokenAmount2, setTokenAmount2] = useState(0);
  let [confirming1, setConfirming1] = useState(false);
  let [confirming2, setConfirming2] = useState(false);
  const StakingAddress = "0x668faeD2632b537095c6A43F8bB1D6421ecBCdD7";
  const UsdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const EthAddress = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
  const BtcAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

  const { switchNetwork } = useSwitchNetwork()

  const [userUsdtAmount, setUserUsdtAmount] = useState(0);
  const [userEthAmount, setUserEthAmount] = useState(0);
  const [userBtcAmount, setUserBtcAmount] = useState(0);
  const [tvlUsdt, setTvlUsdt] = useState(0);
  const [tvlEth, setTvlEth] = useState(0);
  const [tvlBtc, setTvlBtc] = useState(0);
  const [apyUsdt, setApyUsdt] = useState(0);
  const [apyEth, setApyEth] = useState(0);
  const [apyBtc, setApyBtc] = useState(0);
  const [userUsdtPendingRewards, setUserUsdtPendingRewards] = useState(0);
  const [userEthPendingRewards, setUserEthPendingRewards] = useState(0);
  const [userBtcPendingRewards, setUserBtcPendingRewards] = useState(0);

  const [allowanceUsdt, setAllowanceUsdt] = useState(0);
  const [allowanceBtc, setAllowanceBtc] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [maxBalance, setMaxBalance] = useState(0);
  const [maxSet, setMaxSet] = useState(0);
  const [lockingEnabled, setLockingEnabled] = useState(false);
  const [firstConnect, setFirstConnect] = useState(false);
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
  }, [isConnected, chain?.id, switchNetwork])
  const onConnectWallet = async () => {
    await open();
    setFirstConnect(true);
  };
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
    const FetchStakingData = async () => {
      try {
        const tvlUsdt = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'totalUsdtStaked' });
        const tvlEth = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'totalEthStaked' });
        const tvlBtc = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'totalBtcStaked' });
        const usdtAllowance = await readContract({ address: UsdtAddress, abi: UsdtAbi, functionName: 'allowance', args: [address, StakingAddress] });
        const btcAllowance = await readContract({ address: BtcAddress, abi: BtcAbi, functionName: 'allowance', args: [address, StakingAddress] });
        const usdtAmount = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserTotalUsdtDeposits', args: [address] });
        const ethAmount = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserTotalEthDeposits', args: [address] });
        const btcAmount = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserTotalBtcDeposits', args: [address] });
        const usdtPendingRewards = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserUsdtDividends', args: [address] });
        const ethPendingRewards = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserEthDividends', args: [address] });
        const btcPendingRewards = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserBtcDividends', args: [address] });
        const APY_USDT = 24;
        const APY_ETH = 17;
        const APY_BTC = 8;
        setApyUsdt(APY_USDT);
        setApyEth(APY_ETH);
        setApyBtc(APY_BTC);
        setTvlUsdt(Number(tvlUsdt) / Math.pow(10, 6));
        setTvlEth(Number(tvlEth) / Math.pow(10, 18));
        setTvlBtc(Number(tvlBtc) / Math.pow(10, 8));
        setUserUsdtAmount(Number(usdtAmount) / Math.pow(10, 6));
        setUserEthAmount(Number(ethAmount) / Math.pow(10, 18));
        setUserBtcAmount(Number(btcAmount) / Math.pow(10, 8));
        setUserUsdtPendingRewards(Number(usdtPendingRewards) / Math.pow(10, 6));
        setUserEthPendingRewards(Number(ethPendingRewards) / Math.pow(10, 18));
        setUserBtcPendingRewards(Number(btcPendingRewards) / Math.pow(10, 8));
        setLockingEnabled(false);
        setAllowanceUsdt(Number(usdtAllowance) / Math.pow(10, 6));
        setAllowanceBtc(Number(btcAllowance) / Math.pow(10, 8));
        setUsdtBalance(usdtAmount);
        setEthBalance(usdtAmount);
        setBtcBalance(btcAmount);
        setMaxBalance(usdtAmount);
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && chain?.id === 1 && address && (confirming1 === false || confirming2 === false)) {
      FetchStakingData();
    }
  }, [isConnected, address, chain, confirming1, confirming2])

  return (
    <main>
      <div className="GlobalContainer">

        <div className="MainDashboard">
          <section className="ContactBox">
            <>
              <section className="ContractContainer">
                {/* <section className="DepositBoxHeader">
                  <p className="ContractContentTextTitle">All Vaults</p>
                </section> */}
                <div className={styles.Introduction}>
                  <span className={styles.Line1}>Your Unique Edge For</span>
                  <div className={styles.Line2}>
                    <span className={styles.ChangeableText}>
                      <Type />
                    </span>
                    <span className={styles.Line2Tail}>Yields</span>
                  </div>
                </div>
                <div className='StakingContents'>
                  <a className='PlanBox' href={isConnected ? "/UsdtVault" : "/"}>
                    <div className='StakingBoxs'>
                      <div className='StakingBox1'>
                        <div className="ContractContentTextTitlePlan"><img src={UsdtLogo} width="60px" alt="" /></div>
                      </div>
                      <div className='StakingBox'>
                        <div className='StakingInfo'>
                          <p className='HeaderText'>TVL : </p>
                          <p className='Text1'>&nbsp; {tvlUsdt.toFixed(0)} USDT &nbsp;  &nbsp; </p>
                        </div>
                      </div>
                      <div className='StakingBox'>
                        <div className='StakingInfo'>
                          <p className='HeaderText'>APY : </p>
                          {/* <p className='Text1'>&nbsp; {Number(apy1).toFixed(2)}  %</p> */}
                          <p className='Text1'>&nbsp; 24  %</p>
                        </div>
                      </div>
                      <div className='StakingBox1'>
                        <div className='LpBalance UserBalance'>
                          <p className='HeaderText'>Your Staked Amount : </p>
                          <p className='Text1'>&nbsp; {userUsdtAmount} USDT</p>
                        </div>
                        <div className='LpBalance UserBalance'>
                          <p className='HeaderText'>Pending Rewards Amount : </p>
                          <p className='Text1'>&nbsp; {userUsdtPendingRewards.toFixed(2)} USDT</p>
                        </div>
                      </div>
                    </div>
                  </a>
                  <a className='PlanBox' href={isConnected ? "/EthVault" : "/"}>
                    <div className='StakingBoxs'>
                      <div className='StakingBox1'>
                        <div className="ContractContentTextTitlePlan"><img src={EthLogo} width="60px" alt="" /></div>
                      </div>
                      <div className='StakingBox'>
                        <div className='StakingInfo'>
                          <p className='HeaderText'>TVL : </p>
                          <p className='Text1'>&nbsp; {tvlEth.toFixed(0)} ETH  &nbsp;  &nbsp;</p>
                        </div>
                      </div>
                      <div className='StakingBox'>
                        <div className='StakingInfo'>
                          <p className='HeaderText'>APY : </p>
                          {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                          <p className='Text1'>&nbsp; 17 %</p>
                        </div>
                      </div>
                      <div className='StakingBox1'>
                        <div className='LpBalance UserBalance'>
                          <p className='HeaderText'>Your Staked Amount : </p>
                          <p className='Text1'>&nbsp; {userEthAmount} ETH</p>
                        </div>
                        <div className='LpBalance UserBalance'>
                          <p className='HeaderText'>Pending Rewards Amount : </p>
                          <p className='Text1'>&nbsp; {userEthPendingRewards.toFixed(2)} ETH</p>
                        </div>
                      </div>
                    </div>
                  </a>
                  <a className='PlanBox' href={isConnected ? "/BtcVault" : "/"}>
                    <div className='StakingBoxs'>
                      <div className='StakingBox1'>
                        <div className="ContractContentTextTitlePlan"><img src={BtcLogo} width="60px" alt="" /></div>
                      </div>
                      <div className='StakingBox'>
                        <div className='StakingInfo'>
                          <p className='HeaderText'>TVL : </p>
                          <p className='Text1'>&nbsp; {tvlBtc.toFixed(0)} BTC  &nbsp;  &nbsp;</p>
                        </div>
                      </div>
                      <div className='StakingBox'>
                        <div className='StakingInfo'>
                          <p className='HeaderText'>APY : </p>
                          {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                          <p className='Text1'>&nbsp; 8 %</p>
                        </div>
                      </div>
                      <div className='StakingBox1'>
                        <div className='LpBalance UserBalance'>
                          <p className='HeaderText'>Your Staked Amount : </p>
                          <p className='Text1'>&nbsp; {userBtcAmount} BTC</p>
                        </div>
                        <div className='LpBalance UserBalance'>
                          <p className='HeaderText'>Pending Rewards Amount : </p>
                          <p className='Text1'>&nbsp; {userBtcPendingRewards.toFixed(2)} BTC</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </section>

            </>
          </section>
        </div>
        {address ?
          chain?.id === 1 ?
            <></>
            :
            <section className="ConnectWalletBox">
              <p className="FirstNote">Please change Network to Ethereum Mainnet</p>
              <div className="ConnectWalletBoxButton">
              </div>
            </section>
          :
          <section className="ConnectWalletBox">
            <p className="FirstNote">Please connect wallet first</p>
            <div className="ConnectWalletBoxButton">
              <button className="ConnectButton" type="submit" onClick={() => {
                onConnectWallet();
              }}>Enter App / Connect</button>
            </div>
          </section>
        }

      </div>
    </main >
  )
}

export default AllVaults

import React, { useState, useEffect } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../App.css'
import TokenAbi from '../config/TokenAbi.json'
import StakingAbi from '../config/StakingAbi.json'
import "../styles/StakingContainer.css";
import Input from "../components/Input.tsx";
import ClipLoader from "react-spinners/ClipLoader";
import { useWeb3Modal } from "@web3modal/react";
import { waitForTransaction, readContract, writeContract } from '@wagmi/core'

const UsdtVault = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [tokenAmount, setTokenAmount] = useState(0);
  let [confirming, setConfirming] = useState(false);
  const StakingAddress = "0x1aFE82AeCd2a2BE975B552CA6d9B95e532B37a97";
  const TokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  
  const { switchNetwork } = useSwitchNetwork()
  
  const [userAmount, setUserAmount] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [apy, setApy] = useState(0);
  const [userPendingRewards, setUserPendingRewards] = useState(0);
  
  const [allowance, setAllowance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [maxBalance, setMaxBalance] = useState(0);
  const [maxSet, setMaxSet] = useState(0);
  const [lockingEnabled, setLockingEnabled] = useState(false);
  const [firstConnect, setFirstConnect] = useState(false);
  useEffect(() => {
    const switchChain = async () => {
      try {
        switchNetwork?.(25)
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true) {
      if (chain.id !== 25)
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
        const totalInfo = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'DEV_FEE'});
        const tokenAllowance = await readContract({ address: TokenAddress, abi: TokenAbi, functionName: 'allowance', args: [address, StakingAddress] });
        const tokenAmount = await readContract({ address: TokenAddress, abi: TokenAbi, functionName: 'balanceOf', args: [address] });
        const rewardPerYear = Number(totalInfo[1]) * 60 * 60 * 24 * 365;
        const APY = ((rewardPerYear / (Number(totalInfo[0]))) + 1) * 100
        setApy(APY);
        setTvl(Number(totalInfo[0]) / Math.pow(10, 18));
        setUserAmount(Number(totalInfo[2]) / Math.pow(10, 18));
        setUserPendingRewards(Number(totalInfo[3]) / Math.pow(10, 18));
        setLockingEnabled(totalInfo[4]);
        setAllowance(Number(tokenAllowance) / Math.pow(10, 18));
        setTokenBalance(tokenAmount);
        setMaxBalance(tokenAmount);
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && chain?.id === 25 && address && (confirming === false)) {
      FetchStakingData();
    }
  }, [isConnected, address, chain, confirming])
  
  const onTokenAllowance = async () => {
    try {
      setConfirming(true);
      const approve = await writeContract({
        address: TokenAddress,
        abi: TokenAbi,
        functionName: 'approve',
        args: [StakingAddress, tokenBalance],
        account: address
      })
      const approveData = await waitForTransaction({
        hash: approve.hash
      })
      console.log('approveData', approveData)
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
      setMaxSet(0);
    } catch (err) {
      setConfirming(false);
      setMaxSet(0);
    }
  };
  
  const onTokenStake = async (tokenAmounts) => {
    try {
      setConfirming(true);
      let TokenAmounts;
      if (Number(maxSet) === 0) {
        TokenAmounts = `0x${(Number(tokenAmounts) * (10 ** 18)).toString(16)}`;
      } else {
        TokenAmounts = maxSet;
      }
      const deposit = await writeContract({
        address: StakingAddress,
        abi: StakingAbi,
        functionName: 'deposit',
        args: [TokenAmounts],
        account: address
      })
      const depositData = await waitForTransaction({
        hash: deposit.hash
      })
      console.log('depositData', depositData)
      setMaxSet(0);
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
    } catch (err) {
      setMaxSet(0);
      setConfirming(false);
    }
  };
  
  const onTokenClaim = async () => {
    try {
      setConfirming(true);
      const claim = await writeContract({
        address: StakingAddress,
        abi: StakingAbi,
        functionName: 'claim',
        account: address
      })
      const claimData = await waitForTransaction({
        hash: claim.hash
      })
      console.log('claimData', claimData)
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
    } catch (err) {
      setConfirming(false);
    }
  };
  
  const onTokenWithdraw = async () => {
    try {
      setConfirming(true);
      const withdraw = await writeContract({
        address: StakingAddress,
        abi: StakingAbi,
        functionName: 'withdrawAll',
        account: address
      })
      const withdrawData = await waitForTransaction({
        hash: withdraw.hash
      })
      console.log('withdrawData', withdrawData)
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
    } catch (err) {
      setConfirming(false);
    }
  };
  
  const setMaxAmount = async () => {
    setTokenAmount(Number(tokenBalance) / Math.pow(10, 18));
    setMaxSet(maxBalance);
  };

  return (
    <main>
      <div className="GlobalContainer">
        {address ?
          chain?.id === 25 ?
            <div className="MainDashboard">
              <section className="ContactBox">
                <>
                  <section className="ContractContainer">
                    <section className="DepositBoxHeader">
                      <p className="ContractContentTextTitle">USDT Vault</p>
                    </section>
                    {/* <div className='StakingContents'> */}
                    <Tabs className="TabContainer">
                      <TabList className="TabList">
                        <Tab className="TabTitle1">Deposit</Tab>
                        <Tab className="TabTitle2">Withdraw</Tab>
                      </TabList>
                      <TabPanel>
                        <div className='TabContents'>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>TVL : </p>
                              <p className='Text1'>&nbsp; {tvl.toFixed(0)} USDT &nbsp;  &nbsp; </p>
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
                              <p className='Text1'>&nbsp; {userAmount} USDT</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setTokenAmount}
                                value={tokenAmount}
                              />
                            </section>
                            <div onClick={() => setMaxAmount()} className="MaxButton">Max</div>
                          </section>
                          {Number(tokenAmount) > Number(allowance) ?
                            <section className="LockBox">
                              {confirming === false ?
                                Number(tokenBalance) > 0 ?
                                  <>
                                    <p className='Text1'>Please approve USDT first</p>
                                    <button disabled={confirming === false ? false : true} onClick={() => onTokenAllowance()} className="LockButton">
                                      <p>Allow</p>
                                    </button>
                                  </>
                                  :
                                  <p className='Text1'>You have no USDT now</p>
                                :
                                <>
                                  <ClipLoader
                                    color={'#36d7b7'}
                                    loading={confirming}
                                    size={30}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                  />
                                </>
                              }
                            </section>
                            :
                            <>
                              <section className="LockBox">
                                <p className='Text1'>Please enter your USDT Amount now!</p>
                                {confirming === false ?
                                  <>
                                    <section className="claimBox">
                                      <button disabled={tokenAmount > 0 ? false : true} onClick={() => onTokenStake(tokenAmount)} className="LockButton">Stake USDT Now!</button>
                                      {Number(userPendingRewards) > 0 ?
                                        <button disabled={false} onClick={() => onTokenClaim()} className="LockButton">Claim USDT Now!</button>
                                        :
                                        <></>
                                      }
                                      {Number(userAmount) > 0 ?
                                        <button disabled={lockingEnabled === true ? false : true} onClick={() => onTokenWithdraw()} className="LockButton">Withdraw USDT Now!</button>
                                        :
                                        <></>
                                      }
                                    </section>
                                  </>
                                  :
                                  <>
                                    {/* <p className='Text1'>Staking...</p> */}
                                    <ClipLoader
                                      color={'#36d7b7'}
                                      loading={confirming}
                                      size={30}
                                      aria-label="Loading Spinner"
                                      data-testid="loader"
                                    />
                                  </>
                                }
                              </section>
                            </>
                          }
                        </div>
                      </TabPanel>
                      <TabPanel>
                        <div className='TabContents'>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>TVL : </p>
                              <p className='Text1'>&nbsp; {tvl.toFixed(0)} USDT  &nbsp;  &nbsp;</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>APY : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 24 %</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>Withdraw Fee : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 0.75 %</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Withdrawable Amount : </p>
                              <p className='Text1'>&nbsp; {userPendingRewards.toFixed(2)} USDT</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setTokenAmount}
                                value={tokenAmount}
                              />
                            </section>
                            <div onClick={() => setMaxAmount()} className="MaxButton">Max</div>
                          </section>
                          {Number(tokenAmount) > Number(allowance) ?
                            <section className="LockBox">

                              {confirming === false ?
                                Number(tokenBalance) > 0 ?
                                  <>
                                    <p className='Text1'>Please approve USDT first</p>
                                    <button disabled={confirming === false ? false : true} onClick={() => onTokenAllowance()} className="LockButton">
                                      <p>Allow</p>
                                    </button>
                                  </>
                                  :
                                  <p className='Text1'>You have no USDT now</p>
                                :
                                <>
                                  <ClipLoader
                                    color={'#36d7b7'}
                                    loading={confirming}
                                    size={30}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                  />
                                </>
                              }
                            </section>
                            :
                            <>
                              <section className="LockBox">
                                <p className='Text1'>Please enter your USDT Amount now!</p>
                                {confirming === false ?
                                  <>
                                    <section className="claimBox">
                                      <button disabled={tokenAmount > 0 ? false : true} onClick={() => onTokenStake(tokenAmount)} className="LockButton">Withdraw USDT Now!</button>
                                      {Number(userPendingRewards) > 0 ?
                                        <button disabled={false} onClick={() => onTokenClaim()} className="LockButton">Claim USDT Now!</button>
                                        :
                                        <></>
                                      }
                                      {Number(userAmount) > 0 ?
                                        <button disabled={false} onClick={() => onTokenWithdraw()} className="LockButton">Withdraw USDT Now!</button>
                                        :
                                        <></>
                                      }
                                    </section>
                                  </>
                                  :
                                  <>
                                    {/* <p className='Text1'>Staking...</p> */}
                                    <ClipLoader
                                      color={'#36d7b7'}
                                      loading={confirming}
                                      size={30}
                                      aria-label="Loading Spinner"
                                      data-testid="loader"
                                    />
                                  </>
                                }
                              </section>
                            </>
                          }
                        </div>
                      </TabPanel>
                    </Tabs>
                    {/* </div> */}
                  </section>

                </>
              </section>
            </div>
            :
            <section className="ConnectWalletBox">
              <p className="FirstNote">Please change chain</p>
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

export default UsdtVault

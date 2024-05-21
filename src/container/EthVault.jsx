import React, { useState, useEffect } from 'react'
import { ether, ethers } from 'ethers'
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../App.css'
import BtcAbi from '../config/BtcAbi.json'
import StakingAbi from '../config/StakingAbi.json'
import "../styles/StakingContainer.css";
import Input from "../components/Input.tsx";
import ClipLoader from "react-spinners/ClipLoader";
import { useWeb3Modal } from "@web3modal/react";
import { waitForTransaction, readContract, writeContract } from '@wagmi/core'

const EthVault = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [ethAmount, setEthAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const StakingAddress = "0x2E12C15C168bF1134260443B03Cd96f4d65935ec";

  const { switchNetwork } = useSwitchNetwork()

  const [userAmount, setUserAmount] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [userPendingRewards, setUserPendingRewards] = useState(0);
  const [withdrawableAmount, setWithdrawableAmount] = useState(0);

  const [allowance, setAllowance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [maxBalance, setMaxBalance] = useState(0);
  const [maxSet, setMaxSet] = useState(0);
  const [lockingEnabled, setLockingEnabled] = useState(false);
  const [firstConnect, setFirstConnect] = useState(false);
  useEffect(() => {
    const switchChain = async () => {
      try {
        switchNetwork?.(11155111)
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true) {
      if (chain.id !== 11155111)
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
        const tvl = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'totalEthStaked' });
        const userStakedAmount = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserTotalEthDeposits', args: [address] });
        const pendingRewards = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserEthDividends', args: [address] });
        const withdrawableAmount = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'getUserWithdrawableEth', args: [address] });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletAmount = await signer.getBalance();
        setTvl(Number(tvl) / Math.pow(10, 18));
        setUserAmount(Number(userStakedAmount) / Math.pow(10, 18));
        setUserPendingRewards(Number(pendingRewards) / Math.pow(10, 18));
        setWithdrawableAmount(Number(withdrawableAmount) / Math.pow(10, 18));
        // setLockingEnabled(totalInfo1[4]);
        setTokenBalance(walletAmount);
        setMaxBalance(walletAmount);
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && chain?.id === 11155111 && address) {
      FetchStakingData();
    }
  }, [isConnected, address, chain])

  const onEthStake = async (amount) => {
    try {
      let TokenAmounts;
      TokenAmounts = `0x${(Number(amount) * (10 ** 18)).toString(16)}`;
      const deposit = await writeContract({
        address: StakingAddress,
        abi: StakingAbi,
        functionName: 'stakeEth',
        account: address,
        value: TokenAmounts
      })
      const depositData = await waitForTransaction({
        hash: deposit.hash
      })
      console.log('depositData', depositData)
      setMaxSet(0);
      // setTimeout(function () {
      //   setConfirming(false);
      // }, 3000)
    } catch (err) {
      setMaxSet(0);
      // setConfirming(false);
    }
  };

  const onTokenClaim = async () => {
    try {
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
      // setTimeout(function () {
      //   setConfirming(false);
      // }, 3000)
    } catch (err) {
    }
  };

  const onEthWithdraw = async (amount) => {
    try {
      let WithdrawAmounts;
      WithdrawAmounts = `0x${(Number(amount) * (10 ** 18)).toString(16)}`;
      const withdraw = await writeContract({
        address: StakingAddress,
        abi: StakingAbi,
        functionName: 'withdrawEth',
        account: address,
        value: WithdrawAmounts
      })
      const withdrawData = await waitForTransaction({
        hash: withdraw.hash
      })
      console.log('withdrawData', withdrawData)
      // setTimeout(function () {
      //   setConfirming(false);
      // }, 3000)
    } catch (err) {
      // setConfirming(false);
    }
  };

  const setMaxAmount = async () => {
    setEthAmount(Number(tokenBalance) / Math.pow(10, 18));
    setMaxSet(maxBalance);
  };

  const setMaxWithdrawAmount = async () => {
    setWithdrawAmount(Number(withdrawableAmount));
    // setMaxWithdrawSet(maxWithdrawBalance);
  };

  return (
    <main>
      <div className="GlobalContainer">
        {address ?
          chain?.id === 11155111 ?
            <div className="MainDashboard">
              <section className="ContactBox">
                <>
                  <section className="ContractContainer">
                    <section className="DepositBoxHeader">
                      <p className="ContractContentTextTitle">ETH Vault</p>
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
                              <p className='Text1'>&nbsp; {tvl.toFixed(4)} ETH &nbsp;  &nbsp; </p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>APY : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy1).toFixed(2)}  %</p> */}
                              <p className='Text1'>&nbsp; 17  %</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Your Staked Amount : </p>
                              <p className='Text1'>&nbsp; {userAmount.toFixed(4)} ETH</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setEthAmount}
                                value={ethAmount}
                              />
                            </section>
                            <div onClick={() => setMaxAmount()} className="MaxButton">Max</div>
                          </section>
                          <section className="LockBox">
                            <p className='Text1'>Please enter your ETH Amount now!</p>
                            {
                              <>
                                <section className="claimBox">
                                  <button disabled={ethAmount > 0 ? false : true} onClick={() => onEthStake(ethAmount)} className="LockButton">Stake ETH Now!</button>
                                  {/* {Number(userPendingRewards) > 0 ?
                                    <button disabled={false} onClick={() => onTokenClaim()} className="LockButton">Claim ETH Now!</button>
                                    :
                                    <></>
                                  }
                                  {Number(userAmount) > 0 ?
                                    <button disabled={lockingEnabled === true ? false : true} onClick={() => onTokenWithdraw()} className="LockButton">Withdraw ETH Now!</button>
                                    :
                                    <></>
                                  } */}
                                </section>
                              </>
                            }
                          </section>
                        </div>
                      </TabPanel>
                      <TabPanel>
                        <div className='TabContents'>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>TVL : </p>
                              <p className='Text1'>&nbsp; {tvl.toFixed(4)} ETH  &nbsp;  &nbsp;</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>APY : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 17 %</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>Withdraw Fee : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 0.75 %</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>LOCK TIME : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 2 WEEKS</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Pending Rewards Amount : </p>
                              <p className='Text1'>&nbsp; {userPendingRewards.toFixed(4)} ETH</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Withdrawable Amount : </p>
                              <p className='Text1'>&nbsp; {withdrawableAmount.toFixed(4)} ETH</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setWithdrawAmount}
                                value={withdrawAmount}
                              />
                            </section>
                            <div onClick={() => setMaxWithdrawAmount()} className="MaxButton">Max</div>
                          </section>

                          <section className="LockBox">
                            <p className='Text1'>Please enter your ETH Amount now!</p>
                            {
                              <>
                                <section className="claimBox">
                                  <button disabled={withdrawableAmount > 0 ? false : true} onClick={() => onEthWithdraw(withdrawableAmount)} className="LockButton">Withdraw ETH Now!</button>
                                  {/* {Number(userPendingRewards) > 0 ?
                                    <button disabled={false} onClick={() => onTokenClaim()} className="LockButton">Claim ETH Now!</button>
                                    :
                                    <></>
                                  }
                                  {Number(userAmount) > 0 ?
                                    <button disabled={false} onClick={() => onTokenWithdraw()} className="LockButton">Withdraw ETH Now!</button>
                                    :
                                    <></>
                                  } */}
                                </section>
                              </>
                            }
                          </section>
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

export default EthVault

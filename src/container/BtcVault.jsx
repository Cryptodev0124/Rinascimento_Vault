import React, { useState, useEffect } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import '../App.css'
import TokenAbi from '../config/TokenAbi.json'
import StakingAbi from '../config/StakingAbi.json'
import "../styles/StakingContainer.css";
import Input from "../components/Input.tsx";
import ClipLoader from "react-spinners/ClipLoader";
import { useWeb3Modal } from "@web3modal/react";
import { waitForTransaction, readContract, writeContract } from '@wagmi/core'

const BtcVault = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [tokenAmount1, setTokenAmount1] = useState(0);
  const [tokenAmount2, setTokenAmount2] = useState(0);
  let [confirming1, setConfirming1] = useState(false);
  let [confirming2, setConfirming2] = useState(false);
  const StakingAddress = "0x12192270ff21EdfB9c39b9597406c7D92f349312";
  const TokenAddress = "0x31d72768a4E9030D3CC8d5d0d76FCEC54d47ecE4";

  const { switchNetwork } = useSwitchNetwork()

  const [userAmount1, setUserAmount1] = useState(0);
  const [tvl1, setTvl1] = useState(0);
  const [tvl2, setTvl2] = useState(0);
  const [apy1, setApy1] = useState(0);
  const [apy2, setApy2] = useState(0);
  const [userAmount2, setUserAmount2] = useState(0);
  const [userPendingRewards1, setUserPendingRewards1] = useState(0);
  const [userPendingRewards2, setUserPendingRewards2] = useState(0);

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
        const totalInfo1 = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'totalInfo', args: [address, '1'] });
        const totalInfo2 = await readContract({ address: StakingAddress, abi: StakingAbi, functionName: 'totalInfo', args: [address, '2'] });
        const tokenAllowance = await readContract({ address: TokenAddress, abi: TokenAbi, functionName: 'allowance', args: [address, StakingAddress] });
        const tokenAmount = await readContract({ address: TokenAddress, abi: TokenAbi, functionName: 'balanceOf', args: [address] });
        const rewardPerYear1 = Number(totalInfo1[1]) * 60 * 60 * 24 * 365;
        const rewardPerYear2 = Number(totalInfo2[1]) * 60 * 60 * 24 * 365;
        const APY1 = ((rewardPerYear1 / (Number(totalInfo1[0]))) + 1) * 100
        const APY2 = ((rewardPerYear2 / (Number(totalInfo2[0]))) + 1) * 100
        setApy1(APY1);
        setApy2(APY2);
        setTvl1(Number(totalInfo1[0]) / Math.pow(10, 18));
        setTvl2(Number(totalInfo2[0]) / Math.pow(10, 18));
        setUserAmount1(Number(totalInfo1[2]) / Math.pow(10, 18));
        setUserAmount2(Number(totalInfo2[2]) / Math.pow(10, 18));
        setUserPendingRewards1(Number(totalInfo1[3]) / Math.pow(10, 18));
        setUserPendingRewards2(Number(totalInfo2[3]) / Math.pow(10, 18));
        setLockingEnabled(totalInfo1[4]);
        setAllowance(Number(tokenAllowance) / Math.pow(10, 18));
        setTokenBalance(tokenAmount);
        setMaxBalance(tokenAmount);
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && chain?.id === 11155111 && address && (confirming1 === false || confirming2 === false)) {
      FetchStakingData();
    }
  }, [isConnected, address, chain, confirming1, confirming2])

  const onTokenAllowance = async (pid) => {
    try {
      if (pid === 1) {
        setConfirming1(true);
      } else if (pid === 2) {
        setConfirming2(true);
      }
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
        if (pid === 1) {
          setConfirming1(false);
        } else if (pid === 2) {
          setConfirming2(false);
        }
      }, 3000)
      setMaxSet(0);
    } catch (err) {
      if (pid === 1) {
        setConfirming1(false);
      } else if (pid === 2) {
        setConfirming2(false);
      }
      setMaxSet(0);
    }
  };

  const onTokenStake = async (tokenAmounts, pid) => {
    try {
      if (pid === 1) {
        setConfirming1(true);
      } else if (pid === 2) {
        setConfirming2(true);
      }
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
        args: [TokenAmounts, pid.toString()],
        account: address
      })
      const depositData = await waitForTransaction({
        hash: deposit.hash
      })
      console.log('depositData', depositData)
      setMaxSet(0);
      setTimeout(function () {
        if (pid === 1) {
          setConfirming1(false);
        } else if (pid === 2) {
          setConfirming2(false);
        }
      }, 3000)
    } catch (err) {
      setMaxSet(0);
      if (pid === 1) {
        setConfirming1(false);
      } else if (pid === 2) {
        setConfirming2(false);
      }
    }
  };

  const onTokenClaim = async (pid) => {
    try {
      if (pid === 1) {
        setConfirming1(true);
      } else if (pid === 2) {
        setConfirming2(true);
      }
      const claim = await writeContract({
        address: StakingAddress,
        abi: StakingAbi,
        functionName: 'claim',
        args: [pid.toString()],
        account: address
      })
      const claimData = await waitForTransaction({
        hash: claim.hash
      })
      console.log('claimData', claimData)
      setTimeout(function () {
        if (pid === 1) {
          setConfirming1(false);
        } else if (pid === 2) {
          setConfirming2(false);
        }
      }, 3000)
    } catch (err) {
      if (pid === 1) {
        setConfirming1(false);
      } else if (pid === 2) {
        setConfirming2(false);
      }
    }
  };

  const onTokenWithdraw = async (pid) => {
    try {
      if (pid === 1) {
        setConfirming1(true);
      } else if (pid === 2) {
        setConfirming2(true);
      }
      const withdraw = await writeContract({
        address: StakingAddress,
        abi: StakingAbi,
        functionName: 'withdrawAll',
        args: [pid.toString()],
        account: address
      })
      const withdrawData = await waitForTransaction({
        hash: withdraw.hash
      })
      console.log('withdrawData', withdrawData)
      setTimeout(function () {
        if (pid === 1) {
          setConfirming1(false);
        } else if (pid === 2) {
          setConfirming2(false);
        }
      }, 3000)
    } catch (err) {
      if (pid === 1) {
        setConfirming1(false);
      } else if (pid === 2) {
        setConfirming2(false);
      }
    }
  };

  const setMaxAmount = async (pid) => {
    if (pid === 1) {
      setTokenAmount1(Number(tokenBalance) / Math.pow(10, 18));
    } else if (pid === 2) {
      setTokenAmount2(Number(tokenBalance) / Math.pow(10, 18));
    }
    setMaxSet(maxBalance);
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
                      <p className="ContractContentTextTitle">BTC Vault</p>
                    </section>
                    <div className='StakingContents'>
                      <div className='PlanBox'>
                        <p className="ContractContentTextTitlePlan">Deposit</p>
                        <div className='StakingBoxs'>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>TVL : </p>
                              <p className='Text1'>&nbsp; {tvl1.toFixed(0)} BTC &nbsp;  &nbsp; </p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>APY : </p>
                              <p className='Text1'>&nbsp; {Number(apy1).toFixed(2)}  %</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Your Staked Amount : </p>
                              <p className='Text1'>&nbsp; {userAmount1} BTC</p>
                            </div>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Pending Reward Amount : </p>
                              <p className='Text1'>&nbsp; {userPendingRewards1.toFixed(2)} BTC</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setTokenAmount1}
                                value={tokenAmount1}
                              />
                            </section>
                            <p onClick={() => setMaxAmount(1)} className="MaxButton">Max</p>
                          </section>
                          {Number(tokenAmount1) > Number(allowance) ?
                            <section className="LockBox">
                              {confirming1 === false ?
                                Number(tokenBalance) > 0 ?
                                  <>
                                    <p className='Text1'>Please approve BTC first</p>
                                    <button disabled={confirming1 === false ? false : true} onClick={() => onTokenAllowance(1)} className="LockButton">
                                      <p>Allow</p>
                                    </button>
                                  </>
                                  :
                                  <p className='Text1'>You have no BTC now</p>
                                :
                                <>
                                  <ClipLoader
                                    color={'#36d7b7'}
                                    loading={confirming1}
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
                                <p className='Text1'>Please enter your BTC Amount now!</p>
                                {confirming1 === false ?
                                  <>
                                    <section className="claimBox">
                                      <button disabled={tokenAmount1 > 0 ? false : true} onClick={() => onTokenStake(tokenAmount1, 1)} className="LockButton">Stake BTC Now!</button>
                                      {Number(userPendingRewards1) > 0 ?
                                        <button disabled={false} onClick={() => onTokenClaim(1)} className="LockButton">Claim BTC Now!</button>
                                        :
                                        <></>
                                      }
                                      {Number(userAmount1) > 0 ?
                                        <button disabled={lockingEnabled === true ? false : true} onClick={() => onTokenWithdraw(1)} className="LockButton">Withdraw BTC Now!</button>
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
                                      loading={confirming1}
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
                      </div>
                      <div className='PlanBox'>
                        <p class="ContractContentTextTitlePlan">Withdraw</p>
                        <div className='StakingBoxs'>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>TVL : </p>
                              <p className='Text1'>&nbsp; {tvl2.toFixed(0)} BTC  &nbsp;  &nbsp;</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>APY : </p>
                              <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Your Staked Amount : </p>
                              <p className='Text1'>&nbsp; {userAmount2} BTC</p>
                            </div>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Pending Reward Amount : </p>
                              <p className='Text1'>&nbsp; {userPendingRewards2.toFixed(2)} BTC</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setTokenAmount2}
                                value={tokenAmount2}
                              />
                            </section>
                            <p onClick={() => setMaxAmount(2)} className="MaxButton">Max</p>
                          </section>
                          {Number(tokenAmount2) > Number(allowance) ?
                            <section className="LockBox">

                              {confirming2 === false ?
                                Number(tokenBalance) > 0 ?
                                  <>
                                    <p className='Text1'>Please approve BTC first</p>
                                    <button disabled={confirming2 === false ? false : true} onClick={() => onTokenAllowance(2)} className="LockButton">
                                      <p>Allow</p>
                                    </button>
                                  </>
                                  :
                                  <p className='Text1'>You have no BTC now</p>
                                :
                                <>
                                  <ClipLoader
                                    color={'#36d7b7'}
                                    loading={confirming2}
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
                                <p className='Text1'>Please enter your BTC Amount now!</p>
                                {confirming2 === false ?
                                  <>
                                    <section className="claimBox">
                                      <button disabled={tokenAmount2 > 0 ? false : true} onClick={() => onTokenStake(tokenAmount2, 2)} className="LockButton">Stake BTC Now!</button>
                                      {Number(userPendingRewards2) > 0 ?
                                        <button disabled={false} onClick={() => onTokenClaim(2)} className="LockButton">Claim BTC Now!</button>
                                        :
                                        <></>
                                      }
                                      {Number(userAmount2) > 0 ?
                                        <button disabled={false} onClick={() => onTokenWithdraw(2)} className="LockButton">Withdraw BTC Now!</button>
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
                                      loading={confirming2}
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
                      </div>
                    </div>
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

export default BtcVault

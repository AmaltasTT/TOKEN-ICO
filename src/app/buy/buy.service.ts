import { Injectable } from '@angular/core';
import { SaleService } from '../sale/sale.service';
import { ethers } from 'ethers';
import { USDCABI } from './usdc.abi';
import { infAbi } from './infinity.abi';
import { HeaderService } from '../header/header.service';
import { AdminService } from '../admin/admin.service';
import { Router } from '@angular/router';
import { contractAddress } from '../../../env';


@Injectable({
  providedIn: 'root'
})
export class BuyService {
  provider: any;
  usdcAddress: any;
  usdcContract: any;
  usdcAbi: any;
  infinityAddress: any;
  infinityContract: any;
  infinityAbi: any;
  infinityBal: string = ''
  usdcBal: string = ''
  saleStartTime: string = ''
  saleEndTime: string = ''
  isBlacklsted: boolean = false;
  ethToPay: any;
  tokenToGet: any;


  constructor(private saleService: SaleService, private headerService: HeaderService, private adminService: AdminService, private route: Router) {
    this.provider = this.saleService.provider
    this.headerService.isWalletConnected = true;
    this.usdcAbi = USDCABI;
    this.usdcAddress = contractAddress.usdcContractAddress
    this.usdcContract = new ethers.Contract(this.usdcAddress, this.usdcAbi, this.provider)
    this.infinityAbi = infAbi;
    this.infinityAddress = contractAddress.infinityContractAddress;
    this.infinityContract = new ethers.Contract(this.infinityAddress, this.infinityAbi, this.provider)
  }

  async buyTokenPrivate(amount: string, buyType: string, proof: string[]) {
    const user = await this.provider.getSigner()
    try {
      const formData = {
        amount,
        buyType
      }
      const connectSigner = await this.saleService.icoContract.connect(user);
      console.log('await localStorage.getItem(`hexProof ${user.address}`) :', await localStorage.getItem(`hexProof ${user.address}`));
      const users = await localStorage.getItem(`hexProof ${user.address}`)
      console.log('users :', users, typeof users);
      const estimateFund = await this.saleService.icoContract.getEstimateFund(amount, buyType)
      const estimateValue = estimateFund[0].toString()

      const userEthBal = await this.provider.getBalance(user.address)
      if (this.headerService.isWalletConnected) {
        if (userEthBal > estimateValue) {
          if (await this.saleService.icoContract.saleEndTime() > Date.now() / 1000) {
            if (await this.saleService.icoContract.saleStartTime() < Date.now() / 1000) {
              if (buyType == '0') {
                const tx = await connectSigner.buyTokenPrivate(amount, buyType, proof, {
                  value: estimateValue
                })
                await tx.wait();
                return tx;
              } else {
                const icoAddress = await this.saleService.icoContractAddress
                const allowance = await this.usdcContract.allowance(user, icoAddress)
                const usdcBalance = await this.usdcContract.balanceOf(user);
                if (usdcBalance > estimateFund[0]) {
                  if (allowance < estimateFund[0]) {
                    await this.approveUDC(estimateFund[0])
                  }
                } else {
                  alert("NOT Enough USDC balance;")
                }
                const tx = await connectSigner.buyTokenPrivate(amount, buyType, proof)
                await tx.wait()

                return tx
              }
            } else {
              alert("Sale not started!!")
            }

          } else {
            alert("Sale is ended!")
          }
        } else {
          alert("Not enough eth")
        }
      } else {
        alert("Connect your wallet")
      }
    } catch (error) {
      console.error();
    }
  }

  async buyTokenPublic(amount: string, buyType: String) {
    const user = await this.provider.getSigner()
    try {
      const formData = {
        amount,
        buyType
      }
      const connectSigner = await this.saleService.icoContract.connect(user);
      const estimateFund = await this.saleService.icoContract.getEstimateFund(amount, buyType)
      if (this.headerService.isWalletConnected) {
        if (await this.saleService.icoContract.saleEndTime() > Date.now() / 1000) {
          if (await this.saleService.icoContract.saleStartTime() < Date.now() / 1000) {
            if (buyType == '0') {
              const estimateValue = estimateFund[0].toString()
              const tx = await connectSigner.buyTokenPublic(amount, buyType, {
                value: estimateValue
              })
              await tx.wait()
              return tx;
            } else {
              const icoAddress = await this.saleService.icoContractAddress
              const allowance = await this.usdcContract.allowance(user, icoAddress)
              const usdcBalance = await this.usdcContract.balanceOf(user);
              if (usdcBalance > estimateFund[0]) {
                if (allowance < estimateFund[0]) {
                  await this.approveUDC(estimateFund[0])
                }
              } else {
                alert("NOT Enough USDC balance;")
              }
              const tx = await connectSigner.buyTokenPublic(amount, buyType)
              await tx.wait()
              if (tx) {
              }
              return tx
            }
          } else {
            alert("Sale not started")
          }
        } else {
          alert("Sale ended!!")
        }
      } else {
        alert("Connect your wallet")
      }
    } catch (error) {
      console.error('error :', error);

    }
  }

  async getSaleType() {
    const sale = await this.saleService.icoContract.currentSaleType();
    return sale;
  }

  async approveUDC(amount: string) {
    const user = await this.provider.getSigner()
    const connectSigner = await this.usdcContract.connect(user);
    const icoAddress = await this.saleService.icoContractAddress
    const approve = await connectSigner.approve(icoAddress, amount)
    await approve.wait()
    return approve;
  }

  async getInfinityBalance() {
    const user = await this.provider.getSigner()
    const balance = await this.infinityContract.balanceOf(user)
    this.infinityBal = await ethers.formatEther(balance)
    return this.infinityBal;
  }

  async getUSDCBalance() {
    const user = await this.provider.getSigner();
    const balance = await this.usdcContract.balanceOf(user);
    this.usdcBal = balance;
    return this.usdcBal;
  }

  async isWalletConnected() {
    const connected = await this.headerService.isWalletConnected;
    return connected;
  }

  async getSaleStartTime() {
    this.saleStartTime = await this.saleService.icoContract.saleStartTime();
    return this.saleStartTime;
  }

  async getSaleEndTime() {
    this.saleEndTime = await this.saleService.icoContract.saleEndTime();
    return this.saleEndTime;
  }

  async isUserBlacklsted(address: string) {
    this.isBlacklsted = await this.saleService.icoContract.isBlacklisted(address)
    return this.isBlacklsted;
  }

  async getEstimateFund(amount: string, buyType: String) {
    const estimateFund = await this.saleService.icoContract.getEstimateFund(amount, buyType)
    if(buyType == '0') {
      this.ethToPay = estimateFund[0];
      console.log('this.ethToPay :', this.ethToPay);
      this.tokenToGet = estimateFund[1]
      console.log('this.tokenToGet :', this.tokenToGet);
    } else {
      this.ethToPay = estimateFund[0];
      this.tokenToGet = estimateFund[1]
    }
    return estimateFund;
  }
}

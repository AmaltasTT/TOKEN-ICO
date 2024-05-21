import { Component, OnInit } from '@angular/core';
import { BuyService } from './buy.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../admin/admin.service';
import { ethers } from 'ethers';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buy.component.html',
  styleUrl: './buy.component.css'
})
export class BuyComponent implements OnInit {
  buyType: any;
  amount: any;
  saleType: 'NO-SALE-ACTIVE' | 'Private-Sale' | 'Public-Sale' = 'NO-SALE-ACTIVE'
  infinityBal: string = ''
  usdcBal: any;
  isConnected: boolean = false;
  saleStartTime: string = '';
  saleEndTime: string = '';
  isBlacklisted: boolean = false
  payAmount: any;
  tokenAmt: any;
  constructor(private buyService: BuyService, private route: Router) { }

  async ngOnInit() {
    await this.isUserBlacklisted()
    if (await this.isWalletConnected()) {
      this.getInfinitybal();
      this.getUSDCbal()
    } else {
      this.infinityBal = '0';
      this.usdcBal = 0;
    }
    const endTime = await this.buyService.getSaleEndTime()
    const sale = await this.buyService.getSaleType()

    if (await sale == 1 && Number(endTime) < Date.now() / 1000) {
      this.saleType = 'NO-SALE-ACTIVE'
    } else if (await sale == 2 && Number(endTime) < Date.now() / 1000) {
      this.saleType = 'NO-SALE-ACTIVE'
    } else if (await sale == 1) {
      this.saleType = 'Private-Sale'
    } else if (await sale == 2) {
      this.saleType = 'Public-Sale'
    } else {
      this.saleType == 'NO-SALE-ACTIVE'
    }
  }

  async buyToken() {
    try {
      const user = await this.buyService.provider.getSigner()
      if (await this.buyService.getSaleType() != 0) {
        if (await !this.isBlacklisted) {
          if (await this.buyService.getSaleType() == 1) {
            const proof = await JSON.parse(localStorage.getItem(`hexProof ${user.address}`) || `${alert("You are not whitelisted")}`);
            const tx = await this.buyService.buyTokenPrivate(
              this.amount,
              this.buyType,
              proof
            )
          } else if (await this.buyService.getSaleType() == 2) {
            const tx = await this.buyService.buyTokenPublic(
              this.amount,
              this.buyType
            )
          }
        } else {
          alert("You're black-listed")
        }
      } else {
        alert ("Sale not started")
      }
    } catch (error) {
      console.error('error :', error);
    }
  }

  async isWalletConnected() {
    const isConnected = await this.buyService.isWalletConnected()
    this.isConnected = isConnected;
    return isConnected;
  }

  async isUserBlacklisted() {
    const user = await this.buyService.provider.getSigner()
    this.isBlacklisted = await this.buyService.isUserBlacklsted(user.address)
  }

  async getCurrentSale() {
    const sale = this.buyService.getSaleType()
  }

  async getInfinitybal() {
    this.infinityBal = await this.buyService.getInfinityBalance()
  }

  async getUSDCbal() {
    const bal = await this.buyService.getUSDCBalance()
    this.usdcBal = Number(bal) / 10 ** 6;
  }

  async getSaleStartTime() {
    this.saleStartTime = await this.buyService.getSaleStartTime()
  }

  async getSaleEndTime() {
    this.saleEndTime = await this.buyService.getSaleEndTime()
  }

  async getEstimatefund() {
    const tx = await this.buyService.getEstimateFund(this.amount, this.buyType)
    console.log(tx);
  }

  async onValue(event: any) {
    if (event?.target?.value) {
      [this.payAmount, this.tokenAmt] = await this.buyService.getEstimateFund(this.amount, this.buyType)
      if(this.buyType == '0') {
        this.payAmount = await ethers.formatEther(this.payAmount)
      }
      if(this.buyType == '1') {
        this.payAmount = Number(this.payAmount) / 10**6
      }
      console.log('value :', await this.payAmount, await this.tokenAmt);
      // const weiAmtinEth = await ethers.formatEther(this.tokenswapService.ethToToken)
      // console.log('weiAmtinEth :', weiAmtinEth);
      // console.log('value :', this.tokenswapService.ethToToken);
      // this.ethToTokenValue = weiAmtinEth
    }
  }
}

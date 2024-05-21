import { Injectable } from '@angular/core';
import { SaleService } from '../sale/sale.service';
import { ethers } from 'ethers';
@Injectable({
  providedIn: 'root'
})
export class BlacklistService {
  provider: any;
  icoContract: any;

  constructor(private saleService: SaleService) {
    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.icoContract = this.saleService.icoContract;
  }

  async blacklistUsers(users: string[]) {
    try {
      // Execute the smart contract function
      const user = await this.provider.getSigner();
      const connectUser = await this.saleService.icoContract.connect(user);
      const tx = await connectUser.blacklistUser(users);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error blacklisting users:', error);
      return false;
    }
  }
}

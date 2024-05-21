import { Injectable } from '@angular/core';
import { ethers, BrowserProvider, parseUnits } from 'ethers';
import { Subject } from 'rxjs';


declare global {
  interface Window {
    ethereum: any; // 'ethereum' property is optional
  }
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private web3js: any;
  provider: any;
  accounts: any;
  isWalletConnected: boolean = false;
  onAdmin: boolean= false;
  isAdmin: boolean = false;
  constructor() { }

  async connectAccount() {
    if (window.ethereum == null) {
      alert("Please install metamask")
    } else {
      const sepoliaChainId = '0xaa36a7'
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChainId }]
        });
        this.provider = new ethers.BrowserProvider(window.ethereum)
        this.isWalletConnected = true;
      } catch (error) {
        console.log('error :', error);

      }
      this.accounts = await this.provider.getSigner()
      localStorage.setItem('ethereum_account', this.accounts.address);
    }
  }

  async disconnectAccount() {
    this.isWalletConnected = false;
    localStorage.removeItem('ethereum_account')
  }

  async setIsAdmin() {
    return this.isAdmin = true;
  }
}

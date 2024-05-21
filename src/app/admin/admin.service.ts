import { Injectable } from '@angular/core';
import { HeaderService } from '../header/header.service';
import { ICOAbi } from '../sale/ico.abi';
import { ethers } from 'ethers';
import { SaleService } from '../sale/sale.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  provider: any;
  contractAddress: string = ''
  contract: any;
  
  constructor(private saleService: SaleService) {
    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.contractAddress = this.saleService.icoContractAddress;
    const abi = ICOAbi
    this.contract = new ethers.Contract(this.contractAddress, abi, this.provider)
  }
  
  
// Function to fetch all transactions for a given contract address
async fetchContractTransactions() {
  try {
      const transactions = await this.provider.getLogs({
          address: this.contractAddress,
          fromBlock: 0,
          toBlock: 'latest'
      }); 
      return transactions;
  } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
  }
}
}

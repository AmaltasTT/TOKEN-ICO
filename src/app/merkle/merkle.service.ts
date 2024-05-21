import { MerkleTree } from 'merkletreejs';
import { ethers, keccak256 } from 'ethers';
import { Injectable } from '@angular/core';
import { SaleService } from '../sale/sale.service';
import { Router } from '@angular/router';
import { local } from 'web3modal';

@Injectable({
  providedIn: 'root'
})

export class MerkleService {
  // Add addresses for whitelisting
  whitelistAddresses: string[] = [];

  hexProof: any[] = []
  rootHash: string = ''

  constructor(private saleService: SaleService, private route: Router) {
    console.log("array", this.whitelistAddresses);

  }
  async generateMerkleTree() {
    const leafNodes: string[] = this.whitelistAddresses.map(addr => keccak256(addr).toString());
    console.log('leafNodes :', leafNodes);
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

    // set this rootHash in solidity in setMerkleRoot function 
    this.rootHash = merkleTree.getHexRoot();
    console.log('this.rootHash :', this.rootHash);
    this.whitelistAddresses.forEach(async (address, index) => {
      const hexProof = await merkleTree.getHexProof(leafNodes[index]);
      console.log('hexProof :', hexProof);
      const verify = await this.saleService.icoContract.verifyWhitelist(hexProof)
      console.log('verify :', verify);
      localStorage.setItem(`hexProof ${address}`, JSON.stringify(hexProof))
    });
    if (this.rootHash != await this.saleService.icoContract.merkleRoot()) {
      const root = await this.saleService.setMerkleRoot(this.rootHash)
      await root.wait();
      if (root) {
        this.route.navigate(['admin'])
      }
    }
    const user = localStorage.getItem(`hexProof ${this.whitelistAddresses[0]}`)
    console.log('user :', user);
  }

  async addAddress(address: string) {
    const user = this.whitelistAddresses.push(address)
    localStorage.setItem("whitelistAddress", `[${address}]`)
    console.log('user :', user);
    console.log("address----------457", this.whitelistAddresses);
  }

}   
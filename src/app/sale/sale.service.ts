import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { HeaderComponent } from '../header/header.component';
import { HeaderService } from '../header/header.service';
import { ICOAbi } from './ico.abi';
import { contractAddress } from '../../../env';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  icoABi: any;
  icoContract: any;
  icoContractAddress: any;
  provider: ethers.BrowserProvider;
  signer: any

  constructor(private headerService: HeaderService) {
    this.icoContractAddress = contractAddress.icoContractAddress
    const abi = ICOAbi;
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.icoContract = new ethers.Contract(this.icoContractAddress, abi, this.provider)
  }

  async configSale(startTime: string, endTime: string, saleType: string, price: string) {
    if (await this.headerService.isWalletConnected) {
      const user = await this.provider.getSigner();
      try {
        const formData = {
          startTime,
          endTime,
          saleType,
          price
        }
        if(this.headerService.isWalletConnected) {
          const connectSigner = await this.icoContract.connect(user);
          const priceInWei = await ethers.parseEther(price)
          if (user.address == await this.icoContract.admin()) {
            const tx = await connectSigner.configSale(
              Math.floor(new Date(startTime).getTime() / 1000),
              Math.floor(new Date(endTime).getTime() / 1000),
              saleType,
              priceInWei
            )
            await tx.wait();
            return tx;
          } else {
            console.error("Not owner");
          }
        } else {
          alert("Connect your wallet!!")
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Connect your wallet")
    }
  }

  async setMerkleRoot(merkleRoot: any) {
    const user = await this.provider.getSigner();
    const connectSigner = await this.icoContract.connect(user);
    const root = await connectSigner.setMerkleRoot(merkleRoot)
    await root.wait()
    return root;
  }

}

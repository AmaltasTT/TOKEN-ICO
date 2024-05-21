import { Component, OnInit } from '@angular/core';
import { HeaderService } from './header.service';
import { CommonModule } from '@angular/common';
import { SaleService } from '../sale/sale.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  walletConnected: boolean = false;
  buttonNameToggle = true;
  buttonName: 'Connect' | 'Disconnect' = 'Connect';
  shortAddress: string | null = null;
  isAdmin: boolean = false;
  onAdmin: boolean = false;;

  constructor(private headerService: HeaderService, private saleService: SaleService, private route: Router) {
    if(localStorage.getItem("ethereum_acount")) {
      this.headerService.isWalletConnected = true;
      console.log('this.headerService.isWalletConnected :', this.headerService.isWalletConnected);
      this.walletConnected = true;
    } else {  
      this.headerService.isWalletConnected = false
      console.log('this.headerService.isWalletConnected :', this.headerService.isWalletConnected);
      this.walletConnected = false;
    }
  }

  async init() {
    const storedAccount = localStorage.getItem('ethereum_account')
    if (storedAccount == null) {
      console.log('storedAccount:', storedAccount);
      this.walletConnected = false;
      console.log('this.walletConnected :', this.walletConnected);
      this.headerService.isWalletConnected = false;
    }
    if(storedAccount) {
      this.walletConnected = true
      this.headerService.isWalletConnected = true
      if(await storedAccount == await this.saleService.icoContract.admin()) {
        this.isAdmin = true;
        await this.headerService.setIsAdmin()
      }
    }
  }
  async connectMetamask() {
    await this.headerService.connectAccount()
    this.walletConnected = this.headerService.isWalletConnected;
    if(await this.headerService.accounts.address == await this.saleService.icoContract.admin()) {
      this.isAdmin = true;
      this.headerService.isAdmin = true
    }
  }

  async routeAdmin() {
    if (this.walletConnected) {      
      this.route.navigate(['admin'])
      this.onAdmin=true;
      localStorage.setItem('onAdmin', JSON.stringify(this.onAdmin))
      this.headerService.onAdmin = true
    } else {
      alert("Please connect your wallet")
    }
  }

  async disconnectMetamask() {
    this.headerService.isWalletConnected = true;
    this.walletConnected = false;
    this.route.navigate(['/'])
    this.isAdmin = false;
    this.onAdmin =false;
    localStorage.removeItem('onAdmin')
    this.headerService.isAdmin = false
    await this.headerService.disconnectAccount()
  }

  ngOnInit(): void {
   this.init();
  }
}

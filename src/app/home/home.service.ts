import { Injectable } from '@angular/core';
import { BuyService } from '../buy/buy.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  saleType: any;
  constructor(private buyService: BuyService) {}

  async getCurrentSaleType(){
    this.saleType = await this.buyService.getSaleType();
    return this.saleType;
  }
}


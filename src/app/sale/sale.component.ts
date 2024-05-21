import { Component, OnInit } from '@angular/core';
import { SaleService } from './sale.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderService } from '../header/header.service';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export class SaleComponent implements OnInit {
  startTime: any;
  endTime: any;
  saleType: any;
  price: any;
  constructor(private headerService: HeaderService, private saleService: SaleService, private route: Router) { }

  async configSale() {
    try {
      const tx = await this.saleService.configSale(
        this.startTime,
        this.endTime,
        this.saleType,
        this.price
      )
      this.route.navigate(['admin'])
    } catch (error) {
      console.error(error);
    }
  }

  async ngOnInit() {
    await this.headerService.onAdmin;
  }

}


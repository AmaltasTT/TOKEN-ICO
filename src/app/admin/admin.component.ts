import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { SaleService } from '../sale/sale.service';
import { filter } from 'rxjs';
import { ICOAbi } from '../sale/ico.abi';
import { AdminService } from './admin.service';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../header/header.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit{
transactions: any[] = []
transactionsOnPage: any[] = [];
totalTransactions = 0;
currentPage = 1;
itemsPerPage = 10;

constructor(private adminService: AdminService, private headerService: HeaderService, private route: Router) {}

  ngOnInit(): void {
    this.fetchTransactions();
  }

  async fetchTransactions() {
    this.transactions = await this.adminService.fetchContractTransactions()
    this.totalTransactions = this.transactions.length;    
  }

  // ----------------
  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

}

import { Component } from '@angular/core';
import { BlacklistService } from './blacklist.service';
import { FormGroup, FormBuilder, FormArray, ReactiveFormsModule, FormsModule, Validators } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderService } from '../header/header.service';
import { SaleService } from '../sale/sale.service';


@Component({
  selector: 'app-blacklist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './blacklist.component.html',
  styleUrl: './blacklist.component.css'
})
export class BlacklistComponent {
  form: FormGroup;
  userAddress: string[] = []

  constructor(private blacklistService: BlacklistService, private fb: FormBuilder, private headerService: HeaderService, private saleService: SaleService, private route: Router) {
    this.form = this.fb.group({
      addresses: this.fb.array([this.createAddressControl()])
    });
  }

  createAddressControl(): FormGroup {
    return this.fb.group({
      address: ['', Validators.required]
    });
  }

  get addresses(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  addAddressControl(): void {
    this.addresses.push(this.createAddressControl());
  }

  removeAddressControl(index: number): void {
    this.addresses.removeAt(index);
  }

  async blacklistUser(): Promise<void> {
    if (this.form.valid) {
      const addresses = this.addresses.value.map((control: any) => control.address);
      const success = await this.blacklistService.blacklistUsers(addresses);
      if (success) {
        await this.route.navigate(['admin'])
        this.form.reset();
      } else {
        console.error('Failed to blacklist users');
      }
    } else {
      console.error('Form is invalid');
    }
  }
}

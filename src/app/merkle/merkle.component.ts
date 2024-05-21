import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, ReactiveFormsModule, FormsModule, Validators } from "@angular/forms";
import { MerkleService } from './merkle.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-merkle',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule],
  templateUrl: './merkle.component.html',
  styleUrl: './merkle.component.css'
})
export class MerkleComponent {
  form: FormGroup;
  userAddress: string[] = []
  constructor(private merkleService: MerkleService, private fb: FormBuilder,) {
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

  async whitelistUser(): Promise<void> {
    if (this.form.valid) {
      const addresses: string[] = this.addresses.value.map((control: any) => control.address);
      for(let i=0; i<addresses.length; i++){
        await this.merkleService.addAddress(addresses[i]);
      }
      if (this.merkleService.whitelistAddresses.length > 0) {
        await this.merkleService.generateMerkleTree();
      } else {
        console.error('Failed to whitelist users');
      }
    } else {
      console.error('Form is invalid');
    }
  }
}


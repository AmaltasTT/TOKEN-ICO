import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SaleComponent } from './sale/sale.component';
import { BuyComponent } from './buy/buy.component';
import { AdminComponent } from './admin/admin.component';
import { BlacklistComponent } from './blacklist/blacklist.component';
import { MerkleComponent } from './merkle/merkle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, HomeComponent, SaleComponent, BuyComponent, AdminComponent, BlacklistComponent, MerkleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ICO-Frontend';
}

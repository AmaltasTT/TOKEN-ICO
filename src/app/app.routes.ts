import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SaleComponent } from './sale/sale.component';
import { BuyComponent } from './buy/buy.component';
import { AdminComponent } from './admin/admin.component';
import { BlacklistComponent } from './blacklist/blacklist.component';
import { MerkleComponent } from './merkle/merkle.component';
import { AuthGuard } from '../../auth.guard';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent
    },
    {
        path: "admin/sale",
        component: SaleComponent
    }, 
    {
        path: "buy",
        canActivate: [AuthGuard],
        component: BuyComponent
    }, 
    {
        path: "admin",
        canActivate: [AuthGuard],

        component: AdminComponent
    }, 
    {
        path: "admin/blacklist",
        component: BlacklistComponent
    }, 
    {
        path: "admin/merkle",
        component: MerkleComponent
    }
];

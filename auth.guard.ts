// auth.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { HeaderService } from './src/app/header/header.service';
import { CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private headerService: HeaderService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {    
        if (this.headerService.isWalletConnected) {
            return true
        } else {
            this.router.navigate(['/']);
            alert("Connect your wallet")
        }
        return this.headerService.isWalletConnected;
    }
}

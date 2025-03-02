import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';

import { HostListener } from '@angular/core';

import { Observable } from 'rxjs';

@Component({
    selector       : 'user',
    templateUrl    : './user.component.html',
    styleUrls      : ['./user.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'user'
})
export class UserComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */



    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
      return true;
    }


    @Input() showAvatar: boolean = true;
    user: User;
    userType;
    agent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            this.userType = localStorage.getItem('userType');
   
            if(this.userType=='agent'){
              this.agent = JSON.parse(localStorage.getItem('agent'));
        
            }else{
              this.user = JSON.parse(localStorage.getItem('merchant')).merchant;
            
        
            }

            if(!this.user.avatar){
                this.user.avatar ='assets/images/avatars/builder.jpeg';

            }

            this.user.name= JSON.parse(localStorage.getItem('merchant')).merchant.fullName;
            this.user.email= JSON.parse(localStorage.getItem('merchant')).merchant.email;

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void
    {
        // Return if user is not available
        if ( !this.user )
        {
            return;
        }

        // Update the user
        this._userService.update({
            ...this.user,
            status
        }).subscribe();
    }

    /**
     * Sign out
     */
    signOut(): void
    {
        this._router.navigate(['/sign-out']);
    }


    getUser(): User{

        return this.user;
    }
}

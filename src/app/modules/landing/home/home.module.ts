import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { landingHomeRoutes } from 'app/modules/landing/home/home.routing';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingsComponent } from './bookings/bookings.component';
import { GroupActivitiesComponent } from './group-activities/group-activities.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingPopupComponent } from './booking-popup/booking-popup.component';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { GoogleApiModule, 
    GoogleApiService, 
    GoogleAuthService, 
    NgGapiClientConfig, 
    NG_GAPI_CONFIG,
    GoogleApiConfig } from 'ng-gapi';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SuccessComponent } from './success/success.component';
import { FailureComponent } from './failure/failure.component';

import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
  };

    let gapiClientConfig: NgGapiClientConfig = {
        client_id: "161957849902-tt33hs423t8d54nkmv16p7rkps1mfnvs.apps.googleusercontent.com",
        discoveryDocs: ["https://analyticsreporting.googleapis.com/$discovery/rest?version=v4"],
        ux_mode: "popup",
        redirect_uri: "https://ng-gapi-example.stackblitz.io/redirect",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile"
        ].join(" ")
    };

@NgModule({
    declarations: [
        LandingHomeComponent,
        BookingsComponent,
        GroupActivitiesComponent,
        BookingPopupComponent,
        SuccessComponent,
        FailureComponent

    ],
    imports     : [
        RouterModule.forChild(landingHomeRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatMenuModule,
        MatSidenavModule,
        CommonModule,
        ReactiveFormsModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatMomentModule,
        MatDatepickerModule,
      
        NgxIntlTelInputModule,
        MatRadioModule,
        MatSnackBarModule,
        PerfectScrollbarModule,
        
        GoogleApiModule.forRoot({
            provide: NG_GAPI_CONFIG,
            useValue: gapiClientConfig
          }),


    ]
})
export class LandingHomeModule
{
}

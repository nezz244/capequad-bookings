import { Route } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { BookingsComponent } from './bookings/bookings.component';


export const landingHomeRoutes: Route[] = [
    {
        path     : '',
        component: BookingsComponent
    },
    {
        path     : 'bookings',
        component:  BookingsComponent
    },
   
    
];

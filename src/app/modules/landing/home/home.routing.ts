import { Route } from '@angular/router';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { BookingsComponent } from './bookings/bookings.component';
import { GroupActivitiesComponent } from './group-activities/group-activities.component';

export const landingHomeRoutes: Route[] = [
    {
        path: '',
        component: LandingHomeComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'bookings'
            },
            {
                path: 'bookings',
                component: BookingsComponent
            },
            {
                path: 'group-activities',
                component: GroupActivitiesComponent
            }
        ]
    }
];

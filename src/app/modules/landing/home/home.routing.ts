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
                component: BookingsComponent,
                data: {
                    seo: {
                        title: 'Book Quad Biking & Dune Buggy | CapeAdrenaline Cape Town',
                        description:
                            'Book Cape Town quad biking (from R1000) and dune buggy tours (from R1500) with a scenic waterfall stop. Guided adventures at Trails End Hotel, Grabouw.',
                        keywords:
                            'book quad biking Cape Town, book dune buggy, waterfall adventure tour, Grabouw booking, CapeAdrenaline',
                        path: '/home/bookings',
                        image: 'assets/images/activities/buggy7.png'
                    }
                }
            },
            {
                path: 'group-activities',
                component: GroupActivitiesComponent,
                data: {
                    seo: {
                        title: 'Group Activities & Corporate Tours | CapeAdrenaline',
                        description:
                            'Plan group quad biking and dune buggy adventures in Cape Town. Contact CapeAdrenaline for team outings, events, and custom group packages.',
                        keywords:
                            'group quad biking Cape Town, corporate adventure tour, team building Grabouw, group dune buggy',
                        path: '/home/group-activities',
                        image: 'assets/images/activities/quads1.jpeg'
                    }
                }
            }
        ]
    }
];

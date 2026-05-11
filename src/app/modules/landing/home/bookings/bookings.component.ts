import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookingPopupComponent } from '../booking-popup/booking-popup.component';
import { ActivityDetailsPopupComponent } from '../activity-details-popup/activity-details-popup.component';
import {ActivityGalleryPopupComponent} from "../activity-gallery-popup/activity-gallery-popup.component";

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html'
})
export class BookingsComponent {

    constructor(private dialog: MatDialog) {}

    activities = [
        {
            title: 'Quadbiking 1hr',
            shortDescription:
                'Experience the thrill of adventure in the Grabouw mountains on a guided quad biking tour. Ride along scenic trails and enjoy panoramic views of the surrounding landscapes.',
            fullDescription: `
<div class="space-y-3 text-sm text-gray-700 leading-snug">
  <p>
    Guided <strong>quad biking</strong> from <strong>Trails End Hotel</strong> in the Grabouw mountains — winding trails, rugged terrain, and wide-open views with an experienced guide. Great for thrill-seekers and sightseers alike. Add lunch &amp; transport when you book (per person).
  </p>

  <div>
    <h4 class="font-bold text-base mb-1">Highlights</h4>
    <ul class="list-disc ml-5 space-y-0.5">
      <li>Scenic mountain trails &amp; viewpoints</li>
      <li>Quad bike on rugged paths</li>
      <li>Panoramic valley &amp; mountain views</li>
    </ul>
  </div>

  <div>
    <h4 class="font-bold text-base mb-1">Inclusions &amp; exclusions</h4>
    <p class="mb-0.5"><span class="font-semibold">Includes:</span> guided quad tour, safety equipment, guide.</p>
    <p class="mb-0"><span class="font-semibold">Not included:</span> R100 nature reserve entrance permit.</p>
  </div>
</div>
`,
            price: 500,
            timeStart: '10:00 AM',
            timeEnd: '17:00 PM',
            dates: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            imgUrl: 'assets/images/activities/quads1.jpeg',
            gallery: [
                'assets/images/activities/quads1.jpeg',
                'assets/images/activities/quads3.jpeg'
            ],
            addons: [
                { id: 'lunch', label: 'Burger and chips lunch', pricePerPerson: 200 },
                { id: 'transport', label: 'Transport', pricePerPerson: 300 }
            ]
        },
        {
            title: 'Dune buggy experience',
            shortDescription:
                'Experience the thrill of adventure in the Grabouw mountains on a guided dune buggy tour. Ride along scenic trails and enjoy panoramic views of the surrounding landscapes.',
            fullDescription: `
<div class="space-y-3 text-sm text-gray-700 leading-snug">
  <p>
    Guided <strong>dune buggy</strong> (side-by-side) tour from <strong>Trails End Hotel</strong> in the Grabouw mountains — trails, rugged terrain, and wide-open views with an experienced guide. Add lunch &amp; transport when you book (per person).
  </p>

  <div>
    <h4 class="font-bold text-base mb-1">Highlights</h4>
    <ul class="list-disc ml-5 space-y-0.5">
      <li>Scenic mountain trails &amp; viewpoints</li>
      <li>Side-by-side buggy on rugged paths</li>
      <li>Panoramic valley &amp; mountain views</li>
    </ul>
  </div>

  <div>
    <h4 class="font-bold text-base mb-1">Inclusions &amp; exclusions</h4>
    <p class="mb-0.5"><span class="font-semibold">Includes:</span> guided dune buggy tour, safety equipment, guide.</p>
    <p class="mb-0"><span class="font-semibold">Not included:</span> R100 nature reserve entrance permit.</p>
  </div>
</div>
`,
            price: 1000,
            timeStart: '10:00 AM',
            timeEnd: '17:00 PM',
            dates: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            imgUrl: 'assets/images/activities/buggy1.jpeg',
            gallery: [
                'assets/images/activities/buggy1.jpeg',
                'assets/images/activities/buggy2.jpeg',
                'assets/images/activities/buggy3.jpeg',
                'assets/images/activities/buggy4.jpeg'
            ],
            addons: [
                { id: 'lunch', label: 'Burger and chips lunch', pricePerPerson: 200 },
                { id: 'transport', label: 'Transport', pricePerPerson: 300 }
            ]
        }
    ];

    openBooking(activity: any) {
        this.dialog.open(BookingPopupComponent, {
            data: activity,
            disableClose: true,
            panelClass: ['animate__animated','animate__zoomIn']
        });
    }

    viewDetails(activity: any) {
        this.dialog.open(ActivityDetailsPopupComponent, {
            data: activity,
            width: '90%',
            maxWidth: '700px',
            panelClass: ['animate__animated','animate__fadeIn']
        });
    }

    viewImages(activity: any) {
        console.log('Opening gallery for:', activity.title, activity.gallery); // debug
        this.dialog.open(ActivityGalleryPopupComponent, {
            data: { title: activity.title, gallery: activity.gallery },
            width: '90%',
            maxWidth: '800px',
            panelClass: ['animate__animated','animate__fadeIn']
        });
    }


}

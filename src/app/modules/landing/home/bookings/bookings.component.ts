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
            title: 'Quad Biking',
            shortDescription: 'Adrenaline-packed quad biking adventure.',
            fullDescription: `
<div class="space-y-4 text-gray-700 leading-relaxed">
  <h4 class="font-bold">Full Description</h4>
  <p>
   This action-packed activity offers a unique opportunity to explore the
    stunning natural landscapes of the dunes while enjoying the exhilaration of off-road quadbiking.
  </p>

  <p>
    Throughout the tour, our knowledgeable guides will provide interesting insights into the unique flora
    and fauna of the dunes, as well as the history and geology of the area. You'll have plenty of opportunities
    to stop, take photos, and soak in the breathtaking views of the surrounding landscapes.
  </p>

  <h4 class="font-bold mt-4">Highlights</h4>
  <ul class="list-disc ml-6 space-y-1">
    <li>Conquer the thrilling dunes: Navigate through sandy terrains</li>
    <li>Unforgettable adventure for all levels</li>
    <li>Flexible options for convenience</li>
  </ul>

   <h4 class="font-bold mt-4">Inclusions</h4>
    <li>Quadbike, Helmet, Hair Net</li>
    <li>Tour Guides will take pictures</li>

  <h4 class="font-bold mt-4">Exclusions</h4>
  <li>R250 NATURE DAY entry permit</li>

</div>
`,
            price: 799,
            timeStart: '10:00 AM',
            timeEnd: '17:00 PM',
            dates: ['Mon','Tue','Wed','Thur','Fri','Sat'],
            imgUrl: 'assets/images/activities/12.jpeg',
            gallery: [
                'assets/images/activities/quad1.avif',
                'assets/images/activities/quad2.avif',
                'assets/images/activities/quad4.avif',
                'assets/images/activities/quad5.avif',
                'assets/images/activities/quad6.avif'
            ]
        },
        {
            title: 'Cape Town Dessert Thrill: Jeep Dune Venture',
            shortDescription: 'Jeep tour + sandboarding experience.',
            fullDescription: `
<div class="space-y-4 text-gray-700 leading-relaxed">

  <h4 class="font-bold">Full Description</h4>
  <p>
    The <strong>Desert Thrill Dune Jeep Venture</strong> at Atlantis Dunes is an unforgettable adventure
    for thrill-seekers and nature enthusiasts alike.</p>

  <p>
    The adventure is led by experienced professional guides who ensure your safety while
    showing you the very best of the desert’s unique landscape. Complimentary water is provided
    to keep you energized throughout the tour.
  </p>

  <h4 class="font-bold mt-4">Highlights</h4>
  <ul class="list-disc ml-6 space-y-1">
    <li>Thrilling dune bashing and sandboarding experience</li>
    <li>Explore South Africa's iconic Atlantis Desert</li>
    <li>Epic jeep adventure across towering dunes</li>
    <li>Perfect for adrenaline seekers and outdoor lovers</li>
    <li>Professionally guided and safety-focused tour</li>
  </ul>

  <h4 class="font-bold mt-4">Inclusions</h4>
    <li>Our 4x4 jeep, water and sandboards</li>


  <h4 class="font-bold mt-4">Exclusions</h4>
  <li>R250 NATURE DAY entry permit</li>


Inclusions

Exclusions
nature reserve entry permit of R250
</div>
`,      price: 960,
            timeStart: '10:00 AM',
            timeEnd: '17:00 PM',
            dates: ['Mon','Tue','Wed','Thur','Fri','Sat'],
            imgUrl: 'assets/images/activities/15.jpeg',
            gallery: [
                'assets/images/activities/jeep1.jpeg',
                'assets/images/activities/jeep2.jpeg',
                'assets/images/activities/jeep3.jpeg',
                'assets/images/activities/jeep4.jpeg',
                'assets/images/activities/jeep5.jpeg',
                'assets/images/activities/jeep6.jpeg',
                'assets/images/activities/jeep7.jpeg',
                'assets/images/activities/jeep8.jpeg',
                'assets/images/activities/jeep9.jpeg'
            ]
        },
        {
            title: 'SandBoarding',
            shortDescription: 'Pure sandboarding excitement.',
            fullDescription: `
<div class="space-y-4 text-gray-700 leading-relaxed">

  <h4 class="font-bold">Full Description</h4>
  <p>
    Embark on an exhilarating sandboarding adventure at Atlantis Dunes, a breathtaking destination where golden sands stretch
    as far as the eye can see.
  </p>

  <p>
    No matter your skill level, sandboarding at Atlantis Dunes is an adventure that combines excitement, nature, and the joy of mastering a new challenge.
    Get ready to conquer the dunes, embrace the speed, and make unforgettable memories in one of South Africa’s most spectacular outdoor playgrounds!
  </p>

  <h4 class="font-bold mt-4">Highlights</h4>
  <ul class="list-disc ml-6 space-y-1">
    <li>Experience the rush of sandboarding down colossal dunes</li>
    <li>Learn from seasoned instructors who ensure a safe and enjoyable ride</li>
    <li>Inclusive Gear: All the equipment you need, from boards to safety gear, is provided</li>
  </ul>

    <h4 class="font-bold mt-4">Inclusions</h4>
    <li>Sandboarding equipment (board, bindings, and safety gear)</li>

  <h4 class="font-bold mt-4">Exclusions</h4>
  <li>R80 NATURE DAY entry permit</li>

</div>
`
,            price: 350,
            timeStart: '10:00 AM',
            timeEnd: '17:00 PM',
            dates: ['Mon','Tue','Wed','Thur','Fri','Sat'],
            imgUrl: 'assets/images/activities/7.jpeg',
            gallery: [
                'assets/images/activities/sand1.avif',
                'assets/images/activities/sand2.avif',
                'assets/images/activities/sand3.avif'
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

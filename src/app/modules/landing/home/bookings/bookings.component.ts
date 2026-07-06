import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookingPopupComponent } from '../booking-popup/booking-popup.component';
import { ActivityDetailsPopupComponent } from '../activity-details-popup/activity-details-popup.component';
import {ActivityGalleryPopupComponent} from "../activity-gallery-popup/activity-gallery-popup.component";
import { BOOKING_ACTIVITIES, BookingActivity } from '../booking-catalog';

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html'
})
export class BookingsComponent {

    constructor(private dialog: MatDialog) {}

    readonly heroVideoUrl = 'assets/videos/capeadrenaline-hero.mp4';
    readonly heroFallbackImage = 'assets/images/activities/quadbike-waterfall-cover-landscape.jpg';
    heroVideoFailed = false;

    onHeroVideoError(): void {
        this.heroVideoFailed = true;
    }

    activities = BOOKING_ACTIVITIES;

    openBooking(activity: BookingActivity) {
        this.dialog.open(BookingPopupComponent, {
            data: activity,
            disableClose: true,
            panelClass: ['animate__animated','animate__zoomIn']
        });
    }

    viewDetails(activity: BookingActivity) {
        this.dialog.open(ActivityDetailsPopupComponent, {
            data: activity,
            width: '90%',
            maxWidth: '700px',
            panelClass: ['animate__animated','animate__fadeIn']
        });
    }

    viewImages(activity: BookingActivity) {
        console.log('Opening gallery for:', activity.title, activity.gallery); // debug
        this.dialog.open(ActivityGalleryPopupComponent, {
            data: { title: activity.title, gallery: activity.gallery },
            width: '90%',
            maxWidth: '800px',
            panelClass: ['animate__animated','animate__fadeIn']
        });
    }


}

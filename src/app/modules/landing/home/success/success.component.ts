import { Component, OnInit } from '@angular/core';
import { EMPTY, timer } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { GoogleAdsService } from 'app/core/analytics/google-ads.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  payment: any;
  booking: any;

  constructor(
    private authService: AuthService,
    private googleAds: GoogleAdsService
  ) {}

  ngOnInit(): void {

    this.payment = JSON.parse(localStorage.getItem('payment'));
    this.booking = JSON.parse(localStorage.getItem('booking'));

    const checkoutId = String(this.payment?.id || '');
    if (!checkoutId || !this.booking) {
      return;
    }

    timer(0, 1500).pipe(
      take(15),
      switchMap(() => this.authService.getCheckoutStatus(checkoutId).pipe(
        catchError(() => EMPTY)
      )),
      filter(status => status?.status === 'completed'),
      take(1)
    ).subscribe(status => {
      const purchaseValue = Number(status.value);
      const transactionId = String(status.transactionId || '');
      const trackingKey = `capeadrenaline_purchase_tracked_${transactionId}`;

      if (
        Number.isFinite(purchaseValue) &&
        purchaseValue > 0 &&
        transactionId &&
        !localStorage.getItem(trackingKey)
      ) {
        this.googleAds.trackPurchase(
          purchaseValue,
          transactionId,
          String(status.service || this.booking.service || ''),
          Number(status.totalTickets || this.booking.totalTickets || 1)
        );
        localStorage.setItem(trackingKey, 'true');
      }

      localStorage.removeItem('payment');
    });
  }

  bookingUnitLabel(): string {
    return this.booking?.priceUnit === 'couple' ? 'couple(s)' : 'person(s)';
  }
}

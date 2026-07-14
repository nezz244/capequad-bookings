import { Component, OnInit } from '@angular/core';

declare var gtag: Function;

const GOOGLE_ADS_PURCHASE_DESTINATION = 'AW-18322448078/mKS6CJGvvdAcEM696aBE';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  payment: any;
  booking: any;

  constructor() {}

  ngOnInit(): void {

    this.payment = JSON.parse(localStorage.getItem('payment'));
    this.booking = JSON.parse(localStorage.getItem('booking'));

    if (this.payment && this.booking) {
      const purchaseValue = Number(this.booking.totalCost);
      const transactionId = String(this.payment.id || '');

      if (Number.isFinite(purchaseValue) && purchaseValue > 0 && transactionId) {
        gtag('event', 'conversion', {
          send_to: GOOGLE_ADS_PURCHASE_DESTINATION,
          transaction_id: transactionId,
          value: purchaseValue,
          currency: 'ZAR'
        });
      }

      localStorage.removeItem('payment');
    }
  }

  bookingUnitLabel(): string {
    return this.booking?.priceUnit === 'couple' ? 'couple(s)' : 'person(s)';
  }
}

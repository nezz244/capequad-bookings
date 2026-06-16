import { Component, OnInit } from '@angular/core';

declare var gtag: Function;

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

      // ✅ FIRE GOOGLE CONVERSION HERE
      gtag('event', 'purchase', {
        transaction_id: this.payment.id,
        value: this.payment.amount || this.booking.totalCost,
        currency: 'ZAR',
        items: [
          {
            item_name: this.booking.service,
            quantity: this.booking.totalTickets
          }
        ]
      });

      localStorage.removeItem('payment');
    }
  }

  bookingUnitLabel(): string {
    return this.booking?.priceUnit === 'couple' ? 'couple(s)' : 'person(s)';
  }
}

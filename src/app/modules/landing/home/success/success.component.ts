import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

declare var gtag: Function;

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  payment: any;
  booking: any;

  constructor(private main: AuthService) {}

  ngOnInit(): void {

    this.payment = JSON.parse(localStorage.getItem('payment'));
    this.booking = JSON.parse(localStorage.getItem('booking'));

    if (this.payment && this.booking) {

      this.booking['paymentRef'] = this.payment.id;

      // ✅ FIRE GOOGLE CONVERSION HERE
      gtag('event', 'purchase', {
        transaction_id: this.payment.id,
        value: this.payment.amount || this.booking.totalAmount,
        currency: 'ZAR',
        items: [
          {
            item_name: this.booking.title,
            quantity: this.booking.totalTickets
          }
        ]
      });

      // ✅ email
      this.main.sendEmail(this.booking).subscribe(() => {
        this.saveBooking(this.booking);
      });
    }
  }

  saveBooking(booking: { [x: string]: Date }) {

    booking['created'] = new Date();

    this.main.saveBooking(this.booking).subscribe(() => {
      localStorage.removeItem('payment');
    });
  }
}

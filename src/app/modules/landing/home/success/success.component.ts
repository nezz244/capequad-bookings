import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  payment: any ;
  booking: any ;

  constructor(private main: AuthService ) {

  }

  ngOnInit(): void {

    this.payment = JSON.parse(localStorage.getItem('payment'));
    this.booking = JSON.parse(localStorage.getItem('booking'));
    this.booking['paymentRef'] = this.payment.id;

    if(this.payment){
      this.main.sendEmail(this.booking).subscribe((data) => {
        console.log(data);
        //remove the payment
        this.saveBooking(this.booking);
      });

    }

  }


    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  saveBooking(booking: { [x: string]: Date }){

    booking['created'] = new Date() ;

    this.main.saveBooking(this.booking).subscribe((data) => {
      console.log(data);
      localStorage.removeItem('payment');
    });

  }

}

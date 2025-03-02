import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookingPopupComponent } from '../booking-popup/booking-popup.component';


@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {



  activities =[
    {
      title: 'Quad Biking',
      description : 'Enjoy the adrenaline rush for a whole hour quad biking in the Atlantic dunes. ',
      price: 799,
      timeStart : '10:00 AM',
      timeEnd : '17:00 PM',
      dates : ['Mon','Tue','Wed','Thur','Fri','Sat'],
      imgUrl : '../../../../../assets/images/activities/12.jpeg'

    },
    {
      title: 'Jeep Ride & SandBoarding',
      description : 'Drive around the Atlantic dunes in a Jeep and sandboard  at the top for 2hrs.',
      price: 960,
      timeStart : '10:00 AM',
      timeEnd : '17:00 PM',
      dates : ['Mon','Tue','Wed','Thur','Fri','Sat'],
      imgUrl : '../../../../../assets/images/activities/15.jpeg'

    },
    {
      title: 'SandBoarding',
      description : 'Enjoy sandboarding at the Atlantic dunes with the aid of professionals for 2hrs.',
      price: 499,
      timeStart : '10:00 AM',
      timeEnd : '17:00 PM',
      dates : ['Mon','Tue','Wed','Thur','Fri','Sat'],
      imgUrl : '../../../../../assets/images/activities/7.jpeg'

    },


  ]
  constructor( private _matDialog : MatDialog) {



  }

  ngOnInit(): void {
  }


  openBooking(activity){
      localStorage.setItem('activity',JSON.stringify(activity));
      const dialogRef = this._matDialog.open(BookingPopupComponent,{
        disableClose: true ,
        panelClass: ['animate__animated','animate__zoomIn']
      });

  }

}

import { ChangeDetectorRef, Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Validators } from 'ngx-editor';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { GoogleApiService } from 'ng-gapi';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { totalmem } from 'os';
import { AuthService } from 'app/core/auth/auth.service';


@Component({
  selector: 'app-booking-popup',
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent implements OnInit {

  isLoading : boolean = false;

  config ={useBothWheelAxes: false, suppressScrollX: true, suppressScrollY: false}

  @ViewChild('picker') picker: any;

  calendarApi;

  gapi : any;

  public date: any;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: any;
  public maxDate: any;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';

  
  public dateControl = new FormControl(new Date());
  public dateControlMinMax = new FormControl(new Date());

  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' }
  ];

  public listColors = ['primary', 'accent', 'warn'];

  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];

  bookingForm : FormGroup;
  activity : any;

  

   //phone numbers
   separateDialCode = false;
   SearchCountryField = SearchCountryField;
   CountryISO = CountryISO;
   PhoneNumberFormat = PhoneNumberFormat;
   preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  

  constructor(private fb: FormBuilder,private _snackBar : MatSnackBar,
    private gapiService: GoogleApiService, 
    private cd : ChangeDetectorRef,private main : AuthService,
    public matDialogRef: MatDialogRef<BookingPopupComponent>) { 

    this.bookingForm = this.fb.group({
      email: ['',[Validators.required]],
      fullName:['',[Validators.required]],
      numberOfPeople :[1,[Validators.required]],
      phoneNumber  : ['',[Validators.required]],
      transport : [false,[Validators.required]],
    });

     // First make sure gapi is loaded can be in AppInitilizer
    //  this.gapiService.onLoad().subscribe(() => this.loadGapiClient());

  }

  ngOnInit(): void {
      this.activity = JSON.parse(localStorage.getItem('activity'));
  }


  // loadGapiClient() {
  //   gapi.load('client', async () => {
  //     await gapi.client.load('calendar', 'v3');
  //     this.calendarApi = (gapi.client as any).calendar;
      
  //   });
  // }


  try(){
    console.log(this.f.phoneNumber.value);
    this.cd.detectChanges();
    console.log(this.dateControl.value);
  }


  saveAndClose(){
    this.matDialogRef.close();

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }

  get f(){return this.bookingForm.controls};

  checkNumber(){
    if(this.f.numberOfPeople.value == -1){
        this.f.numberOfPeople.setValue(1);
        this.openSnackBar('Minimum number of people is 1','Close');
    }
  }

  checkout(){
   
  if(this.bookingForm.valid && this.f.phoneNumber.value !=null ){
    this.isLoading = true;
    this.cd.detectChanges();
    //CALCULATE TOTAL FIRST
    if(this.f.transport.value==false){
      var total = this.activity.price * this.f.numberOfPeople.value;
    }else{
      var total = this.activity.price * this.f.numberOfPeople.value + (500*this.f.numberOfPeople.value)
    }
    
    
    var dto = {
      phoneNumber:this.f.phoneNumber.value.e164Number,
      email : this.f.email.value,
      date : this.dateControl.value,
      fullName : this.f.fullName.value,
      totalTickets : this.f.numberOfPeople.value,
      totalCost : total,
      transport : this.f.transport.value,
      service : this.activity.title
    
    } 
    //add a payment ref

    console.log(dto);

    this.main.triggerCheckout(dto).subscribe(data => {   
      console.log(data);
      if(data.data.status=='created'){
        localStorage.setItem('payment',JSON.stringify(data.data));
        localStorage.setItem('booking',JSON.stringify(dto));
        this.isLoading = false;
        this.cd.detectChanges();
        window.open(data.data.redirectUrl,'_self');
      }else{
        this.openSnackBar('Something went wrong, try again later.','Close');
        this.isLoading = false;
        this.cd.detectChanges();
      }
      
    }) 




  }else{
    this.openSnackBar('Please fill out form','Close');
    this.isLoading = false;
    this.cd.detectChanges();
  }

}




}

import { ChangeDetectorRef, Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { GoogleApiService } from 'ng-gapi';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'app-booking-popup',
    templateUrl: './booking-popup.component.html',
    styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent implements OnInit {

    isLoading: boolean = false;

    config = { useBothWheelAxes: false, suppressScrollX: true, suppressScrollY: false };

    @ViewChild('picker') picker: any;

    public dateControl = new FormControl(new Date());

    bookingForm: FormGroup;
    activity: any;

    // Phone settings
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    PhoneNumberFormat = PhoneNumberFormat;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

    constructor(
        private fb: FormBuilder,
        private _snackBar: MatSnackBar,
        private gapiService: GoogleApiService,
        private cd: ChangeDetectorRef,
        private main: AuthService,
        public matDialogRef: MatDialogRef<BookingPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        // Form initialization
        this.bookingForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            fullName: ['', [Validators.required]],
            numberOfPeople: [1, [Validators.required, Validators.min(1)]],
            phoneNumber: [''],           // No Angular required validator for ngx-intl-tel-input
            transportOption: ['']        // '', 'class', 'vclass'
        });

    }

    ngOnInit(): void {
        this.activity = this.data;

        // Enforce capacity rules when transport option changes
        this.f.transportOption.valueChanges.subscribe(() => {
            this.checkNumber();
        });
    }

    // Shortcut to form controls
    get f() {
        return this.bookingForm.controls;
    }

    saveAndClose() {
        this.matDialogRef.close();
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, { duration: 3000 });
    }

    // Enforce passenger limits
    checkNumber() {
        const people = this.f.numberOfPeople.value;
        const option = this.f.transportOption.value;

        if (people < 1) {
            this.f.numberOfPeople.setValue(1);
            this.openSnackBar('Minimum number of people is 1', 'Close');
        }

        if (option === 'class' && people > 3) {
            this.f.numberOfPeople.setValue(3);
            this.openSnackBar('Mercedes Benz Class allows only 3 passengers', 'Close');
        }

        if (option === 'vclass' && people > 8) {
            this.f.numberOfPeople.setValue(8);
            this.openSnackBar('Mercedes Benz V-Class allows only 8 passengers', 'Close');
        }
    }

    // Calculate total cost including transport
    getTotalPrice(): number {
        const base = this.activity.price;
        console.log("sent price base", base);
        const option = this.f.transportOption.value;

        let transportFee = 0;
        if (option === 'class') transportFee = 1000;
        if (option === 'vclass') transportFee = 1750;
        console.log("sent transportFee", base + transportFee);

        return base + transportFee;
    }

    // Production-ready checkout
    checkout() {

        this.bookingForm.markAllAsTouched();
        const phone = this.f.phoneNumber.value;

        // Validate form fields
        if (!this.bookingForm.valid) {
            this.openSnackBar('Please complete all required fields', 'Close');
            return;
        }

        // Validate phone number object
        if (!phone || !phone.e164Number) {
            this.openSnackBar('Please enter a valid phone number', 'Close');
            return;
        }

        // Passed all validations — proceed
        this.isLoading = true;
        this.cd.detectChanges();

        const total = this.getTotalPrice();

        const dto = {
            phoneNumber: phone.e164Number,
            email: this.f.email.value,
            date: this.dateControl.value,
            fullName: this.f.fullName.value,
            totalTickets: this.f.numberOfPeople.value,
            totalCost: total,
            transport: this.f.transportOption.value,
            service: this.activity.title
        };

        console.log('Booking DTO:', dto);

        this.main.triggerCheckout(dto).subscribe(data => {

            if (data.data.status === 'created') {
                localStorage.setItem('payment', JSON.stringify(data.data));
                localStorage.setItem('booking', JSON.stringify(dto));
                this.isLoading = false;
                this.cd.detectChanges();
                window.open(data.data.redirectUrl, '_self');
            } else {
                this.openSnackBar('Something went wrong, try again later.', 'Close');
                this.isLoading = false;
                this.cd.detectChanges();
            }

        });

    }

}

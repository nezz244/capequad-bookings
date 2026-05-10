import { ChangeDetectorRef, Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'app-booking-popup',
    templateUrl: './booking-popup.component.html',
    styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent implements OnInit {

    isLoading = false;

    config = { useBothWheelAxes: false, suppressScrollX: true, suppressScrollY: false };

    public dateControl = new FormControl(new Date());

    bookingForm: FormGroup;
    activity: any;

    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    PhoneNumberFormat = PhoneNumberFormat;

    constructor(
        private fb: FormBuilder,
        private _snackBar: MatSnackBar,
        private cd: ChangeDetectorRef,
        private main: AuthService,
        public matDialogRef: MatDialogRef<BookingPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.bookingForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            fullName: ['', [Validators.required]],
            numberOfPeople: [1, [Validators.required, Validators.min(1)]],
            phoneNumber: [''],
            addonLunch: [false],
            addonTransport: [false]
        });
    }

    ngOnInit(): void {
        this.activity = this.data;
    }

    get f() {
        return this.bookingForm.controls;
    }

    addonPricePerPerson(addonId: string): number {
        const row = this.activity?.addons?.find((a: { id: string }) => a.id === addonId);
        return row?.pricePerPerson ?? 0;
    }

    saveAndClose(): void {
        this.matDialogRef.close();
    }

    openSnackBar(message: string, action: string): void {
        this._snackBar.open(message, action, { duration: 3000 });
    }

    checkNumber(): void {
        const people = Number(this.f.numberOfPeople.value);
        if (people < 1) {
            this.f.numberOfPeople.setValue(1);
            this.openSnackBar('Minimum number of people is 1', 'Close');
        }
    }

    getTotalPrice(): number {
        const peopleCount = Number(this.f.numberOfPeople.value) || 1;
        let total = this.activity.price * peopleCount;

        if (this.f.addonLunch.value) {
            total += this.addonPricePerPerson('lunch') * peopleCount;
        }
        if (this.f.addonTransport.value) {
            total += this.addonPricePerPerson('transport') * peopleCount;
        }

        return total;
    }

    checkout(): void {
        this.bookingForm.markAllAsTouched();
        const phone = this.f.phoneNumber.value;

        if (!this.bookingForm.valid) {
            this.openSnackBar('Please complete all required fields', 'Close');
            return;
        }

        if (!phone || !phone.e164Number) {
            this.openSnackBar('Please enter a valid phone number', 'Close');
            return;
        }

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
            transport: '',
            service: this.activity.title,
            extras: {
                burgerLunchPerPerson: this.f.addonLunch.value,
                lunchPerPersonAmount: this.f.addonLunch.value ? this.addonPricePerPerson('lunch') : 0,
                transportPerPerson: this.f.addonTransport.value,
                transportPerPersonAmount: this.f.addonTransport.value ? this.addonPricePerPerson('transport') : 0
            }
        };

        this.main.triggerCheckout(dto).subscribe({
            next: (data) => {
                if (data.data.status === 'created') {
                    localStorage.setItem('payment', JSON.stringify(data.data));
                    localStorage.setItem('booking', JSON.stringify(dto));
                    window.open(data.data.redirectUrl, '_self');
                } else {
                    this.openSnackBar('Something went wrong, try again later.', 'Close');
                }
                this.isLoading = false;
                this.cd.detectChanges();
            },
            error: () => {
                this.openSnackBar('Something went wrong, try again later.', 'Close');
                this.isLoading = false;
                this.cd.detectChanges();
            }
        });
    }
}

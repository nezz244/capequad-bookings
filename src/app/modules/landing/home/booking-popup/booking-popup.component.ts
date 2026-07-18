import { ChangeDetectorRef, Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { AuthService } from 'app/core/auth/auth.service';
import { GoogleAdsService } from 'app/core/analytics/google-ads.service';

@Component({
    selector: 'app-booking-popup',
    templateUrl: './booking-popup.component.html',
    styleUrls: ['./booking-popup.component.scss']
})
export class BookingPopupComponent implements OnInit {

    isLoading = false;

    config = { useBothWheelAxes: false, suppressScrollX: true, suppressScrollY: false };

    public dateControl = new FormControl(this.formatDateForInput(new Date()), Validators.required);

    bookingForm: FormGroup;
    activity: any;
    timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    PhoneNumberFormat = PhoneNumberFormat;

    constructor(
        private fb: FormBuilder,
        private _snackBar: MatSnackBar,
        private cd: ChangeDetectorRef,
        private main: AuthService,
        private googleAds: GoogleAdsService,
        public matDialogRef: MatDialogRef<BookingPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.bookingForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            fullName: ['', [Validators.required]],
            numberOfPeople: [1, [Validators.required, Validators.min(1)]],
            phoneNumber: [''],
            timeSlot: ['', [Validators.required]],
            addonLunch: [false],
            addonTransport: [false]
        });
    }

    ngOnInit(): void {
        this.activity = this.data;
        this.f.numberOfPeople.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(this.maxPeoplePerSlot())
        ]);
        this.f.numberOfPeople.updateValueAndValidity();
    }

    get f() {
        return this.bookingForm.controls;
    }

    addonPricePerPerson(addonId: string): number {
        const row = this.activity?.addons?.find((a: { id: string }) => a.id === addonId);
        return row?.pricePerPerson ?? 0;
    }

    hasAddons(): boolean {
        return !!this.activity?.addons?.length;
    }

    isCoupleBooking(): boolean {
        return this.activity?.priceUnit === 'couple';
    }

    maxPeoplePerSlot(): number {
        return this.activity?.maxPeoplePerSlot || 1;
    }

    bookingUnitLabel(): string {
        return this.isCoupleBooking() ? 'couples' : 'people';
    }

    maxPeoplePerSlotLabel(): string {
        const maxPeople = this.maxPeoplePerSlot();
        const unit = maxPeople === 1
            ? (this.isCoupleBooking() ? 'couple' : 'person')
            : this.bookingUnitLabel();

        return `${maxPeople} ${unit}`;
    }

    selectTimeSlot(timeSlot: string): void {
        this.f.timeSlot.setValue(timeSlot);
        this.f.timeSlot.markAsTouched();
    }

    saveAndClose(): void {
        this.matDialogRef.close();
    }

    openSnackBar(message: string, action: string): void {
        this._snackBar.open(message, action, { duration: 3000 });
    }

    checkNumber(): void {
        const people = Number(this.f.numberOfPeople.value);
        const maxPeople = this.maxPeoplePerSlot();

        if (this.isCoupleBooking() && people !== 1) {
            this.f.numberOfPeople.setValue(1);
            this.openSnackBar('Only one couple can book each time slot', 'Close');
            return;
        }

        if (people < 1) {
            this.f.numberOfPeople.setValue(1);
            this.openSnackBar('Minimum number of people is 1', 'Close');
            return;
        }

        if (people > maxPeople) {
            this.f.numberOfPeople.setValue(maxPeople);
            this.openSnackBar(`Maximum ${maxPeople} ${this.bookingUnitLabel()} per time slot`, 'Close');
        }
    }

    getTotalPrice(): number {
        const peopleCount = Number(this.f.numberOfPeople.value) || 1;
        let total = this.activity.price * peopleCount;

        if (this.hasAddons() && this.f.addonLunch.value) {
            total += this.addonPricePerPerson('lunch') * peopleCount;
        }
        if (this.hasAddons() && this.f.addonTransport.value) {
            total += this.addonPricePerPerson('transport') * peopleCount;
        }

        return total;
    }

    private formatDateForInput(date: Date): string {
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
    }

    private buildBookingDate(): Date {
        const dateValue = this.dateControl.value;
        const timeSlot = this.f.timeSlot.value;
        const [year, month, day] = dateValue.split('-').map((part: string) => Number(part));
        const [hours, minutes] = timeSlot.split(':').map((part: string) => Number(part));

        return new Date(year, month - 1, day, hours, minutes);
    }

    checkout(): void {
        this.bookingForm.markAllAsTouched();
        this.dateControl.markAsTouched();
        const phone = this.f.phoneNumber.value;

        if (!this.bookingForm.valid || !this.dateControl.valid) {
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
            date: this.buildBookingDate(),
            timeSlot: this.f.timeSlot.value,
            fullName: this.f.fullName.value,
            totalTickets: this.f.numberOfPeople.value,
            totalCost: total,
            transport: '',
            service: this.activity.title,
            priceUnit: this.activity.priceUnit || 'person',
            maxPeoplePerSlot: this.maxPeoplePerSlot(),
            extras: {
                burgerLunchPerPerson: this.hasAddons() && this.f.addonLunch.value,
                lunchPerPersonAmount: this.hasAddons() && this.f.addonLunch.value ? this.addonPricePerPerson('lunch') : 0,
                transportPerPerson: this.hasAddons() && this.f.addonTransport.value,
                transportPerPersonAmount: this.hasAddons() && this.f.addonTransport.value ? this.addonPricePerPerson('transport') : 0
            }
        };

        this.main.triggerCheckout(dto).subscribe({
            next: (data) => {
                if (data.data.status === 'created') {
                    localStorage.setItem('payment', JSON.stringify(data.data));
                    localStorage.setItem('booking', JSON.stringify(dto));
                    this.googleAds.trackCheckoutStarted(
                        total,
                        this.activity.title,
                        Number(this.f.numberOfPeople.value)
                    );
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

import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { CountryISO } from 'ngx-intl-tel-input';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-group-activities',
    templateUrl: './group-activities.component.html'
})
export class GroupActivitiesComponent {
    readonly activityTypes = [
        { id: 'kids_birthday', label: 'Kids birthday parties' },
        { id: 'team_building', label: 'Team building activities' },
        { id: 'school_event', label: 'Schools events' }
    ] as const;

    form: FormGroup;
    isSubmitting = false;

    CountryISO = CountryISO;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private cd: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: [''],
            activityType: ['kids_birthday', Validators.required],
            message: ['']
        });
    }

    get f(): FormGroup['controls'] {
        return this.form.controls;
    }

    labelForType(id: string): string {
        return this.activityTypes.find((t) => t.id === id)?.label ?? id;
    }

    submit(): void {
        this.form.markAllAsTouched();
        const phone = this.f.phoneNumber.value;

        if (!this.form.valid) {
            this.snackBar.open('Please complete all required fields.', 'Close', { duration: 4000 });
            return;
        }
        if (!phone || !phone.e164Number) {
            this.snackBar.open('Please enter a valid phone number.', 'Close', { duration: 4000 });
            return;
        }

        const typeId = this.f.activityType.value;
        const typeLabel = this.labelForType(typeId);
        const msg = (this.f.message.value as string)?.trim();

        const dto = {
            inquiryType: 'group_activity',
            fullName: this.f.fullName.value,
            email: this.f.email.value,
            phoneNumber: phone.e164Number,
            service: `Group activity: ${typeLabel}`,
            groupActivityType: typeId,
            groupActivityLabel: typeLabel,
            message: msg || undefined
        };

        this.isSubmitting = true;
        this.cd.detectChanges();

        this.auth
            .sendEmail(dto)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                    this.cd.detectChanges();
                })
            )
            .subscribe({
                next: () => {
                    this.snackBar.open(
                        'Thanks — your request was sent. We will contact you soon.',
                        'Close',
                        { duration: 5000 }
                    );
                    this.form.patchValue({
                        fullName: '',
                        email: '',
                        phoneNumber: '',
                        activityType: 'kids_birthday',
                        message: ''
                    });
                    this.form.markAsUntouched();
                },
                error: () => {
                    this.snackBar.open(
                        'Something went wrong. Please try again or contact us directly.',
                        'Close',
                        { duration: 6000 }
                    );
                }
            });
    }
}

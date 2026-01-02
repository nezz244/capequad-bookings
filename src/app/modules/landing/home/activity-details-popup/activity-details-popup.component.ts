import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-activity-details-popup',
    standalone: true,
    templateUrl: './activity-details-popup.component.html'
})
export class ActivityDetailsPopupComponent {

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<ActivityDetailsPopupComponent>
    ) {}

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    close() {
        this.dialogRef.close();
    }
}

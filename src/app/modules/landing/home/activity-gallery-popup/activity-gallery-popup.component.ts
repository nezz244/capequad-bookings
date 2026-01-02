import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-activity-gallery-popup',
    templateUrl: './activity-gallery-popup.component.html',
    styleUrls: ['./activity-gallery-popup.component.scss']
})
export class ActivityGalleryPopupComponent {

    scrollLeft = 0;
    maxScroll = 0;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string; gallery: string[] },
        private dialogRef: MatDialogRef<ActivityGalleryPopupComponent>
    ) {}

    close() {
        this.dialogRef.close();
    }

    @HostListener('window:resize')
    onResize() {
        // update max scroll if needed
        setTimeout(() => this.updateMaxScroll(), 50);
    }

    updateMaxScroll() {
        const galleryDiv = document.querySelector('.gallery-scroll') as HTMLElement;
        if (galleryDiv) {
            this.maxScroll = galleryDiv.scrollWidth - galleryDiv.clientWidth;
        }
    }

    scrollGallery(direction: 'left' | 'right') {
        const galleryDiv = document.querySelector('.gallery-scroll') as HTMLElement;
        if (galleryDiv) {
            const scrollAmount = galleryDiv.clientWidth * 0.7; // scroll 70% of width
            if (direction === 'left') {
                galleryDiv.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                galleryDiv.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    }
}

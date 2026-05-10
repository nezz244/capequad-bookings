import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-activity-gallery-popup',
    templateUrl: './activity-gallery-popup.component.html',
    styleUrls: ['./activity-gallery-popup.component.scss']
})
export class ActivityGalleryPopupComponent {
    /** Current slide inside the carousel */
    activeIndex = 0;
    /** Fullscreen image overlay (same as MDB lightbox enlarge) */
    lightboxOpen = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string; gallery: string[] },
        private dialogRef: MatDialogRef<ActivityGalleryPopupComponent>
    ) {}

    get slides(): string[] {
        return this.data?.gallery ?? [];
    }

    get slideCount(): number {
        return this.slides.length;
    }

    get currentSrc(): string {
        return this.slides[this.activeIndex] ?? '';
    }

    close(): void {
        this.lightboxOpen = false;
        this.dialogRef.close();
    }

    closeLightbox(): void {
        this.lightboxOpen = false;
    }

    /** Open fullscreen view for the active slide (data-mdb-img behaviour) */
    openLightbox(): void {
        if (!this.currentSrc) {
            return;
        }
        this.lightboxOpen = true;
    }

    prev(): void {
        if (this.slideCount <= 1) {
            return;
        }
        this.activeIndex = (this.activeIndex - 1 + this.slideCount) % this.slideCount;
    }

    next(): void {
        if (this.slideCount <= 1) {
            return;
        }
        this.activeIndex = (this.activeIndex + 1) % this.slideCount;
    }

    ariaLabelAlt(i: number): string {
        return `${this.data.title ?? 'Activity'} photo ${i + 1}`;
    }

    @HostListener('document:keydown', ['$event'])
    onDocumentKey(ev: KeyboardEvent): void {
        if (this.slideCount === 0) {
            return;
        }
        if (this.lightboxOpen) {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                this.closeLightbox();
                return;
            }
        }
        if (this.slideCount > 1) {
            if (ev.key === 'ArrowLeft') {
                ev.preventDefault();
                this.prev();
            }
            if (ev.key === 'ArrowRight') {
                ev.preventDefault();
                this.next();
            }
        }
    }
}

import { Component, ViewEncapsulation } from '@angular/core';
import { environment } from 'environments/environment';
import { GoogleAdsService } from 'app/core/analytics/google-ads.service';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent {
    readonly contact = environment.contact;
    readonly currentYear = new Date().getFullYear();

    constructor(private googleAds: GoogleAdsService) {}

    get hasSocialLinks(): boolean {
        const s = this.contact.social;
        return !!(s && (s.facebook || s.instagram || s.tiktok));
    }

    trackWhatsAppClick(): void {
        this.googleAds.trackWhatsAppClick();
    }
}

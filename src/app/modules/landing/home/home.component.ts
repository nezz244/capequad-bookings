import { Component, ViewEncapsulation } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent {
    readonly contact = environment.contact;
    readonly currentYear = new Date().getFullYear();

    get hasSocialLinks(): boolean {
        const s = this.contact.social;
        return !!(s && (s.facebook || s.instagram || s.tiktok));
    }
}

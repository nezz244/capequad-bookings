import { Injectable } from '@angular/core';

const PURCHASE_DESTINATION = 'AW-18322448078/mKS6CJGvvdAcEM696aBE';
const CHECKOUT_DESTINATION = 'AW-18322448078/s7gUCJnvnNIcEM696aBE';
const WHATSAPP_DESTINATION = 'AW-18322448078/seIUCJzvnNIcEM696aBE';

type GoogleTag = (command: string, eventName: string, parameters?: Record<string, unknown>) => void;

@Injectable({ providedIn: 'root' })
export class GoogleAdsService {
    trackCheckoutStarted(value: number, service: string, quantity: number): void {
        this.sendEvent('begin_checkout', {
            currency: 'ZAR',
            value,
            items: [{ item_name: service, quantity }]
        });
        this.sendConversion(CHECKOUT_DESTINATION, { value, currency: 'ZAR' });
    }

    trackWhatsAppClick(): void {
        this.sendEvent('contact', { method: 'whatsapp' });
        this.sendConversion(WHATSAPP_DESTINATION, { value: 1, currency: 'ZAR' });
    }

    trackPurchase(
        value: number,
        transactionId: string,
        service: string,
        quantity: number
    ): void {
        this.sendEvent('purchase', {
            currency: 'ZAR',
            value,
            transaction_id: transactionId,
            items: [{ item_name: service, quantity }]
        });
        this.sendConversion(PURCHASE_DESTINATION, {
            transaction_id: transactionId,
            value,
            currency: 'ZAR'
        });
    }

    private sendConversion(
        destination: string,
        parameters: Record<string, unknown>
    ): void {
        this.sendEvent('conversion', { send_to: destination, ...parameters });
    }

    private sendEvent(eventName: string, parameters: Record<string, unknown>): void {
        const gtag = (window as Window & { gtag?: GoogleTag }).gtag;
        if (typeof gtag === 'function') {
            gtag('event', eventName, parameters);
        }
    }
}

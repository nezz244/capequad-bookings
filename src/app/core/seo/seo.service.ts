import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { SeoConfig } from './seo.types';

@Injectable({ providedIn: 'root' })
export class SeoService {
    private readonly _seo = environment.seo;
    private _jsonLdScriptId = 'capeadrenaline-jsonld';

    constructor(
        private _title: Title,
        private _meta: Meta,
        @Inject(DOCUMENT) private _document: Document
    ) {
        this._applyGoogleSiteVerification();
    }

    update(config: SeoConfig): void {
        const siteUrl = this._normalizeSiteUrl(this._seo.siteUrl);
        const path = config.path ?? '/home';
        const canonicalUrl = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
        const imagePath = config.image ?? this._seo.defaultImage;
        const imageUrl = imagePath.startsWith('http') ? imagePath : `${siteUrl}/${imagePath.replace(/^\//, '')}`;
        const robots = config.noindex ? 'noindex, nofollow' : 'index, follow';

        this._title.setTitle(config.title);

        this._setMeta('description', config.description);
        this._setMeta('keywords', config.keywords ?? this._seo.defaultKeywords);
        this._setMeta('robots', robots);
        this._setMeta('googlebot', robots);

        this._setMeta('og:title', config.title, true);
        this._setMeta('og:description', config.description, true);
        this._setMeta('og:type', config.type ?? 'website', true);
        this._setMeta('og:url', canonicalUrl, true);
        this._setMeta('og:image', imageUrl, true);
        this._setMeta('og:site_name', this._seo.siteName, true);
        this._setMeta('og:locale', this._seo.locale, true);

        this._setMeta('twitter:card', 'summary_large_image');
        this._setMeta('twitter:title', config.title);
        this._setMeta('twitter:description', config.description);
        this._setMeta('twitter:image', imageUrl);

        this._setCanonical(canonicalUrl);
        this._setJsonLd(canonicalUrl, imageUrl, config.noindex === true);
    }

    applyDefault(): void {
        this.update({
            title: this._seo.defaultTitle,
            description: this._seo.defaultDescription,
            path: '/home'
        });
    }

    private _setMeta(name: string, content: string, isProperty = false): void {
        if (!content) {
            return;
        }
        const selector = isProperty ? `property='${name}'` : `name='${name}'`;
        if (this._meta.getTag(selector)) {
            this._meta.updateTag({ [isProperty ? 'property' : 'name']: name, content }, selector);
        } else {
            this._meta.addTag({ [isProperty ? 'property' : 'name']: name, content });
        }
    }

    private _setCanonical(url: string): void {
        const head = this._document.head;
        let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!link) {
            link = this._document.createElement('link');
            link.setAttribute('rel', 'canonical');
            head.appendChild(link);
        }
        link.setAttribute('href', url);
    }

    private _setJsonLd(canonicalUrl: string, imageUrl: string, noindex: boolean): void {
        const head = this._document.head;
        let script = head.querySelector<HTMLScriptElement>(`script#${this._jsonLdScriptId}`);
        if (noindex) {
            script?.remove();
            return;
        }
        if (!script) {
            script = this._document.createElement('script');
            script.id = this._jsonLdScriptId;
            script.type = 'application/ld+json';
            head.appendChild(script);
        }
        const contact = environment.contact;
        script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebSite',
                    '@id': `${canonicalUrl}#website`,
                    url: this._normalizeSiteUrl(this._seo.siteUrl),
                    name: this._seo.siteName,
                    description: this._seo.defaultDescription,
                    inLanguage: 'en-ZA',
                    publisher: { '@id': `${canonicalUrl}#organization` }
                },
                {
                    '@type': 'TouristAttraction',
                    '@id': `${canonicalUrl}#organization`,
                    name: this._seo.siteName,
                    description: this._seo.defaultDescription,
                    url: canonicalUrl,
                    image: imageUrl,
                    email: contact.email,
                    telephone: contact.whatsappLabel,
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Trails End Hotel',
                        addressLocality: 'Grabouw',
                        addressRegion: 'Western Cape',
                        addressCountry: 'ZA'
                    },
                    geo: {
                        '@type': 'GeoCoordinates',
                        latitude: -34.1516,
                        longitude: 19.0153
                    },
                    priceRange: 'R1000-R1500',
                    makesOffer: [
                        {
                            '@type': 'Offer',
                            name: 'Quad biking 1 hour with waterfall stop',
                            price: '1000',
                            priceCurrency: 'ZAR',
                            availability: 'https://schema.org/InStock',
                            url: `${this._normalizeSiteUrl(this._seo.siteUrl)}/home`
                        },
                        {
                            '@type': 'Offer',
                            name: 'Dune buggy experience with waterfall stop',
                            price: '1500',
                            priceCurrency: 'ZAR',
                            availability: 'https://schema.org/InStock',
                            url: `${this._normalizeSiteUrl(this._seo.siteUrl)}/home`
                        }
                    ]
                }
            ]
        });
    }

    private _normalizeSiteUrl(url: string): string {
        return url.replace(/\/$/, '');
    }

    private _applyGoogleSiteVerification(): void {
        const code = this._seo.googleSiteVerification?.trim();
        if (!code) {
            return;
        }
        this._setMeta('google-site-verification', code);
    }
}

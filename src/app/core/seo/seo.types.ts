export interface SeoConfig {
    title: string;
    description: string;
    keywords?: string;
    path?: string;
    image?: string;
    type?: string;
    noindex?: boolean;
}

export interface SeoEnvironment {
    siteUrl: string;
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string;
    defaultImage: string;
    locale: string;
    /** Paste verification code from Google Search Console (content value only). */
    googleSiteVerification?: string;
}

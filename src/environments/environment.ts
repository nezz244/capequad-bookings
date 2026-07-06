// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    /** SEO — set siteUrl to your live domain (e.g. custom domain on Firebase Hosting). */
    seo: {
        siteUrl: 'http://localhost:4200',
        siteName: 'CapeAdrenaline',
        defaultTitle: 'CapeAdrenaline | Cape Town Quad Biking & Dune Buggy Tours',
        defaultDescription:
            'Book Cape Town quad biking from R499 and dune buggy adventures from R1500 with a scenic waterfall stop. Guided tours from Trails End Hotel, Grabouw - CapeAdrenaline.',
        defaultKeywords:
            'Cape Town quad biking, dune buggy Cape Town, Grabouw adventure, waterfall tour, Trails End Hotel, CapeAdrenaline, Western Cape tours',
        defaultImage: 'assets/images/activities/buggy7.png',
        locale: 'en_ZA',
        googleSiteVerification: ''
    },
    /** Public contact blocks for the landing header/footer — update whatsapp URL with your real number. */
    contact: {
        brandName: 'CapeAdrenaline',
        email: 'info@capeadrenaline.com',
        whatsappUrl: 'https://wa.me/27605954968',
        whatsappLabel: '+27605954968',
        location: 'Trails End Hotel, Grabouw',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Trails+End+Hotel+Grabouw',
        social: {
            facebook: '',
            instagram: '',
            tiktok: ''
        }
    },
    firebase: {
      apiKey: "AIzaSyAr-UCofUlWYtwSDKVY8xtEs_HpJonNkyg",
      authDomain: "cape-quad-new112.firebaseapp.com",
      projectId: "cape-quad-new112",
      storageBucket: "cape-quad-new112.appspot.com",
      messagingSenderId: "1015309044140",
      appId: "1:1015309044140:web:b5c3d5727f75a361e71209",
      measurementId: "G-RKTG0E8RH2"
    },
      production: false
  };
  
  
  
  /*
   * For easier debugging in development mode, you can import the following file
   * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
   *
   * This import should be commented out in production mode because it will have a negative impact
   * on performance if an error is thrown.
   */
  // import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
  

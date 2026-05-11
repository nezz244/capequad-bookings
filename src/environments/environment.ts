// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    /** Public contact blocks for the landing header/footer — update whatsapp URL with your real number. */
    contact: {
        brandName: 'CapeAdrenaline',
        email: 'info@capeadrenaline.com',
        whatsappUrl: 'https://wa.me/27605954968',
        whatsappLabel: '+27 605 954 968',
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
  
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import auth from 'firebase/compat/app';


declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any>; 
  calendarItems: any[];

  constructor(public afAuth: AngularFireAuth) { 
    this.initClient();
    this.user$ = afAuth.authState;
  }

  // Initialize the Google API client with desired scopes
  initClient() {
    gapi.load('client', () => {
      console.log('loaded client')

      // It's OK to expose these credentials, they are client safe.
      gapi.client.init({
        apiKey: 'AIzaSyCEtZ0xg2po9qzYp4klySf4PnLYbwyCtuo',
        clientId: '468644202491-u3068tainra2fopt9jfkspie5349h622.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar'
      })

      gapi.client.load('calendar', 'v3', () => console.log('loaded calendar'));

    });
  }


  async login(event) {
    const googleAuth = gapi.auth2.getAuthInstance()
    const googleUser = await googleAuth.signIn();
  
    const token = googleUser.getAuthResponse().id_token;
  
    console.log(googleUser)
  
    const credential = auth.auth.GoogleAuthProvider.credential(token);
  
    await this.afAuth.signInAndRetrieveDataWithCredential(credential);

    this.insertEvent(event);
  
  
    // Alternative approach, use the Firebase login with scopes and make RESTful API calls
    // const provider = new auth.GoogleAuthProvider()
    // provider.addScope('https://www.googleapis.com/auth/calendar');
    // this.afAuth.signInWithPopup(provider)
    
  }
  
  logout() {
    this.afAuth.signOut();
  }



  async getCalendar() {
    const events = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime'
    })

    console.log(events)

    this.calendarItems = events.result.items;
  
  }


  async insertEvent(body) {
    console.log(body)
    const insert = await gapi.client.calendar.events.insert(body);
    
    await this.getCalendar();
  }





}

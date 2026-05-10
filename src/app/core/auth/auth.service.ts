import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, throwError as observableThrowError,Observable, of,of as observableOf , switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { AppSettings } from './_helpers/appSettings';
import { retryWhen, first, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuth, AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { ThisReceiver } from '@angular/compiler';
import { RegisterUserDTO } from '../_models/registerUserDTO';
import { User } from '../_models/usermodel';
// import { MatSnackBar } from '@angular/material/snack-bar';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Injectable()
export class AuthService
{

    signUpButtonsClicked : boolean = false;
    signInButtonsClicked : boolean = false;

    merchantId;
    userId;
    error;
    hasError;
    myGoogleAuthStatus : boolean = false;
    private eventAuthError = new BehaviorSubject<string>("");
    private _authenticated: boolean = false; 
    private  googleAccountCreationStatus: BehaviorSubject<boolean>;
    newUser: any;
    credentials : any;
    createMerchantDTO;
    createNewUserDTO : RegisterUserDTO = new RegisterUserDTO();
   
    user$: Observable<User>;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private afAuth:  AngularFireAuth,
        private db: AngularFirestore,
        private http: HttpClient,
        private router : Router,
        private snackBar : MatSnackBar
    )
    {
      
      this.googleAccountCreationStatus = new BehaviorSubject<boolean>(false);

      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
            // Logged in
          if (user) {
            console.log('google auth returned');
            console.log(user);
            // return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            // Logged out
            return of(null);
          }
        })
      )

    }


   //Signup with google methods

   async googleSignUp() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  // login with google
  async googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.signInWithGoogle(credential.user);
  }

  microsoftSignIn(){
    const provider = new firebase.auth.OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      prompt: "consent",
      tenant: "36a36f17-72f1-47a8-8e09-52c96d2a2445"
    });
    firebase.auth().signInWithPopup(provider).then(data => {
        console.log(data);
    })
  }




  //create a user in the fiorestore database
  private updateUserData(user) {
    
    console.log('google auth returned');
    console.log(user);

    this.userId = user.uid;
    //check if user already exists if not then go on to create merchant;
    console.log(user.uid);
    this.getUser(user.uid)
    .pipe(first())
    .subscribe(			
      data => { 
        console.log(user);			
        if(data.user){
          console.log('i signed them in instead');
          //  this.openSnackBar('User already exists','Close');
           this.signInWithGoogle(user);
          }
        else
        {
          console.log('i took the signup route');
          this.createUserWithGoogle(user);
  
        }

      });


    

  }


  //notifications popup
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
}




    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    getValue(): Observable<boolean> {
      return this.googleAccountCreationStatus.asObservable();
    }
    
    setValue(newValue): void {
      this.googleAccountCreationStatus.next(newValue);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn2(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post('api/auth/sign-in', credentials).pipe(
            switchMap((response: any) => {
               
                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // this.router.navigateByUrl('/');

                //call the google sign in 
                
                // this.signIn(credentialsGoogle.email,credentialsGoogle.password)

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    retrieveMerchant2(id): Observable<any> {

      // console.log(id);
      const url = '/retrieve​/merchant';
      const httpOptions = {
        headers: { 'Content-Type': 'application/json',},
        params: { 'merchantId':id}
      };
      return this.http.get<any>(AppSettings.API_ENDPOINT+'/'+'retrieve'+'/'+'merchant',httpOptions)
      .pipe(
      tap((res: any) => {
       // console.log(res);
       // return [null, res];
      }),
      catchError(this.handleError)
      )
      } 
      
    retrieveMerchant(): Observable<any> {

        // console.log(this.merchantId);
        const url = '/retrieve​/merchant';
        const httpOptions = {
    
        headers: { 'Content-Type': 'application/json'},
        params: { 'merchantId':this.merchantId}
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT+'/'+'retrieve'+'/'+'merchant',httpOptions)
        .pipe(
        tap((res: any) => {
            // console.log(res);
            // return [null, res];
        }),
        catchError(this.handleError)
        )
    } 

         
    updateMerchant(updateMerchantDTO) {
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/update/merchant',
      updateMerchantDTO
      ).pipe(
        tap((res: any) => {
          // console.log("Showing Error At Service:");
          // console.log(res);
          // return [null, res];
        }),
        catchError(this.handleError)
    )
  }


          
  saveTemplate(dto) {
    return this.http.post<any>(AppSettings.API_ENDPOINT + '/add/document',
    dto
    ).pipe(
      tap((res: any) => {
        // console.log("Showing Error At Service:");
        // console.log(res);
        // return [null, res];
      }),
      catchError(this.handleError)
  )
  }


             
  getTemplates(dto) {
    return this.http.post<any>(AppSettings.API_ENDPOINT + '/retrieve/documents',
    dto
    ).pipe(
      tap((res: any) => {
        // console.log("Showing Error At Service:");
        // console.log(res);
        // return [null, res];
      }),
      catchError(this.handleError)
  )
  }

  getTemplate(dto) {
    return this.http.post<any>(AppSettings.API_ENDPOINT + '/retrieve/document',
    dto
    ).pipe(
      tap((res: any) => {
        // console.log("Showing Error At Service:");
        // console.log(res);
        // return [null, res];
      }),
      catchError(this.handleError)
  )
  }



 deleteTemplate(dto) {
    return this.http.post<any>(AppSettings.API_ENDPOINT + '/delete/document',
    dto
    ).pipe(
      tap((res: any) => {
        // console.log("Showing Error At Service:");
        // console.log(res);
        // return [null, res];
      }),
      catchError(this.handleError)
  )
  }










    private handleError(error: any) {
      console.log(error);
        return [observableThrowError(error.error || 'Server error'), null];
    }

    signIn(email: string, password: string)
    {
      this.afAuth.signInWithEmailAndPassword(email, password)
      .catch(error => {
        this.eventAuthError.next(error);
        this.setValue(false);
        this.error = error;
        
      })
      .then(userCredential => {
        if(userCredential) {
          console.log('hona credential');
          console.log(userCredential)
          this.userId = userCredential.user.uid;
          this.retrieveUser()
          .pipe(first())
          .subscribe(
  
              data => {
                 console.log('user uyu');
                 console.log(data.user);

                  //WEIRD FIXES
                 if(data.user.defaultServiceLevel =='ecommerceMerchant'){
                  var myPermissions = [
                    'hasAgents','hasProducts','hasCheckout','hasDelivery','hasNotifications','hasInbox','hasBroadcasts','hasCustomers','hasBilling','hasChatbots','hasCurrency'
                  ];
                  localStorage.setItem('permissions',JSON.stringify(myPermissions));

                 }

          
  
                   //if an ordinary ecommerce merchant is logging in
  
                  if(data.user.defaultServiceLevel==='ecommerceMerchant'){
                    // console.log(data);
                    this.merchantId = data.user.defaultMerchant;
                    if(this.merchantId){
                      // console.log(this.merchantId);
                      localStorage.setItem('merchantId', JSON.stringify(this.merchantId));   
                      this.retrieveMerchant()
                      .pipe(first())
                      .subscribe(
  
                          data => {
  
                            if(data){
                              console.log(data);
                              localStorage.setItem('userType','ecommerceMerchant');
                              localStorage.setItem('isLoggedIn', JSON.stringify(true));
                              this.myGoogleAuthStatus = true;
                              localStorage.setItem('merchant', JSON.stringify(data)); 
                              if(data.merchant.bot){
                                localStorage.setItem('bot' , JSON.stringify(data.merchant.bot));
  
                              }  
                              
                              this.setValue(true);

                              // this.router.navigateByUrl('/')
                         
                        
                            }else{
                            
                              // this.toastr.error( 'Something Went Wrong', 'Failed!!');
                              // this.ngxService.stop();
  
                            }
                      
                          },
                          error => {
                            setTimeout(() => {
                            
                            }, 1000);
                          });
                    
                    }else{
                      //  this.logout();
                      //  this.ngxService.stop();
                      //  this.toastr.error('You are logging in to the wrong service');
                    }
                  }

                  if(data.user.defaultServiceLevel ==='agent'){
                    localStorage.setItem('agent', JSON.stringify(data.user));   

                    // console.log(data);
                    this.merchantId = data.user.defaultMerchant;
                    if(this.merchantId){
                      // console.log(this.merchantId);
                      localStorage.setItem('merchantId', JSON.stringify(this.merchantId));   
                      this.retrieveMerchant()
                      .pipe(first())
                      .subscribe(
  
                          data => {
  
                            if(data){
                              console.log(data);
                              localStorage.setItem('userType','agent');
                              localStorage.setItem('isLoggedIn', JSON.stringify(true));
                              this.myGoogleAuthStatus = true;
                              localStorage.setItem('merchant', JSON.stringify(data)); 
                              if(data.merchant.bot){
                                localStorage.setItem('bot' , JSON.stringify(data.merchant.bot));
  
                              }  
                              
                              this.setValue(true);

                            
                            }
                          },
                          error => {
                            setTimeout(() => {
                            
                            }, 1000);
                          });
                    
                    }else{
                      //  this.logout();
                      //  this.ngxService.stop();
                      //  this.toastr.error('You are logging in to the wrong service');
                    }
                  }
  
  
  
              
              
              },
              error => {
                setTimeout(() => {
                 
                }, 1000);
              });
          
        }else{
          this.setValue(false);
        }
      })

     
  }

    signInWithGoogle(user)
    {
       console.log('see');
        console.log(user);
        if(user.uid){

          this.userId = user.uid;
          this.retrieveUser()
          .pipe(first())
          .subscribe(
              data => {
                console.log('user uyu');
                console.log(data.user);


               
                //WEIRD FIXES
                  if(data.user !=undefined){

                        
                        if(data.user.defaultServiceLevel==='ecommerceMerchant'){
                          // console.log(data);
                          this.merchantId = data.user.defaultMerchant;
                          if(this.merchantId){
                            // console.log(this.merchantId);
                            localStorage.setItem('merchantId', JSON.stringify(this.merchantId));   
                            this.retrieveMerchant()
                            .pipe(first())
                            .subscribe(

                                data => {
                                  console.log('see merchant');
                                  console.log(data);
                                  if(data){
                                    console.log(data);
                                    localStorage.setItem('userType','ecommerceMerchant');
                                    localStorage.setItem('isLoggedIn', JSON.stringify(true));
                                    this.myGoogleAuthStatus = true;
                                    localStorage.setItem('merchant', JSON.stringify(data)); 
                                    if(data.merchant.bot){
                                      localStorage.setItem('bot' , JSON.stringify(data.merchant.bot));

                                    }  
                                    
                                    this.setValue(true);

                                    // this.router.navigateByUrl('/')
                              
                              
                                  }else{
                                  
                                    // this.toastr.error( 'Something Went Wrong', 'Failed!!');
                                    // this.ngxService.stop();

                                  }
                            
                                },
                                error => {
                                  setTimeout(() => {
                                    this.setValue(false);
                                  }, 1000);
                                });
                          
                          }else{
                            //  this.logout();
                            //  this.ngxService.stop();
                            //  this.toastr.error('You are logging in to the wrong service');
                          }
                        }
                  }else{
                      // this.openSnackBar('User does not exist. Sign up first','Close');
                      // this.router.navigateByUrl('/sign-in');
                      this.googleSignUp();
  
                  }

              },
              error => {
                setTimeout(() => {
                  this.setValue(false);
                }, 1000);
              });
          
        
        }

    
    }


  deleteUser(){
    this.afAuth.currentUser.then(user => user?.delete());
    this.setValue(true);

  }



  resetAuthPassword(email){
    this.afAuth.sendPasswordResetEmail(email).then(
      () => {
        // success, show some message
        // this.openSnackBar('Password reset link has been sent to your email','Close');
        this.setValue(true);
      },
      err => {
        // handle errors
      }
    );
  }

  changeEmail(email){
    this.afAuth.updateCurrentUser(email).then(
      () => {
        // success, show some message
        // this.openSnackBar('Password reset link has been sent to your email','Close');
        this.setValue(true);
      },
      err => {
        // handle errors
      }
    );
  }


  // openSnackBar(message: string, action: string) {
  //   this.snackBar.open(message, action, {
  //     duration: 10000,
  //   });
  // }

    retrieveUser(): Observable<any> {

        // this.userId = JSON.parse(localStorage.getItem('userId'));
        
        // console.log(this.userId);
        if(this.userId){
        // console.log(this.userId);
        const url = '/retrieve​/user';
        const httpOptions = {
            headers: { 'Content-Type': 'application/json'},
            params: { 'uid':this.userId}
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT+'/'+'retrieve'+'/'+'user',httpOptions)
        .pipe(
            tap((res: any) => {
            // console.log(res);
            // return [null, res];
            }),
            catchError(this.handleError)
        )
        }else{
        // this.toastr.error ('something went wrong try again');
        // this.ngxService.stop();
        }
        
    } 

    getUser(userId): Observable<any> {

      // this.userId = JSON.parse(localStorage.getItem('userId'));
      
      // console.log(this.userId);
      if(userId){
      // console.log(this.userId);
      const url = '/retrieve​/user';
      const httpOptions = {
          headers: { 'Content-Type': 'application/json'},
          params: { 'uid':userId}
      };
      return this.http.get<any>(AppSettings.API_ENDPOINT+'/'+'retrieve'+'/'+'user',httpOptions)
      .pipe(
          tap((res: any) => {
          // console.log(res);
          // return [null, res];
          }),
          catchError(this.handleError)
      )
      }else{
      // this.toastr.error ('something went wrong try again');
      // this.ngxService.stop();
      }
      
  } 


    createUserWithGoogle(user){
      console.log('we here fam');
      console.log(user);
      console.log(user.email);
      
            this.createNewUserDTO.email = user.email;
            this.createNewUserDTO.fullName = user.displayName;
            this.createNewUserDTO.uid = user.uid;
            this.createNewUserDTO.defaultServiceLevel = 'ecommerceMerchant';
            this.createNewUserDTO.formsBotId = 'none';
            this.createNewUserDTO.permissions = [
            'hasAgents','hasProducts','hasCheckout','hasDelivery','hasNotifications','hasInbox','hasBroadcasts','hasCustomers','hasBilling','hasChatbots','hasCurrency'
            ];

            this.createNewUser(this.createNewUserDTO)
            .pipe(first())
            .subscribe(
    
                data => {
    
                  if(data.message === "User created successfully"){
    
    
                    // //create merchant
                       console.log('see this user id');
                       console.log(user);
                       console.log(user.uid);

                       //create merchant dto
                      var merchantDTO = {
                        uid:user.uid, 
                        isActive:true,
                        email:user.email,
                        fullName:user.displayName,
                        name:user.displayName,
                        tradingName:user.displayName,
                        phone:user.phone,
                        defaultServiceLevel:'ecommerceMerchant',
                        emailConfirmed:true

                      };
                  
                      this.createNewMerchant(merchantDTO)
                      .pipe(first())
                      .subscribe(
            
                          data => {
            
                          
                              console.log(data);
                              this.signInWithGoogle(user);
                              setTimeout(() => {
                                setTimeout(() => {
                              
                                }, 1000);
                              }
                              , 1000);
                            
                          },
                          error => {
                            setTimeout(() => {
                              this.setValue(false);

                              // this.openSnackBar('Something went wrong', 'close');
    
                            }, 1000);
                          });
                                        
                            
                  
                  }else{
                    this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
    
                  }
            
                },
                error => {
                  setTimeout(() => {
                    this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
                  }, 1000);
                });

    }
    

    createUser(user) {
      console.log('we here fam');
      console.log(user);
      console.log(user.email);
      this.afAuth.createUserWithEmailAndPassword(user.value.email, user.value.password)
        .then(userCredential => {
      
           console.log(userCredential);
          userCredential.user.updateProfile( {
            displayName: user.company
          });
    
          // this.router.navigate(['/dashboard']);
          this.credentials = userCredential.user.uid;
          if(this.credentials){
             this.createNewUserDTO.email = this.createMerchantDTO.email;
             this.createNewUserDTO.fullName = this.createMerchantDTO.fullName;
             this.createNewUserDTO.uid = this.credentials;
             this.createNewUserDTO.defaultServiceLevel = this.createMerchantDTO.defaultServiceLevel
             this.createNewUserDTO.formsBotId = this.createMerchantDTO.formsBotId ;
             this.createNewUserDTO.permissions = [
              'hasAgents','hasProducts','hasCheckout','hasDelivery','hasNotifications','hasInbox','hasBroadcasts','hasCustomers','hasBilling','hasChatbots','hasCurrency'

             ]

            this.createNewUser(this.createNewUserDTO)
            .pipe(first())
            .subscribe(
    
                data => {
    
                  if(data.message === "User created successfully"){
    
    
                    // //create merchant
                      this.createMerchantDTO.uid = this.credentials;
                      this.createMerchantDTO.isActive = true;
                      console.log(this.createMerchantDTO);   
                      this.createNewMerchant(this.createMerchantDTO)
                      .pipe(first())
                      .subscribe(
            
                          data => {
            
                          
                              console.log(data);
                              this.setValue(true);

                              
                              setTimeout(() => {
                                setTimeout(() => {
                              
                                }, 1000);
                              }
                              , 1000);
                            
                          },
                          error => {
                            setTimeout(() => {
                              this.setValue(false);

                              // this.openSnackBar('Something went wrong', 'close');
    
                            }, 1000);
                          });
                                        
                            
                  
                  }else{
                    this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
    
                  }
            
                },
                error => {
                  setTimeout(() => {
                    this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
                  }, 1000);
                });
              
           
          }
    
        })
        .catch( error => {
          this.eventAuthError.next(error);
          this.setValue(false);
          console.log(error);
          this.openSnackBar(error, 'close');
    
    
        });
    }
    
    
    createUserByAggregator(user) {
      this.afAuth.createUserWithEmailAndPassword( user.email, user.password)
        .then(userCredential => {
      
          // // console.log(userCredential);
          userCredential.user.updateProfile( {
            displayName: user.tradingName
          });
    
          // this.router.navigate(['/dashboard']);
          this.credentials = userCredential.user.uid;
          if(this.credentials){
             this.createNewUserDTO.email = this.createMerchantDTO.email;
             this.createNewUserDTO.fullName = this.createMerchantDTO.fullName;
             this.createNewUserDTO.uid = this.credentials;
             this.createNewUserDTO.defaultServiceLevel = this.createMerchantDTO.defaultService
           
        
    
            this.createNewUser(this.createNewUserDTO)
            .pipe(first())
            .subscribe(
    
                data => {
                  console.log(data);
                  if(data.message){
    
                    // //create merchant
                      this.createMerchantDTO.uid = this.credentials;
                      this.createMerchantDTO.isActive = true;
                      this.createMerchantDTO.serviceType = this.createMerchantDTO.serviceType;
                      console.log(this.createMerchantDTO);   
                      this.createNewMerchant(this.createMerchantDTO)
                      .pipe(first())
                      .subscribe(
            
                          data => {
                            console.log(data);

                            this.setValue(true);

                            setTimeout(() => {
                              setTimeout(() => {
                            
                              }, 1000);
                            }
                            , 1000);
                                                
                          },
                          error => {
                            setTimeout(() => {
                              this.setValue(false);

                              // this.openSnackBar('Something went wrong', 'close');
    
                            }, 1000);
                          });
                                        
                            
                  
                  }else{
                    this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
    
                  }
            
                },
                error => {
                  setTimeout(() => {
                    this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
                  }, 1000);
                });
              
           
          }
    
        })
        .catch( error => {
          this.eventAuthError.next(error);
          this.setValue(false);
          // this.openSnackBar(error, 'close');
    
    
        });
    }
  
    
    createAgent(user,dto) {
    
      this.afAuth.createUserWithEmailAndPassword( user.email, user.password)
        .then(userCredential => {
      
          // // console.log(userCredential);
          userCredential.user.updateProfile( {
            displayName: user.tradingName
          });
    
          this.credentials = userCredential.user.uid;
          if(this.credentials){
             this.createNewUserDTO.email = dto.email;
             this.createNewUserDTO.uid = this.credentials;
             this.createNewUserDTO.defaultMerchant = dto.merchantId;
             this.createNewUserDTO.fullName = dto.fullName;
             this.createNewUserDTO.botId = dto.defaultBotId
             this.createNewUserDTO.isActive = true;
             this.createNewUserDTO.defaultServiceLevel = 'agent';

             this.createNewUserDTO.templateManagerPermission = dto.templateManagerPermission ;
             console.log('see fam');
             console.log(this.createNewUserDTO);

            this.createNewUser(this.createNewUserDTO)
            .pipe(first())
            .subscribe(
    
                data => {
                  console.log(data);
                  if(data.message === "User created successfully"){
                    // this.setValue(true);

                    this.openSnackBar('Team member added','Close');
                    this.sendMyInviteEmail(user)

                  }else{
                    // this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
    
                  }
             
                },
                error => {
                  setTimeout(() => {
                    this.setValue(false);

                  //   this.openSnackBar('Something went wrong', 'close');
    
                  }, 1000);
                });
              
           
          }
    
        })
        .catch( error => {
          console.log(error);
          this.eventAuthError.next(error);
          this.openSnackBar(error, 'close');
          this.setValue(false);

    
        });
    }
    

    sendMyInviteEmail(user){
      console.log('sending email');
      console.log(user);
     
      var dto ={
        email:'',
        templateId:'',
        variables:{
            firstName:'',
            url:'',
            urlTop:'',
            adminPerson:'',
            password:'',
            email:''
        }
      }
      dto.email = user.email;
      dto.templateId="d-56da7a26969e4aa28d76df74421d361f";
      dto.variables.adminPerson = JSON.parse(localStorage.getItem('merchant')).merchant.fullName;
      dto.variables.firstName = user.fullName.split(' ')[0];
      dto.variables.password = user.password;
      dto.variables.email = user.email;
      dto.variables.url = 'https://tm.chatinc.com/sign-in';
      dto.variables.urlTop = 'https://tm.chatinc.com/sign-in';
      console.log(dto);
     
      this.sendInviteEmail(dto)
                .pipe(first())
                .subscribe(			
                  data => { 			
                    if(data){
                      this.snackBar.open('Invitation email sent successfully','close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top'
                      });

                      }
                    else
                    {
                      this.snackBar.open('Something went wrong','close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top'
                      });
                  }
      
                  });
    }
   

    createNewUser(createNewUserDTO) {
      // // console.log(this.createMerchantDTO)
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/create/user',
      createNewUserDTO
      ).pipe()
    } 
    
    createNewMerchant(createNewMerchantDTO) {
      // console.log(this.createMerchantDTO)
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/create/otarkie/merchant',
      createNewMerchantDTO
      ).pipe()
    } 
    
    createNewPartner(createNewMerchantDTO) {
      // console.log(this.createMerchantDTO)
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/create/otarkie/partner',
      createNewMerchantDTO
      ).pipe()
    } 
    




    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Renew token
        return this._httpClient.post('api/auth/refresh-access-token', {
            accessToken: this.accessToken
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut2(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    signOut()
    {
      localStorage.clear();
      this.afAuth.signOut();
      this._authenticated = false;
      return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }



  //function below this consume version 1 of chatinc api
    uploadFile(importFile){
      // const eventBlob = new Blob([JSON.stringify(form)],{ type: "application/json"});
      var formdata = new FormData();
      
      // formdata.append('form', JSON.stringify(form));
     
      formdata.append('image',importFile);
    
     
      return this.http.post<any>(AppSettings.API_ENDPOINT3 + '/utils/upload/image ',
      formdata
      ).pipe(
        tap((res: any) => {
       
        }),
        catchError(this.handleError)
      )
    }

    createCampaign(dto){
      // console.log(this.createMerchantDTO)
      return this.http.post<any>(AppSettings.API_ENDPOINT3 + '/create/campaign',
      dto
      ).pipe()
    }

    sendInviteEmail(dto) {
      // console.log(this.createMerchantDTO)
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/send-email',
      dto
      ).pipe()
    }

    createFromOffPlatformTemplate(dto) {
      // console.log(this.createMerchantDTO)
      return this.http.post<any>(AppSettings.API_ENDPOINT4 + '/create/campaign/from-offplatform-template',
      dto
      ).pipe()
    }

    retrieveOffPlatformTemplates(key): Observable<any> {

      console.log(key);
    
      const httpOptions = {
        headers: { 'Content-Type': 'application/json',Authorization: key}
       

      };
      return this.http.get<any>(AppSettings.API_ENDPOINT4+'/'+'view'+'/'+'off-platform-templates',httpOptions)
      .pipe(
      tap((res: any) => {
      
      }),
      catchError(this.handleError)
      )
    } 

  

    getAgents(merchantIdDTO) {
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/retrieve/agents',
      merchantIdDTO
      ).pipe(
        tap((res: any) => {
          // console.log("Showing Error At Service:");
          // console.log(res);
          // return [null, res];
        }),
        catchError(this.handleError)
      )}

    updateUser(updateMerchantDTO) {
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/update/user',
      updateMerchantDTO
      ).pipe(
        tap((res: any) => {
          // console.log("Showing Error At Service:");
          // console.log(res);
          // return [null, res];
        }),
        catchError(this.handleError)
    )
  }




  // CapeAdrenaline backend (payments / email API)


  
  triggerCheckout(dto) {
      return this.http.post<any>(AppSettings.API_ENDPOINT + '/create/checkout',
      dto
      ).pipe(
        tap((res: any) => {
          // console.log("Showing Error At Service:");
          // console.log(res);
          // return [null, res];
        }),
        catchError(this.handleError)
    )
  }

  sendEmail(dto){
    return this.http.post<any>(AppSettings.API_ENDPOINT + '/send/email',
    dto
    ).pipe(
      tap((res: any) => {
        // console.log("Showing Error At Service:");
        // console.log(res);
        // return [null, res];
      }),
      catchError(this.handleError)
  )
}


saveBooking(dto){
  return this.http.post<any>(AppSettings.API_ENDPOINT + '/bookings/create',
  dto
  ).pipe(
    tap((res: any) => {
      // console.log("Showing Error At Service:");
      // console.log(res);
      // return [null, res];
    }),
    catchError(this.handleError)
)
}
  



}

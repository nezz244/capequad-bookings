import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, takeUntil, first, BehaviorSubject} from 'rxjs';

@Component({
    selector     : 'auth-sign- in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    styleUrls:['./sign-in.component.scss']
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    formFieldHelpers: string[] = [''];
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signInForm: FormGroup;
    signInForm2: FormGroup;
    message;
    isLoading : boolean = false;
    isLoading3 : boolean = false;
    isFocused = 'email';
    isGoogleSignIn : boolean = false;
    isMobile : boolean = false;
    showAlert: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router, private cd : ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private  snackBar : MatSnackBar
    )
    {

  

        this._authService.getValue().subscribe((value) => {
            if(value){

                if(this._authService.signInButtonsClicked == true){
                    console.log('too smooth');
    
                    if(JSON.parse(localStorage.getItem('agent'))){
                        if(JSON.parse(localStorage.getItem('agent')).templateManagerPermission == 'removed'){
                            this._router.navigateByUrl('/sign-out');
                            this.openSnackBar('You are not authorized to access this page','Close');
        
                        }else{
                            this.signIn2();
                
                        }
                    }else{
                        this.signIn2();
                    }
                }
                
               
            }else{

                if(this.isLoading == true){
                    this.openSnackBar('Something went wrong','Close');
                    this.isLoading=false;
                    this.cd.detectChanges();
                    console.log('too  bad');
                }
                
            }
          });
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
          duration: 5000,
        });
        this.refresh();
    }
    

    
   
  
      refresh(){
        this.cd.detectChanges(); 
      }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void
    {

         this._authService.signUpButtonsClicked = false;
        // this.cd.detectChanges();
          // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required,Validators.minLength(8)],
            rememberMe: ['']
        });


        this.signInForm2 = this._formBuilder.group({
            email     : ['hughes.brian@company.com', [Validators.required, Validators.email]],
            password  : ['admin', Validators.required],
            rememberMe: ['']
        });


        this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) => {

            // Set the drawerMode if the given breakpoint is active
            if ( matchingAliases.includes('lg') )
            {
              console.log('not mobile');
            }
            else
            {
               
              this.isMobile = true;
            }

            // Mark for check
            this.cd.markForCheck();
            this.cd.detectChanges();
        });
    }

    getFormFieldHelpersAsString(): string
    {
        return this.formFieldHelpers.join(' ');
    }


    ngAfterViewInit(){
        this.showAlert = false;

    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */

    get f(){return this.signInForm.controls};
    

     submit()
     {

        if(this.f.email.value == '' || this.f.password.value == ''){
            this.openSnackBar('Please enter your email and password','Close');
            return;
        }else{
            console.log('hona brosky');
            this._authService.signInButtonsClicked = true;
            this.signIn(this.f.email.value, this.f.password.value);
    
        }
       
     }


     googleSignIn(){
        this.isLoading=true;
        this.isGoogleSignIn = true;
        this._authService.signInButtonsClicked = true;
        this.cd.detectChanges();
        // this.signInForm.disable();
        // this._authService.googleSignIn();
        this._authService.googleSignUp();
        
     }  

     microsoftSignIn(){
        this.isLoading=true;
        this.cd.detectChanges();
        // this.signInForm.disable();
        this._authService.microsoftSignIn();
        
     }  
     
     onFocus(x){
        this.isFocused = x;
    }


     signIn2(): void
     {
        console.log('hona brosky 1');
        
         // Return if the form is invalid
       
        // Sign in
        this._authService.signIn2(this.signInForm2.value)
        .subscribe(
            () => {

                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/apps';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);

            },
            (response) => {
                console.log('hona brosky');

                console.log(response);
                // Re-enable the form
                //  this.signInForm.enable();
                this._router.navigateByUrl('/apps');

                // Reset the form
                //  this.signInNgForm.resetForm();

        
            }
        );
            
        
     }



    signIn(email,password)
    {
        this.isLoading3= true;
        this.cd.detectChanges();
        // Return if the form is invalid
        // if ( this.signInForm.invalid )
        // {
        //     return;
        // }
        console.log('hona we here');
        

        // Disable the form
        // this.signInForm.disable();


     
        // Sign in
        this._authService.signIn(email,password)
        if(this._authService.hasError == true){
            this.signInForm.enable();

            // Reset the form
            this.signInNgForm.resetForm();

            // Set the alert
            this.alert = {
                type   : 'error',
                message: 'Username or password is wrong'
            };

            // Show the alert
            this.showAlert = true;
        }
           
    }
}

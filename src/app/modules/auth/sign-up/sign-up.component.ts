import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { CreateMerchantDTO } from 'app/core/_models/createMerchantDTO';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    styleUrls:['./sign-up.component.scss']

})
export class AuthSignUpComponent implements OnInit
{
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;
    message;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    config;
    signUpForm: FormGroup;
    isLoading2 : boolean = false;
    showAlert: boolean = false;
    customerSignUpDTO : CreateMerchantDTO = new CreateMerchantDTO();
    isFocused = 'name';
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private cd : ChangeDetectorRef,
        private snackBar : MatSnackBar,
        private _activatedRoute: ActivatedRoute

    )
    {

     this._authService.getValue().subscribe((value) => {
      if (value){
        if(this._authService.signUpButtonsClicked == true){
            //if not google sign up 
            this.openSnackBar('Account created sucessfully','Close');

        }
        this._router.navigateByUrl('/sign-in');


      }else{
        
        this.isLoading2 = false;
        this.cd.detectChanges();
        // this.openSnackBar('Something went wrong','Close');


      }
    });
   
    }


  
    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
          duration: 5000,
        });
        this.refresh();
    }
    


    onFocus(x){
        this.isFocused = x;
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

        this._authService.signInButtonsClicked = false;

        // Create the form
        this.signUpForm = this._formBuilder.group({
                email     : ['', [Validators.required, Validators.email]],
                password  : ['', Validators.required],
                fullName  : ['', Validators.required],
                
                agreements: ['', Validators.requiredTrue]
            }
        );
    }

    
    ngAfterViewInit(){
        this.showAlert = false;

    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


   //sign up with google
    googleSignUp(){
        this._authService.signUpButtonsClicked = true;
        this._authService.googleSignUp();
     
    }


    /**
     * Sign up
     */
    signUp(): void
    {
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign up
        this._authService.signUp(this.signUpForm.value)
            .subscribe(
                (response) => {

                    // Navigate to the confirmation required page
                    this._router.navigateByUrl('/confirmation-required');
                },
                (response) => {

                    // Re-enable the form
                    this.signUpForm.enable();

                    // Reset the form
                    this.signUpNgForm.resetForm();

               

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }

    trigger(frm){
        this.isLoading2 = true;
        this._authService.signUpButtonsClicked = true;
        this.cd.detectChanges();

        document.getElementById("submit").addEventListener("click", function(event){
            event.preventDefault()
        });

        // if ( this.signUpForm.invalid )
        // {
        //     return;
        // }

        // Disable the form
        // this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;
        this.createUser(frm);

    }


    get f(){return this.signUpForm.controls};

    createUser(frm) {
        console.log('we here');
        this.customerSignUpDTO.email = this.f.email.value;
        this.customerSignUpDTO.fullName = this.f.fullName.value;
        this.customerSignUpDTO.processorId ="uK7zicJODvni2J0Rfck5";
        this.customerSignUpDTO.verified ="false";
        this.customerSignUpDTO.defaultServiceLevel = 'ecommerceMerchant';
        this.customerSignUpDTO.tradingName = '';
        this.customerSignUpDTO.name = '';
        
        console.log(this.customerSignUpDTO);
        this._authService.createMerchantDTO = this.customerSignUpDTO;
    
        this._authService.createUser(frm) ;
    
    
       
      }
}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  signUpForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required)
  })

  constructor(private auth: AuthenticationService,private router: Router) { }

  ngOnInit() {
  }

  signUp(){
    const email = "" + this.signUpForm.value.email;
    const name = "" + this.signUpForm.value.name;
    const password = "" + this.signUpForm.value.password;
    this.auth.register(email, password, name).then(
      ()=>{
        console.log("successful sign up.")
        this.router.navigate(['/login'])
      }
    );
  }

}

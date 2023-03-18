import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {


  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  })

  loggedIn = false;
  alertHTML = "";

  constructor(private auth: AuthenticationService) { this.loginForm.reset() }

  ngOnInit() {
  }

  loginUser() {
    const email = "" + this.loginForm.value.email;
    const password = "" + this.loginForm.value.password;
    // console.log(email+" "+password);
    this.auth.login(email, password).then(
      () => {
        if (this.auth.success === true) {
          this.loggedIn = true;
          this.loginForm.reset();
        }
        else {
          this.loggedIn = false;
          this.alertHTML = "Log In Failed. Please try Again with the correct credentials."
          this.loginForm.reset();
        }
        
      }
    )
  }

}

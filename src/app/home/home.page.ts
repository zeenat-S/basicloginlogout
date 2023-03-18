import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Expense } from '../model/expense';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  currentUser: any
  user=""
  addExpense = false;

  expenseForm = new FormGroup({
    description: new FormControl('', Validators.required),
    amount: new FormControl('', [Validators.required, Validators.min(0.01)]),
    date: new FormControl('', [Validators.required])
  })

  constructor(private auth: AuthenticationService, private fb: FormBuilder, private router: Router) { 
    this.auth.getCurrentUser()
    .then((user)=> {
      this.currentUser = user;
      console.log(this.currentUser)
      this.user = this.currentUser
    }).catch((error)=> {
      console.log(error);
    })
   }

  logout() {
    this.auth.logout();
    // this.loginPage.loginForm.reset();
  }

  onSubmit(){
    const expense: Expense = {
      description: String(this.expenseForm.value.description),
      amount: Number(this.expenseForm.value.amount),
      date: new Date(String(this.expenseForm.value.date)), 
      userId: String(this.auth.getCurrentUserID)
    }
    console.log(expense)
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}

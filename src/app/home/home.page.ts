import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Expense } from '../model/expense';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  currentUser: any
  user = ""
  userEmail = ""
  showExpenseForm = false;


  expenseForm = new FormGroup({
    description: new FormControl('', Validators.required),
    amount: new FormControl('', [Validators.required, Validators.min(0.01)]),
    date: new FormControl('', [Validators.required])
  })

  expenses !: any[];

  constructor(private auth: AuthenticationService,
    private fb: FormBuilder,
    private router: Router,
    private firestore: AngularFirestore) {
    this.auth.getCurrentUser()
      .then((user) => {
        this.currentUser = user;
        console.log(this.currentUser)
        this.user = this.currentUser
        this.user = this.user.toUpperCase();
      }).catch((error) => {
        console.log(error);
      });

    this.auth.getCurrentUserEmail().then((async email => {
      console.log("email " + email)
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + email);
        return;
      }
      const document = query?.docs[0];
      const docId = document?.id;

      this.firestore.collection('users').doc(docId).collection<Expense>("expense").valueChanges().subscribe(expenses => {
        this.expenses = expenses;
        console.log("expenses: " + expenses)
      })
    }))

  }

  logout() {
    this.auth.logout();
  }

  async onSubmit() {
    const expense: Expense = {
      id: '',
      description: String(this.expenseForm.value.description),
      amount: Number(this.expenseForm.value.amount),
      date: new Date(String(this.expenseForm.value.date)),
      userId: String(this.auth.getCurrentUserID())
    }

    this.auth.getCurrentUserEmail().then((async email => {
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + email);
        return;
      }
      const document = query?.docs[0];
      const docId = document?.id;

      const expRef = this.firestore.collection('users').doc(docId).collection('expense');
      expRef.add(expense).then(() => console.log("expense added : " + expense.description))
    }))

  }

  onCancel() {
    // this.router.navigate(['/home']);
    this.showExpenseForm = false;
  }

  HandleAddButton() {
    this.showExpenseForm = true;
  }

  deleteExpense(date: Date) {
    this.auth.getCurrentUserEmail().then((async email => {
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + email);
        return;
      }
      const document = query?.docs[0];
      const docId = document?.id;
      const expRef = this.firestore.collection('users').doc(docId).collection('expense', ref=> ref.where('date', '==', date));
      expRef.get().toPromise().then(queryS=>{
        queryS?.forEach(doc=> {
          const exp = expRef.doc(doc.id);
          exp.delete();
        })
      })
    }))
  }

}

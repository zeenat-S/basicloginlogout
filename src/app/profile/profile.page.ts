import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import * as ApexCharts from 'apexcharts';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Expense } from '../model/expense';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user = ""
  chart: ApexCharts | undefined;
  money: number[] = [];
  dates: string[] = [];
  expenses: Expense[] = [];

  constructor(private auth: AuthenticationService, private firestore: AngularFirestore) {
    this.auth.getCurrentUser()
      .then((user) => {
        this.user = user.toUpperCase();
      }).catch((error) => {
        console.log(error);
      });



  }


  ngOnInit() {
    this.chart = new ApexCharts(document.querySelector("#chart"), this.getChartOptions());
    this.chart.render();
  }

  logout() {
    this.auth.logout();
  }

  getChartOptions(): ApexCharts.ApexOptions {
    this.auth.getCurrentUserEmail().then((async email => {
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + email);
        return;
      }
      const document = query?.docs[0];
      const docId = document?.id;

      this.firestore.collection('users').doc(docId).collection<Expense>("expense").valueChanges().subscribe(expenses => {
        for (let expense of expenses) {
          this.money.push(expense.amount);
          // console.log(expense.amount)
          this.dates.push(expense.date);
        }
      })
    }))

    return {
      chart: {
        type: 'bar',
        height: 350
      },
      series: [{
        name: 'Expenditure',
        data: this.money
      }],
      xaxis: {
        categories: this.dates
      }
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { Groups } from '../model/groups';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../services/authentication.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {

  group!: Groups;
  addNewEvent = false;
  eventForm = new FormGroup({
    eventName: new FormControl('', [Validators.required]),
    paidBy: new FormControl('', [Validators.required, Validators.email]),
    amount: new FormControl(0, [Validators.required, Validators.min(1)]),
    date: new FormControl('', Validators.required),
    // splitType: new FormControl('', Validators.required)
  })

  constructor(private activatedRoute: ActivatedRoute, private firestore: AngularFirestore, private auth: AuthenticationService) {
    this.activatedRoute.params.subscribe(params => {
      const groupDocId = params['id'];
      this.getGroupDetails(groupDocId);
    })
   }

  ngOnInit() {
    
  }

  getGroupDetails(groupDocId: string){
    this.auth.getCurrentUserEmail().then(async email => {
      var query = await this.firestore.collection('users', ref => ref.where("userEmail", '==', email)).get().toPromise();
      if (query?.empty) return;
      var document = query?.docs[0];
      var docId = document?.id;
      this.firestore.collection('users').doc(docId).collection('groups').doc(groupDocId).get().subscribe(doc => {
        if(doc.exists) {
          this.group = doc.data() as Groups;
        } else {
          console.log("error: Group not found")
        }
      }, error => {
        console.error('Error fetching group details:', error);
      })
    })
    
    
  }

  handleNewEventsButton(){
    this.addNewEvent= true;
  }

  onCancel() {
    this.addNewEvent = false;
  }

}

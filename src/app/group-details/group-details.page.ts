import { Component, OnInit } from '@angular/core';
import { Groups } from '../model/groups';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from '../services/authentication.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../services/event.service';
import { Events } from '../model/events';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {

  user= ""
  group!: Groups;
  addNewEvent = false;
  eventForm = new FormGroup({
    eventName: new FormControl('', [Validators.required]),
    paidBy: new FormControl('', [Validators.required, Validators.email]),
    amount: new FormControl(0, [Validators.required, Validators.min(1)]),
    date: new FormControl('', Validators.required),
    // splitType: new FormControl('', Validators.required)
  })
  events!: Events[]

  constructor(private activatedRoute: ActivatedRoute, private firestore: AngularFirestore, private auth: AuthenticationService, private eventSerivce: EventService) {
    this.auth.getCurrentUser()
      .then((user) => {
        this.user = user.toUpperCase();
      }).catch((error) => {
        console.log(error);
      });
    this.activatedRoute.params.subscribe(params => {
      const groupDocId = params['id'];
      this.getGroupDetails(groupDocId);
     
    this.auth.getCurrentUserEmail().then(async email => {
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + email);
        return;
      }
      const document = query?.docs[0];
      const docId = document?.id;

      this.firestore.collection("users").doc(docId).collection("groups").doc(groupDocId).collection<Events>("events").valueChanges().subscribe(events => this.events = events)
    })
  }) 
  }

  ngOnInit(): void {}

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

  addEvent() {
    const date = new Date(String(this.eventForm.value.date));
    const dateDay = date.getDate();
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    const memberLen = this.group.members.length;
    const money = Number(this.eventForm.value.amount)/memberLen;
    
    const newEvent: Events = {
      eventName: this.eventForm.value.eventName,
      amount: Number(this.eventForm.value.amount),
      paidBy: this.eventForm.value.paidBy,
      eventMembers: this.group.members,
      date: String(dateDay)+"/"+String(dateMonth)+"/"+String(dateYear),
      splitMoney: String(money)
    }
    this.activatedRoute.params.subscribe( params => {
      const id = params['id'];
      this.eventSerivce.createEvent(newEvent, id).then(()=>
    {
      console.log('Event created' + newEvent.id);
    })
    .catch((error)=> {
      console.log("Event creating error: " + error)
    })
    })
    
  }

  logout(){
    this.auth.logout();
  }
}

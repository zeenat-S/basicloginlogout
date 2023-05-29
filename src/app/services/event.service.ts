import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Events } from '../model/events';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {


  public docID!: string | undefined;
  
  constructor(private firestore: AngularFirestore, private auth: AuthenticationService) { }

  async getDocID(): Promise<void> {
    try {
      const email = await this.auth.getCurrentUserEmail();
      console.log("email " + email);
  
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + email);
        return;
      }
  
      const document = query?.docs[0];
      const docId = document?.id;
      this.docID = docId;
    } catch (error) {
      console.error('Error getting docID:', error);
    }
  }

  async getEvents(id: any): Promise<Events[]> {
    try {
      await this.getDocID();
      console.log("from getEvents: " + this.docID);
  
      const events = await this.firestore.collection("users").doc(this.docID).collection("groups").doc(id).collection<Events>("events").valueChanges().toPromise();
      return events || []; // Return an empty array if events is undefined
    } catch (error) {
      console.error('Error retrieving events:', error);
      return []; // Return an empty array in case of an error
    }
  }

  private async generateNewId(id: any): Promise<string> {
    await this.getDocID();
    return this.firestore.collection("users").doc(this.docID).collection("groups").doc(id).collection<Events>("events").ref.doc().id;
  }

  async createEvent(event: Events, id: any): Promise<void> {
    const eventId = await this.generateNewId(id);
    event.id = eventId;
    await this.getDocID();
    return this.firestore.collection("users").doc(this.docID).collection("groups").doc(id).collection<Events>("events").doc(eventId).set(event);
  }
    
}

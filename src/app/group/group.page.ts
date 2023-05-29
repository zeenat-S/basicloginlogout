import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Groups } from '../model/groups';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group',
  templateUrl: './group.page.html',
  styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {

  user = ""
  addGroup = false;
  groups: any[] = [];
  group!: Groups;
  members: any[] = [];

  groupForm = new FormGroup({
    groupName: new FormControl('', Validators.required),
    members: new FormControl('', [Validators.required, Validators.email])
  })
  reset = false;

  constructor(private auth: AuthenticationService, private firestore: AngularFirestore, private router: Router) {
    this.getCurrentUserEmail();
    this.getAllGroups(); 
  }

  ngOnInit() {
  }

  logout() {
    this.auth.logout();
  }

  handleNewGroup() {
    this.addGroup = true;
    this.reset = false;
    this.members = []
  }

  onCancel() {
    this.addGroup = false;
    this.groupForm.reset();
  }

  getCurrentUserEmail() {
    this.auth.getCurrentUser().then(name => {
      this.user = name;
    });
  }

  getAllGroups() {
    this.auth.getCurrentUserEmail().then(async name => {
      // console.log('inside getCurrentUSerDocId : ' + name)
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', name)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + name);
        return;
      }
      const document = query?.docs[0];
      const docId = document?.id;
      console.log("inside promise func " + docId);
      this.firestore.collection('users').doc(docId).collection("groups").valueChanges().subscribe(group => {
        this.groups = group;
        console.log("Groups: " + group)
      })
    });
  }

  async addGroups() {
    if (this.members.length === 0) {
      console.log("No members added");
      return;
    }
    this.auth.getCurrentUserEmail().then(email => {
      this.auth.getCurrentUser().then(name => {
        this.members.push({ email: email, name: name })
      })
    })
    const groupName = this.groupForm.value.groupName;
    this.group = {
      id: String(this.groups.length++),
      groupName: groupName,
      members: this.members
    }
    this.auth.getCurrentUserEmail().then(async name => {
      // console.log('inside getCurrentUSerDocId : ' + name)
      const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', name)).get().toPromise();
      if (query?.empty) {
        console.log('No document found with email ' + name);
        return;
      }
      const document = query?.docs[0];
      const docId = document?.id;
      this.firestore.collection('users').doc(docId).collection("groups").add(this.group)
      console.log("Group created: " + this.group.groupName)
    });
    this.groupForm.reset();
    this.reset = true;
    this.addGroup = false;
    this.groupForm.reset();
  }

  async addMembers() {
    console.log(this.members)
    const email = this.groupForm.value.members;
    const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
    if (query?.empty) {
      console.log('This email does not exist: ' + email);
      return;
    }
    const document = query?.docs[0];
    const user = document?.data() as User;
    const name = user.userName
    // console.log(user)
    if(!this.members.includes({ email: email, name: name })){
      this.members.push({ email: email, name: name });
    }
    console.log("member added: " + email + " " + name);
  }

  onGroupClick(groupId : string) {
   this.auth.getCurrentUserEmail().then(async email => {
    const query = await this.firestore.collection('users', ref => ref.where('userEmail', '==', email)).get().toPromise();
    if(query?.empty) return;
    const document = query?.docs[0];
    const docId = document?.id;
    const queryGroup = await this.firestore.collection('users').doc(docId).collection('groups', ref => ref.where('id', '==', groupId)).get().toPromise();
    if(queryGroup?.empty){
      console.log("Group with ID "+groupId+" not found.")
      return
    }
    const groupDoc = queryGroup?.docs[0];
    const groupDocId = groupDoc?.id;
    console.log(groupDocId+" selected");
    this.router.navigate(['/group-details', groupDocId])
   })
  }
}

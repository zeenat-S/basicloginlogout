import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence, Auth } from 'firebase/auth';
import { first } from 'rxjs';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private app = initializeApp(environment.firebase);
  private auth: Auth = getAuth(this.app)
  success = false;

  constructor(public af: AngularFireAuth, public router: Router) {
    setPersistence(this.auth, browserSessionPersistence).then(
      () => {
        console.log("persistence successful")
      }
    ).catch((error) => {
      console.log('Error setting persistence:', error)
    });
  }

  login(email: string, password: string) {

    return this.af.signInWithEmailAndPassword(email, password).then(
      () => {
        console.log("success");
        this.router.navigate(["/home"]);
        this.success = true;
      }
    ).catch((error) => {
      console.log("An error occurred.");
      this.success = false;
    })
  }

  register(email: string, password: string, displayName: string) {
    return this.af.createUserWithEmailAndPassword(email, password).then((credentials)=>{
      const user = credentials.user;
      return user?.updateProfile({displayName: displayName})
    })
    .catch(
      (error: any) => {
        console.log("Sign Up failed: " + error);
      }
    );
  }

  logout() {
    return this.af.signOut().then(
      () => {
        console.log(this.getCurrentUser() + "logged out")
        this.router.navigate(['/login'])
      }
    )
  }

  getCurrentUser() {
    return new Promise<any>((resolve, reject) => {
      getAuth(this.app).onAuthStateChanged((user)=> {
        if(user) {
          resolve(user.displayName);
        } else {
          reject ('No user logged in')
        }
      })
    })
  }

  // returns current user uid
  getCurrentUserID(){
    return new Promise<any>((resolve, reject) => {
      getAuth(this.app).onAuthStateChanged((user)=> {
        if(user) {
          resolve(user.uid);
        } else {
          reject ('No user logged in')
        }
      })
    })
  }

  
}

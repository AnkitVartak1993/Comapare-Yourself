import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import {CognitoUserPool, CognitoUserAttribute,AuthenticationDetails, CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { User } from './user.model';

const POOL_DATA ={
  UserPoolId: 'us-east-2_FP4v9darb',
  ClientId: '1sqp1mcl5p9hd19ji5ht4h1rn6'
};

const userPool = new CognitoUserPool(POOL_DATA);

@Injectable()
export class AuthService {
  authIsLoading = new BehaviorSubject<boolean>(false);
  authDidFail = new BehaviorSubject<boolean>(false);
  authStatusChanged = new Subject<boolean>();
  registeredUser: CognitoUser;
  constructor(private router: Router) {}
  signUp(username: string, email: string, password: string): void {
    this.authIsLoading.next(true);
    const user: User = {
      username: username,
      email: email,
      password: password
    };
    const attrList: CognitoUserAttribute [] = [];
    const emailAttribute = {
      Name: 'email',
      Value: user.email
    };

    attrList.push(new CognitoUserAttribute(emailAttribute));
    userPool.signUp(user.username, user.password, attrList, null, (err, result)=>{
      if(err){
        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        this.registeredUser = result.user;
        return;
      }
      
    });
    return;
  }
  confirmUser(username: string, code: string) {
    this.authIsLoading.next(true);
    const userData = {
      Username: username,
      Pool: userPool
    };
    const cognitUser =  new CognitoUser(userData);
    cognitUser.confirmRegistration(code, true, (err, result)=>{
      if(err){
        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }
      this.authIsLoading.next(false);
      this.router.navigate(['/']);
    });
  }
  signIn(username: string, password: string): void {
    this.authIsLoading.next(true);
    const authData = {
      Username: username,
      Password: password
    };
    const authDetails = new AuthenticationDetails(authData);
    const userData ={
      Username: username,
      Pool: userPool
    };
    const cognitUser =  new CognitoUser(userData);
    cognitUser.authenticateUser(authDetails, {
      onSuccess(result: CognitoUserSession){
      
        console.log(result);
      },
      onFailure(err){
        
        console.log(err);
      }
    })
    this.authStatusChanged.next(true);
    return;
  }
  getAuthenticatedUser() {
  }
  logout() {
    this.authStatusChanged.next(false);
  }
  isAuthenticated(): Observable<boolean> {
    const user = this.getAuthenticatedUser();
    const obs = Observable.create((observer) => {
      if (!user) {
        observer.next(false);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
    return obs;
  }
  initAuth() {
    this.isAuthenticated().subscribe(
      (auth) => this.authStatusChanged.next(auth)
    );
  }
}

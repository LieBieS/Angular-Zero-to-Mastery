import { Injectable } from '@angular/core';
import { IUser } from '../models/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { delay, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticated$!: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private usersCollection: AngularFirestoreCollection<IUser>;
  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.usersCollection = db.collection('users');
    this.isAuthenticated$ = this.auth.user.pipe(
      map(user => !!user)
    );
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    )
  }

  public async registerUser(user: IUser): Promise<number> {
    const { email, password } = user;
    await this.auth
      .createUserWithEmailAndPassword(email as string, password as string)
      .then(async (userCredentials) => {
        await userCredentials.user
          ?.updateProfile({
            displayName: user.name,
          })
          .then(async () => {
            await this.usersCollection.doc(userCredentials.user?.uid).set({
              name: user.name,
              email: user.email,
              age: user.age,
              phoneNumber: user.phoneNumber,
            });
          });
      })
      .catch((err) => {
        console.error(err);
        return 500;
      });
    return 201;
  }
  public async login(user: IUser): Promise<number> {
    if (user.password == null) {
      return 404;
    }
    await this.auth
      .signInWithEmailAndPassword(user.email, user.password)
      .then((usr) => {
        return 200;
      })
      .catch((err) => {
        console.error(err);
        return 404;
      });
    return 200;
  }
}

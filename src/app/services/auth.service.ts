import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: AngularFireAuth, private db: AngularFirestore) { }

  public async registerUser(user: User): Promise<number> {
    const { email, password } = user;
    await this.auth
      .createUserWithEmailAndPassword(email as string, password as string)
      .then(async () => {
        await this.db
          .collection('users')
          .add({
            name: user.name,
            email: user.email,
            age: user.age,
            phoneNumber: user.phoneNumber,
          })
          .then(() => {
            return 201;
          });
      })
      .catch((err) => {
        console.error(err);
        return 500;
      });
      return 404;
  }
}

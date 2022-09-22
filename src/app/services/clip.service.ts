import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';

import IClip from '../models/clip';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, switchMap } from 'rxjs/operators';
import { of, BehaviorSubject, combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingRequest: boolean = false;
  constructor(private db: AngularFirestore, private auth: AngularFireAuth, private storage: AngularFireStorage) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  updateClipTitle(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title,
    });
  }

  async deleteClip(clip: IClip) {
    await this.storage.ref(`clips/${clip.clipFileName}`).delete();
    await this.storage.ref(`screenshots/${clip.screenshotFileName}`).delete();
    await this.clipsCollection.doc(clip.docID).delete();
  }

  retrieveClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((values) => {

        const [user, sort] = values;
        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref.where('uid', '==', user.uid).orderBy(
          'timestamp',
          sort === '1' ? 'desc' : 'asc'
        );

        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  async getClips() {
    if (this.pendingRequest) {
      return
    }
    this.pendingRequest = true;
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(1);
    const { length } = this.pageClips;
    if (length) {
      const lastDocID = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsCollection.doc(lastDocID).get().toPromise();
      query = query.startAfter(lastDoc)
    }
const snapShot = await query.get();
snapShot.forEach(s => {
  this.pageClips.push({
    docID: s.id,
    ...s.data()})
})
    this.pendingRequest = false;
    
  }
}

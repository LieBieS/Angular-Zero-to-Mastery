import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { DocumentReference } from '@angular/fire/compat/firestore';
import IClip from 'src/app/models/clip';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragover: boolean = false;
  inSubmission: boolean = false;
  file: File | null = null;
  nextStep: boolean = false;
  showAlert = false;
  alertMsg: string = 'Please wait your account is being greated';
  alertColour: string = 'blue';
  showPercent: boolean = false;
  percentage: number = 0;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });
  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth, private clipsSrv: ClipService, private router: Router) {
    auth.user.subscribe(user => this.user = user);
  }
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  storeFile(e: Event) {
    this.isDragover = false;
    this.file = (e as DragEvent).dataTransfer ? (e as DragEvent).dataTransfer?.files.item(0) ?? null :
      (e.target as HTMLInputElement).files?.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.title.setValue(this.file.name.replace('.mp4', ''));
    this.nextStep = true;
  }

  async publish() {
    this.showUserNotification();
    const clipFileName: string = uuid();
    const clipPath: string = `clips/${clipFileName}.mp4`;
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });
    this.task.snapshotChanges()
      .pipe(last(),
        switchMap(() => clipRef.getDownloadURL()))
      .subscribe({
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value as string,
            fileName: `${clipFileName}.mp4`,
            url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };

          this.successReturn(await this.clipsSrv.createClip(clip));
        },
        error: (error) => {
          this.errorReturn();
        },
      });
  }


  private showUserNotification() {
    this.uploadForm.disable;
    this.showPercent = true;
    this.showAlert = true;
    this.alertMsg = 'Your video is being uploaded. Please wait..';
    this.alertColour = 'blue';
    this.inSubmission = true;
  }

  private successReturn(clip: DocumentReference<IClip>) {
    this.showPercent = false;
    this.alertMsg = 'Your video have been successfully uploaded.';
    this.alertColour = 'green';
    this.showAlert = true;
    setTimeout(() => {
      this.router.navigate([
        'clip', clip.id,
      ])
    }, 1000)
  }

  private errorReturn() {
    this.uploadForm.enable
    this.alertMsg = 'An unexpected error occured. please try again later.';
    this.alertColour = 'red';
    this.showAlert = true;
    this.inSubmission = false;
  }
}

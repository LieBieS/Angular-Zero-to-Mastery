import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { v4 as uuid } from 'uuid';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
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
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });
  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth) {
    auth.user.subscribe(user => this.user = user);
  }

  ngOnInit(): void { }

  storeFile(e: Event) {
    this.isDragover = false;
    this.file = (e as DragEvent).dataTransfer?.files.item(0) ?? null;
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
    const task = this.storage.upload(clipPath, this.file);

    task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });
    task.snapshotChanges()
      .pipe(last())
      .subscribe({
        next: (snapshot) => {
          const clip = {
            uid: this.user?.uid,
            displayName: this.user?.displayName,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: this
          };
          this.successReturn();
        },
        error: (error) => {
          this.errorReturn();
        },
      });
  }


  private showUserNotification() {
    this.showPercent = true;
    this.showAlert = true;
    this.alertMsg = 'Your video is being uploaded. Please wait..';
    this.alertColour = 'blue';
    this.inSubmission = true;
  }

  private successReturn() {
    this.showPercent = false;
    this.alertMsg = 'Your video have been successfully uploaded.';
    this.alertColour = 'green';
    this.showAlert = true;
  }

  private errorReturn() {
    this.alertMsg = 'An unexpected error occured. please try again later.';
    this.alertColour = 'red';
    this.showAlert = true;
    this.inSubmission = false;
  }
}

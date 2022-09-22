import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { v4 as uuid } from 'uuid';
import { switchMap } from 'rxjs/operators';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { DocumentReference } from '@angular/fire/compat/firestore';
import IClip from 'src/app/models/clip';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

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
  screenshots: string[] = [];
  selectedScreenshot: string = '';
  screenshotTask?: AngularFireUploadTask;
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
  });
  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsSrv: ClipService,
    private router: Router,
    public ffmpegSrv: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    ffmpegSrv.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile(e: Event) {
    if (this.ffmpegSrv.isRunning) {
      return;
    }
    this.isDragover = false;
    this.file = (e as DragEvent).dataTransfer
      ? (e as DragEvent).dataTransfer?.files.item(0) ?? null
      : (e.target as HTMLInputElement).files?.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.screenshots = await this.ffmpegSrv.getScreenShots(this.file);
    this.selectedScreenshot = this.screenshots[0];
    this.title.setValue(this.file.name.replace('.mp4', ''));
    this.nextStep = true;
  }

  async publish() {
    this.showUserNotification();
    const clipFileName: string = uuid();
    const clipPath: string = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegSrv.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;
    const screenshotRef = this.storage.ref(screenshotPath);
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) {
        return;
      }
      const total = clipProgress + screenshotProgress;
      this.percentage = (total as number) / 200;
    });

    forkJoin([this.task.snapshotChanges(),
    this.screenshotTask.snapshotChanges()])
      .pipe(
        switchMap(() => forkJoin([
          clipRef.getDownloadURL(),
          screenshotRef.getDownloadURL()
        ]))
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL, screenshotURL] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value as string,
            clipFileName: `${clipFileName}.mp4`,
            clipURL,
            screenshotFileName: `${clipFileName}.png`,
            screenshotURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
      this.router.navigate(['clip', clip.id]);
    }, 1000);
  }

  private errorReturn() {
    this.uploadForm.enable;
    this.alertMsg = 'An unexpected error occured. please try again later.';
    this.alertColour = 'red';
    this.showAlert = true;
    this.inSubmission = false;
  }
}

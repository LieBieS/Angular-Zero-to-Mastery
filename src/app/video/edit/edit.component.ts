import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import IClip from 'src/app/models/clip';
import { ModalService } from 'src/app/services/modal.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  activeClip: IClip | null = null;

  inSubmission: boolean = false;
  showAlert = false;
  alertMsg: string = 'Please wait your account is being greated';
  alertColour: string = 'blue';

  clipID = new FormControl();
  newTitle = new FormControl('', [Validators.required, Validators.minLength(3)])
  editForm = new FormGroup({ id: this.clipID, title: this.newTitle });
  @Output() hasUpdated = new EventEmitter();

  constructor(private modal: ModalService, private clipSrv: ClipService) {
    this.showAlert = false;
  }
  ngOnChanges(): void {
    if (!this.activeClip) {
      return
    }
    this.inSubmission = false;
    this.showAlert = false;
    this.clipID.setValue(this.activeClip.docID);
    this.newTitle.setValue(this.activeClip.title)
  }
  ngOnDestroy(): void {
    this.modal.unregister('editClips')
  }

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  async update() {
    this.showUserNotification();
    await this.clipSrv.updateClipTitle(this.clipID.value, this.newTitle.value as string)
      .then(() => { this.successReturn() })
      .catch(() => { this.errorReturn() })
  }
  private showUserNotification() {
    this.editForm.disable;
    this.showAlert = true;
    this.alertMsg = 'Your video is being updated. Please wait..';
    this.alertColour = 'blue';
    this.inSubmission = true;
  }

  private successReturn() {
    this.alertMsg = 'Your video have been successfully updated.';
    this.alertColour = 'green';
    this.showAlert = true;
    if (this.activeClip) {
      this.activeClip.title = this.newTitle.value as string;
      this.hasUpdated.emit(this.activeClip);
    }
  }

  private errorReturn() {
    this.editForm.enable
    this.alertMsg = 'An unexpected error occured. please try again later.';
    this.alertColour = 'red';
    this.showAlert = true;
    this.inSubmission = false;
  }
}

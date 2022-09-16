import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})

export class RegisterComponent implements OnInit {

  constructor(private authService: AuthService, private emailTaken: EmailTaken) { }
  ngOnInit(): void { }
  // Component variables
  showAlert = false;
  alertMsg: string = 'Please wait your account is being greated';
  alertColour: string = 'blue';
  inSubmission = false;

  //#region  Form Controls
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email],[this.emailTaken.validate]);
  age = new FormControl(0, [
    Validators.required,
    Validators.min(18),
    Validators.max(100),
  ]);

  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ]);
  confirmPassword = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(9),
  ]);
  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirmPassword: this.confirmPassword,
    phoneNumber: this.phoneNumber,
  }, [RegisterValidators.match('password', 'confirmPassword')]);
  //#endregion

  //#region User Creation
  async register() {
    this.showUserNotification();

    const status = await this.authService.registerUser(this.registerForm.value as IUser);
    if (status === 201) {
      this.successReturn();
    } else {
      this.errorReturn();
    }
  }
  //#endregion

  //#region Notifications

  private showUserNotification() {
    this.showAlert = true;
    this.alertMsg = 'Please wait your account is being greated';
    this.alertColour = 'blue';
    this.inSubmission = true;
  }

  private successReturn() {
    this.alertMsg = 'Success your account has been created.';
    this.alertColour = 'green';
    this.showAlert = true;
  }

  private errorReturn() {
    this.alertMsg = 'An unexpected error occured. please try again later.';
    this.alertColour = 'red';
    this.showAlert = true;
    this.inSubmission = false;
  }
  //#endregion
}

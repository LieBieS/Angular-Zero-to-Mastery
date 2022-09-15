import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validator, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})

export class RegisterComponent implements OnInit {
  user = new User();
  constructor(private authService: AuthService) { }
  ngOnInit(): void { }
  // Component variables
  showAlert = false;
  alertMsg: string = 'Please wait your account is being greated';
  alertColour: string = 'blue';
  inSubmission = false;

  //#region  Form Controls
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email]);
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
  });
  //#endregion

  //#region User Creation
  async register() {
    this.showUserNotification();
    this.constructUserObj(
      this.name.value || '',
      this.email.value || '',
      this.password.value || '',
      this.age.value || 0,
      this.phoneNumber.value || ''
    );
    const status = await this.authService.registerUser(this.user);
    if (status === 201) {
      this.successReturn();
    } else {
      this.errorReturn();
    }
  }
  //#endregion

  //#region Object creation
  private constructUserObj(
    name: string,
    email: string,
    password: string,
    age: number,
    phoneNumber: string
  ) {
    this.user.name = name;
    this.user.email = email;
    this.user.password = password;
    this.user.age = age;
    this.user.phoneNumber = phoneNumber;
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

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ]);
  showAlert = false;
  alertMsg: string = 'Please wait your account is being greated';
  alertColour: string = 'blue';
  inSubmission = false;
  constructor(private authService: AuthService) { }
  loginForm = new FormGroup({
    email: this.email,
    password: this.password,
  });
  ngOnInit(): void { }

  async login(){
    this.inSubmission = true;
    const status = await this.authService.login(this.loginForm.value as IUser);
    
    if (status === 200) {
      this.successReturn();
    } else {
      this.errorReturn();
    }
  }
  successReturn() {
    throw new Error('Method not implemented.');
  }

  private errorReturn() {
    this.alertMsg = 'An unexpected error occured. please try again later.';
    this.alertColour = 'red';
    this.showAlert = true;
    this.inSubmission = false;
  }
}

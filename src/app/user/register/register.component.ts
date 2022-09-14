import { Component } from '@angular/core';
import { FormGroup, FormControl, Validator, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {

  name= new FormControl('', [Validators.required], Validators.minLength(3));
  email= new FormControl('', [Validators.required, Validators.email]);
  age= new FormControl(0, [Validators.required, Validators.min(3), Validators.max(100)]);
  password= new FormControl('', [Validators.required, Validators.minLength(6)]);
  confirmPassword= new FormControl('', [Validators.required, Validators.minLength(6)]);
  phoneNumber= new FormControl('', [Validators.required, Validators.minLength(9)]);


  registerForm = new FormGroup({
name: this.name, 
email: this.email, 
age:this.age,
password: this.password,
confirmPassword: this.confirmPassword,
phoneNumber: this.phoneNumber,
   });
  constructor(){
    
  }

}

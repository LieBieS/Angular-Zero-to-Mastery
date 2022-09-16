import { ValidationErrors, AbstractControl, ValidatorFn } from "@angular/forms";
export class RegisterValidators {
    static match(controlName: string, mathingControlName: string): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const control = group.get(controlName);
            const matchingControl = group.get(mathingControlName);
            if (!control || !matchingControl) {
                console.error('Form controls cannot be found in the form group.')
                return { controlNotFound: false };
            }
            var controlNoMatch = control.value === matchingControl.value ? null : { noMatch: true };
            matchingControl.setErrors(controlNoMatch);
            return controlNoMatch;
        }
    }
}

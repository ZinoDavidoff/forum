import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      
      const { username, email, password, fullName } = this.registerForm.value;
      
      this.authService.register(username, email, password, fullName).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }
}

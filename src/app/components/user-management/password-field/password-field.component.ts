import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { StringUtils } from '../../../utils/string.utils';

const TYPE_TEXT = 'text';
const TYPE_PASSWORD = 'password';

@Component({
  selector: 'std-password-field',
  styles: [`
    :host {
      display: flex;
      align-items: center;
    }`
  ],
  template: `
    <mat-form-field>
      <input matInput placeholder="Password" i18n-placeholder
             [type]="revealed ? '${TYPE_TEXT}' : '${TYPE_PASSWORD}'"
             [formControl]="formControlRef"
             [(ngModel)]="model.password">
      <mat-error i18n *ngIf="formControlRef.hasError('required')">
        Password is <strong>required</strong>
      </mat-error>
    </mat-form-field>
    <div class="helpers">
      <button class="ui basic icon mini button"
              *ngIf="allowVisibilityControl"
              (click)="revealed = !revealed"
              title="Show/Hide Password" i18n-title>
        <i class="icon {{inputType === 'text' ? 'low vision' : 'eye'}}"></i>
      </button>
      <button i18n class="ui basic mini button" *ngIf="allowGeneration" (click)="generatePassword()">
        Generate
      </button>
    </div>`
}) export class PasswordFieldComponent implements OnInit {
  @Input() model;
  @Input() autoGenerate = false;
  @Input() allowVisibilityControl = true;
  @Input() allowGeneration = true;
  @Input() formControlRef;
  @Input() revealed = true;
  ngOnInit() {
    if (!this.formControlRef) {
      this.formControlRef = new FormControl('', [Validators.required]);
    }
    if (this.autoGenerate) {
      this.generatePassword();
    }
  }
  generatePassword() {
    const passwd: string = StringUtils.password();
    this.formControlRef.setValue(passwd);
    this.model.password = passwd;
  }
}

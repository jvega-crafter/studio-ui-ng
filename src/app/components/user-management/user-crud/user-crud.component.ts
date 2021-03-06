import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { showSnackBar } from '../../../utils/material.utils';
import { Change, ChangeType } from '../../../classes/change-tracker.class';
import { GroupService } from '../../../services/group.service';
import { AVATARS } from '../../../app.utils';
import { ResponseCodesEnum } from '../../../enums/response-codes.enum';
import { Observable } from 'rxjs/Observable';
import { select } from '@angular-redux/store';
import { Settings } from '../../../classes/app-state.interface';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'std-user-crud',
  templateUrl: './user-crud.component.html',
  styleUrls: ['./user-crud.component.scss']
})
export class UserCrUDComponent implements OnInit {

  @Output() finished = new EventEmitter();

  @select('settings')
  settings$: Observable<Settings>;

  avatars = AVATARS;

  userGroupsHasChanges = false;
  groupChangeRollback: Change;

  model: User = new User();
  editMode = false;
  selectedTabIndex = 0;
  notifyPasswordReset = true;

  firstNameFormControl = new FormControl('', [Validators.required]);
  lastNameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required, Validators.pattern(EMAIL_REGEX)]);
  userNameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);
  resetPasswordFormControl = new FormControl('', [Validators.required]);

  updateBasicInfoFormGroup = new FormGroup({
    firstName: this.firstNameFormControl,
    lastName: this.lastNameFormControl,
    email: this.emailFormControl,
    userName: this.userNameFormControl
  });

  constructor(public snackBar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute,
              public userService: UserService,
              public groupService: GroupService) {
  }

  ngOnInit() {
    const subscription = (params) => {
      if (params.username || params.edit) {
        this.model.username = params.username || params.edit;
        this.loadUser();
      }
    };
    this.route.params
      .subscribe(subscription);
    this.route.queryParams
      .subscribe(subscription);
  }

  done(snackBarMessage?) {

    if (snackBarMessage) {
      showSnackBar(this.snackBar, snackBarMessage);
    }

    // TODO: Better way of doing this?
    // How can parent component view subscribe to the event if it's the router outlet how renders
    // https://stackoverflow.com/questions/38393494/how-to-emit-event-in-router-outlet-in-angular2
    if (this.finished.observers.length) {
      this.finished.emit();
    } else {
      this.router.navigate(['/users']);
    }

  }

  loadUser() {
    const username = this.model.username;
    return this.userService.byId(username)
      .subscribe((response) => {
        this.model = response;
        this.editMode = true;
      });
  }

  create() {
    this.userService
      .create(this.model)
      .subscribe((data) => {
        if (data.responseCode === ResponseCodesEnum.OK) {
          this.model.password = '';
          showSnackBar(this.snackBar, `${this.fullName()} registered successfully. Edit mode enabled.`);
          this.loadUser();
        }
      });
  }

  update() {
    this.userService
      .update(this.model)
      .subscribe((data) => {
        this.done(`${this.fullName()} updated successfully.`);
      });
  }

  enable() {
    this.userService
      .enable(this.model)
      .subscribe({
        next: (result) => {
          // TODO: See sample error handling here...
          // Not quite working though. When would result not be "OK"?
          if (result.responseCode === ResponseCodesEnum.OK) {
            showSnackBar(this.snackBar, `${this.fullName()} set as enabled.`, 'Undo')
              .onAction()
              .subscribe(() => {
                this.model.enabled = false;
                this.disable();
              });
          } else {
            this.model.enabled = false;
            showSnackBar(this.snackBar, `Unable to set ${this.fullName()} as required.`, 'Retry')
              .onAction()
              .subscribe(() => {
                this.enable();
              });
          }
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  disable() {
    this.userService
      .disable(this.model)
      .subscribe((result) => {
        showSnackBar(this.snackBar, `${this.fullName()} set as disabled.`, 'Undo')
          .onAction()
          .subscribe(() => {
            this.model.enabled = true;
            this.enable();
          });
      });
  }

  enabledChanged(enabled) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  eliminate() {
    this.userService
      .delete(this.model)
      .subscribe(() => {
        this.done(`${this.fullName()} deleted successfully.`);
      });
  }

  resetPassword() {
    this.userService
      .resetPassword(this.model)
      .subscribe(() => {
        this.done('Password successfully reset.');
      });
  }

  fullName() {
    return `${this.model.firstName} ${this.model.lastName}`;
  }

  userGroupsChanged(data) {
    this.userGroupsHasChanges = data.hasChanges;
    let change = data.change;
    if (ChangeType.Add === change.type) {
      this.addToGroup(change.value.projectCode, change.value.groupName);
    } else /* if (ChangeType.Remove === change.type) */ {
      this.removeFromGroup(change.value.projectCode, change.value.groupName);
    }
  }

  addToGroup(projectCode, groupName) {
    this.groupService
      .addUser({ username: this.model.username, projectCode, groupName })
      .subscribe(() =>
        showSnackBar(this.snackBar, `${this.fullName()} added to ${groupName}`, 'Undo', { duration: 10000 })
          .onAction()
          .subscribe(() => {
            this.groupChangeRollback = { type: ChangeType.Add, value: { projectCode, groupName } };
            this.removeFromGroup(projectCode, groupName);
          }));
  }

  removeFromGroup(projectCode, groupName) {
    this.groupService
      .removeUser({ username: this.model.username, projectCode, groupName })
      .subscribe(() =>
        showSnackBar(this.snackBar, `${this.fullName()} removed from ${groupName}`, 'Undo', { duration: 10000 })
          .onAction()
          .subscribe(() => {
            this.groupChangeRollback = { type: ChangeType.Remove, value: { projectCode, groupName } };
            this.addToGroup(projectCode, groupName);
          }));
  }

  updateGroups() {
    // TODO: Not supported by API
  }

}

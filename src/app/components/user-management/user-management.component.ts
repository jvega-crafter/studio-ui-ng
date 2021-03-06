import { Component, OnInit } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/delay';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { UserService } from '../../services/user.service';
import { openDialog } from '../../utils/material.utils';
import { UserCrUDComponent } from './user-crud/user-crud.component';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Settings } from '../../classes/app-state.interface';

declare var $;

@Component({
  selector: 'std-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  @select('settings')
  settings$: Observable<Settings>;

  hasChild = false;
  childComponent = null;

  users;
  pageSize = 5;
  pageIndex = 0;
  totalNumOfUsers = 0;
  pageSizeOptions = [5, 10, 25, 100];

  constructor(private userService: UserService,
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog,
              public router: Router) {
    // Take advantage or be respectful of client screen by
    // showing more or less results
    /*this.pageSize = ($(window).height() > 600)
      ? this.pageSizeOptions[1]
      : this.pageSizeOptions[0];*/
    /*this.subs = Observable.fromEvent(window, 'resize')
      .delay(500)
      .subscribe((e) => console.log(e)); */
  }

  ngOnInit() {
    this.activeRoute.queryParams
      .subscribe(params => {
        const pageSize = params['pageSize'];
        const pageIndex = params['pageIndex'];
        const create = params['create'];
        const edit = params['edit'];
        const state = {
          pageSize: this.pageSize,
          pageIndex: this.pageIndex,
          users: this.users
        };

        if (pageSize !== undefined) {
          this.pageSize = pageSize;
        }
        if (pageIndex !== undefined) {
          this.pageIndex = pageIndex;
        }

        // TODO: fetch only when changed
        this.fetchUsers();

        // Something fails when opening dialogs without the setTimeout

        if (create !== undefined) {
          setTimeout(() => this.openDialog());
        }

        if (edit !== undefined && edit !== '') {
          setTimeout(() => this.openDialog({ username: edit }));
        }

      });
  }

  fetchUsers() {
    this.userService.page({
      start: (this.pageIndex * this.pageSize),
      number: this.pageSize
    }).subscribe((data) => {
      this.users = data.entries;
      this.totalNumOfUsers = data.total;
    });
  }

  createUser() {
    if (this.useModal()) {
      this.router.navigate(['/users'], { queryParams: { create: 'true' } });
    } else {
      this.router.navigate(['/users/create']);
    }
  }

  editUser(user) {
    if (this.useModal()) {
      this.router.navigate(['/users'], { queryParams: { edit: user.username } });
    } else {
      this.router.navigate(['/users/edit', user.username]);
    }
  }

  private useModal() {
    return $(window).width() < 1350;
  }

  openDialog(data = {}) {
    let dialogRef;
    dialogRef = openDialog(this.dialog, UserCrUDComponent, {
      width: '800px',
      height: '80vh',
      panelClass: ['no', 'pad', 'dialog'],
      disableClose: true,
      data
    });
    dialogRef.afterClosed()
      .subscribe(() => {
        this.editFinished();
      });
    dialogRef.componentInstance.finished
      .subscribe(() => {
        dialogRef.close();
      });
  }

  editFinished() {
    this.router.navigate(['/users']);
  }

  pageChanged($event: PageEvent) {
    this.router.navigate(['/users'], {
      queryParams: { pageIndex: $event.pageIndex, pageSize: $event.pageSize }
    });
  }

  componentAdded(event) {
    this.hasChild = true;
    this.childComponent = event;
  }

  componentRemoved(event) {
    this.hasChild = false;
    this.childComponent = null;
  }

}

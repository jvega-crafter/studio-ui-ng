import { Injectable } from '@angular/core';
import { ignoreElements, switchMap } from 'rxjs/operators';
import { StoreActionsEnum } from '../enums/actions.enum';
import { RootEpic } from './root.epic';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewTabCore } from '../classes/app-state.interface';
import { PromiseObservable } from 'rxjs/observable/PromiseObservable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { Asset } from '../models/asset.model';
import { BaseEpic } from './base-epic';

@Injectable()
export class InterceptorEpics extends BaseEpic {

  protected manifest: string[] = [
    'navigation',
    'editAsset'
  ];

  constructor(private router: Router,
              private route: ActivatedRoute) {
    super();
  }

  private navigation = RootEpic.createEpic(
    [
      StoreActionsEnum.NAVIGATE_ON_ACTIVE,
      StoreActionsEnum.OPEN_TAB_BACKGROUND
    ],
    (tab: PreviewTabCore) => {
      let router = this.router;
      if (!router.url.includes('/preview')) {
        router.navigate([`/preview`]);
      }
      return EmptyObservable
        .create()
        .pipe(ignoreElements());
    });

  private editAsset = RootEpic.createEpic(
    StoreActionsEnum.EDIT_ASSET,
    () => {
      let router = this.router;
      if (!router.url.includes('/edit')) {
        router.navigate([`/edit`]);
      }
      return EmptyObservable
        .create()
        .pipe(ignoreElements());
    });

}

// Could do something like below but don't really need to
// do anything with the router's navigation promise resolution
// return PromiseObservable
//   .create(router.navigate([`/preview`]))
//   .pipe(ignoreElements());

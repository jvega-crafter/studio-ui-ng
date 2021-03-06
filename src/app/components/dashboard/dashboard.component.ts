import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'std-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  nav = [
    { icon: 'fa fa-globe', label: 'Organizations', href: '/organizations' },
    { icon: 'fa fa-briefcase', label: 'Projects', href: '/projects' },
    { icon: 'fa fa-address-card-o', label: 'Users', href: '/users' },
    { icon: 'fa fa-file-o', label: 'Assets', href: '/assets' },
    { icon: 'fa fa-binoculars', label: 'Browser', href: '/preview' },
    { icon: 'fa fa-question-circle-o', label: 'Help', href: '/help' },
    { icon: 'fa fa-cogs', label: 'Configuration', href: '/config' },
    { icon: 'fa fa-shopping-cart', label: 'Marketplace', href: '/market' }
  ];

  constructor() { }

  ngOnInit() {
  }

}

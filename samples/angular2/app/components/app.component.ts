import { Component } from '@angular/core';
import {Contact, ContactsState, ContactsStore} from "./../stores/contacts.store";
import {AuthState, AuthStore} from "../stores/auth.store";
import {AppActivities} from "../services/appActivities.service";

@Component({
  selector: "my-app",
  moduleId: module.id,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  contacts: ContactsState;
  auth: AuthState;

  constructor(private appActivities: AppActivities,
              private contactsStore: ContactsStore,
              private authStore: AuthStore) {
    this.contactsStore.load();
  }

  ngOnInit() {
    this.contactsStore.store.getAppStore().subscribe(state => {
      this.contacts = state.contacts;
      this.auth = state.auth;
    });
  }

  isLoggedIn() {
    return this.auth && this.auth.user;
  }

  login() {
    this.authStore.login("oric", "123");
  }

  logout() {
    this.appActivities.logout();
  }
}

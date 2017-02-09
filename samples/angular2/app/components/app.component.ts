import { Component } from '@angular/core';
import {RootStore} from "./../stores/root.store";
import {Contact, ContactsState, ContactsStore} from "./../stores/contacts.store";
import {AuthState, AuthStore} from "../stores/auth.store";

@Component({
  selector: "my-app",
  moduleId: module.id,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  contacts: ContactsState;
  auth: AuthState;

  constructor(private rootStore: RootStore,
              private contactsStore: ContactsStore,
              private authStore: AuthStore) {
    this.contactsStore.load();
  }

  ngOnInit() {
    this.rootStore.store.subscribe(state => {
      this.contacts = state.contacts;
      this.auth = state.auth;
    });
  }

  isLoggedIn() {
    return this.auth.user!=null;
  }

  login() {
    this.authStore.login("oric", "123");
  }
}

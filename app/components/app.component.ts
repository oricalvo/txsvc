import { Component } from '@angular/core';
import {RootService} from "../services/root.service";

@Component({
    selector: 'my-app',
    template: require("./app.component.html"),
    styles: [require("./app.component.css")]
})
export class AppComponent {
    locale: string;
    metro: string;

    constructor(private rootService: RootService) {
    }

    ngOnInit() {
        this.rootService.subscribe(state => {
            this.locale = state.locale.localeId;
            this.metro = state.metro.metro.name;
        });
    }

    changeMetro() {
        this.rootService.changeMetro(2);
    }
}

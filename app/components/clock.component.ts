import { Component } from '@angular/core';
import {LocaleService} from "../services/locale.service";

@Component({
    selector: 'clock',
    template: require("./clock.component.html"),
    styles: [require("./clock.component.css")]
})
export class ClockComponent {
    locale: string;

    constructor(private localeService: LocaleService) {
    }

    ngOnInit() {
        this.localeService.subscribe(state => {
            this.locale = state.localeId;
        });
    }
}

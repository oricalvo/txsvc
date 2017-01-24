import "reflect-metadata";
import "zone.js";
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from "./components/app.component";
import {ClockComponent} from "./components/clock.component";
import {MetroService} from "./services/metro.service";
import {LocaleService} from "./services/locale.service";
import {RootService} from "./services/root.service";

@NgModule({
    imports: [BrowserModule],
    declarations: [AppComponent, ClockComponent],
    bootstrap: [AppComponent],
    providers: [
        LocaleService,
        MetroService,
        RootService,
    ],
})
export class AppModule {
}

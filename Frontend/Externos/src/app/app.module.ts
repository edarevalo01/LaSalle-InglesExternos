import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { RegistroComponent } from "./components/registro/registro.component";
import { LoginComponent } from "./components/login/login.component";

import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { CalendarModule } from "primeng/calendar";

@NgModule({
  declarations: [AppComponent, RegistroComponent, LoginComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, BrowserAnimationsModule, ButtonModule, DropdownModule, HttpClientModule, InputTextModule, CalendarModule],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {}

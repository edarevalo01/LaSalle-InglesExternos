import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Externos";
  checkIns: boolean = false;
  checkLog: boolean = false;

  constructor(private router: Router) {}

  changeColor() {
    return this.checkIns ? "background-color: red" : "background-color: red";
  }

  registro() {
    this.router.navigateByUrl("registro");
  }

  login() {
    this.router.navigateByUrl("login");
  }
}

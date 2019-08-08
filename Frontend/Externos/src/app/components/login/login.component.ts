import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Respuesta } from "src/app/model/Respuesta";
import { ServiciosService } from "src/app/services/servicios.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  usuario: string;
  contrasena: string;
  respuesta: Respuesta;
  hide = true;

  constructor(private service: ServiciosService, private cookie: CookieService) {}

  ngOnInit() {}

  login() {
    this.service.loginUsuario(this.usuario, this.contrasena).subscribe(
      respuestaObs => {
        this.respuesta = respuestaObs;
      },
      error => {
        console.error("ERROR al intentar ingresar.");
      },
      () => {
        console.log("Ingreso exitoso.");
        console.log(this.respuesta);
        this.cookie.set("cookie", this.respuesta.mensaje);
      }
    );
  }
}

import { Component, OnInit } from "@angular/core";
import { Respuesta } from "src/app/model/Respuesta";
import { ServiciosService } from "src/app/services/servicios.service";
import { CookieService } from "ngx-cookie-service";

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
        console.log(respuestaObs);
        this.respuesta = respuestaObs;
      },
      error => {
        console.error("ERROR al intentar ingresar.");
      },
      () => {
        console.log("Ingreso exitoso.");
        console.log(this.respuesta);
        if (this.respuesta.status === "ok") {
          this.cookie.set("wUFAnew4", this.respuesta.mensaje, 3600, "/", ".lasalle.edu.co");
          document.location.href = "http://zeus.lasalle.edu.co/oar/clus/?v=1.3";
        }
      }
    );
  }
}

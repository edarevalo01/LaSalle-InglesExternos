import { Component, OnInit } from "@angular/core";
import { Respuesta } from "src/app/model/Respuesta";
import { ServiciosService } from "src/app/services/servicios.service";
import { CookieService } from "ngx-cookie-service";
import { MessageService } from "primeng/api";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  usuario: string;
  contrasena: string;
  respuesta: Respuesta;
  hide = true;

  hide1: boolean = true;
  hide2: boolean = true;
  hide3: boolean = true;

  display: boolean = false;
  progress: boolean = false;

  newPass: FormGroup;
  respuestaCambio: Respuesta;

  constructor(private service: ServiciosService, private messageService: MessageService, private cookie: CookieService, private fb: FormBuilder) {}

  ngOnInit() {
    this.newPass = this.fb.group({
      cusuario: new FormControl("", Validators.required),
      passwAct: new FormControl("", Validators.required),
      newPass1: new FormControl("", Validators.required),
      newPass2: new FormControl("", Validators.required)
    });
  }

  login() {
    this.progress = true;
    this.service.loginUsuario(this.usuario, encodeURIComponent(this.contrasena)).subscribe(
      respuestaObs => {
        console.log(respuestaObs);
        this.respuesta = respuestaObs;
      },
      error => {
        this.progress = false;
        console.error("ERROR al intentar ingresar.");
        this.messageService.add({ severity: "error", summary: "Error al ingresar al sistema", detail: error });
      },
      () => {
        this.progress = false;
        console.log("Ingreso exitoso.");
        if (this.respuesta.status === "ok") {
          this.cookie.set("wUFAnew4", this.respuesta.mensaje, 3600, "/", ".lasalle.edu.co");
          document.location.href = "http://zeus.lasalle.edu.co/oar/clus/?v=1.3";
        }
        this.messageService.add({ severity: "warn", summary: this.respuesta.mensaje });
      }
    );
  }

  showDialog() {
    this.display = true;
  }

  change() {
    if (this.newPass.value.newPass1 !== this.newPass.value.newPass2) {
      this.messageService.add({ severity: "warn", summary: "No es posible cambiar la contraseña.", detail: "La contraseñas no coinciden" });
    } else {
      this.progress = true;
      this.display = false;
      this.service.cambioPassword(this.newPass.value.cusuario, encodeURIComponent(this.newPass.value.passwAct), encodeURIComponent(this.newPass.value.newPass1)).subscribe(
        changeObs => {
          this.respuestaCambio = changeObs;
        },
        error => {
          this.progress = false;
          console.error("ERROR al cambiar la contraseña.");
          this.messageService.add({ severity: "error", summary: "Error inesperado.", detail: error });
        },
        () => {
          this.progress = false;
          if (this.respuestaCambio.status === "ok") {
            this.messageService.add({ severity: "success", summary: "Contraseña modificada Satisfactoriamente.", detail: "" });
          } else if (this.respuestaCambio.status === "fail") {
            this.messageService.add({ severity: "warn", summary: "No es posible cambiar la contraseña.", detail: this.respuestaCambio.mensaje });
          }
        }
      );
    }
  }
}

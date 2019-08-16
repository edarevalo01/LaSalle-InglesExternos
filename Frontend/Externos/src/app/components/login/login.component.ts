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
  olvido: boolean = false;

  newPass: FormGroup;
  respuestaCambio: Respuesta;
  respuestaValidar: Respuesta;
  respuestaEnvio: Respuesta;
  confirmar: string = "Validar usuario";
  usuarioValidado: boolean = false;
  usuarioCambio: string;
  correoCambio: string = "";

  condicionesPass: string = "Mínimo 8 caractéres incluyendo mayúsculas, minúsculas, números y caracteres especiales (#, @, *, $, %, &).";

  constructor(private service: ServiciosService, private messageService: MessageService, private cookie: CookieService, private fb: FormBuilder) {}

  ngOnInit() {
    this.newPass = this.fb.group({
      cusuario: new FormControl("", Validators.required),
      passwAct: new FormControl("", Validators.required),
      newPass1: new FormControl("", [Validators.minLength(8), Validators.required]),
      newPass2: new FormControl("", [Validators.minLength(8), Validators.required])
    });
  }

  /** Método para ingresar al sistema, crea el token y permite que el usuario sea visible en el dominio .lasalle */
  login() {
    this.progress = true;
    this.service.loginUsuario(this.usuario, encodeURIComponent(this.contrasena)).subscribe(
      respuestaObs => {
        this.respuesta = respuestaObs;
      },
      error => {
        this.progress = false;
        this.messageService.add({ severity: "error", summary: "Error al ingresar al sistema", detail: "Ingrese todos los datos" });
        console.error("ERROR al intentar ingresar.");
      },
      () => {
        this.progress = false;
        if (this.respuesta.status === "ok") {
          this.cookie.set("wUFAnew4", this.respuesta.mensaje, 3600, "/", ".lasalle.edu.co");
          document.location.href = "http://zeus.lasalle.edu.co/oar/clus/?v=1.3";
        } else {
          this.messageService.add({ severity: "warn", summary: this.respuesta.mensaje });
        }
      }
    );
  }

  /** Método que llama al servicio para cambio de contraseña, enviando la nueva al correo */
  validarUser() {
    this.progress = true;
    this.olvido = false;
    if (this.usuarioValidado) {
      this.service.enviarPassword(this.usuarioCambio).subscribe(
        envioObs => {
          this.respuestaEnvio = envioObs;
        },
        error => {
          this.messageService.add({ severity: "warn", summary: "Ha ocurrido un error.", detail: "Error al enviar la nueva contraseña al usuario" });
          console.log("ERROR al enviar la nueva contraseña.", error);
        },
        () => {
          this.progress = false;
          if (this.respuestaEnvio.status === "fail") {
            this.messageService.add({ severity: "warn", summary: "Ha ocurrido un error.", detail: this.respuestaEnvio.error });
          } else {
            this.messageService.add({ severity: "success", summary: "Nueva contraseña", detail: "La nueva contraseña ha sido enviada a tu correo electrónico." });
            this.usuarioValidado = false;
            this.usuarioCambio = null;
            this.correoCambio = null;
            this.confirmar = "Validar usuario";
          }
        }
      );
    } else {
      this.service.validarUsuario(this.usuarioCambio).subscribe(
        validarObs => {
          this.respuestaValidar = validarObs;
        },
        error => {
          this.messageService.add({ severity: "warn", summary: "Ha ocurrido un error.", detail: "Error al validar el usuario" });
          this.usuarioValidado = false;
          this.olvido = false;
          console.error("ERROR al validar el usuario.", error);
        },
        () => {
          this.progress = false;
          if (this.respuestaValidar.status === "fail") {
            this.messageService.add({ severity: "warn", summary: "Ha ocurrido un error.", detail: this.respuestaValidar.error });
            this.olvido = false;
            this.usuarioValidado = false;
            this.usuarioCambio = null;
            this.confirmar = "Validar usuario";
          } else {
            this.olvido = true;
            this.usuarioValidado = true;
            this.confirmar = "Cambiar contraseña";
            this.correoCambio = this.modifyMail(this.respuestaValidar.mensaje);
          }
        }
      );
    }
  }

  /** Método que llama al servicio para cambio de contraseña cuando conozco la antigua */
  change() {
    if (this.newPass.value.newPass1 !== this.newPass.value.newPass2) {
      this.messageService.add({ severity: "warn", summary: "No es posible cambiar la contraseña.", detail: "La contraseñas no coinciden" });
      return;
    } else {
      this.progress = true;
      this.display = false;
      this.service.cambioPassword(this.newPass.value.cusuario, encodeURIComponent(this.newPass.value.passwAct), encodeURIComponent(this.newPass.value.newPass1)).subscribe(
        changeObs => {
          this.respuestaCambio = changeObs;
        },
        error => {
          this.progress = false;
          this.messageService.add({ severity: "error", summary: "Error inesperado.", detail: error });
          console.error("ERROR al cambiar la contraseña.");
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

  /**
   * Método para modificar el correo obtenido del servicio de autenticación
   * modifica el correo reemplazando los caracteres impares por *
   * @param mail
   */
  modifyMail(mail: String): string {
    var newMail: string = "";
    for (let i = 0; i < mail.length; i++) {
      if (mail.charAt(i) === "@") {
        newMail = newMail + mail.substring(i);
        break;
      }
      if (i % 2 === 0) {
        newMail = newMail + mail.charAt(i);
        continue;
      }
      newMail = newMail + "*";
    }
    return newMail;
  }

  /** Método para desplegar el pop-up para cambio de contraseña */
  showCambio() {
    this.display = true;
  }

  /** Método para enviar la confirmación de cambio de contraseña */
  showOlvido() {
    this.display = false;
    this.olvido = true;
  }

  /** Metodo para salir del cambio de contraseña */
  cancelar() {
    this.usuarioValidado = false;
    this.confirmar = "Validar usuario";
  }
}

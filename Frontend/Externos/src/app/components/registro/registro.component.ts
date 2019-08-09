import { Component, OnInit } from "@angular/core";
import { Divipola } from "src/app/model/Divipola";
import { ServiciosService } from "src/app/services/servicios.service";
import { Tipo } from "src/app/model/Tipo";
import { Eps } from "src/app/model/Eps";
import { MessageService } from "primeng/api";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Respuesta } from "src/app/model/Respuesta";

@Component({
  selector: "app-registro",
  templateUrl: "./registro.component.html",
  styleUrls: ["./registro.component.css"],
  providers: [MessageService]
})
export class RegistroComponent implements OnInit {
  tiposDocumento: Tipo[];
  departamentos: Divipola[];
  ciudadesDoc: Divipola[];
  ciudadesNac: Divipola[];
  ciudadesRes: Divipola[];
  tipoEstadoCivil: Tipo[];
  estrato: Tipo[];
  sexo: Tipo[];
  eps: Eps[];

  userform: FormGroup;
  respuesta: Respuesta;

  constructor(private service: ServiciosService, private router: Router, private fb: FormBuilder) {
    this.getDepartamentos();
    this.getEps();
    this.fillTipoDocumento();
    this.fillTipoEstadoCivil();
    this.fillEstrato();
    this.fillSexo();
  }

  ngOnInit() {
    this.userform = this.fb.group({
      primerNombre: new FormControl("", Validators.required),
      segundoNombre: new FormControl("", Validators.required),
      primerApellido: new FormControl("", Validators.required),
      segundoApellido: new FormControl("", Validators.required),
      tipoDocSelected: new FormControl("", Validators.required),
      numeroDocumento: new FormControl("", Validators.required),
      depDocSelected: new FormControl("", Validators.required),
      ciuDocSelected: new FormControl("", Validators.required),
      fechaNacimiento: new FormControl("", Validators.required),
      depNacSelected: new FormControl("", Validators.required),
      ciuNacSelected: new FormControl("", Validators.required),
      tipoEstCivilSelected: new FormControl("", Validators.required),
      direccion: new FormControl("", Validators.required),
      depResSelected: new FormControl("", Validators.required),
      ciuResSelected: new FormControl("", Validators.required),
      barrio: new FormControl("", Validators.required),
      telCasa: new FormControl("", Validators.required),
      telCelular: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      estratoSelected: new FormControl("", Validators.required),
      sexoSelected: new FormControl("", Validators.required),
      epsSelected: new FormControl("", Validators.required)
    });
  }

  registrarse() {
    let registro = this.makeJson();
    if (!registro) {
      this.userform.invalid;
      return;
    } else {
      this.service.registroUsuario(registro).subscribe(
        msj => {
          this.respuesta = msj;
          console.log(msj);
        },
        error => {
          console.error("ERROR al registrar: ", error);
        },
        () => {
          console.log(this.respuesta);
          if (this.respuesta.status === "ok") {
            //Enviar modal para que verifique el registro y redirija
            console.log("registro terminado");
            this.router.navigateByUrl("login");
          }
        }
      );
    }
  }

  getDepartamentos() {
    this.service.getDepartamentos().subscribe(
      departamentosObs => {
        this.departamentos = departamentosObs;
      },
      error => {
        console.error("ERROR al obtener departementos: ", error);
      },
      () => {
        console.log("Departamentos Cargados");
      }
    );
  }

  getCiudades(depSelected, tipoC) {
    if (!depSelected.codigo) return;
    this.service.getCiudades(depSelected.codigo).subscribe(
      ciudadesObs => {
        if (tipoC === "doc") {
          this.ciudadesDoc = ciudadesObs;
        } else if (tipoC === "nac") {
          this.ciudadesNac = ciudadesObs;
        } else if (tipoC === "res") {
          this.ciudadesRes = ciudadesObs;
        }
      },
      error => {
        console.error("ERROR al obtener ciudades: ", error);
      },
      () => {
        console.log("Ciudades cargadas.");
      }
    );
  }

  getEps() {
    this.service.getEps().subscribe(
      epsObs => {
        this.eps = epsObs;
      },
      error => {
        console.error("ERROR al obtener las eps: ", error);
      },
      () => {
        console.log("Eps obtenidas");
      }
    );
  }

  asignarDepartamento(tipoCiudad: string) {
    if (tipoCiudad === "doc") {
      this.getCiudades(this.userform.value.depDocSelected, tipoCiudad);
    } else if (tipoCiudad === "nac") {
      this.getCiudades(this.userform.value.depNacSelected, tipoCiudad);
    } else if (tipoCiudad === "res") {
      this.getCiudades(this.userform.value.depResSelected, tipoCiudad);
    }
  }

  fillTipoDocumento() {
    this.tiposDocumento = [{ codigo: "01", valor: "Cédula de Ciudadanía" }, { codigo: "02", valor: "Cédula de Extrangería" }, { codigo: "03", valor: "Tarjeta de Identidad" }, { codigo: "04", valor: "Visa" }, { codigo: "05", valor: "Pasaporte" }, { codigo: "07", valor: "Contraseña cédula" }, { codigo: "08", valor: "Carné de Identificación" }, { codigo: "09", valor: "Documento Transitorio" }];
  }

  fillTipoEstadoCivil() {
    this.tipoEstadoCivil = [{ codigo: "01", valor: "Soltero (a)" }, { codigo: "02", valor: "Casado (a)" }, { codigo: "03", valor: "Separado (a)" }, { codigo: "04", valor: "Viudo (a)" }, { codigo: "05", valor: "Unión Libre" }, { codigo: "06", valor: "Religioso (a)" }, { codigo: "07", valor: "Madre Soltera" }, { codigo: "99", valor: "No sabe / No responde" }];
  }

  fillEstrato() {
    this.estrato = [{ codigo: "01", valor: "Estrato 1" }, { codigo: "02", valor: "Estrato 2" }, { codigo: "03", valor: "Estrato 3" }, { codigo: "04", valor: "Estrato 4" }, { codigo: "05", valor: "Estrato 5" }, { codigo: "06", valor: "Estrato 6" }, { codigo: "99", valor: "No sabe / No responde" }];
  }

  fillSexo() {
    this.sexo = [{ codigo: "M", valor: "Masculino" }, { codigo: "F", valor: "Femenino" }];
  }

  makeJson(): string {
    try {
      const jsonReturn = {
        primer_nombre: this.userform.value.primerNombre,
        segundo_nombre: this.userform.value.segundoNombre,
        primer_apellido: this.userform.value.primerApellido,
        segundo_apellido: this.userform.value.segundoApellido,
        tipo_documento: encodeURI(this.userform.value.tipoDocSelected.codigo),
        numero_documento: encodeURI(this.userform.value.numeroDocumento),
        departamento_documento: this.userform.value.depDocSelected.codigo,
        ciudad_documento: this.userform.value.ciuDocSelected.codigo,
        fecha_nacimiento: this.userform.value.fechaNacimiento.getDay() + "/" + this.userform.value.fechaNacimiento.getMonth() + "/" + this.userform.value.fechaNacimiento.getFullYear(),
        departamento_nacimiento: this.userform.value.depNacSelected.codigo,
        ciudad_nacimiento: this.userform.value.ciuNacSelected.codigo,
        estado_civil: encodeURI(this.userform.value.tipoEstCivilSelected.codigo),
        direccion_residencia: encodeURIComponent(this.userform.value.direccion),
        departamento_residencia: this.userform.value.depResSelected.codigo,
        ciudad_residencia: this.userform.value.ciuResSelected.codigo,
        barrio: this.userform.value.barrio,
        telefono_casa: encodeURI(this.userform.value.telCasa),
        telefono_celular: encodeURI(this.userform.value.telCelular),
        email: this.userform.value.email,
        estrato: encodeURI(this.userform.value.estratoSelected.codigo),
        sexo: encodeURI(this.userform.value.sexoSelected.codigo),
        eps: encodeURI(this.userform.value.epsSelected.codigo),
        ciclo: "01"
      };
      return JSON.stringify(jsonReturn);
    } catch (error) {
      return null;
    }
  }
}

import { Component, OnInit } from "@angular/core";
import { Divipola } from "src/app/model/Divipola";
import { ServiciosService } from "src/app/services/servicios.service";
import { Tipo } from "src/app/model/Tipo";
import { Eps } from "src/app/model/Eps";

@Component({
  selector: "app-registro",
  templateUrl: "./registro.component.html",
  styleUrls: ["./registro.component.css"]
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

  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  tipoDocSelected: Tipo = new Tipo();
  numeroDocumento: string;
  depDocSelected: Divipola = new Divipola();
  ciuDocSelected: Divipola = new Divipola();
  fechaNacimiento: Date;
  depNacSelected: Divipola = new Divipola();
  ciuNacSelected: Divipola = new Divipola();
  tipoEstCivilSelected: Tipo = new Tipo();
  direccion: string;
  depResSelected: Divipola = new Divipola();
  ciuResSelected: Divipola = new Divipola();
  barrio: string;
  telCasa: string;
  telCelular: string;
  email: string;
  estratoSelected: Tipo = new Tipo();
  sexoSelected: Tipo = new Tipo();
  epsSelected: Eps = new Eps();

  constructor(private service: ServiciosService) {
    this.getDepartamentos();
    this.getEps();
    this.fillTipoDocumento();
    this.fillTipoEstadoCivil();
    this.fillEstrato();
    this.fillSexo();
  }

  ngOnInit() {}

  registrarse() {
    let registro = this.makeJson();
    this.service.registroUsuario(registro).subscribe(
      msj => {
        console.log(msj);
      },
      error => {
        console.error("ERROR al registrar: ", error);
      },
      () => {
        console.log("registro terminado");
      }
    );
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
      this.getCiudades(this.depDocSelected, tipoCiudad);
    } else if (tipoCiudad === "nac") {
      this.getCiudades(this.depNacSelected, tipoCiudad);
    } else if (tipoCiudad === "res") {
      this.getCiudades(this.depResSelected, tipoCiudad);
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
    const jsonReturn = {
      primer_nombre: encodeURI(this.primerNombre),
      segundo_nombre: encodeURI(this.segundoNombre),
      primer_apellido: encodeURI(this.primerApellido),
      segundo_apellido: encodeURI(this.segundoApellido),
      tipo_documento: encodeURI(this.tipoDocSelected.codigo),
      numero_documento: encodeURI(this.numeroDocumento),
      departamento_documento: encodeURI(this.depDocSelected.codigo),
      ciudad_documento: encodeURI(this.ciuDocSelected.codigo),
      fecha_nacimiento: this.fechaNacimiento.getDay() + "/" + this.fechaNacimiento.getMonth() + "/" + this.fechaNacimiento.getFullYear(),
      departamento_nacimiento: encodeURI(this.depNacSelected.codigo),
      ciudad_nacimiento: encodeURI(this.ciuNacSelected.codigo),
      estado_civil: encodeURI(this.tipoEstCivilSelected.codigo),
      direccion_residencia: encodeURIComponent(this.direccion),
      departamento_residencia: encodeURI(this.depResSelected.codigo),
      ciudad_residencia: encodeURI(this.ciuResSelected.codigo),
      barrio: encodeURI(this.barrio),
      telefono_casa: encodeURI(this.telCasa),
      telefono_celular: encodeURI(this.telCelular),
      email: encodeURI(this.email),
      estrato: encodeURI(this.estratoSelected.codigo),
      sexo: encodeURI(this.sexoSelected.codigo),
      eps: encodeURI(this.epsSelected.codigo),
      ciclo: "01"
    };
    return JSON.stringify(jsonReturn);
  }
}

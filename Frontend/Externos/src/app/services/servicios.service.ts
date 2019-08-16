import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment.prod";
import { Observable } from "rxjs";
import { Respuesta } from "../model/Respuesta";
import { Divipola } from "../model/Divipola";
import { Eps } from "../model/Eps";

@Injectable({
  providedIn: "root"
})
export class ServiciosService {
  constructor(private http: HttpClient) {}

  registroUsuario(datos: string): Observable<Respuesta> {
    const param = new HttpParams().set("datos", datos);
    return this.http.post<Respuesta>(environment.urlRegistro, param);
  }

  loginUsuario(usuario: string, contrasena: string): Observable<Respuesta> {
    const param = new HttpParams().set("usuario", usuario).set("contrasena", contrasena);
    return this.http.post<Respuesta>(environment.urlLogin, param);
  }

  getDepartamentos(): Observable<any[]> {
    const param = new HttpParams().set("idPais", "01");
    return this.http.get<any[]>(environment.urlGetDepartamentos, {
      params: param
    });
  }

  getCiudades(codigo_departamento: string): Observable<Divipola[]> {
    const param = new HttpParams().set("codigoDepartamento", codigo_departamento);
    return this.http.get<Divipola[]>(environment.urlGetCiudades, {
      params: param
    });
  }

  getEps(): Observable<Eps[]> {
    return this.http.get<Eps[]>(environment.urlGetEps);
  }

  cambioPassword(usuario: string, viejaPass: string, nuevaPass: string): Observable<Respuesta> {
    const body = new HttpParams()
      .set("usuario", usuario)
      .set("passwordVieja", viejaPass)
      .set("passwordNueva", nuevaPass);
    return this.http.post<Respuesta>(environment.urlChangePassword, body);
  }

  validarUsuario(usuario: string): Observable<Respuesta> {
    const body = new HttpParams().set("usuario", usuario);
    return this.http.post<Respuesta>(environment.urlValidarUsuario, body);
  }

  enviarPassword(usuario: string): Observable<Respuesta> {
    const body = new HttpParams().set("usuario", usuario);
    return this.http.post<Respuesta>(environment.urlEnviarPass, body);
  }
}

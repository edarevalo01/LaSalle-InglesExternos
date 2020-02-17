package co.edu.lasalle.ExternosIngles.controllers;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.TimeZone;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.xml.datatype.DatatypeFactory;

import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.net.URLCodec;
import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import co.com.edu.lasalle.habeasData.Service.HabeasData;
import co.edu.lasalle.ExternosIngles.dto.FormularioExt;
import co.edu.lasalle.ExternosIngles.dto.Mensaje;
import co.edu.lasalle.exception.LaSalleException;
import co.edu.lasalle.utils.AuthHelper;
import co.edu.lasalle.utils.CriptoHelper;
import co.edu.lasalle.utils.ExternosHelper;
import co.edu.lasalle.utils.HabeasDataHelper;
import co.edu.lasalle.utils.LaSalleProperties;
import co.edu.lasalle.utils.MailHelper;
import co.edu.lasalle.utils.MailTemplatesHelper;
import co.edu.unisalle.cti.sgaexternos.service.RolUsuarioExternoSalle;
import co.edu.unisalle.cti.sgaexternos.service.UsuarioExternoSalle;
/**
 * @author edarevalo
 * Date: 14/08/19
 */
@CrossOrigin(origins="http://estctiedarevalo.lasalle.edu.co:4200", maxAge = 1)
@RestController
public class FormularioController {

	private ExternosHelper externosHelper = ExternosHelper.getInstance(186); 
	private AuthHelper autenticacion = AuthHelper.getInstance(186);
	private LaSalleProperties properties;
	private final Logger LOG = Logger.getLogger(FormularioController.class);
	private final String IDAPLICACION = "10010";

	/**
	 * 
	 * @param usuario
	 * @param contrasena
	 * @param response
	 * @return
	 * @throws DecoderException 
	 */
	@RequestMapping(path="/loginUsuario", method = RequestMethod.POST)
	public @ResponseBody Mensaje loginUsuario (@RequestParam String usuario, @RequestParam String contrasena, HttpServletResponse response) throws DecoderException{
		try {
			String unes = new String(URLCodec.decodeUrl(contrasena.getBytes()), Charset.forName("UTF-8"));
			UsuarioExternoSalle usrLogin = autenticacion.autenticarExterno(usuario, unes, IDAPLICACION);
			if(usrLogin == null) {
				return new Mensaje("fail", "Usuario o contraseña inválidos.", "Usuario o contraseña inválidos.");
			}
			this.properties = LaSalleProperties.getInstance("application.properties");
			RestTemplate restTemplate = new RestTemplate();
			Gson gson = new GsonBuilder().create();
			UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(this.properties.getPropertie("base.url") + "PKG_IDIOMAS_EXTERNOS.get_codigo").queryParam("num_documento", usrLogin.getNumDoc());
			String responsePL = restTemplate.getForEntity(uriBuilder.build().toUri(), String.class).getBody();			
			Mensaje jsonMensaje = gson.fromJson(responsePL, Mensaje.class);

			String usrToken = "ZZZZ;ZZZZ;" + jsonMensaje.getMensaje() + ";" +usrLogin.getPriNombre() + ";" + usrLogin.getNumDoc();
			String token = CriptoHelper.crearToken(usrToken, properties.getPropertie("des.key"));

			Cookie cookie = new Cookie(this.properties.getPropertie("cookie.name"), token);
			cookie.setMaxAge(3600);
			cookie.setPath("/");
			cookie.setDomain("lasalle.edu.co");
			cookie.setHttpOnly(true);
			response.addCookie(cookie); 

			return new Mensaje("ok", token, "no-error", usrLogin);
		} catch (LaSalleException e) {
			e.printStackTrace();
			return new Mensaje("fail", "Usuario o contraseña inválidos.", e.getMessage());
		}
	}

	/**
	 * 
	 * @param datos - Json de datos de usuario
	 * @return
	 */
	@RequestMapping(path="/crearUsuario", method = RequestMethod.POST)
	public @ResponseBody Mensaje crearUsuario (@RequestParam String datos) {
		try {
			Gson gson = new GsonBuilder().create();
			FormularioExt datosForm = gson.fromJson(datos, FormularioExt.class);

			this.properties = LaSalleProperties.getInstance("application.properties");
			RestTemplate restTemplate = new RestTemplate();
			UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(this.properties.getPropertie("base.url") + "PKG_IDIOMAS_EXTERNOS.inscripcion_externos").queryParam("json_datos", datos);
			String responsePL = restTemplate.getForEntity(uriBuilder.build().toUri(), String.class).getBody();			

			Mensaje jsonMensaje = gson.fromJson(responsePL, Mensaje.class);
			String statusPL = jsonMensaje.getStatus();

			if(statusPL.equals("fail")) {
				return jsonMensaje;
			}

			String username = externosHelper.generadorNombreUsuario(
					datosForm.getPrimer_nombre().toLowerCase(), 
					datosForm.getSegundo_nombre().toLowerCase(), 
					datosForm.getPrimer_apellido().toLowerCase(), 
					datosForm.getSegundo_apellido().toLowerCase()
					);

			UsuarioExternoSalle crearExterno = fillDatos(datosForm, username); //wsdl

			if(crearExterno == null) {
				uriBuilder = UriComponentsBuilder.fromHttpUrl(this.properties.getPropertie("base.url") + "PKG_IDIOMAS_EXTERNOS.eliminar_usuario").queryParam("num_documento", datosForm.getNumero_documento());
				String responseDelPL = restTemplate.getForEntity(uriBuilder.build().toUri(), String.class).getBody();
				Mensaje jsonMensajeDel = gson.fromJson(responseDelPL, Mensaje.class);
				String statusDelPL = jsonMensajeDel.getStatus();
				if(statusDelPL.equals("fail")) {
					return jsonMensajeDel;
				}
				return new Mensaje("fail", "El usuario ya existe", "El usuario ya existe");
			}

			try {
				MailHelper.sendMail(this.properties.getPropertie("mail.asunto.inscripcion"), 
						MailTemplatesHelper.getMessageText(this.properties.getPropertie("mail.tmpl.inscripcion"), 
								crearExterno.getPriNombre(), 
								crearExterno.getSegNombre(), 
								crearExterno.getPriApellido(), 
								crearExterno.getUsuario(), 
								crearExterno.getPassword(), 
								jsonMensaje.getExtra()),
						crearExterno.getMail());
			}catch (Exception e) {
				return new Mensaje("ok", "Usuario creado. Error el enviar el correo.", e.toString(), crearExterno.getPassword());
			}

			this.registrarHabeasData(datosForm);

			LOG.info(username + " " + crearExterno.getMail() + " " + crearExterno.getPassword());
			return new Mensaje("ok", jsonMensaje.getMensaje(), jsonMensaje.getError(), crearExterno.getPassword());
		}
		catch (Exception e) {
			LOG.error("ERROR: ", e);
			return new Mensaje("fail", "Excepción", e.toString());
		}
	}

	/**
	 * 
	 * @param datos
	 */
	private void registrarHabeasData(FormularioExt datos) {
		try {
			HabeasData hd = new HabeasData();
			hd.setHdCorreoElectronico(datos.getEmail());
			hd.setHdDireccion("Carrera 5 # 59 a 44");
			hd.setHdNumDocumento(datos.getNumero_documento());
			hd.setHdPrimerApellido(datos.getPrimer_apellido());
			hd.setHdPrimerNombre(datos.getPrimer_nombre());
			hd.setHdSegundoApellido(datos.getSegundo_apellido());
			hd.setHdSegundoNombre(datos.getSegundo_nombre());
			hd.setHdTelefono(datos.getTelefono_casa());
			String td = "";
			int tipoDoc = Integer.parseInt(datos.getTipo_documento());
			switch (tipoDoc) {
			case 1: td = HabeasDataHelper.TIPO_DOCUMENTO_CC; break;
			case 2: td = HabeasDataHelper.TIPO_DOCUMENTO_CE; break;
			case 3: td = HabeasDataHelper.TIPO_DOCUMENTO_TI; break;
			case 4: td = HabeasDataHelper.TIPO_DOCUMENTO_VI; break;
			case 5: td = HabeasDataHelper.TIPO_DOCUMENTO_PAS; break;
			case 7: td = HabeasDataHelper.TIPO_DOCUMENTO_RC; break;
			default: td = HabeasDataHelper.TIPO_DOCUMENTO_CC; break;
			}
			hd.setHdTipoDoc(td);
			hd.setHdTipoUsuario(HabeasDataHelper.TIPO_USUARIO_ESTUD);
			HabeasDataHelper.getInstance().registrar(hd);
		}
		catch (Exception ex) {
			LOG.warn("No se logro registrar el habeas data: " + ex.getMessage(), ex);
		}
	}

	/**
	 * 
	 * @param datosForm
	 * @param username
	 * @return
	 * @throws Exception
	 */
	private UsuarioExternoSalle fillDatos(FormularioExt datosForm, String username) throws Exception {
		UsuarioExternoSalle datos = new UsuarioExternoSalle();
		datos.setCelContacto(datosForm.getTelefono_celular());
		datos.setDetalles("Crear usuario");
		datos.setDireccion(datosForm.getDireccion_residencia());
		datos.setFechaCreacion(DatatypeFactory.newInstance().newXMLGregorianCalendar(new GregorianCalendar(TimeZone.getTimeZone("GMT"))));
		datos.setFechaEdicion(datos.getFechaEdicion());
		datos.setIdAplicacionEdita(IDAPLICACION);
		datos.setMail(datosForm.getEmail());
		datos.setNumDoc(datosForm.getNumero_documento());
		datos.setPriApellido(datosForm.getPrimer_apellido());
		datos.setPriNombre(datosForm.getPrimer_nombre());
		RolUsuarioExternoSalle rol = new RolUsuarioExternoSalle();
		rol.setDescripcion("Estudiante Externo");
		rol.setFechaAsignacion(datos.getFechaCreacion());
		rol.setRol("Externo");
		ArrayList<RolUsuarioExternoSalle> roles = new ArrayList<RolUsuarioExternoSalle>();
		roles.add(rol);
		datos.setRoles(roles);
		datos.setSegApellido(datosForm.getSegundo_apellido());
		datos.setSegNombre(datosForm.getSegundo_nombre());
		datos.setTelContacto(datosForm.getTelefono_casa());
		datos.setTipoDoc(Integer.parseInt(datosForm.getTipo_documento())+"");
		datos.setTipoPersona("N");
		datos.setUsuario(username);
		datos.setUsuarioModificacion("true");
		return externosHelper.crearUsuarioExterno(datos, IDAPLICACION);
	}

}

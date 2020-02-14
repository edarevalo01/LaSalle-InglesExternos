package co.edu.lasalle.ExternosIngles.controllers;

import java.nio.charset.Charset;

import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.net.URLCodec;
import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import co.edu.lasalle.ExternosIngles.dto.Mensaje;
import co.edu.lasalle.exception.LaSalleException;
import co.edu.lasalle.utils.AuthHelper;
import co.edu.lasalle.utils.ExternosHelper;
import co.edu.lasalle.utils.LaSalleProperties;
import co.edu.lasalle.utils.MailHelper;
import co.edu.lasalle.utils.MailTemplatesHelper;
import co.edu.unisalle.cti.sgaexternos.service.UsuarioExternoSalle;
/**
 * @author edarevalo
 * Date: 14/08/19
 */
@CrossOrigin(origins="http://estctiedarevalo.lasalle.edu.co:4200", maxAge = 1)
@RestController
public class ExternoController {
	
	private ExternosHelper externosHelper = ExternosHelper.getInstance(186); 
	private AuthHelper autenticacion = AuthHelper.getInstance(186);
	private LaSalleProperties properties;
	private final Logger LOG = Logger.getLogger(ExternoController.class);
	private final String IDAPLICACION = "10010";
	
	/**
	 * 
	 * @param documento
	 * @param tipoDocumento
	 * @return Mensaje
	 */
	@RequestMapping(path="/obtenerDatosConDocumento")
	public @ResponseBody Mensaje obtenerDatosConDocumento (@RequestParam String documento, @RequestParam String tipoDocumento){
		try {
			UsuarioExternoSalle usrLogin = externosHelper.obtenerUsuarioExtPorDocumento(documento, tipoDocumento);
			if(usrLogin == null) {
				return new Mensaje("fail", "Documento inválido.", "Documento inválido.");
			}
			return new Mensaje("ok", "Usuario obtenido", "no-error", usrLogin);
		} catch (LaSalleException e) {
			LOG.error("ERROR: ", e);
			return new Mensaje("fail", "Excepción", e.toString());
		}
		
	}
	
	/**
	 * 
	 * @param usuario
	 * @param passwordVieja
	 * @param passwordNueva
	 * @return Mensaje
	 * @throws DecoderException 
	 */
	@RequestMapping(path="/cambiarPassword", method = RequestMethod.POST)
	public @ResponseBody Mensaje cambiarPassword (@RequestParam String usuario, @RequestParam String passwordVieja, @RequestParam String passwordNueva) throws DecoderException {
		try {
			String oldPass = new String(URLCodec.decodeUrl(passwordVieja.getBytes()), Charset.forName("UTF-8"));
			UsuarioExternoSalle usr = autenticacion.autenticarExterno(usuario, oldPass, IDAPLICACION);
			if(usr == null) {
				return new Mensaje("fail", "Usuario o contraseña inválidos", "Usuario o contraseña inválidos");
			}
			String newPass = new String(URLCodec.decodeUrl(passwordNueva.getBytes()), Charset.forName("UTF-8"));
			usr = externosHelper.cambioPasswordExterno(usuario, newPass, IDAPLICACION);
			if(usr == null) {
				return new Mensaje("fail", "No se puede cambiar la contraseña.", "No se puede cambiar la contraseña.");
			}
			return new Mensaje("ok", "Contraseña modificada exitosamente.", "Contraseña modificada exitosamente.");
		} catch (LaSalleException e) {
			LOG.error("ERROR: ", e);
			return new Mensaje("fail", "Excepción", e.toString());
		}
	}
	
	/**
	 * 
	 * @param usuario
	 * @return
	 */
	@RequestMapping(path="/validarUsuario", method = RequestMethod.POST)
	public @ResponseBody Mensaje validarUsuario(@RequestParam String usuario) {
		try {
			UsuarioExternoSalle usr = externosHelper.consultarDatosSinPass(usuario, IDAPLICACION, "true");
			if("USER_DOES_NOT_EXIST".equals(usr.getReturnCode())) {
				return new Mensaje("fail", "El usuario no existe", usuario + ", no existe.");
			}
			else if("SUCCESS".equals(usr.getReturnCode())) {
				return new Mensaje("ok", usr.getMail(), "Usuario registrado.");
			}
			else {
				return new Mensaje("fail", "ERROR inesperado", "ERROR");
			}
		} catch (LaSalleException e) {
			return new Mensaje("fail", "Excepción", e.getMessage());
		}
	}
	
	/**
	 * 
	 * @param usuario
	 * @return
	 */
	@RequestMapping(path="/asignarPassword", method = RequestMethod.POST)
	public @ResponseBody Mensaje asignarPassword(@RequestParam String usuario) {
		try {
			UsuarioExternoSalle usr = externosHelper.asignarPasswordExterno(usuario, IDAPLICACION);
			if(usr == null) {
				return new Mensaje("fail", "ERROR inesperado", null);
			}
			try {
				properties = LaSalleProperties.getInstance("application.properties");
				MailHelper.sendMail(properties.getPropertie("mail.asunto.cambiopass"), 
						MailTemplatesHelper.getMessageText(properties.getPropertie("mail.tmpl.newpass"), 
								usr.getUsuario(), 
								usr.getPassword()),
						usr.getMail());
			}catch (Exception e) {
				return new Mensaje("ok", "Cambio asignado, error al enviar correo.", e.toString(), usr.getPassword());
			}
			return new Mensaje("ok", "Contraseña enviada al correo.", "Contraseña modificada.");
		}
		catch (LaSalleException e) {
			return new Mensaje("fail", "Excepción", e.getMessage());
		}
	}

}

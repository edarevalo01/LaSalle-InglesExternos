package co.edu.lasalle.ExternosIngles.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
/**
 * @author edarevalo
 * Date: 14/08/19
 */
@CrossOrigin(origins="http://estctiedarevalo.lasalle.edu.co:4200", maxAge = 1)
@RestController
public class ExtrasController {
	
	/**
	 * @param idPais
	 * @return Json con los departamentos
	 */
	@RequestMapping(path="/getDepartamentos")
	public @ResponseBody String getDepartamentos(@RequestParam String idPais){
		RestTemplate restTemplate = new RestTemplate();
		UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl("http://pruebasia.lasalle.edu.co/pls/pruebasoar/pkg_admisiones.getDepartamentos").queryParam("id_pais", idPais);
		String responsePL = restTemplate.getForEntity(uriBuilder.build().toUri(), String.class).getBody();	
		return responsePL;
	}
	
	/**
	 * @param codigoDepartamento
	 * @return Json con las ciudades
	 */
	@RequestMapping(path="/getCiudades")
	public @ResponseBody String getCiudades(@RequestParam String codigoDepartamento) {
		RestTemplate restTemplate = new RestTemplate();
		UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl("http://pruebasia.lasalle.edu.co/pls/pruebasoar/pkg_admisiones.getMunicipios").queryParam("p_codigo_departamento", codigoDepartamento);
		String responsePL = restTemplate.getForEntity(uriBuilder.build().toUri(), String.class).getBody();	
		return responsePL;
	}
	
	/**
	 * @return Json con EPS de todo el paiss
	 */
	@RequestMapping(path="/getEps")
	public @ResponseBody String getEps() {
		RestTemplate restTemplate = new RestTemplate();
		UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl("http://pruebasia.lasalle.edu.co/pls/pruebasoar/PKG_IDIOMAS_EXTERNOS.get_eps");
		String responsePL = restTemplate.getForEntity(uriBuilder.build().toUri(), String.class).getBody();	
		return responsePL;
	}

}

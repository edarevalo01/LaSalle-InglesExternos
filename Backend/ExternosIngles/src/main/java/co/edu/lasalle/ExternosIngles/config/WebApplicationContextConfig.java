package co.edu.lasalle.ExternosIngles.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
/**
 * @author edarevalo
 * Date: 14/08/19
 */
@Configuration
@EnableWebMvc
@ComponentScan (
		basePackages="co.edu.lasalle.ExternosIngles.config, "
				+ "co.edu.lasalle.ExternosIngles.dto, "
				+ "co.edu.lasalle.ExternosIngles.controllers")
public class WebApplicationContextConfig extends WebMvcConfigurerAdapter {

}

package co.edu.lasalle.ExternosIngles.dto;
/**
 * @author edarevalo
 * Date: 14/08/19
 */
public class Mensaje {
	
	private String status;
	
	private String mensaje;
	
	private String error;
	
	private Object extra;
	
	public Mensaje(String status, String mensaje, String error, Object extra) {
		this.status = status;
		this.mensaje = mensaje;
		this.error = error;
		this.extra = extra;
	}
	
	public Mensaje(String status, String mensaje, String error) {
		this(status, mensaje, error, "");
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getMensaje() {
		return mensaje;
	}

	public void setMensaje(String mensaje) {
		this.mensaje = mensaje;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}

	public Object getExtra() {
		return extra;
	}

	public void setExtra(Object extra) {
		this.extra = extra;
	}

}

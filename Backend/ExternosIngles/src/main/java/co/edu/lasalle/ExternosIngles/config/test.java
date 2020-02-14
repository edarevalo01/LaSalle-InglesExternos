package co.edu.lasalle.ExternosIngles.config;

import co.edu.lasalle.utils.cripto.CodecFactory;

public class test {
	public static void main(String[] args) {
		System.out.println(CodecFactory.instanceCodec(CodecFactory.DES)
                .decode("1521C9291C25018B565C647AB4D5B2CA615DCDF43D5F48643A5E0C4AFEC1936A604F6A911CD961219C52E2BCC316F448EF3DD3E55897B6F8E9470E0DF02A13EC5AAF1E9E173E31B7952D3F90BF365E2C", "7da48517"));

	System.out.println();

	}
	
	public String decode() {
		return CodecFactory.instanceCodec(CodecFactory.DES)
	            .decode("6B04E381390F9D1318761EA8BCD2260F736A7551BAFD46263BA599F4347B75A2F4DE11CC57D97C527654F2D87ED0AAA266A37E4FDFDF22CAC96A3375BA99FCEFB329E4D0330232A5E0D4E589ECFBEB82", "7da48517");
	}
}

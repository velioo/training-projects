$(document).ready(function() {

	var countries = getCountries();
	var phone = "";
	
	//change_phonecode();
	phone = $('#phone').val();
		
	$('#country').on('change', function() {
		change_phonecode();
	});	
	
	$('#phone').on('keydown', function(e) {	
		var code = e.keyCode || e.which;
		phone = $('#phone').val();	
		check_country_codes();
	});
	
	function change_phonecode() {
		$.each(countries, function(index, country) {			
			var selected_country = $('#country').val();
			phone = $('#phone').val();
			if(country.nicename == selected_country) {	
				var temp_val = $('#phone').val();
				temp_val = temp_val.split(" ");
				if(phone.charAt(0) != '0') {
					if(temp_val[0].indexOf('+') !== -1) {
						if(temp_val.length > 1) {
							$('#phone').val('+' + country.phonecode + ' ' + temp_val[1]);
						}
					} else {
						$('#phone').val('+' + country.phonecode + ' ' + temp_val[0]);
					}	
					phone = $('#phone').val();		
				}		
			}
		});	
	}
	
	function check_country_codes() {
		if(phone.indexOf('+') !== -1) {
			var temp_code = phone.replace("+", "");	
			if($('[data-id="' + temp_code + '"]').length > 0) {	
				$('#country option').removeAttr("selected");
				$('[data-id="' + temp_code + '"]').attr('selected', 'selected');
				temp_code = '+' + temp_code;
				phone = phone.replace(temp_code, "");
			} 
		}
	}
});

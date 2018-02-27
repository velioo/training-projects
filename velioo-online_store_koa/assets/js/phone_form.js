$(document).ready(function() {

	infoLog += '\nphone_form.js loaded\n';

	var countries = getCountries();
	var phone = "";
	
	//change_phonecode();
	phone = $('#phone').val();
		
	$('#country').on('change', function() {
		infoLog += '\nphone_form.js/#country: Executing...\n';
		change_phonecode();
	});	
	
	$('#phone').on('keydown', function(e) {	
		var code = e.keyCode || e.which;
		phone = $('#phone').val();	
		check_country_codes();
	});
	
	function change_phonecode() {
		infoLog += '\nphone_form.js/change_phonecode(): Executing...\n';
		infoLog += 'phone_form.js/change_phonecode(): Checking if phone input could be filled by the help of the country input...\n';
		$.each(countries, function(index, country) {			
			var selected_country = $('#country').val();
			phone = $('#phone').val();
			if(country.nicename == selected_country) {	
				infoLog += 'phone_form.js/change_phonecode(): Country found: ' + selected_country + '\n';
				infoLog += 'phone_form.js/change_phonecode(): Current phone input value: ' + phone + '\n';
				var temp_val = phone;	
				temp_val = temp_val.split(" ");			
				infoLog += 'phone_form.js/change_phonecode(): Splitting phone on space. Values are: ' + temp_val.join(',,') + '\n';
				if(phone.charAt(0) != '0') {
					if(temp_val[0].indexOf('+') !== -1) {
						infoLog += 'phone_form.js/change_phonecode(): Phone starts with \'+\'\n';
						if(temp_val.length > 1) {
							infoLog += 'phone_form.js/change_phonecode(): Splitted phone has more than 1 element,' + 
							'assigning country code + the latter value of the splitted phone to phone input value\n';
							$('#phone').val('+' + country.phonecode + ' ' + temp_val[1]);
						} else {
							infoLog += 'phone_form.js/change_phonecode(): Splitted phone has 1 or less elements, no help could be done\n';
						}
					} else {
						infoLog += 'phone_form.js/change_phonecode(): Phone doesn\'t start with \'+\', assigning country code' + 
						' + the first value of the splitted phone input value\n';
						$('#phone').val('+' + country.phonecode + ' ' + temp_val[0]);
					}	
					phone = $('#phone').val();		
				} else {
					infoLog += 'phone_form.js/change_phonecode(): Phone input starts with \'0\', no help could be done\n';
				}		
			}
		});	
		logger.info(infoLog);
		infoLog = "";
	}
	
	function check_country_codes() {
		infoLog += '\nphone_form.js/check_country_codes(): Executing...\n';
		infoLog += 'phone_form.js/check_country_codes(): Checking if country input could be filled by the help of the phone inputs\' value\n';
		if(phone.indexOf('+') !== -1) {
			infoLog += 'phone_form.js/check_country_codes(): Phone input starts with \'+\'\n';
			infoLog += 'phone_form.js/check_country_codes(): Removing the \'+\' from the phone input value\n';
			var temp_code = phone.replace("+", "");	
			infoLog += 'phone_form.js/check_country_codes(): Replaced phone input value: ' + temp_code + '\n';
			infoLog += 'phone_form.js/check_country_codes(): Checking if the replaced phone input matches any of the country codes...\n';
			if($('[data-id="' + temp_code + '"]').val().length > 0) {	
				infoLog += 'phone_form.js/check_country_codes(): Country matched: ' + $('[data-id="' + temp_code + '"]').val() + '\n';
				$("#country option:selected").prop("selected", false);
				$('[data-id="' + temp_code + '"]').prop('selected', true);
			} 
		} else {
			infoLog += 'phone_form.js/check_country_codes(): Phone input doesn\'t start with \'+\', no help could be done\n';
		}
		logger.info(infoLog);
		infoLog = "";
	}
});

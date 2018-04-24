$(document).ready(function () {
  logger.info('phone_form.js loaded');

  var countries = getCountries();
  var phone = '';

  phone = $('#phone').val();

  $('#country').on('change', function () {
    logger.info('\nphone_form.js/#country: Executing...');

    changePhoneCode();
  });

  $('#phone').on('keydown', function (event) {
    var code = event.keyCode || event.which;

    phone = $('#phone').val();
    checkCountryCodes();
  });

  function changePhoneCode () {
    logger.info('\nphone_form.js/changePhoneCode(): Executing...');
    logger.info('phone_form.js/changePhoneCode(): Checking if phone input could' +
      'be filled by the help of the country input...');

    $.each(countries, function (index, country) {
      var selectedCountry = $('#country').val();

      phone = $('#phone').val();

      if (country.nicename === selectedCountry) {
        logger.info('phone_form.js/changePhoneCode(): Country found: ' + selectedCountry);
        logger.info('phone_form.js/changePhoneCode(): Current phone input value: ' + phone);

        var tempVal = phone;

        tempVal = tempVal.split(' ');
        logger.info('phone_form.js/changePhoneCode(): Splitting phone on space.' +
          ' Values are: ' + tempVal.join(',,'));

        if (phone.charAt(0) !== '0') {
          if (tempVal[0].indexOf('+') !== -1) {
            logger.info('phone_form.js/changePhoneCode(): Phone starts with \'+\'');

            if (tempVal.length > 1) {
              logger.info('phone_form.js/changePhoneCode(): Splitted phone has more than 1 element,' +
              'assigning country code + the latter value of the splitted phone to phone input value');

              $('#phone').val('+' + country.phonecode + ' ' + tempVal[1]);
            } else {
              logger.info('phone_form.js/changePhoneCode(): Splitted phone has 1 or ' +
                'less elements, no help could be done');
            }
          } else {
            logger.info('phone_form.js/changePhoneCode(): Phone doesn\'t start with \'+\', assigning country code' +
            ' + the first value of the splitted phone input value');

            $('#phone').val('+' + country.phonecode + ' ' + tempVal[0]);
          }
          phone = $('#phone').val();
        } else {
          logger.info('phone_form.js/changePhoneCode(): Phone input starts with \'0\', no help could be done');
        }
      }
    });
  }

  function checkCountryCodes () {
    logger.info('\nphone_form.js/checkCountryCodes(): Executing...');
    logger.info('phone_form.js/checkCountryCodes(): Checking if country input could' +
      'be filled by the help of the phone inputs\' value');

    if (phone.indexOf('+') !== -1) {
      logger.info('phone_form.js/checkCountryCodes(): Phone input starts with \'+\'');
      logger.info('phone_form.js/checkCountryCodes(): Removing the \'+\' from the phone input value');

      var tempCode = phone.replace('+', '');

      logger.info('phone_form.js/checkCountryCodes(): Replaced phone input value: ' + tempCode);
      logger.info('phone_form.js/checkCountryCodes(): Checking if the replaced' +
        'phone input matches any of the country codes...');
      if ($('[data-id="' + tempCode + '"]').val() && $('[data-id="' + tempCode + '"]').val().length > 0) {
        logger.info('phone_form.js/checkCountryCodes(): Country matched: ' +
          $('[data-id="' + tempCode + '"]').val());

        $('#country option:selected').prop('selected', false);
        $('[data-id="' + tempCode + '"]').prop('selected', true);
      }
    } else {
      logger.info('phone_form.js/checkCountryCodes(): Phone input doesn\'t start with \'+\', no help could be done');
    }
  }
});

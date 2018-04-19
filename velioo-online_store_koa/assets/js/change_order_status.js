$(document).ready(function () {
  infoLog += '\nchange_order_status.js loaded';

  var changeStatusUrl = getChangeStatusUrl();
  var redirectUrl = getRedirectUrl();

  $('#orders_table').on('change', '.select_status', function () {
    infoLog += '\nchange_order_status.js/#orders_table: Executing... \n';

    var statusId = parseInt($(this).val(), 10);
    var orderId = parseInt($(this).parent().parent().children('td').eq(2).text(), 10);

    if (statusId === parseInt(statusId, 10) && orderId === parseInt(orderId, 10)) {
      assert((statusId === parseInt(statusId, 10)) && (orderId === parseInt(orderId, 10)));

      infoLog += 'change_order_status.js/#orders_table: Sending request to ' +
        changeStatusUrl + ' with params: orderId = ' + orderId + ', statusId = ' +
        statusId + '\n';
      $.post(changeStatusUrl, { orderId: orderId, statusId: statusId }, function (data, status) {
        assert(data === true);

        infoLog += '\nchange_order_status.js/#orders_table: Request successfull\n';

        notification(orderId);

        logger.info(infoLog);
        infoLog = '';
      })
        .fail(failHandler);
    } else {
      infoLog += 'change_order_status.js/#orders_table: statusId or/and orderId must be integers: statusId = ' +
        statusId + ', orderId = ' + orderId + '\n';
      logger.info(infoLog);
      infoLog = '';
    }
  });

  function notification (orderId) {
    $('#notification').fadeIn('slow').find('#container').prepend('Поръчка #' + orderId +
      ' е успешно променена.<br>');
    $('.dismiss').click(() => {
      $('#notification').fadeOut('slow', () => $('#container').empty());
    });
  }

  function failHandler (xhr, status, errorThrown) {
    if (status === `timeout`) {
      infoLog += `Request timed out\n`;

      window.alert(`Request timed out`);
    } else {
      if (xhr.readyState === 0) {
        infoLog += `Internet connection is off or server is
          not responding\n`;

        window.alert(`Internet connection is off or server is not responding`);
      } else if (xhr.readyState === 1) {
      } else if (xhr.readyState === 2) {
      } else if (xhr.readyState === 3) {
      } else {
        if (xhr.status === 200) {
          infoLog += `Error parsing JSON data\n`;
        } else if (xhr.status === 404) {
          infoLog += `The resource at the requested location
            could not be found\n`;
        } else if (xhr.status === 403) {
          if (xhr.responseText === 'login') {
            return window.location.href = redirectUrl;
          }
          infoLog += `You don\`t have permission to access this data\n`;
        } else if (xhr.status === 500) {
          infoLog += `Internal sever error\n`;
        }
      }
      window.alert(`There was a problem while processing your request. Please try again later.`);
    }

    infoLog += `Response Text: ` +
      xhr.responseText + `\n Ready State: ` +
      xhr.readyState + `\n Status Code: ` + xhr.status;
    logger.info(infoLog);
    infoLog = ``;

    $(`.spinner.cart`).hide();
  }
});

$(document).ready(function () {
  logger.info('change_order_status.js loaded');

  var changeStatusUrl = getChangeStatusUrl();
  var redirectUrl = getRedirectUrl();

  $('#orders_table').on('change', '.select_status', function () {
    logger.info('change_order_status.js/#orders_table: Executing...');

    var statusId = parseInt($(this).val());
    var orderId = parseInt($(this).parent().parent().children('td').eq(2).text(), 10);

    if (statusId === parseInt(statusId, 10) && orderId === parseInt(orderId, 10)) {
      assert((statusId === parseInt(statusId, 10)) && (orderId === parseInt(orderId)));

      logger.info('change_order_status.js/#orders_table: Sending request to ' +
        changeStatusUrl + ' with params: orderId = ' + orderId + ', statusId = ' +
        statusId);
      $.post(changeStatusUrl, { orderId: orderId, statusId: statusId }, function (data, status) {
        assert(data === true);

        logger.info('change_order_status.js/#orders_table: Request successfull');

        notification(orderId);
      })
        .fail(failHandler);
    } else {
      logger.info('change_order_status.js/#orders_table: statusId or/and orderId must be integers: statusId = ' +
        statusId + ', orderId = ' + orderId);
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
      logger.info(`Request timed out`);

      window.alert(`Request timed out`);
    } else {
      if (xhr.readyState === 0) {
        logger.info(`Internet connection is off or server is
          not responding`);

        window.alert(`Internet connection is off or server is not responding`);
      } else if (xhr.readyState === 1) {
      } else if (xhr.readyState === 2) {
      } else if (xhr.readyState === 3) {
      } else {
        if (xhr.status === 200) {
          logger.info(`Error parsing JSON data`);
        } else if (xhr.status === 404) {
          logger.info(`The resource at the requested location
            could not be found`);
        } else if (xhr.status === 403) {
          if (xhr.responseText === 'login') {
            return window.location.href = redirectUrl;
          }
          logger.info(`You don\`t have permission to access this data`);
        } else if (xhr.status === 500) {
          logger.info(`Internal sever error`);
        }
      }
      window.alert(`There was a problem while processing your request. Please try again later.`);
    }

    logger.info(`Response Text: ` +
      xhr.responseText + `\n Ready State: ` +
      xhr.readyState + `\n Status Code: ` + xhr.status);

    $(`.spinner.cart`).hide();
  }
});

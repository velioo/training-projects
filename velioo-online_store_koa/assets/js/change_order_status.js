$(document).ready(function () {
  //infoLog += '\nchange_order_status.js loaded';

  var changeStatusUrl = getChangeStatusUrl();

  $('#orders_table').on('change', '.select_status', function () {
    // infoLog += '\nchange_order_status.js/#orders_table: Executing... \n';
    var statusId = parseInt($(this).val(), 10);
    var orderId = parseInt($(this).parent().parent().children('td').eq(2).text(), 10);
    if (statusId === parseInt(statusId, 10) && orderId === parseInt(orderId, 10)) {
      assert((statusId === parseInt(statusId, 10)) && (orderId === parseInt(orderId, 10)));

      // infoLog += 'change_order_status.js/#orders_table: Sending request to ' + changeStatusUrl + ' with params: orderId = ' + orderId + ', statusId = ' + statusId + '\n';
      $.post(changeStatusUrl, {orderId: orderId, statusId: statusId}, function (data, status) {
        if (data) {
          // infoLog += '\nchange_order_status.js/#orders_table: Request successfull\n';
          // notification(orderId);
        } else {
          // infoLog += '\nchange_order_status.js/#orders_table: Request failed\n';
          window.alert('Възникна проблем при обработката на заявката ви.');
        }
        // logger.info(//infoLog);
        // infoLog = "";
      })
        .fail(function (xmlObject, status, errorThrown) {
          if (status === 'timeout') {
            // infoLog += 'change_order_status.js/#orders_table: Request timed out\n';
            window.alert('Request timed out');
          } else {
            if (xhr.readyState === 0) {
              // infoLog += 'change_order_status.js/#orders_table: Internet connection is off or server is not responding\n';
              window.alert('Internet connection is off or server is not responding');
            } else if (xhr.readyState === 1) {
            } else if (xhr.readyState === 2) {
            } else if (xhr.readyState === 3) {
            } else {
              if (xhr.status === 200) {
                // infoLog += 'change_order_status.js/#orders_table: Error parsing JSON data\n';
              } else if (xhr.status === 404) {
                // infoLog += 'change_order_status.js/#orders_table: The resource at the requested location could not be found\n';
              } else if (xhr.status === 403) {
                // infoLog += 'change_order_status.js/#orders_table: You don\'t have permission to access this data\n';
              } else if (xhr.status === 500) {
                // infoLog += 'change_order_status.js/#orders_table: Internal sever error\n';
              }
            }
            window.alert('Failed to get data from server. Please try again later');
          }

          // infoLog += 'change_order_status.js/#orders_table:\n Response Text:' + xhr.responseText +
                           //'\n Ready State:' + xhr.readyState +
                           //'\n Status Code: ' + xhr.status;
          // logger.info(//infoLog);
          // infoLog = "";
          $('.spinner.menu').hide();
        });
    } else {
      // infoLog += "change_order_status.js/#orders_table: statusId or/and orderId must be integers: statusId = " + statusId + ', orderId = ' + orderId + '\n';
      // logger.info(//infoLog);
      // infoLog = "";
    }
  });

  //~ function notification(orderId) {
    //~ $('#message').prepend("<p>Поръчка# " + orderId + " е успешно променена.</p>");
    //~ setTimeout(function(){
    //~ $('#message p:last').fadeOut('slow',function(){
      //~ $(this).remove();
    //~ });
    //~ }, 2000);
  //~ }
});

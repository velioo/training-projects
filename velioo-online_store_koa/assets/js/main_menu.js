$(document).ready(function () {
  logger.info('main_menu.js loaded');

  var menuItemUrl = getMenuItemsUrl();
  var activeTab = getActiveTab();
  var searchUrl = getCategorySearchUrl();

  logger.info('main_menu.js: Executing get request. Sending request to ' + menuItemUrl);

  $('.spinner.menu').show();

  $.ajax({
    type: 'GET',
    async: true,
    url: menuItemUrl,
    dataType: 'json',
    success: function (data, status) {
      logger.info('main_menu.js: Request returned data');
      logger.info('main_menu.js: Checking if returned data is valid JSON...');

      if (ajv.validate(menuItemsSchema, data)) {
        logger.info('main_menu.js: Data is valid JSON');

        $.each(data, function (index, e) {
          if (e.c_type === 1) {
            $('#main_menu').prepend('<li class="main_tab" data-id="' +
              e.id + '"><a href="' + searchUrl + e.id + '">' + e.name + '</a></li>');
          } else if (e.c_type === 2) {
            $('#components_dropdown').prepend('<li class="component" data-id="' +
              e.id + '"><a href="' + searchUrl + e.id + '">' + e.name + '</a></li>');
          } else if (e.c_type === 3) {
            $('#peripheral_dropdown').prepend('<li class="peripheral" data-id="' +
              e.id + '"><a href="' + searchUrl + e.id + '">' + e.name + '</a></li>');
          }
        });

        $('.main_tab').each(function () {
          if ($(this).data('id') === activeTab) {
            $(this).addClass('active');
          }
        });

        $('.component').each(function () {
          if ($(this).data('id') === activeTab) {
            $(this).addClass('active');
            $('#components_dropdown_tab').addClass('active');
          }
        });

        $('.peripheral').each(function () {
          if ($(this).data('id') === activeTab) {
            $(this).addClass('active');
            $('#peripheral_dropdown_tab').addClass('active');
          }
        });
      } else {
        logger.info('main_menu.js: Request didn\'t return a valid JSON object');
        logger.info(JSON.stringify(ajv.errors, null, 2));

        window.alert('Failed to get data from server. Please try again later');
      }

      if ($('#category_name').length > 0) {
        let categoryId = $('#category_name').data('id');
        $('#category_name').text($('#main_menu').find('li[data-id="' + categoryId + '"] a:first-child').text());
      }
      $('.spinner.menu').hide();
    },
    error: function (xhr, status, errorThrown) {
      if (status === 'timeout') {
        logger.info('main_menu.js: Request timed out');

        window.alert('Request timed out');
      } else {
          if (xhr.readyState === 0) {
              logger.info('main_menu.js: Internet connection is off or server is not responding');

              window.alert('Internet connection is off or server is not responding');
          } else if (xhr.readyState === 1) {
          } else if (xhr.readyState === 2) {
          } else if (xhr.readyState === 3) {
          } else {
              if (xhr.status === 200) {
                  logger.info('main_menu.js: Error parsing JSON data');
              } else if (xhr.status === 404) {
                  logger.info('main_menu.js: The resource at the requested location could not be found');
              } else if (xhr.status === 403) {
                  logger.info('main_menu.js: You don\'t have permission to access this data');
              } else if (xhr.status === 500) {
                  logger.info('main_menu.js: Internal sever error');
              }
          }
          window.alert('Failed to get data from server. Please try again later');
      }

      logger.info('main_menu.js:\n Response Text:' + xhr.responseText +
        '\n Ready State:' + xhr.readyState +
        '\n Status Code: ' + xhr.status);
      $('.spinner.menu').hide();
    },
    timeout: 10000
  });
});

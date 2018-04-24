$(document).ready(function () {
  logger.info('get_products.js loaded');

  var productsUrl = getProductsUrl();
  var redirectUrl = getRedirectUrl();
  var clearFiltersFlag = false;

  $(function () {
    $('.data_picker').datepicker({
      dateFormat : 'yy-mm-dd',
      changeMonth : true,
      changeYear : true
    });
  });

  logger.info('get_products.js: Initialize tablesorter');

  $('#products_table').tablesorter({
    theme: 'blue',
    widthFixed: true,
    sortLocaleCompare: true,
    sortList: [ [0, 1] ],
    widgets: ['zebra', 'filter', 'uitheme']
  })
    .tablesorterPager({
      container: $('.pager'),
      ajaxUrl: productsUrl + '?page={page}&size={size}&{sortList:col}&{filterList:fcol}',
      customAjaxUrl: function (table, url) {
        $('.spinner.dashboard').show();

        return url += '&date_c_from=' + $('#date_c_from').val() +
              '&date_c_to=' + $('#date_c_to').val() +
              '&date_m_from=' + $('#date_m_from').val() +
              '&date_m_to=' + $('#date_m_to').val() +
              '&price_from=' + $('#price_from').val() +
              '&price_to=' + $('#price_to').val();
      },
      ajaxError: failHandler,
      ajaxObject: {
        dataType: 'json'
      },
      ajaxProcessing: function (data) {
        var total, rows, headers;
        total = data.total_rows;
        // headers = data.headers;
        rows = data.rows;
        $('.spinner.dashboard').hide();
        return [ total, rows ];
      },
      processAjaxOnInit: true,
      output: '{startRow} to {endRow} ({totalRows})',
      updateArrows: true,
      page: 0,
      size: 30,
      savePages: true,
      pageReset: 0,
      cssNext: '.next',
      cssPrev: '.prev',
      cssFirst: '.first',
      cssLast: '.last',
      cssGoto: '.gotoPage',
      cssPageDisplay: '.pagedisplay',
      cssPageSize: '.pagesize',
      cssDisabled: 'disabled',
      cssErrorRow: 'tablesorter-errorRow'
    });

  $('.filter').on('change', function () {
    logger.info('get_products.js/.filter: Executing...');
    logger.info('get_products.js/.filter: Trigerring tablesorter pagerUpdate');

    $('#products_table').trigger('pagerUpdate');

    if ($('#clear_filters').length <= 0) {
      logger.info('get_products.js/.filter: #clear_filters doesn\'t exist. Prepending...');

      $('#clean_filters').prepend('<a href="#" style="color:red;" id="clear_filters">Изчисти филтрите</a>');
    } else {
      logger.info('get_products.js/.filter: #clear_filters exist');

      clearFiltersFlag = 0;

      logger.info('get_products.js/.filter: Checking if all filters are empty');

      $('.filters').each(function () {
        if ($(this).val() === '') {
          clearFiltersFlag = 1;
        }
      });

      if (clearFiltersFlag) {
        logger.info('get_products.js/.filter: All filters are empty. Removing #clear_filters');

        $('#clear_filters').remove();
      } else {
        logger.info('get_products.js/.filter: There are active filters');
      }
    }
  });

  $('#clean_filters').on('click', '#clear_filters', function () {
    logger.info('get_products.js/#clean_filters: Executing...');

    $('.filter').val('');
    $('#clear_filters').remove();

    logger.info('get_orders.js/#clean_filters: Trigerring tablesorter pagerUpdate');

    $('#products_table').trigger('pagerUpdate');
  });

  function failHandler (config, xhr, settings, exception) {
    if (xhr === undefined) return false;

    if (xhr.readyState === 0) {
      logger.info(`Internet connection is off or server is not responding`);

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

    logger.info(`Response Text: ` +
      xhr.responseText + `\n Ready State: ` +
      xhr.readyState + `\n Status Code: ` + xhr.status);
  }
});

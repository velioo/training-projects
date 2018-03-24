$(document).ready(function() {

    //infoLog += '\nget_orders.js loaded\n';

    var ordersUrl = getOrdersUrl();

    $(function() {
        $( ".data_picker" ).datepicker({
            dateFormat : 'yy-mm-dd',
            changeMonth : true,
            changeYear : true
        });
    });

    //infoLog += 'get_orders.js: Initialize tablesorter\n';
    $("#orders_table").tablesorter({
        theme: 'blue',
        widthFixed: true,
        sortLocaleCompare: true,
        sortList: [ [0,1] ],
        widgets: ['zebra', 'filter', 'uitheme']
    })
    .tablesorterPager({
        container: $(".pager"),
        ajaxUrl: ordersUrl + '?page={page}&size={size}&{sortList:col}&{filterList:fcol}',
        customAjaxUrl: function(table, url) {
            $('.spinner.client_orders').show();
            return url += '&date_c_from=' + $('#date_c_from').val() +
                          '&date_c_to=' + $('#date_c_to').val() +
                          '&date_m_from=' + $('#date_m_from').val() +
                          '&date_m_to=' + $('#date_m_to').val() +
                          '&price_from=' + $('#price_from').val() +
                          '&price_to=' + $('#price_to').val();
        },
        ajaxError: null,
        ajaxObject: {
            dataType: 'json'
        },
        ajaxProcessing: function(data){
            console.log(data);
            var total, rows, headers;
            $('#profits_tbody').find('*').not('#profits').remove();
            $.each(data.sums, function(index, value) {
                $('<tr class="sums">\
                      <td></td>\
                      <td></td>\
                      <td class="left_aligned_td">' + index + '</td>\
                      <td class="right_aligned_td">' + value + '</td>\
                      <td></td>\
                      <td></td>\
                  </tr>').insertAfter($('#profits'));
            });   

            
            total = data.total_rows;
            //headers = data.headers;
            rows = data.rows;
            $('.spinner.client_orders').hide();
            return [ total, rows];
        },
        processAjaxOnInit: true,
        output: '{startRow} to {endRow} ({totalRows})',
        updateArrows: true,
        page: 0,
        size: 30,
        savePages: true,
        pageReset: 0,
        cssNext        : '.next',
        cssPrev        : '.prev',
        cssFirst       : '.first',
        cssLast        : '.last',
        cssGoto        : '.gotoPage',
        cssPageDisplay : '.pagedisplay',
        cssPageSize    : '.pagesize',
        cssDisabled    : 'disabled',
        cssErrorRow    : 'tablesorter-errorRow'
    });
    
    //logger.info(//infoLog);
    //infoLog = "";
    
    $('.filter').on('change', function() {
        //infoLog += '\nget_orders.js/.filter: Executing...\n';
        //infoLog += 'get_orders.js/.filter: Trigerring tablesorter pagerUpdate\n';
        $("#orders_table").trigger('pagerUpdate');
        if ($('#clear_filters').length <= 0) {
            //infoLog += 'get_orders.js/.filter: #clear_filters doesn\'t exist. Prepending...\n';
            $('#clean_filters').prepend('<a href="#" style="color:red;" id="clear_filters">Изчисти филтрите</a>');
        } else {
            //infoLog += 'get_orders.js/.filter: #clear_filters exist\n';
            flag = 0;
            //infoLog += 'get_orders.js/.filter: Checking if all filters are empty\n';
            $('.filter').each(function() {
                if($(this).val() == "") {
                    flag = 1;
                } else {
                    flag = 0;
                    return false;
                }
            });
            if(flag) {
                //infoLog += 'get_orders.js/.filter: All filters are empty. Removing #clear_filters\n';
                $('#clear_filters').remove();
            } else {
                //infoLog += 'get_orders.js/.filter: There are active filters\n';
            }
        }       
        //logger.info(//infoLog);
        //infoLog = "";     
    });
    
    $('#clean_filters').on('click', '#clear_filters', function() {
        //infoLog += '\nget_orders.js/#clean_filters: Executing...\n';
        $('.filter').val('');
        $('#clear_filters').remove();
        //infoLog += 'get_orders.js/#clean_filters: Trigerring tablesorter pagerUpdate\n';
        $("#orders_table").trigger('pagerUpdate');
        //logger.info(//infoLog);
        //infoLog = "";
    });
    
});

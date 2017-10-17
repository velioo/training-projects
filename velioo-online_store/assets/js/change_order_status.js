$(document).ready(function() {
	
	var changeStatusUrl = getChangeStatusUrl();
	var emailsUrl = getEmailsUrl();
	
	$('#orders_table').on('change', '.select_status', function() {
		var statusId = $(this).val();
		var orderId = $(this).parent().parent().children('td').eq(1).text();
		$.post(changeStatusUrl, {orderId: orderId, statusId: statusId}, function(data, status) {
			if(data) {
				//notification(orderId);
			} else {
				window.alert("Възникна проблем при обработката на заявката ви.");
			}
		});
		
	});	
	
	function notification(orderId) {
	  $('#message').prepend("<p>Поръчка# " + orderId + " е успешно променена.</p>");
	  setTimeout(function(){
		$('#message p:last').fadeOut('slow',function(){
			$(this).remove();
		});
	  }, 2000);
	}
	
	$(function() {
		$( ".data_picker" ).datepicker({
			dateFormat : 'yy-mm-dd',
			changeMonth : true,
			changeYear : true
		});
	});
	
	var options = {
		url: function(phrase) {
			return emailsUrl + "/" + phrase;
		},
		dataType: "json",
		getValue: "email"
	};

	$("#email_search_input").easyAutocomplete(options);
	
	var ordersUrl = getOrdersUrl();
	
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
				return url += '&date_from=' + $('#date_from').val() + '&date_to=' + $('#date_to').val();
			},
            ajaxError: null,
            ajaxObject: {
                dataType: 'json'
            },
            ajaxProcessing: function(data){
                console.log(data);
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
                var total, rows, headers;
                total   = data.total_rows;
                //headers = data.headers;
                rows    = data.rows;
                return [ total, rows];
            },
            processAjaxOnInit: true,
            output: '{startRow} to {endRow} ({totalRows})',
            updateArrows: true,
            page: 0,
            size: 10,
            savePages: true,
            pageReset: 0,
            // css class names of pager arrows
            cssNext        : '.next',  // next page arrow
            cssPrev        : '.prev',  // previous page arrow
            cssFirst       : '.first', // go to first page arrow
            cssLast        : '.last',  // go to last page arrow
            cssGoto        : '.gotoPage', // page select dropdown - select dropdown that set the "page" option

            cssPageDisplay : '.pagedisplay', // location of where the "output" is displayed
            cssPageSize    : '.pagesize', // page size selector - select dropdown that sets the "size" option

            // class added to arrows when at the extremes; see the "updateArrows" option
            // (i.e. prev/first arrows are "disabled" when on the first page)
            cssDisabled    : 'disabled', // Note there is no period "." in front of this class name
            cssErrorRow    : 'tablesorter-errorRow' // error information row
        });
	
	$('.filter').on('change', function() {
		$("#orders_table").trigger('pagerUpdate');
		if ($('#clear_filters').length <= 0)
			$('#clean_filters').prepend('<a href="#" style="color:red;" id="clear_filters">Изчисти филтрите</a></br></br>');
		else 
			if($('.filter').val() == '')
				$('#clear_filters').remove();
			
	});
	
	$('#clean_filters').on('click', '#clear_filters', function() {
		$('.filter').val('');
		$('#clear_filters').remove();
		$("#orders_table").trigger('pagerUpdate');
	});
	
});

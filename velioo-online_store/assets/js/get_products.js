$(document).ready(function() {
	
	var productsUrl = getProductsUrl();
	
	$(function() {
		$( ".data_picker" ).datepicker({
			dateFormat : 'yy-mm-dd',
			changeMonth : true,
			changeYear : true
		});
	});
	
	$("#products_table").tablesorter({
			theme: 'blue',
			widthFixed: true,
			sortLocaleCompare: true,
			sortList: [ [0,1] ],
			widgets: ['zebra', 'filter', 'uitheme']
		})
		.tablesorterPager({
			container: $(".pager"),
			ajaxUrl: productsUrl + '?page={page}&size={size}&{sortList:col}&{filterList:fcol}',
			customAjaxUrl: function(table, url) {
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
				//console.log(data);
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
	
	$('.filter').on('change', function() {
		$("#products_table").trigger('pagerUpdate');
		if ($('#clear_filters').length <= 0)
			$('#clean_filters').prepend('<a href="#" style="color:red;" id="clear_filters">Изчисти филтрите</a>');
		else {
			flag = 0;
			$('.filters').each(function() {
				if($(this).val() == "") {
					flag = 1;
				}
			});
			if(flag) 
				$('#clear_filters').remove();
		}			
	});
	
	$('#clean_filters').on('click', '#clear_filters', function() {
		$('.filter').val('');
		$('#clear_filters').remove();
		$("#products_table").trigger('pagerUpdate');
	});
});

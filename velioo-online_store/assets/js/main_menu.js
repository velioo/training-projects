$(document).ready(function() {
	
	var menuItemsUrl = getMenuItemsUrl();
	var activeTab = getActiveTab();
	var searchUrl = getCategorySearchUrl();
	
	$.get(menuItemsUrl, function(data, status) {
		$.each(data, function(index, e) {
			if(e.type == 1) {
				$('#main_menu').prepend('<li class="main_tab" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
			} else if(e.type == 2) {
				$('#components_dropdown').prepend('<li class="component" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
			} else {
				$('#peripheral_dropdown').prepend('<li class="peripheral" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
			}
		});
		$('.main_tab').each(function() {
			if($(this).data('id') == activeTab) {
				$(this).addClass('active');
			}
		});
		
		$('.component').each(function() {
			if($(this).data('id') == activeTab) {
				$(this).addClass('active');
				$('#components_dropdown_tab').addClass('active');
			}
		});
		
		$('.peripheral').each(function() {
			if($(this).data('id') == activeTab) {
				$(this).addClass('active');
				$('#peripheral_dropdown_tab').addClass('active');
			}
		});
		
		//$('#main_menu').show();
		
	});
	
	
});

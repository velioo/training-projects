$(document).ready(function() {	
	
	infoLog += '\nmain_menu.js loaded\n';
	
	var menuItemUrl = getMenuItemsUrl();
	var activeTab = getActiveTab();
	var searchUrl = getCategorySearchUrl();
	
	infoLog += '\nmain_menu.js: Executing get request. Sending request to ' + menuItemUrl + '\n';
	$.get(menuItemUrl, function(data, status) {
		if(data) {
			infoLog += 'main_menu.js: Request returned data';
			$.each(data, function(index, e) {
				if(e.type == 1) {
					$('#main_menu').prepend('<li class="main_tab" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
				} else if(e.type == 2) {
					$('#components_dropdown').prepend('<li class="component" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
				} else if(e.type == 3){
					$('#peripheral_dropdown').prepend('<li class="peripheral" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
				} else {
					assert(false, 'Assert Error: Category type must <=3 and >=1');
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
			logger.info(infoLog);
			infoLog = "";
		} else {
			infoLog += 'main_menu.js: Request didn\'t return anything';
			logger.info(infoLog);
			infoLog = "";
		}
		//$('#main_menu').show();
			
	});
});

$(document).ready(function() {	
	
	infoLog += '\nmain_menu.js loaded\n';
	
	var menuItemUrl = getMenuItemsUrl();
	var activeTab = getActiveTab();
	var searchUrl = getCategorySearchUrl();
	
	infoLog += '\nmain_menu.js: Executing get request. Sending request to ' + menuItemUrl + '\n';
	$('.spinner.menu').show();
	
	$.ajax({
		type: "GET",
		async: true,
		url: menuItemUrl,
		dataType: "json",
		success: function(data, status) {	
			infoLog += 'main_menu.js: Request returned data\n';
			infoLog += 'main_menu.js: Checking if returned data is valid JSON...\n';
			if(typeof data == 'object' && ajv.validate(menuItemsSchema, data)) {
				infoLog += 'main_menu.js: Data is valid JSON\n';
				$.each(data, function(index, e) {
					if(e.c_type == 1) {
						$('#main_menu').prepend('<li class="main_tab" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
					} else if(e.c_type == 2) {
						$('#components_dropdown').prepend('<li class="component" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
					} else if(e.c_type == 3){
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
				logger.info(infoLog);
				infoLog = "";
				$('.spinner.menu').hide();
			} else {
				infoLog += 'main_menu.js: Request didn\'t return a valid JSON object\n';
				infoLog += JSON.stringify(ajv.errors, null, 2);
			}
			logger.info(infoLog);
			infoLog = "";
		},
		error: function(xmlObject, status, errorThrown) {
			if(status == 'parsererror') {
				infoLog += 'main_menu.js: Error parsing JSON data\n';
				window.alert("Failed to get data from server. Please try again later");
			} else if(status == 'timeout') {
				infoLog += 'main_menu.js: Request timed out\n';
				window.alert("Request timed out");
			} else if(status == 'error') {
				infoLog += 'main_menu.js: An error occurred\n';
				window.alert("Failed to get data from server. Please try again later");
			} else if(status == 'abort') {
				infoLog += 'main_menu.js: Internet connection lost\n';
				window.alert("Check your internet connection and try again.");
			} else {
				infoLog += 'main_menu.js: Unknown error occurred\n';
				window.alert("Failed to get data from server. Please try again later");
			}
			infoLog += 'main_menu.js:\n Response Text:' + xmlObject.responseText + 
											 '\n Ready State:' + xmlObject.readyState + 
											 '\n Status Code: ' + xmlObject.status;
			logger.info(infoLog);
			infoLog = "";
			$('.spinner.menu').hide();
		}, 
		timeout: 5000
	});
	
	//~ $.get(menuItemUrl, function(data, status) {
		//~ if(data) {
			//~ infoLog += 'main_menu.js: Request returned data';
			//~ $.each(data, function(index, e) {
				//~ if(e.c_type == 1) {
					//~ $('#main_menu').prepend('<li class="main_tab" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
				//~ } else if(e.c_type == 2) {
					//~ $('#components_dropdown').prepend('<li class="component" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
				//~ } else if(e.c_type == 3){
					//~ $('#peripheral_dropdown').prepend('<li class="peripheral" data-id="' +  e.id +'"><a href="' + searchUrl + '/' + e.id +'">' + e.name + '</a></li>');
				//~ } else {
					//~ assert(false, 'Assert Error: Category type must <=3 and >=1');
				//~ }
			//~ });
			//~ $('.main_tab').each(function() {
				//~ if($(this).data('id') == activeTab) {
					//~ $(this).addClass('active');
				//~ }
			//~ });
			
			//~ $('.component').each(function() {
				//~ if($(this).data('id') == activeTab) {
					//~ $(this).addClass('active');
					//~ $('#components_dropdown_tab').addClass('active');
				//~ }
			//~ });
			
			//~ $('.peripheral').each(function() {
				//~ if($(this).data('id') == activeTab) {
					//~ $(this).addClass('active');
					//~ $('#peripheral_dropdown_tab').addClass('active');
				//~ }
			//~ });
			//~ logger.info(infoLog);
			//~ infoLog = "";
			//~ $('.spinner.menu').hide();
		//~ } else {
			//~ infoLog += 'main_menu.js: Request didn\'t return anything';
			//~ logger.info(infoLog);
			//~ infoLog = "";
		//~ }
		//~ //$('#main_menu').show();
			
	//~ });
});

$(document).ready(function() {
	
	infoLog += '\nget_tags.js loaded\n';
	
	var tagsUrl = getTagsUrl();
	var checkTagUrl = getCheckTagUrl();	

	var options = {
		url: function(phrase) {
			return tagsUrl + "/" + phrase;
		},
		dataType: "json",
		getValue: "name",
		
		list: {
			onClickEvent: function(data) {
				addTag();				
			}	
		}
	};

	$("#tag_input").easyAutocomplete(options);

	$('#tag_input').on('keydown', function(e) {
		infoLog += '\nget_tags.js/#tag_input: Executing...\n';
		if(e.keyCode == 13) {
			infoLog += 'get_tags.js/#tag_input: Enter pressed\n';
			e.preventDefault();
			var input = $('#tag_input').val();	
			infoLog += 'get_tags.js/#tag_input: Input = ' + input + '\n';	
			if(input != '') {
				infoLog += 'get_tags/#tag_input: Sending request to ' + checkTagUrl + ' with params: tagName = ' + input + '\n';				
				$.post(checkTagUrl , {tagName: input}, function(data) {
					if(data) {						
						infoLog += 'get_tags/#tag_input: Request successfull. Tag exists\n';
						addTag();
					} else {
						infoLog += 'get_tags/#tag_input: Tag doesn\'t exist\n';
						$('#tag_error').show();					
						setTimeout(function(){
						$('#tag_error').fadeOut('slow',function(){});
					    }, 3000);
					}	
					logger.info(infoLog);
					infoLog = "";		
				});
				
			}
		}
	});
	
	
	function addTag() {
		infoLog += '\nget_tags.js/addTag(): Executing...\n';
		var flag = 0;
		infoLog += 'get_tags.js/addTag(): Checking if tag already exists on product\n';
		$('.tag').each(function() {
			if($(this).val() == $('#tag_input').val()) {
				infoLog += 'get_tags.js/addTag(): Tag already exists on product\n';
				$('#tag_exists').show();					
				setTimeout(function(){
				$('#tag_exists').fadeOut('slow',function(){
					
				});
			  }, 3000);
			  flag = 1;
			}
		});
		
		if(!flag) {
			infoLog += 'get_tags.js/addTag(): Tag doesn\'t exist on product. Adding it...\n';
			$('#tags_div').prepend('<div class="tag_div"><input type="text" value="' + $('#tag_input').val() + '" class="tag" name="tags[]" readonly> <span class="glyphicon glyphicon-remove remove_tag"></span></div>');		
			$('#tag_input').val('');
		}
		
		logger.info(infoLog);
		infoLog = "";	
	}	

	
});

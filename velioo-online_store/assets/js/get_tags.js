$(document).ready(function() {
	
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
		if(e.keyCode == 13) {
			e.preventDefault();
			var input = $('#tag_input').val();	
			
			if(input != '') {
				$.post(checkTagUrl , {tagName: input}, function(data){
					if(data) {						
						addTag();
					} else {
						$('#tag_error').show();					
						setTimeout(function(){
						$('#tag_error').fadeOut('slow',function(){
							
						});
					  }, 3000);
				}			
				});
				
			}
		}
	});
	
	
	function addTag() {
		var flag = 0;
		$('.tag').each(function() {
			if($(this).val() == $('#tag_input').val()) {
				$('#tag_exists').show();					
				setTimeout(function(){
				$('#tag_exists').fadeOut('slow',function(){
					
				});
			  }, 3000);
			  flag = 1;
			}
		});
		
		if(!flag) {
			$('#tags_div').prepend('<div class="tag_div"><input type="text" value="' + $('#tag_input').val() + '" class="tag" name="tags[]" readonly> <span class="glyphicon glyphicon-remove remove_tag"></span></div>');		
			$('#tag_input').val('');
		}
	}	

	
});

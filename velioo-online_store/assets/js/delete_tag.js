$(document).ready(function() {
	
	infoLog += '\ndelete_tag.js loaded\n';
	
	var deleteTagUrl = getDeleteTagUrl();
	
	$(document).on('click','.remove_tag',function(e){
		e.preventDefault();
		infoLog += '\ndelete_tag.js/.remove_tag: Executing... \n';
		if (confirm('Сигурни ли сте, че искате да премахнете тага.')) {
			var tagName = $(this).data('tag-name');
			var self = $(this);
			infoLog += 'delete_tag.js/.remove_tag: Sending request to ' + deleteTagUrl + 
					   ' with params: tagName = ' + tagName + '\n';
			$.post(deleteTagUrl , {tagName: tagName}, function(data){
				if(data) {
					infoLog += 'delete_tag.js/.remove_tag: Request successfull\n';
					self.parent().parent().remove();
				} else {
					infoLog += 'delete_tag.js/.remove_tag: Request failed\n';
					window.alert('error removing tag');
				}	
				logger.info(infoLog);
				infoLog = "";		
			});
		}
	});
	
});

$(document).ready(function() {
	
	var deleteTagUrl = getDeleteTagUrl();
	
	$(document).on('click','.remove_tag',function(){
		if (confirm('Сигурни ли сте, че искате да премахнете тага.')) {
			var tagName = $(this).data('tag-name');
			var self = $(this);
			
			$.post(deleteTagUrl , {tagName: tagName}, function(data){
				if(data) {
					self.parent().parent().remove();
				} else {
					window.alert('error removing tag');
				}			
			});
		}
	});
	
});

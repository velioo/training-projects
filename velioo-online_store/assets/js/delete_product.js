$(document).ready(function() {
   
  var delete_url = getDeleteUrl(); 
   
  $(".delete_record").click(function(){
	if (confirm('Are you sure you want to delete this record ?')) {
		var delete_id = $(this).data("id");
		var parent_element = $(this).parent().parent();
		$.post(delete_url + '/' + delete_id , function(data){
			if(data) {
				window.alert("Продуктът е успешно премахнат.");
				parent_element.remove();
			} else {
				window.alert("Възникна проблем, моля свържете се с вашия администратор.");
			}			
		});
	} 
  });  
});

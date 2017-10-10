$(document).ready(function() {  

  if($(".statusMsg").length > 0) {
	  setTimeout(function(){
		$('.statusMsg').remove();
	  }, 3000);
  }
  
});

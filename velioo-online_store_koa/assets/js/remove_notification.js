$(document).ready(function() {  

  infoLog += '\nremove_notification.js loaded\n';

  if($(".statusMsg").length > 0) {
	  infoLog += '\nremove_notification.js: Notification found, removing...\n';
	  logger.info(infoLog);
	  infoLog = "";
	  setTimeout(function(){
		$('.statusMsg').remove();
		infoLog += '\nremove_notification.js: Notification removed\n';
		logger.info(infoLog);
		infoLog = "";
	  }, 3000);
  }
  
});

<!DOCTYPE html>
<html lang="en">
<head>
  <title><?php echo $title; ?></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="http://downloadicons.net/sites/default/files/computer-icon-65917.png">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="<?php echo asset_url() . "css/main.css"; ?>">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script> 
  <script src="<?php echo asset_url() . "js/remove_notification.js"; ?>"></script>  
</head>
<body>
	
<div id="holder">	
	
<nav class="navbar navbar-inverse navbar-fixed-top" id="navigation_top">
  <div class="container-fluid" style="width: 1150px;">
    <div class="navbar-header">
      <a class="navbar-brand" href="<?php echo site_url("employees/dashboard"); ?>">Dashboard</a>
    </div>
    <ul class="nav navbar-nav navbar-right">
		<li><a href="<?php echo site_url(); ?>"><span class="glyphicon glyphicon-home"></span> Kъм Магазина</a></li>
	  <?php if($this->session->userdata('isEmployeeLoggedIn')) { ?>		
		<li><a href="<?php echo site_url("employees/logout"); ?>"><span class="glyphicon glyphicon-log-in"></span> Изход</a></li>
	  <?php } ?>
    </ul>
  </div>	
</nav>

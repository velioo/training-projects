<!DOCTYPE html>
<html lang="en">
<head>
  <title><?php echo $title; ?></title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
<link rel="icon" href="http://downloadicons.net/sites/default/files/computer-icon-65917.png">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>  
<script src="<?php echo asset_url() . "js/remove_notification.js"; ?>"></script>  
<script src="<?php echo asset_url() . "js/cart.js"; ?>"></script>
<script src="<?php echo asset_url() . "js/main_menu.js"; ?>"></script>
<link rel="stylesheet" href="<?php echo asset_url() . "css/main.css"; ?>"> 
 
<script src='https://www.google.com/recaptcha/api.js'></script>
</head>
<body>
	
<script>

	function getAddToCartUrl() {
		var url = "<?php echo site_url("cart/add"); ?>";
		return url;
	}
	
	function getChangeQuantityUrl() {
		var url = "<?php echo site_url("cart/change_quantity"); ?>";
		return url;
	}
	
	function getRemoveFromCartUrl() {
		var url = "<?php echo site_url("cart/remove"); ?>";
		return url;
	}
	
	function getCartCountPriceUrl() {
		var url = "<?php echo site_url("cart/cart_count_price"); ?>";
		return url;
	}

	function getRedirectUrl() {
		var url = "<?php echo site_url("users/login"); ?>";
		return url;
	}
	
	function getMenuItemsUrl() {
		var url = "<?php echo site_url("products/get_menu_items"); ?>";
		return url;
	}
	
	function getActiveTab() {
		var tab = "<?php echo $category_id; ?>";
		return tab;
	}
	
	function getCategorySearchUrl() {
		var url = "<?php echo site_url("products/search"); ?>";
		return url;
	}

</script>	
	
<div id="holder">	
	
<nav class="navbar" id="navigation_top">
  <div class="container-fluid" style="width: 1150px;">
    <div class="navbar-header">
      <a class="navbar-brand" href="<?php echo site_url(); ?>">Computer Store</a>
    </div>
    <form action="<?php echo site_url("products/search"); ?>" method="get" class="navbar-form navbar-left"> 
      <div class="input-group">
        <input type="text" class="form-control" name="search_input" placeholder="Search">
        <div class="input-group-btn">
          <button class="btn btn-default" name="search_button" type="submit">
            <i class="glyphicon glyphicon-search"></i>
          </button>
        </div>
      </div>
    </form>
    <ul class="nav navbar-nav navbar-right">
	  <?php if(!$this->session->userdata('isUserLoggedIn')) { ?>
		  <li><a href="<?php echo site_url("users/registration"); ?>"><span class="glyphicon glyphicon-user"></span> Регистрация</a></li>
		  <li><a href="<?php echo site_url("users/login"); ?>"><span class="glyphicon glyphicon-log-in"></span> Вход</a></li>
      <?php } else { ?>
		  <li><a href="<?php echo site_url("users/cart"); ?>"><span class="glyphicon glyphicon-shopping-cart" style="float:right;"> Количка</span></br><span id="cart_count_price"></span></a></li>
		  <li><a href="<?php echo site_url("users/account"); ?>"><span class="glyphicon glyphicon-user"></span> Моят профил</a></li>
		  <li><a href="<?php echo site_url("users/logout"); ?>"><span class="glyphicon glyphicon-log-in"></span> Изход</a></li>
	  <?php } ?>
    </ul>
  </div>	
</nav>	
	
<nav class="navbar" id="navigation_top2">
  <div class="container-fluid" style="width: 1150px;">
    <ul class="nav navbar-nav" id="main_menu">		

	  
      <li class="dropdown" id="components_tab">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="components_dropdown_tab">Компоненти
        <span class="caret"></span></a>
        <ul class="dropdown-menu" id="components_dropdown">

        </ul>
      </li>  
      <li class="dropdown" id="peripheral_tab">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="peripheral_dropdown_tab">Периферия
        <span class="caret"></span></a>
        <ul class="dropdown-menu" id="peripheral_dropdown">
         
        </ul>
      </li>     	    
    </ul>
  </div>
</nav>

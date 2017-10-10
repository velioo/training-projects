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
    <ul class="nav navbar-nav">		

	  <li <?php if(isset($category_id)) if($category_id == 0) echo "class='active'"; ?>><a href="<?php echo site_url(); ?>">Начало</a></li>
	  <li <?php if(isset($category_id)) { if($category_id == 10) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/10"); ?>">Лаптопи</a></li>
	  <li <?php if(isset($category_id)) { if($category_id == 9) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/9"); ?>">Компютри</a></li>	
	  <li <?php if(isset($category_id)) { if($category_id == 13) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/13"); ?>">Монитори</a></li>	
      <li class="dropdown <?php if(isset($category_id)) { if($category_id == 1 || $category_id == 2 || $category_id == 3 || $category_id == 4 || $category_id == 5 || $category_id == 6
		  || $category_id == 7 || $category_id == 8 || $category_id == 16 || $category_id == 17) echo 'active'; } ?>">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">Компоненти
        <span class="caret"></span></a>
        <ul class="dropdown-menu">
          <li <?php if(isset($category_id)) { if($category_id == 17) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/17"); ?>">Процесори</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 1) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/1"); ?>">Видео карти</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 3) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/3"); ?>">Дънни платки</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 5) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/5"); ?>">Ram памет</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 4) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/4"); ?>">SSD</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 2) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/2"); ?>">Захранвания</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 7) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/7"); ?>">Кутии</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 6) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/6"); ?>">Твърди дискове (настолен)</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 16) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/16"); ?>">Твърди дискове (външен)</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 8) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/8"); ?>">Охладители за процесори</a></li>
        </ul>
      </li>  
      <li class="dropdown <?php if(isset($category_id)) { if($category_id == 11 || $category_id == 12 || $category_id == 14 || $category_id == 15) echo 'active'; } ?>">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">Периферия
        <span class="caret"></span></a>
        <ul class="dropdown-menu">
          <li <?php if(isset($category_id)) { if($category_id == 14) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/14"); ?>">Мишки</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 15) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/15"); ?>">Клавиатури</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 12) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/12"); ?>">Кабели</a></li>
          <li <?php if(isset($category_id)) { if($category_id == 11) echo "class='active'"; } ?>><a href="<?php echo site_url("products/search/11"); ?>">Подложки за мишки</a></li>
        </ul>
      </li>     	    
    </ul>
  </div>
</nav>

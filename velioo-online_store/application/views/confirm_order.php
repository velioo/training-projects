<?php require 'header.php'; ?>

<div id="body">
	
<h2>Потвърждение на поръчка</h2>	
	 <div class="vertical-menu">
	  <a href="<?php echo site_url("users/cart"); ?>">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>" class="active">Поръчки</a> 
	  <a href="<?php echo site_url("users/account"); ?>">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>">Детайли</a>
	</div>
	
	<div class="account-info">
		<hr>
		<form action="<?php echo site_url("orders/create_order"); ?>" method="post" class="form-horizontal login_register_form">
		<div class="cart_products order">								
			<?php if(isset($payment_method) && $payment_method) echo "Плащане чрез:</br> "; ?> <img src="<?php echo asset_url() . "imgs/" . htmlentities($payment_method['image'], ENT_QUOTES); ?>" class="cart_product_image confirm"><?php echo htmlentities($payment_method['name'], ENT_QUOTES); ?>
			<p><?php echo "<b>" . $payment_method['details'] . "</b>"; ?></p>
			<div style="display:inline-block;">
				<h4>Данни за доставката:</h4>
				<p>Име на получател: <?php echo htmlentities($userData['name'], ENT_QUOTES) . ' ' . htmlentities($userData['last_name'], ENT_QUOTES); ?></p>
				<p>Адрес: <?php echo htmlentities($userData['country'], ENT_QUOTES) . ', ' . htmlentities($userData['region'], ENT_QUOTES) . ', ' . htmlentities($userData['street_address'], ENT_QUOTES); ?></p>
				<p>Телефон за връзка: <?php echo htmlentities($userData['phone_unformatted'], ENT_QUOTES); ?></p>
				<p>Имейл за връзка: <?php echo htmlentities($userData['email'], ENT_QUOTES); ?></p>
			</div>
		</div>	
		<div class="cart_products items order"</div>
		<h3 style="text-align:right;">Продукти: </h3>
			<?php if(isset($products) && $products) { foreach($products as $p) { ?>
				<div class="cart_product order">
					<div class="cart_product_image_div order"><a href="#"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="cart_product_image order" style="margin: 5px;"></a></div>
					<div class="cart_product_name_div order"><p class="cart_product_name order"><?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></p></div>
					<div class="cart_product_price order"><p>Цена: <?php echo htmlspecialchars($p['cart_quantity'] . " x " . number_format($p['price_leva'], 2), ENT_QUOTES) . " лв.  =  " . htmlspecialchars(number_format($p['price_leva'] * $p['cart_quantity'], 2), ENT_QUOTES) . " лв."; ?></p></div>						
				</div>
			<?php }} ?>
			 <div class="cart_purchase_div"><b><h3 class="inline_h3">Общo: &nbsp;</h3><h3 class="cart_sum inline_h3"></h3><h3 class="inline_h3"> лв.</h3></br></div>
		</div>
		<div class="form-group form_submit" style="margin-top:50px;">
			<button type="submit" value="Избери" id="confirmSubmit" name="confirmSubmit" class="btn btn-primary form_submit_button register">Потвърди</button>
        </div>  
		</form>		
	</div>
</div>

<?php require 'footer.php'; ?>

<?php require 'header.php'; ?>

<div id="body">
	
<h2>Поръчка# <?php if($order['order_id']) echo htmlentities($order['order_id'], ENT_QUOTES); ?></h2>	
	 <div class="vertical-menu">
	  <a href="<?php echo site_url("users/cart"); ?>">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>" class="active">Поръчки</a>
	  <a href="<?php echo site_url("users/account"); ?>">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>">Детайли</a>
	</div>
	
	<div class="account-info">
		<hr>
		<div class="form-horizontal login_register_form">
			<div class="cart_products order">								
				<?php if($order) echo "Плащане чрез:</br> "; ?> <img src="<?php echo asset_url() . "imgs/" . htmlentities($order['payment_method_image'], ENT_QUOTES); ?>" class="cart_product_image confirm"><?php echo htmlentities($order['payment_method_name'], ENT_QUOTES); ?>
				<p><?php echo "<b>" . $order['payment_method_details'] . "</b>"; ?></p>
				<div style="display:inline-block;">
					<h4>Данни за доставката:</h4>
					<p>Име на получател: <?php if($userData['name'] && $userData['last_name']) echo htmlentities($userData['name'], ENT_QUOTES) . ' ' . htmlentities($userData['last_name'], ENT_QUOTES); ?></p>
					<p>Адрес: <?php if($userData['country'] && $userData['region'] && $userData['street_address']) echo htmlentities($userData['country'], ENT_QUOTES) . ', ' . htmlentities($userData['region'], ENT_QUOTES) . ', ' . htmlentities($userData['street_address'], ENT_QUOTES); ?></p>
					<p>Телефон за връзка: <?php if($userData['phone_unformatted']) echo htmlentities($userData['phone_unformatted'], ENT_QUOTES); ?></p>
					<p>Имейл за връзка: <?php if($userData['email']) echo htmlentities($userData['email'], ENT_QUOTES); ?></p>
				</div>
			</div>	
			<div class="cart_products items order"</div>
			<h3 style="text-align:right;">Продукти: </h3>
				<?php if(isset($products) && $products) { foreach($products as $p) { ?>
					<div class="cart_product order">
						<div class="cart_product_image_div order"><a href="#"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="cart_product_image order"></a></div>
						<div class="cart_product_name_div order"><p class="cart_product_name order"><?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></p></div>
						<div class="cart_product_price order"><p>Цена: <?php echo htmlspecialchars($p['quantity'] . " x " . number_format($p['price_leva'], 2), ENT_QUOTES) . " лв.  =  " . htmlspecialchars(number_format($p['price_leva'] * $p['quantity'], 2), ENT_QUOTES) . " лв."; ?></p></div>						
					</div>
				<?php } echo '<div class="cart_purchase_div"><h3 class="cart_sum_const">Обща сума: ' . htmlentities(number_format($order['amount_leva'], 2), ENT_QUOTES). '</h3></br></div>'; } ?>
			</div>
		</div>
	</div>
</div>

<?php require 'footer.php'; ?>

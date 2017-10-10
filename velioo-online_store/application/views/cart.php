<?php require 'header.php'; ?>

<script>

	function geRemoveFromCartUrl() {
		var url = "<?php echo site_url("cart/remove"); ?>";
		return url;
	}
	
</script>

<div id="body">
	
<h2>Количка</h2>	
	 <div class="vertical-menu">
	  <a href="<?php echo site_url("users/cart"); ?>" class="active">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("users/account"); ?>">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>">Детайли</a>
	</div>
	
	<div class="account-info">
		<hr>
		<div class="cart_products">
			<?php $numItems = count($products); $i = 0; if($products) { foreach($products as $p) { ?>
				<div class="cart_product" data-id="<?php echo $p['id']; ?>">
					<div class="cart_product_image_div"><a href="#"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="cart_product_image"></a></div>
					<div class="cart_product_name_div"><p class="cart_product_name"><?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></p></div>
					<span class="remove_product">✘</span>
					<div class="change_product_count">Брой:					
						<input class="input_change_count" min="0" step="1" type="number" value="<?php echo $p['quantity']; ?>">
					</div>
					<div class="cart_product_price cart"><p style="font-size: 18px;" class="product_price_p">Цена: <?php echo htmlspecialchars(($p['price_leva'] * $p['quantity']), ENT_QUOTES) . " лв."; ?></p></div>						
				</div>
				<div class="plus">
					<?php if(++$i !== $numItems) echo "+"; ?>
				</div>
			<?php } echo '<div class="cart_purchase_div"><h3 class="cart_sum">Обща сума: </h3></br></br>' . '<a href="' . site_url("orders/payment_method") . '"> <button type="button" class="btn btn-default purchase_button">
						  <span class="glyphicon glyphicon-shopping-cart"></span> Продължи към плащане</button></a></div>'; } else echo "<h3>Нямате продукти в кошницата</h3>"; ?>
		</div>			
	</div>
</div>

<?php require 'footer.php'; ?>

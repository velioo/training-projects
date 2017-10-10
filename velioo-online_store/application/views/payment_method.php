<?php require 'header.php'; ?>

<div id="body">
	
<h2>Изберете метод за плащане</h2>	
	 <div class="vertical-menu">
	  <a href="<?php echo site_url("users/cart"); ?>">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>">Поръчки</a>	  
	  <a href="<?php echo site_url("users/account"); ?>">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>">Детайли</a>
	</div>
	
	<div class="account-info">
		<hr>
		<form action="<?php echo site_url("orders/confirm_order"); ?>" method="post" class="form-horizontal login_register_form">
		<div class="cart_products order">								
			<?php if($payment_methods) { foreach($payment_methods as $p) { if($p['id'] != 3 && $p['id'] != 4) {?>
				<div class="radio">
				<img src="<?php echo asset_url() . "imgs/" . $p['image']; ?>" class="payment_image">
				  <label><input type="radio" value="<?php echo $p['id']; ?>" name="payment_method" required><?php echo htmlentities($p['name'], ENT_QUOTES); ?></label>
				</div>
			<?php }}} ?>
		
		</div>	
		<div class="cart_products items order"</div>
			<?php $numItems = count($products); $i = 0; if($products) { foreach($products as $p) { ?>
				<div class="cart_product order">
					<div class="cart_product_image_div order"><a href="#"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="cart_product_image order"></a></div>
					<div class="cart_product_name_div order"><p class="cart_product_name order"><?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></p></div>
					<div class="cart_product_price order"><p>Цена: <?php echo htmlspecialchars($p['cart_quantity'] . " x " . $p['price_leva'], ENT_QUOTES) . " лв."; ?></p></div>						
				</div>
				<div class="plus">
					<?php if(++$i !== $numItems) echo "+"; else echo "="; ?>
				</div>
			<?php } echo '<div class="cart_purchase_div"><h3 class="cart_sum">Обща сума: </h3></br></div>'; } ?>
		</div>
		<div class="form-group form_submit" style="margin-top:50px;">
			<button type="submit" value="Избери" id="paymentSubmit" name="paymentSubmit" class="btn btn-primary form_submit_button register">Избери</button>
        </div>  
		</form>	
			<?php
			if(!empty($this->session->userdata('error_msg'))) {
				echo '<p class="errorMsg">' . $this->session->userdata('error_msg') . '</p>';
				$this->session->unset_userdata('error_msg');
			}
			?>	
	</div>
</div>

<?php require 'footer.php'; ?>

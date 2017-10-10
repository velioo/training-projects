<?php include 'dashboard_header.php'; ?>


<div id="body" style="width: 100%;">

<div class="vertical-menu employee">
	  <a href="<?php echo site_url("employees/orders"); ?>" class="active">Поръчки</a>
	  <a href="<?php echo site_url("employees/dashboard"); ?>" >Всички продукти</a>
	  <a href="<?php echo site_url("employees/add_product"); ?>" >Добави продукт</a>
</div>

<div class="account-info employee">
	<div class="profile_tab_title">Поръчка#<?php echo htmlentities($order['order_id'], ENT_QUOTES); ?></div>
	<hr>
	
	<?php
		if(!empty($this->session->userdata('success_msg'))){
			echo '<p class="statusMsg">' . $this->session->userdata('success_msg') . '</p>';
			$this->session->unset_userdata('success_msg');
		} elseif(!empty($this->session->userdata('error_msg'))) {
			echo '<p class="statusMsg">' . $this->session->userdata('error_msg') . '</p>';
			$this->session->unset_userdata('error_msg');
		}	
	?>
	
	<div class="form-horizontal login_register_form">
			<div class="cart_products order">								
				<?php if($order) echo "Плащане чрез:</br> "; ?> <img src="<?php echo asset_url() . "imgs/" . htmlentities($order['payment_method_image'], ENT_QUOTES); ?>" class="cart_product_image confirm"><?php echo htmlentities($order['payment_method_name'], ENT_QUOTES); ?>
				<p><?php echo "<b>" . $order['payment_method_details'] . "</b>"; ?></p>
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
				<?php if($products) { foreach($products as $p) { ?>
					<div class="cart_product order">
						<div class="cart_product_image_div order"><a href="#"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="cart_product_image order"></a></div>
						<div class="cart_product_name_div order"><p class="cart_product_name order"><?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></p></div>
						<div class="cart_product_price order"><p>Цена: <?php echo htmlspecialchars($p['quantity'] . " x " . $p['price_leva'], ENT_QUOTES) . " лв."; ?></p></div>						
					</div>
				<?php } echo '<div class="cart_purchase_div"><h3 class="cart_sum_const">Обща сума: ' . $order['amount_leva'] . '</h3></br></div>'; } ?>
			</div>
		</div>

</div>

</div>

<?php include 'dashboard_footer.php'; ?>



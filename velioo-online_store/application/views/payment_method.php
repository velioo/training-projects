<?php require 'header.php'; ?>

<div id="body">
	
<h2>Изберете метод за плащане</h2>	
	 <div class="vertical-menu">
	  <a href="<?php echo site_url("users/cart"); ?>">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>" class="active">Поръчки</a>	  
	  <a href="<?php echo site_url("users/account"); ?>">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>">Детайли</a>
	</div>
	
	<div class="account-info">
		<hr>
		<form action="<?php echo site_url("orders/confirm_order"); ?>" method="post" class="form-horizontal">
		<div class="table-responsive">          
		  <table class="table">
			<thead>
			  <tr>
				<th></th>
				<th>Име</th>
				<th class="price_th">Ед.Цена в лв.</th>
				<th>Брой</th>
				<th class="sum_th">Сума в лв.</th>
				<th>Премахни</th>
			  </tr>
			</thead>
			<tbody>
			<?php if(isset($products) && $products) foreach($products as $product) { ?>
			  <tr data-id="<?php echo htmlentities($product['id'], ENT_QUOTES); ?>">
				<td><a href="#"><img src="<?php echo ($product['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($product['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="cart_product_image"></a></td>
				<td class="cart_product_name_td"><?php echo htmlspecialchars($product['name'], ENT_QUOTES); ?></td>
				<td class="cart_product_price_td"><?php echo htmlspecialchars(number_format($product['price_leva'], 2), ENT_QUOTES); ?></td>
				<td>					
					<input class="input_change_count" min="0" step="1" type="number" value="<?php echo $product['quantity']; ?>">
				</td>
				<td class="cart_product_sum_td"><?php echo htmlspecialchars(number_format($product['price_leva'] * $product['quantity'], 2), ENT_QUOTES); ?></td>
				<td><span class="remove_product">Премахни</span></td>
			  </tr>
			  <?php } else {  ?>
				  <h3>Нямате продукти в кошницата</h3>
			  <?php } ?>
			  <tr>
				  <td></td>
				  <td></td>
				  <td></td>
				  <td><b style="font-size: 18px;">Общо</b></td>
				  <td class="cart_sum"></td>
				  <td></td>
			  </tr>
			</tbody>
		  </table>
		</div>
		<div class="cart_products order">								
			<?php if(isset($payment_methods) && $payment_methods) { foreach($payment_methods as $p) { if($p['details'] != '') {?>
				<div class="radio">
				<img src="<?php echo asset_url() . "imgs/" . $p['image']; ?>" class="payment_image">
				  <label><input type="radio" value="<?php echo $p['id']; ?>" name="payment_method" required><?php echo htmlentities($p['name'], ENT_QUOTES); ?></label>
				</div>
			<?php }}} ?>
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

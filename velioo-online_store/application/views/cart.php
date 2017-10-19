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
				<td><a href="<?php echo site_url('products/product') . '/' . htmlentities($product['id'], ENT_QUOTES); ?>"><img src="<?php echo ($product['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($product['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="cart_product_image"></a></td>
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
		<div class="cart_purchase_div">
			<a href="<?php echo site_url("orders/payment_method"); ?>"> 
				<button type="button" class="btn btn-default purchase_button">
				<span class="glyphicon glyphicon-shopping-cart"></span> Продължи към плащане</button>
			</a>
		</div>		
	</div>
</div>

<?php require 'footer.php'; ?>

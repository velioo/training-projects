<?php include 'dashboard_header.php'; ?>

<script src="<?php echo asset_url() . "js/delete_product.js"; ?>"></script>

<script>
	
	function getDeleteUrl() {
		var url = "<?php echo site_url("products/delete_product"); ?>";
		return url;
	}

</script>

<div id="body" style="width: 100%;">

<div class="vertical-menu employee">
	  <a href="<?php echo site_url("employees/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("employees/dashboard"); ?>" class="active">Продукти</a>
	  <a href="<?php echo site_url("employees/tags"); ?>">Тагове</a>
</div>

<div class="account-info employee">
	<div class="profile_tab_title">Всички продукти</div>
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
	
	<a href="<?php echo site_url("employees/add_product"); ?>">Добави нов продукт</a>
	
	<div class="table-responsive">          
	  <table class="table">
		<thead>
		  <tr>
			<th>Име</th>
			<th>Категория</th>
			<th>Цена</th>
			<th>Брой</th>
			<th>Създаден на</th>
			<th>Последна промяна</th>
			<th>Редактирай</th>
			<th>Изтрии</th>
		  </tr>
		</thead>
		<tbody>
		<?php if($products) foreach($products as $product) { ?>
		  <tr>
			<td><?php echo htmlspecialchars($product['name'], ENT_QUOTES); ?></td>
			<td><?php echo htmlspecialchars($product['category'], ENT_QUOTES); ?></td>
			<td><?php echo htmlspecialchars($product['price_leva'], ENT_QUOTES); ?></td>
			<td><?php echo htmlspecialchars($product['quantity'], ENT_QUOTES); ?></td>
			<td><?php echo htmlspecialchars($product['created_at'], ENT_QUOTES); ?></td>
			<td><?php echo htmlspecialchars($product['updated_at'], ENT_QUOTES); ?></td>
			<td><a href="<?php echo site_url("employees/update_product/" . htmlspecialchars($product['id'], ENT_QUOTES)); ?>">Редактирай</a></td>
			<td><a href="#" data-id="<?php echo htmlspecialchars($product['id'], ENT_QUOTES); ?>" class="delete_record">Изтрий</a></td>
		  </tr>
		  <?php } ?>
		</tbody>
	  </table>
	</div>
	
	<div style="text-align:center;"><?php echo ($pagination) ? $pagination : ''; ?></div>
	
</div>

</div>

<?php include 'dashboard_footer.php'; ?>



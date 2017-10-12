<?php include 'dashboard_header.php'; ?>

<script src="<?php echo asset_url() . "js/change_order_status.js"; ?>"></script>

<script>
	
	function getChangeStatusUrl() {
		var url = "<?php echo site_url("employees/change_status"); ?>";
		return url;
	}

</script>

<div id="body" style="width: 100%;">

<div class="vertical-menu employee">
	  <a href="<?php echo site_url("employees/orders"); ?>" class="active">Поръчки</a>
	  <a href="<?php echo site_url("employees/dashboard"); ?>" >Продукти</a>
	  <a href="<?php echo site_url("employees/tags"); ?>">Тагове</a>
	  <div id="message"></div>
</div>

<div class="account-info employee">
	<div class="profile_tab_title">Поръчки</div>
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
	
	<div class="table-responsive">          
	  <table class="table">
		<thead>
		  <tr>
			<th>Поръчка#</th>
			<th>Създадена на</th>
			<th>Обща сума</th>
			<th>Състояние</th>
			<th>Детайли</th>
		  </tr>
		</thead>
		<tbody>
		<?php if($orders) foreach($orders as $order) { ?>
		  <tr data-id="<?php echo htmlentities($order['order_id'], ENT_QUOTES); ?>">
			<td class="order_id"><?php echo htmlspecialchars($order['order_id'], ENT_QUOTES); ?></td>
			<td><?php echo htmlspecialchars($order['order_created_at'], ENT_QUOTES); ?></td>
			<td><?php echo htmlspecialchars($order['amount_leva'], ENT_QUOTES); ?></td>
			<td class="order_status">
				<?php if(($order['status_id'] != 1) && ($order['status_id'] != 2) && ($order['status_id'] != 3) && ($order['status_id'] != 8)) { ?>
				<select class="select_status">
					<?php foreach($statuses as $status) { ?>
						<option value="<?php echo htmlentities($status['id'], ENT_QUOTES); ?>" <?php if(htmlspecialchars($order['status_id'], ENT_QUOTES) == htmlentities($status['id'], ENT_QUOTES)) echo "selected='selected'"; ?>><?php echo htmlentities($status['name'], ENT_QUOTES); ?></option>
					<?php } ?>
				</select>
				<?php } else { ?>
					<?php echo htmlentities($order['status_name']); ?>
				<?php } ?>
			</td>
			<td><a href="<?php echo site_url("employees/order_details/" . htmlentities($order['order_id'], ENT_QUOTES)); ?>" class="order_details">Детайли</a></td>
		  </tr>	
		  <?php } ?>
		</tbody>
	  </table>
	</div>
	
	<div style="text-align:center;"><?php echo ($pagination) ? $pagination : ''; ?></div>
	
</div>

</div>

<?php include 'dashboard_footer.php'; ?>



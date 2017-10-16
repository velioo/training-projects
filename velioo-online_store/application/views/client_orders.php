<?php include 'dashboard_header.php'; ?>

<script src="<?php echo asset_url() . "js/change_order_status.js"; ?>"></script>
<link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/themes/base/jquery-ui.css">
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<script src="<?php echo asset_url() . "easy_autocomplete/jquery.easy-autocomplete.min.js"; ?>"></script> 
<link rel="stylesheet" href="<?php echo asset_url() . "easy_autocomplete/easy-autocomplete.min.css"; ?>">

<script>
	
	function getChangeStatusUrl() {
		var url = "<?php echo site_url("employees/change_status"); ?>";
		return url;
	}

	function getEmailsUrl() {
		var url = "<?php echo site_url("employees/get_user_emails"); ?>";
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
	
	<form action="<?php echo site_url("employees/orders"); ?>" method="get" class="form-horizontal" id="filter_form">
		
		Дата:
		От: <input type="text" class="data_picker filter" value="<?php if(isset($date_from) && $date_from) echo htmlentities($date_from, ENT_QUOTES); else echo ""; ?>" name="date_from">
		До: <input type="text" class="data_picker filter" value="<?php if(isset($date_to) && $date_from) echo htmlentities($date_to, ENT_QUOTES); else echo ""; ?>" name="date_to"></br></br>
		Имейл: <input type="text" class="user_filter filter" value="<?php if(isset($user_filter)) echo htmlentities($user_filter, ENT_QUOTES); else echo ""; ?>" name="user_filter" id="email_search_input">
		<div class="form-group form_submit orders_filter_submit">
			<button type="submit" class="btn btn-default purchase_button">Филтрирай</button>
        </div>  
	</form>
	
	<div class="table-responsive">          
	  <table class="table">
		<thead>
		  <tr>
			<th>Създадена на</th>
			<th>Поръчка#</th>		
			<th>Потребител</th>		
			<th>Обща сума в лв.</th>
			<th>Състояние</th>
			<th>Детайли</th>
		  </tr>
		</thead>
		<tbody>
		<?php if(isset($orders) && $orders) foreach($orders as $order) { ?>
		  <tr data-id="<?php echo htmlentities($order['order_id'], ENT_QUOTES); ?>">
		    <td><?php echo htmlspecialchars($order['order_created_at'], ENT_QUOTES); ?></td>
			<td class="order_id"><?php echo htmlspecialchars($order['order_id'], ENT_QUOTES); ?></td>	
			<td><?php echo htmlspecialchars($order['user_email'], ENT_QUOTES); ?></td>	
			<td class="cart_product_price_td"><?php echo number_format(htmlspecialchars($order['amount_leva'], ENT_QUOTES), 2); ?></td>
			<td class="order_status">
				<?php if(($order['status_id'] != 1) && ($order['status_id'] != 2) && ($order['status_id'] != 3) && ($order['status_id'] != 8)) { ?>
				<select class="select_status">
					<?php if(isset($statuses)) foreach($statuses as $status) { ?>
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
		  <tr>
				<td></td>
				<td></td>
				<td><b style="font-size:18px;</b>">Статистики:</b></td>
				<td></td>
				<td></td>
				<td></td>
		  </tr>
		  <?php if(isset($totalSum) && $totalSum) foreach($totalSum as $key => $value) { ?>
			  <tr>
				<td></td>
				<td></td>
				<td><?php echo htmlentities($key, ENT_QUOTES); ?></td>
				<td class="cart_product_price_td"><?php echo htmlentities($value, ENT_QUOTES); ?></td>
				<td></td>
				<td></td>
			  </tr>		  
		  <?php } ?>
		</tbody>
	  </table>
	</div>
	
	<div style="text-align:center;"><?php echo ($pagination) ? $pagination : ''; ?></div>
	
</div>

</div>

<?php include 'dashboard_footer.php'; ?>



<?php include 'dashboard_header.php'; ?>

<script src="<?php echo asset_url() . "js/change_order_status.js"; ?>"></script>
<script src="<?php echo asset_url() . "js/get_orders.js"; ?>"></script>

<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/themes/base/jquery-ui.css">
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

<link rel="stylesheet" href="<?php echo asset_url() . "tablesorter/css/theme.blue.css"; ?>">
<script src="<?php echo asset_url() . "tablesorter/jquery.tablesorter.js"; ?>"></script>

<link rel="stylesheet" href="<?php echo asset_url() . "tablesorter/addons/pager/jquery.tablesorter.pager.css"; ?>">
<script src="<?php echo asset_url() . "tablesorter/addons/pager/jquery.tablesorter.pager.js"; ?>"></script>

<script src="<?php echo asset_url() . "tablesorter/jquery.tablesorter.widgets.js"; ?>"></script>


<script>
	
	function getChangeStatusUrl() {
		var url = "<?php echo site_url("employees/change_status"); ?>";
		return url;
	}
	
	function getOrdersUrl() {
		var url = "<?php echo site_url("employees/get_orders"); ?>";
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
	<p id="clean_filters" style="height:30px;"></p>	
		<div class="form-horizontal">
			<div class="form-group">
			  <label class="col-sm-1 control-label filter_label" for="date_c_from">Създадени:</label>
			  <div class="col-sm-8">
					От: <input type="text" class="data_picker filter" id="date_c_from">
					До: <input type="text" class="data_picker filter" id="date_c_to">
			  </div>
			</div>
			<div class="form-group">
			  <label class="col-sm-1 control-label filter_label" for="date_m_from">Модифицирани:</label>
			  <div class="col-sm-8">
					От: <input type="text" class="data_picker filter" name="date_m_from" id="date_m_from">
					До: <input type="text" class="data_picker filter" id="date_m_to"></br>
			  </div>
			</div>
			<div class="form-group">
			  <label class="col-sm-1 control-label filter_label" for="price_from">Цена:</label>
			  <div class="col-sm-8">
					От: <input type="number" class="filter filter_price" min="0" step="1" id="price_from">
					До: <input type="number" class="filter filter_price" min="0" step="1" id="price_to"></br>
			  </div>
			</div>
		</div>
</div>

	  <table class="tablesorter" id="orders_table">
		<thead>
		  <tr class="tablesorter-ignoreRow">
			<td class="pager" colspan="7" style="text-align:left;">
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/first.png"; ?>" class="first"/>
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/prev.png"; ?>" class="prev"/>
				<span class="pagedisplay"></span>
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/next.png"; ?>" class="next"/>
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/last.png"; ?>" class="last"/>
				<select class="pagesize">
				  <option value="30">30</option>
				  <option value="50">50</option>
				  <option value="100">100</option>
				  <option value="200">200</option>
				  <option value="500">500</option>
				</select>
		    </td>	  
		  </tr>
		  <tr>
			<th>Създадена на</th>
			<th>Последно променена</th>
			<th>Поръчка#</th>		
			<th>Потребител</th>		
			<th>Обща сума в лв.</th>
			<th>Състояние</th>
			<th>Детайли</th>
		  </tr>
		</thead>
		 <tfoot>
		<tr>
		  	<th>Създадена на</th>
		  	<th>Последно променена</th>
			<th>Поръчка#</th>		
			<th>Потребител</th>		
			<th>Обща сума в лв.</th>
			<th>Състояние</th>
			<th>Детайли</th>
		</tr>
		  <tr>
			  <td class="pager" colspan="7" style="text-align:left;">
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/first.png"; ?>" class="first"/>
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/prev.png"; ?>" class="prev"/>
				<span class="pagedisplay"></span>
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/next.png"; ?>" class="next"/>
				<img src="<?php echo asset_url() . "tablesorter/addons/pager/icons/last.png"; ?>" class="last"/>
				<select class="pagesize">
				  <option value="30">30</option>
				  <option value="50">50</option>
				  <option value="100">100</option>
				  <option value="200">200</option>
				  <option value="500">500</option>
				</select>
			  </td>
		</tr>
		  </tfoot>
		<tbody>
		</tbody>
	  </table>
	  
	 <div class="table-responsive">          
	  <table class="table">
		<thead>
		  <tr>
			<th></th>
			<th style="width:26%;"></th>		
			<th></th>		
			<th></th>
			<th style="width:26%;"></th>
			<th></th>
		  </tr>
		</thead>
		<tbody id="profits_tbody">
		  <tr id="profits">
			<td></td>
			<td></td>
			<td class="left_aligned_td"><b style="font-size:18px;</b>">Печалби:</b></td>
			<td></td>
			<td></td>
			<td></td>
		  </tr>
		</tbody>
	  </table>
	</div>

</div>

<?php include 'dashboard_footer.php'; ?>



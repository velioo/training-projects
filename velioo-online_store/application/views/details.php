<?php require 'header.php'; ?>

<script src="<?php echo asset_url() . "js/phone_form.js"; ?>"></script>

<script type="text/javascript">

	function getCountries() {
		var countries = <?php echo json_encode($countries); ?>;
		return countries;
	}

</script>

<div id="body">
	
<h2>Моят профил</h2>	
	<div class="vertical-menu">
      <a href="<?php echo site_url("users/cart"); ?>">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("users/account"); ?>">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>" class="active">Детайли</a>
	</div>
	<div class="account-info">
		<div class="profile_tab_title">Детайли</div>
		<hr>
		<h3>Промяна на данни</h3>
		 <?php
			if(!empty($this->session->userdata('success_msg'))){
				echo '<p class="statusMsg">' . $this->session->userdata('success_msg') . '</p>';
				$this->session->unset_userdata('success_msg');
			} elseif(!empty($this->session->userdata('error_msg'))) {
				echo '<p class="statusMsg">' . $this->session->userdata('error_msg') . '</p>';
				$this->session->unset_userdata('error_msg');
			}
		?>
		</br>
		<form action="<?php echo site_url("users/update_info"); ?>" method="post" class="form-horizontal">
			<div class="form-group <?php if(form_error('country') == true) { echo "has-error has-feedback"; } ?>">
			  <label class="col-sm-1 control-label" for="country">Държава:</label>
			  <div class="col-sm-8">
				 <select name="country" id="country" class="form-control">
					<?php foreach($countries as $country) { ?>
						<option value="<?php echo htmlentities($country['nicename']); ?>" <?php if(isset($user['country'])) { echo ($country['nicename'] == $user['country']) ? 'selected' : ''; } ?> data-id="<?php echo htmlentities($country['phonecode']); ?>" ><?php echo htmlentities($country['nicename']); ?></option>
					<?php } ?>
				 </select> 
				<?php echo form_error('country','<span class="help-block">','</span>'); ?>
			  </div>
			</div>
			
			<div class="form-group <?php if(form_error('phone') == true) { echo "has-error has-feedback"; } ?>">
			  <label class="col-sm-1 control-label" for="phone" id="phone_label">Телефон*: </label>
			  <div class="col-sm-8">
				<input type="text" class="form-control" id="phone" name="phone" value="<?php echo !empty($user['phone']) ? htmlspecialchars($user['phone_unformatted'], ENT_QUOTES) : ''; ?>">
				<span class="glyphicon glyphicon-remove form-control-feedback"></span>
				<?php echo form_error('phone','<span class="help-block">','</span>'); ?>
			  </div>
			</div>		
			
			<div class="form-group <?php if(form_error('region') == true) { echo "has-error has-feedback"; } ?>">
			  <label class="col-sm-1 control-label" for="region">Регион:</label>
			  <div class="col-sm-8">
				<input type="text" class="form-control" id="region" name="region" value="<?php echo !empty($user['region']) ? htmlspecialchars($user['region'], ENT_QUOTES) : ''; ?>">
				<span class="glyphicon glyphicon-remove form-control-feedback"></span>
				<?php echo form_error('region','<span class="help-block">','</span>'); ?>
			  </div>
			</div>
			
			<div class="form-group <?php if(form_error('street_address') == true) { echo "has-error has-feedback"; } ?>">
			  <label class="col-sm-1 control-label" for="address">Адрес:</label>
			  <div class="col-sm-8">
				<input type="text" class="form-control" id="address" name="street_address" value="<?php echo !empty($user['street_address']) ? htmlspecialchars($user['street_address'], ENT_QUOTES) : ''; ?>">
				<span class="glyphicon glyphicon-remove form-control-feedback"></span>
				<?php echo form_error('street_address','<span class="help-block">','</span>'); ?>
			  </div>
			</div>
			<div class="form-group">
				<?php
				if(!empty($user['gender']) && $user['gender'] == 'Another'){
					$fcheck = '';
					$mcheck = '';
					$acheck = 'checked="checked"';
				} elseif(!empty($user['gender']) && $user['gender'] == 'Female'){
					$fcheck = 'checked="checked"';
					$mcheck = '';
					$acheck = '';
				} else {
					$acheck = '';
					$fcheck = '';
					$mcheck = 'checked="checked"';
				}
				?>
				<label class="col-sm-1 control-label">Пол:</label>

					<label>
					<input type="radio" name="gender" value="Male" <?php echo $mcheck; ?>>
					Мъж
					</label>            
					<label>
					  <input type="radio" name="gender" value="Female" <?php echo $fcheck; ?>>
					  Жена
					</label>
					<label>
					  <input type="radio" name="gender" value="Another" <?php echo $acheck; ?>>
					  Друго
					</label>
			</div>
			 <div class="form-group form_submit">
				<button type="submit" value="Промени" id="infoSubmit" name="infoSubmit" class="btn btn-primary form_submit_button register">Промени</button>
			</div>   	
		</form>				
    </div>
</div>

<?php require 'footer.php'; ?>

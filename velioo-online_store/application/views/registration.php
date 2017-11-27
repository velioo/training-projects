<?php require 'header.php'; ?>

<script src="<?php echo asset_url() . "js/phone_form.js"; ?>"></script>

<script type="text/javascript">

	function getCountries() {
		var countries = <?php echo json_encode($countries); ?>;
		return countries;
	}

</script>

<div id="body">
<div id="wrap">
<h2 s>Регистрация</h2></br></br>
    <form action="<?php echo site_url("users/registration"); ?>" method="post" class="form-horizontal login_register_form">
		<div class="form-group <?php if(form_error('name') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="name">Име*:</label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="name" name="name" value="<?php echo !empty($user['name']) ? htmlspecialchars($user['name'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('name') == true) { echo "style='display:inline-block;'"; } ?>></span>		
			 <?php echo form_error('name','<span class="help-block">','</span>'); ?>	  
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('last_name') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="last_name">Фамилия:</label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="last_name" name="last_name" value="<?php echo !empty($user['last_name']) ? htmlspecialchars($user['last_name'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('last_name') == true) { echo "style='display:inline-block;'"; } ?>></span>		
			 <?php echo form_error('last_name','<span class="help-block">','</span>'); ?>	  
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('email') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="email">Имейл*:</label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="email" name="email" value="<?php echo !empty($user['email']) ? htmlspecialchars($user['email'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('email') == true) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('email','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('country') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="country">Държава:</label>
		  <div class="col-sm-8">
			 <select name="country" id="country" class="form-control">
				 <option value="" selected="selected">Choose a Country</option>
				<?php if(isset($countries) && $countries) foreach($countries as $country) { ?>
					<option value="<?php echo htmlentities($country['nicename']); ?>" <?php if(isset($user['country'])) { echo ($country['nicename'] == $user['country']) ? 'selected' : ''; }?> data-id="<?php echo htmlentities($country['phonecode']); ?>"><?php echo htmlentities($country['nicename']); ?></option>
				<?php } ?>
			 </select> 
			<?php echo form_error('country','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('phone') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="phone" id="phone_label">Телефон*: </label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="phone" name="phone" value="<?php echo !empty($user['phone']) ? htmlspecialchars($user['phone'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('phone') == true) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('phone','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('region') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="region">Регион:</label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="region" name="region" value="<?php echo !empty($user['region']) ? htmlspecialchars($user['region'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('region') == true) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('region','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('street_address') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="address">Адрес:</label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="address" name="street_address" value="<?php echo !empty($user['street_address']) ? htmlspecialchars($user['street_address'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('streete_address') == true) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('street_address','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('password') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="password">Парола*:</label>
		  <div class="col-sm-8">
			<input type="password" class="form-control" id="password" name="password">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('password') == true) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('password','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		
		<div class="form-group <?php if(form_error('conf_password') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="conf_password">Потвърди парола*:</label>
		  <div class="col-sm-8">
			<input type="password" class="form-control" id="conf_password" name="conf_password">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('conf_password') == true) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('conf_password','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		
		<div class="form-group">
            <?php
				if(!empty($user['gender']) && $user['gender'] == 'Male'){
					$fcheck = '';
					$mcheck = 'checked="checked"';
				} elseif(!empty($user['gender']) && $user['gender'] == 'Female'){
					$fcheck = 'checked="checked"';
					$mcheck = '';
				} else {
					$mcheck = '';
					$fcheck = '';
				}
            ?>
            <label class="col-sm-1 control-label">Пол:</label>

                <label>
                <input type="radio" name="gender" value="Male" <?php echo $mcheck; ?> >
                Мъж
                </label>            
                <label>
                <input type="radio" name="gender" value="Female" <?php echo $fcheck; ?> >
                 Жена
                </label>
                <label>
        </div></br>  
        <div class="g-recaptcha" data-sitekey="6LeBrTIUAAAAAJqfzWbZvxPv8SFxfW8GMjxCynhO"></div>
		<?php echo form_error('g-recaptcha-response','<span class="help-block">','</span>'); ?>
		</br></br>
        <div class="form-group form_submit">
			<button type="submit" value="Регистрация" id="registrSubmit" name="registrSubmit" class="btn btn-primary form_submit_button register">Регистрация</button>
        </div>  
    </form>    
</div>
</div>

<?php require 'footer.php'; ?>

<?php require 'header.php'; ?>

<div id="body">
<div id="wrap">
<h2 style="text-align:center; margin-right: 15%;">Промяна на парола</h2></br>

    <?php
	if(!empty($this->session->userdata('success_msg'))){
		echo '<p class="statusMsg">' . $this->session->userdata('success_msg') . '</p>';
		$this->session->unset_userdata('success_msg');
	} elseif(!empty($this->session->userdata('error_msg'))) {
		echo '<p class="statusMsg">' . $this->session->userdata('error_msg') . '</p>';
		$this->session->unset_userdata('error_msg');
	}
    ?>
    </br></br>
    <form action="<?php echo site_url("users/reset_password"); ?>" method="post" class="form-horizontal login_register_form">
    
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
		
		</br>
        <div class="form-group form_submit">
			<button type="submit" value="Изпрати" id="resetSubmit" name="resetSubmit" class="btn btn-primary form_submit_button login">Промени</button>
        </div> 
    </form>
</div>
</div>

<?php require 'footer.php'; ?>

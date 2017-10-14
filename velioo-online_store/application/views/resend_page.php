<?php require 'header.php'; ?>

<div id="body">
<div id="wrap">
<h2 style="text-align:center; margin-right: 15%;">Изпрати потвърждаващ имейл</h2></br>
<p>На посоченият имейл ще бъде изпратен линк, чрез който ще може да потвърдите акаунта си.</p>
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
    <form action="<?php echo site_url("users/resend_page"); ?>" method="post" class="form-horizontal login_register_form">
    
    	<div class="form-group <?php if(form_error('email') == true) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="email">Имейл:</label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="email" name="email" value="<?php echo !empty($user['email']) ? htmlspecialchars($user['email'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('email') == true) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('email','<span class="help-block">','</span>'); ?>	  
		  </div>
		</div>
		</br>
        <div class="form-group form_submit">
			<button type="submit" value="Изпрати" id="resetSubmit" name="resetSubmit" class="btn btn-primary form_submit_button login">Изпрати имейл</button>
        </div> 
    </form>
</div>
</div>

<?php require 'footer.php'; ?>

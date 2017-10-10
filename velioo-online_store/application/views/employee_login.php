<?php require 'header.php'; ?>

<div id="body">
<div id="wrap">
<h2 style="text-align:center; margin-right: 15%;">Вход за служители</h2></br></br>
    <?php
	if(!empty($this->session->userdata('success_msg'))){
		echo '<p class="statusMsg">' . $this->session->userdata('success_msg') . '</p>';
		$this->session->unset_userdata('success_msg');
	} elseif(!empty($this->session->userdata('error_msg'))) {
		echo '<p class="statusMsg">' . $this->session->userdata('error_msg') . '</p>';
		$this->session->unset_userdata('error_msg');
	}
    ?>
    <form action="<?php echo site_url("employees/login"); ?>" method="post" class="form-horizontal login_register_form">
		<div class="form-group <?php if(!empty($this->session->userdata('error_msg_timeless'))) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="name">Потребителско име:</label>
		  <div class="col-sm-8">
			<input type="text" class="form-control" id="username" name="username" value="<?php echo !empty($user['username']) ? htmlspecialchars($user['username'], ENT_QUOTES) : ''; ?>">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(!empty($this->session->userdata('error_msg_timeless'))) { echo "style='display:inline-block;'"; } ?>></span>		
			 <?php echo form_error('username','<span class="help-block">','</span>'); ?>	  
		  </div>
		</div>
		
		<div class="form-group <?php if(!empty($this->session->userdata('error_msg_timeless'))) { echo "has-error has-feedback"; } ?>">
		  <label class="col-sm-1 control-label" for="password">Парола:</label>
		  <div class="col-sm-8">
			<input type="password" class="form-control" id="password" name="password">
			<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(!empty($this->session->userdata('error_msg_timeless'))) { echo "style='display:inline-block;'"; } ?>></span>
			<?php echo form_error('password','<span class="help-block">','</span>'); ?>
		  </div>
		</div>
		<?php if(!empty($this->session->userdata('error_msg_timeless'))) {
				echo '<span class="help-block" style="margin-left: 120px;">' . $this->session->userdata('error_msg_timeless') . '</span>';
				$this->session->unset_userdata('error_msg_timeless');
			}
		 ?>		
        	</br>
        <div class="form-group form_submit">
			<button type="submit" value="Влез" id="loginSubmit" name="loginSubmit" class="btn btn-primary form_submit_button login">Влез</button>
        </div> 
    </form>
</div>
</div>

<?php require 'footer.php'; ?>

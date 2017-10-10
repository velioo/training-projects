<?php require 'header.php'; ?>

<div id="body">

<h2>Моят профил</h2>
    <div class="vertical-menu">
	  <a href="<?php echo site_url("users/cart"); ?>">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("users/account"); ?>" class="active">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>">Детайли</a>
	</div>
    <div class="account-info">
		<div class="profile_tab_title">Настройки</div>
		<hr>
		<h3>Промяна на парола</h3>
		</br>
		 <?php
			if(!empty($this->session->userdata('success_msg'))){
				echo '<p class="statusMsg">' . $this->session->userdata('success_msg') . '</p>';
				$this->session->unset_userdata('success_msg');
			} elseif(!empty($this->session->userdata('error_msg'))) {
				echo '<p class="statusMsg">' . $this->session->userdata('error_msg') . '</p>';
				$this->session->unset_userdata('error_msg');
			}
		?>
		
		<form action="<?php echo site_url("users/update_password"); ?>" method="post" class="form-horizontal login_register_form" style="width: 100%;">
		
			<div class="form-group <?php if(form_error('old_password') == true) { echo "has-error has-feedback"; } ?>">
			  <label class="col-sm-1 control-label" for="password">Стара парола*:</label>
			  <div class="col-sm-8">
				<input type="password" class="form-control" id="old_password" name="old_password">
				<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('old_password') == true) { echo "style='display:inline-block;'"; } ?>></span>
				<?php echo form_error('old_password','<span class="help-block">','</span>'); ?>
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
			 <div class="form-group form_submit">
				<button type="submit" value="Промени" id="passwordSubmit" name="passwordSubmit" class="btn btn-primary form_submit_button register">Промени</button>
			</div>   
		</form>
		
		<h3>Промяна на име и имейл</h3>
		</br>
		<form action="<?php echo site_url("users/update_name_email"); ?>" method="post" class="form-horizontal login_register_form" style="width: 100%;">
			<div class="form-group <?php if(form_error('name') == true) { echo "has-error has-feedback"; } ?>">
			  <label class="col-sm-1 control-label" for="name">Име:</label>
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
			  <label class="col-sm-1 control-label" for="email">Имейл:</label>
			  <div class="col-sm-8">
				<input type="text" class="form-control" id="email" name="email" value="<?php echo !empty($user['email']) ? htmlspecialchars($user['email'], ENT_QUOTES) : ''; ?>">
				<span class="glyphicon glyphicon-remove form-control-feedback" <?php if(form_error('email') == true) { echo "style='display:inline-block;'"; } ?>></span>
				<?php echo form_error('email','<span class="help-block">','</span>'); ?>
			  </div>
			</div></br>
			 <div class="form-group form_submit">
				<button type="submit" value="Промени" id="nameEmailSubmit" name="nameEmailSubmit" class="btn btn-primary form_submit_button register">Промени</button>
			</div>   
		</form>
    </div>
</div>

<?php require 'footer.php'; ?>

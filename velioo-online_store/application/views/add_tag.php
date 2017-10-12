<?php include 'dashboard_header.php'; ?>

<div id="body" style="width: 100%;">

<div class="vertical-menu employee">
	  <a href="<?php echo site_url("employees/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("employees/dashboard"); ?>">Продукти</a>
	  <a href="<?php echo site_url("employees/tags"); ?>" class="active">Тагове</a>
</div>

<div class="account-info employee">
	<div class="profile_tab_title">Добави таг</div>
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

	<form action="<?php echo site_url("tags/insert_tag"); ?>" method="post" enctype="multipart/form-data">
        <div class="form-group">
			<label for="name">Име на тага:</label>
            <input type="text" class="form-control" name="name" id="name" placeholder="*Име" required="" value="<?php echo !empty($tag['name']) ? htmlentities($tag['name']) : ''; ?>">
            <?php echo form_error('name','<span class="help-block">','</span>'); ?>
        </div>
        <div class="form-group">
            <input type="submit" name="tagSubmit" class="btn-primary" value="Добави"/>
        </div>
    </form>
	
</div>
</div>

<?php include 'dashboard_footer.php'; ?>



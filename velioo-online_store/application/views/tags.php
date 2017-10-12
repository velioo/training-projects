<?php include 'dashboard_header.php'; ?>

<script src="<?php echo asset_url() . "js/delete_tag.js"; ?>"></script>

<script>
	
	function getDeleteTagUrl() {
		var url = "<?php echo site_url("tags/delete_tag"); ?>";
		return url;
	}

</script>

<div id="body" style="width: 100%;">

<div class="vertical-menu employee">
	  <a href="<?php echo site_url("employees/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("employees/dashboard"); ?>">Продукти</a>
	  <a href="<?php echo site_url("employees/tags"); ?>" class="active">Тагове</a>
</div>

<div class="account-info employee">
	<div class="profile_tab_title">Тагове</div>
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
	
	<a href="<?php echo site_url("employees/add_tag"); ?>">Добави нов таг</a>
	
	<div class="table-responsive">          
	  <table class="table">
		<thead>
		  <tr>
			<th>Име</th>
			<th>Създаден на</th>
			<th>Премахни</th>
		  </tr>
		</thead>
		<tbody>
		<?php if($tags) foreach($tags as $tag) { ?>
		  <tr data-id="<?php echo htmlentities($tag['id'], ENT_QUOTES); ?>">
			 <td><?php echo htmlentities($tag['name'], ENT_QUOTES); ?></td>
			 <td><?php echo htmlentities($tag['created_at'], ENT_QUOTES); ?></td>
			 <td>
				<a href="#" class="remove_tag" data-tag-name="<?php echo htmlentities($tag['name'], ENT_QUOTES) ?>">Премахни</a>
			</td>
		  </tr>	
		  <?php } ?>
		</tbody>
	  </table>
	</div>
	
	<div style="text-align:center;"><?php echo ($pagination) ? $pagination : ''; ?></div>
	
</div>
</div>

<?php include 'dashboard_footer.php'; ?>



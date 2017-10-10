<?php include 'dashboard_header.php'; ?>

<script src="<?php echo asset_url() . "easy_autocomplete/jquery.easy-autocomplete.min.js"; ?>"></script> 
<link rel="stylesheet" href="<?php echo asset_url() . "easy_autocomplete/easy-autocomplete.min.css"; ?>">
<script src="<?php echo asset_url() . "js/get_tags.js"; ?>"></script>

<script>
	
	function getTagsUrl() {
		var url = "<?php echo site_url("tags/get_tags"); ?>";
		return url;
	}
	
	function getCheckTagUrl() {
		var url = "<?php echo site_url("tags/check_tag"); ?>";
		return url;
	}
	
	$(document).on('click','.remove_tag',function(){
		$(this).prev().remove();
		$(this).remove();
	});

</script>

<div id="body" style="width: 100%;">

<div class="vertical-menu employee">
	  <a href="<?php echo site_url("employees/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("employees/dashboard"); ?>">Виж всички продукти</a>
	  <a href="<?php echo site_url("employees/add_product"); ?>" class="active">Добави продукт</a>
</div>

<div class="account-info employee">
	<div class="profile_tab_title">Добави продукт</div>
	<hr>
	
	<?php
		if(!empty($this->session->userdata('success_msg'))){
			echo '<p class="statusMsg">' . $this->session->userdata('success_msg') . '</p>';
			$this->session->unset_userdata('success_msg');
		} elseif(!empty($this->session->userdata('error_msg'))) {
			echo '<p class="statusMsg">' . $this->session->userdata('error_msg') . '</p>';
			$this->session->unset_userdata('error_msg');
		}
		
		echo isset($product['image_error']) ? '<p class="statusMsg">' . $product['image_error']['error'] . '</p>' : '';
	?>
	
	<form action="<?php echo site_url("products/insert_product"); ?>" method="post" enctype="multipart/form-data">
        <div class="form-group">
			<label for="name">Име на продукта:</label>
            <input type="text" class="form-control" name="name" id="name" placeholder="*Име" required="" value="<?php echo !empty($product['name']) ? htmlentities($product['name']) : ''; ?>">
            <?php echo form_error('name','<span class="help-block">','</span>'); ?>
        </div>
        <div class="form-group">
            <label for="description">Описание:</label>
			<textarea class="form-control" rows="5" id="description" name="description" placeholder="Описание"><?php echo !empty($product['description']) ? htmlentities($product['description']) : ''; ?></textarea>		
        </div>
        <div class="product_left" style="width:50%; display:inline-block;">
			<div class="form-group">
				 <label for="category_id">*Категория:</label>
				 <select name="category_id" id="category" class="form-control">
					<option value="" selected="selected">Избери категория</option>
					<?php foreach($categories as $category) { ?>
						<option value="<?php echo htmlentities($category['id']); ?>" <?php if(isset($product['category_id'])) { echo ($category['id'] == $product['category_id']) ? 'selected' : ''; }?> ><?php echo htmlentities($category['name']); ?></option>
					<?php } ?>
				 </select> 
				 <?php echo form_error('category_id','<span class="help-block">','</span>'); ?>
			</div>
			<div class="form-group">
				<label for="price_leva">*Цена в лв:</label>
				<input type="number" value="<?php echo !empty($product['price_leva']) ? htmlentities($product['price_leva']) : ''; ?>" min="0" step="0.01" name="price_leva" id="price_leva" />
				 <?php echo form_error('price_leva','<span class="help-block">','</span>'); ?>
			</div>
			<div class="form-group">
				<label for="quantity">*Брой:</label>
				<input type="number" value="<?php echo !empty($product['quantity']) ? htmlentities($product['quantity']) : '0'; ?>" min="0" step="1" name="quantity" id="quantity" />
				 <?php echo form_error('quantity','<span class="help-block">','</span>'); ?>
			</div>
			<div class="form-group">
				<label for="image">Изображение на продукта:</label>
				<input type="file" name="image" accept="image/*" size="20">
			</div>
			</br>
        </div>
        <div class="product_right">
			 <div class="form-group">
				<label for="image">Тагове:<span id="tag_error">Тагът не съществува</span><span id="tag_exists">Тагът вече е сложен</span></label>
				<input type="text" id="tag_input" placeholder="Enter tag name...">
			</div>
			<div id="tags_div">	
				<?php if(isset($tags)) { foreach($tags as $t) { ?>
					<input value="<?php echo $t; ?>" class="tag" name="tags[]" readonly="" style="width: 55px;" type="text"> <span class="glyphicon glyphicon-remove remove_tag"></span>
				<?php }} ?>
			</div>
		</div>
        <div class="form-group">
            <input type="submit" name="productSubmit" class="btn-primary" value="Добави"/>
        </div>
    </form>
	
</div>
</div>

<?php include 'dashboard_footer.php'; ?>



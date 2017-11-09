<?php require 'header.php'; ?>

<script src="<?php echo asset_url() . "js/filter_tags.js"; ?>"></script>
<div id="body">
<div id="wrap"></br>
<h2><?php if(isset($search_title)) echo htmlentities($search_title, ENT_QUOTES); else echo "Нови Продукти"; ?></h2>
<div class="container-fluid">
	
<?php if(isset($tags)) { ?>
<div class="filtering_menu">
	<form action="<?php echo(isset($category_id)) ? site_url("products/search/{$category_id}") : site_url("products/search/"); ?>" method="get" id="filter_form">	
	    <h4 class="filter_header">Цена:</h4>
		От: <input type="number" min="0" step="1" name="price_from" value="<?php if(isset($price_from)) echo htmlentities($price_from, ENT_QUOTES); else echo ""; ?>">
		До: <input type="number" min="0" step="1" name="price_to" value="<?php if(isset($price_to)) echo htmlentities($price_to, ENT_QUOTES); else echo ""; ?>"></br></br>
		<input type="submit" value="Търси">
		<h4 class="filter_header">Избери:</h4>
		<?php if(isset($tags) && $tags) foreach($tags as $key => $value) { ?>
			<p class="filter_name"><?php echo htmlentities($key, ENT_QUOTES); ?></p>
			<?php foreach($value as $tag) { ?>
				<div class="checkbox"><label><input type="checkbox" class="checkbox_tag" name="tags[]" <?php if(array_key_exists('checked', $tag)) echo "checked='checked'"; ?> value="<?php echo htmlentities($key, ENT_QUOTES) . ':' . $tag['value']; ?>"><?php echo htmlentities($tag['value'], ENT_QUOTES) . ' (' . htmlentities($tag['count'], ENT_QUOTES) . ')'; ?></label></div>				
			<?php } ?>
		<?php } ?>
		<input type="hidden" name="search_input" value="<?php if(isset($search_input)) echo htmlentities($search_input, ENT_QUOTES); ?>">
</div>	 
<?php } ?>

<div class="products_div" <?php if(!isset($tags)) echo 'style="width:100%;"'; ?> >	
    <?php if(isset($tags)) { ?> 
		Подреди по <select name="sort_products" id="sort_products">
			<option value="most_buyed" <?php if(isset($sort_products) && $sort_products == 'most_buyed' || isset($sort_products) && $sort_products == null || !isset($sort_products)) echo 'selected="selected"'; ?>>Най-продавани</option>
			<option value="price_asc" <?php if(isset($sort_products) && $sort_products == 'price_asc') echo 'selected="selected"'; ?>>Цена възх.</option>
			<option value="price_desc" <?php if(isset($sort_products) && $sort_products == 'price_desc') echo 'selected="selected"'; ?>>Цена низх.</option>
			<option value="newest" <?php if(isset($sort_products) && $sort_products == 'newest') echo 'selected="selected"'; ?>>Най-нови</option>
		</select>
		</form>
	<?php } ?>
	<div class="row row-eq-height">
		  
	  <?php $row = 0; if(isset($products) && $products) foreach($products as $p) { ?>	  
		 <?php if($row % 4 == 0 && $row != 0) { ?>
			</div>
			<div class="row row-eq-height">
		 <?php } ?>
		<div class="col-sm-3 product" data-id="<?php echo htmlspecialchars($p['id'], ENT_QUOTES); ?>">
			<a href="<?php echo site_url("products/product") . "/" . htmlentities($p['id'], ENT_QUOTES); ?>"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="product_image" <?php if(!isset($tags)) echo 'style="max-width:220px;max-height:220px;"' ?>></a></br></br>
			<a href="<?php echo site_url("products/product") . "/" . htmlentities($p['id'], ENT_QUOTES); ?>" class="product_name no_underline">Име: <?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></a></br>
			<a href="<?php echo site_url("products/search") . "/" . htmlentities($p['category_id'], ENT_QUOTES); ?>" class="product_category no_underline">Категория: <?php echo htmlspecialchars($p['category'], ENT_QUOTES); ?></a></br>		
			<div class="product_price"><p style="font-size: 18px;">Цена: <?php echo number_format(htmlspecialchars($p['price_leva'], ENT_QUOTES), 2) . " лв."; ?></p></div>	
			<?php if($p['quantity'] >= 1) echo "<p style='color:blue;'>В наличност</p>"; else echo "<p style='color:red;'>Няма наличност</p>"; ?>	
			<?php if($p['quantity'] != 0) { ?><button type="button" class="btn btn-default buy_button"><span class="glyphicon glyphicon-shopping-cart"></span> Купи</button> <?php } ?>
		</div>
	  <?php $row++; } else echo "Няма налични продукти в момента."?>
	  
	</div>
	</br></br>
	<div style="text-align:center;">
		<?php if(isset($pagination)) echo $pagination; ?>
	</div>
</div>
</div> 

</div>
</div>

<?php require 'footer.php'; ?>

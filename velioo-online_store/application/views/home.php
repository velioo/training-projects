<?php require 'header.php'; ?>

<script src="<?php echo asset_url() . "js/get_filter_tags.js"; ?>"></script>

<script>

	function getFilterTags() {
		var tags = <?php echo json_encode($tags); ?>;
		return tags;
	}

</script>

<div id="body">
<div id="wrap"></br>
<h2>Нови продукти</h2>
<div class="container-fluid">
	
<?php if(isset($category_id)) { ?>
<div class="filtering_menu">
	<form action="<?php echo(isset($category_id)) ? site_url("products/search/{$category_id}") : site_url("products/search/"); ?>" method="get" id="filter_form">	
	<b><p class="filter_name">Капацитет</p></b>
	</form>
</div>	 
<?php } ?>

<div class="products_div" <?php if(!isset($category_id)) echo 'style="width:100%;"' ?>>	 
	 
	<div class="row row-eq-height">
		  
	  <?php $row = 0; if($products) foreach($products as $p) { ?>	 
		 <?php if($row % 4 == 0 && $row != 0) { ?>
			</div>
			<div class="row row-eq-height">
		 <?php } ?>
		 
		<div class="col-sm-3 product" data-id="<?php echo htmlspecialchars($p['id'], ENT_QUOTES); ?>">
			<a href="#"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="product_image" <?php if(!isset($category_id)) echo 'style="max-width:220px;max-height:220px;"' ?>></a></br></br>
			<a href="#" class="product_name no_underline">Име: <?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></a></br>
			<a href="#" class="product_category no_underline">Категория: <?php echo htmlspecialchars($p['category'], ENT_QUOTES); ?></a></br>		
			<div class="product_price"><p style="font-size: 18px;">Цена: <?php echo htmlspecialchars($p['price_leva'], ENT_QUOTES) . " лв."; ?></p></div>	
			<?php if($p['quantity'] >= 1) echo "<p style='color:blue;'>В наличност</p>"; else echo "<p style='color:red;'>Няма наличност</p>"; ?>	
			<?php if($p['quantity'] != 0) { ?><button type="button" class="btn btn-default buy_button"><span class="glyphicon glyphicon-shopping-cart"></span> Купи</button> <?php } ?>
		</div>

	  <?php $row++; } else echo "Няма налични продукти в момента."?>
	  
	</div>

</div>

<div style="text-align:center;">
	<?php if(isset($pagination)) echo $pagination; ?>
</div>
</div> 

</div>
</div>

<?php require 'footer.php'; ?>

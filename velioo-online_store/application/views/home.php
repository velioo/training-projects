<?php require 'header.php'; ?>

<div id="body">
<div id="wrap"></br>
<h2>Нови продукти</h2>
<div class="container-fluid">
	 
<div class="row row-eq-height">
	  
  <?php $row = 0; if($products) foreach($products as $p) { ?>	 
	 <?php if($row % 4 == 0 && $row != 0) { ?>
		</div>
		<div class="row row-eq-height">
	 <?php } ?>
	 
	<div class="col-sm-3 product" data-id="<?php echo htmlspecialchars($p['id'], ENT_QUOTES); ?>">
		<a href="#"><img src="<?php echo ($p['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($p['image'], ENT_QUOTES) : ""; ?>" onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="product_image"></a></br></br>
		<a href="#" class="product_name no_underline">Име: <?php echo htmlspecialchars($p['name'], ENT_QUOTES); ?></a></br>
		<a href="#" class="product_category no_underline">Категория: <?php echo htmlspecialchars($p['category'], ENT_QUOTES); ?></a></br>		
		<div class="product_price"><p style="font-size: 18px;">Цена: <?php echo htmlspecialchars($p['price_leva'], ENT_QUOTES) . " лв."; ?></p></div>	
		<?php if($p['quantity'] >= 1) echo "<p style='color:blue;'>В наличност</p>"; else echo "<p style='color:red;'>Няма наличност</p>"; ?>	
		<?php if($p['quantity'] != 0) { ?><button type="button" class="btn btn-default buy_button"><span class="glyphicon glyphicon-shopping-cart"></span> Купи</button> <?php } ?>
	</div>

  <?php $row++; } else echo "Няма налични продукти в момента."?>
  
</div>

<div style="text-align:center;">
	<?php if(isset($pagination)) echo $pagination; ?>
</div>
</div> 

</div>
</div>

<?php require 'footer.php'; ?>

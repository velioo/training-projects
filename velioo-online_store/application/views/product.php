<?php require 'header.php'; ?>

<div id="body">
	<div id="wrap"></br>
		<h2><?php if(isset($product['name'])) echo htmlentities($product['name'], ENT_QUOTES); ?></h2>
		<hr>
		<div class="container-fluid">
			
			<div class="product_left">	
				<img src="<?php echo ($product['image'] != '') ? asset_url() . "imgs/" . htmlspecialchars($product['image'], ENT_QUOTES) : ""; ?>" 
					onerror="this.src='<?php echo asset_url() . "imgs/no_image.png" ?>';" class="product_image details">
			</div>

			<div class="product_right details" data-id="<?php echo htmlspecialchars($product['id'], ENT_QUOTES); ?>">	
				<div class="product_price">
					<p class="product_price_details">Цена: <?php if($product['price_leva']) echo number_format(htmlspecialchars($product['price_leva'], ENT_QUOTES), 2) . " лв."; ?></p>
				</div>	
				<?php if($product['quantity']) if($product['quantity'] >= 1) echo "<p style='color:blue;'>В наличност</p>"; else echo "<p style='color:red;'>Няма наличност</p>"; ?>	
				<?php if($product['quantity']) if($product['quantity'] != 0) { ?><button type="button" class="btn btn-default buy_button details"><span class="glyphicon glyphicon-shopping-cart"></span> Добави в количката</button> <?php } ?>
			</div>
			
			<div class="table-responsive">   
				<table class="table product_details_table" width="100%">
				<thead>
				  <tr>
					<th></th>
					<th></th>
				  </tr>
				</thead>
				<tbody>
				<?php if(isset($product['specs']) && $product['specs']) foreach($product['specs'] as $spec) { ?>
				  <tr>
					<td class="spec_name"><?php echo htmlspecialchars($spec['name'], ENT_QUOTES); ?></td>
					<td><?php echo htmlspecialchars($spec['value'], ENT_QUOTES); ?></td>
				  </tr>
				  <?php } ?>
				</tbody>
			  </table>
			</div>

		</div>

	</div>
</div>

<?php require 'footer.php'; ?>

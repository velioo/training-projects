<?php require 'header.php'; ?>

<div id="body">
	
<h2>Поръчката ви е успешно създадена</h2>	
	 <div class="vertical-menu">
	  <a href="<?php echo site_url("users/cart"); ?>">Количка</a>
	  <a href="<?php echo site_url("users/orders"); ?>">Поръчки</a>
	  <a href="<?php echo site_url("users/account"); ?>">Настройки</a>
	  <a href="<?php echo site_url("users/details"); ?>">Детайли</a>
	</div>
	
	<div class="account-info">
		<hr>		
		<p stlye="font-size:15px;"><?php if($payment_details) { echo "<b>" . $payment_details['details'] . "</b>"; } ?></br>Може да отнеме 1-2 дена докато потвърдим плащането, след което поръчката Ви ще бъде изпратена на посоченият от вас адрес.</p>
	</div>
</div>

<?php require 'footer.php'; ?>

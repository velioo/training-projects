$(document).ready(function() {
	
	infoLog += '\ncart.js loaded\n';
	
	var addToCartUrl = getAddToCartUrl();
	var changeQuantityUrl = getChangeQuantityUrl();
	var removeFromCartUrl = getRemoveFromCartUrl();
	var cartCountPriceUrl = getCartCountPriceUrl();
	var redirectUrl = getRedirectUrl();
	
	update_cart();
	
	$('.buy_button').on('click', function() {	
		add_to_cart($(this));
	});
	
	$('.remove_product').on('click', function() {

		infoLog += '\ncart.js/.remove_product: Executing... \n';
		
		if (confirm('Сигурни ли сте, че искате да премахнете продукта.')) {
			
			infoLog += 'cart.js/.remove_product: Agreed to remove product\n';
			
			var productId = $(this).parent().parent().data('id');
			
			if (productId === parseInt(productId, 10)) {
			
				infoLog += 'cart.js/.remove_product: Product id = ' + productId + '\n';
				assert(productId === parseInt(productId, 10), 'cart.js/.remove_product:\nAssert Error: productId must be integer');
				
				var product = $(this).parent().parent();
				
				infoLog += 'cart.js/.remove_product: Sending request to ' + removeFromCartUrl + ' with params: productId = ' + productId + '\n';
				$.post(removeFromCartUrl, {productId: productId}, function(data, status) {
					if(data) {
						if(data != 'login') {
							infoLog += 'cart.js/.remove_product: Reqest successfull\n';
							update_cart();
							product.remove();
							if($('.remove_product').length <= 0) {
								$('.cart_purchase_div').remove();
								$("<h3>Нямате продукти в кошницата</h3>").insertBefore(".table-responsive");
							}
						} else {
							infoLog += 'cart.js/.remove_product: User trying to delete product while not logged in. Redirecting to users/login\n';
							window.location.href = redirectUrl;
						}			
						
					} else {
						infoLog += 'cart.js/.remove_product: Request failed\n';
						window.alert("Имаше проблем в обработването на заявката ви.");
					}
					
					logger.info(infoLog);
					infoLog = "";
				});
			
			} else {
				infoLog += 'cart.js/.remove_product: Product id is not integer: ' + productId + '\n';
				logger.info(infoLog);
				infoLog = "";
				window.alert("Имаше проблем в обработването на заявката ви.");
			}
		}

	});
	
	$('.input_change_count').on('change', function() {
		infoLog += '\ncart.js/.input_change_count: Executing: ' + arguments.callee.name + '()\n';
		var val = parseInt($(this).val(), 10);
		infoLog += 'cart.js/.input_change_count: Invoking function change_cart($(this)' + ',, ' + val + ')\n';
		change_cart($(this), val);
	});
	
	function update_cart() {

		infoLog += '\ncart.js/update_cart(): Executing: ' + arguments.callee.name + '()\n';
		infoLog += 'cart.js/update_cart(): Sending request to ' + cartCountPriceUrl + '\n';
		$.post(cartCountPriceUrl, function(data, status) {
			if(data) {				
				infoLog += 'cart.js/update_cart(): Request returned data\n';
				assert(data[0].count == parseInt(data[0].count, 10), 'cart.js/update_cart():\nAssert Error: data[0].count must be integer');
				assert(!isNaN(data[0].price_leva) && data[0].price_leva.toString().indexOf('.') != -1, 'cart.js/update_cart():\nAssert Error: data[0].price_leva must be float');
				$('#cart_count_price').text(data[0].count + " артикул(а) - " + formatter.format(data[0].price_leva) + " лв.");	
				if($('.cart_sum').length > 0) {
					$('.cart_sum').text(formatter.format(data[0].price_leva));
				}	
				infoLog += 'cart.js/update_cart(): Cart update successfull\n';
			} else {
				infoLog += 'cart.js/update_cart(): Request didn\'t return anything\n';
			}
			logger.info(infoLog);
			infoLog = "";
		});

	}	
	
	function add_to_cart(e) {
		
		infoLog += '\ncart.js/add_to_cart(): Executing: ' + arguments.callee.name + '()\n';		
		var productId = e.parent().data('id');
		
		if (productId === parseInt(productId, 10)) {
		
			assert(productId === parseInt(productId, 10), 'cart.js/add_to_cart:\nAssert Error: productId must be integer');	
			
			infoLog += 'cart.js/add_to_cart(): Sending request to ' + addToCartUrl + ' with params: productId = ' + productId + '\n';	
			$.post(addToCartUrl, {productId: productId}, function(data, status) {
				if(data) {
					if(data != 'login') {
						infoLog += 'cart.js/add_to_cart(): Reqest successfull\n';
						update_cart();
						window.alert("Продуктът е добавен успешно в количката.");
					} else {
						infoLog += 'cart.js/add_to_cart(): User trying to add to items to cart while not logged in. Redirecting to ' + redirectUrl + '\n';
						window.location.href = redirectUrl;
					}			
					
				} else {
					infoLog += 'cart.js/add_to_cart(): Reqest failed\n';
					window.alert("Имаше проблем в обработването на заявката ви.");
				}
			});
		} else {
			infoLog += 'cart.js/add_to_cart(): ProductId is not integer';
			window.alert("Имаше проблем в обработването на заявката ви.");
		}
	}
		
	function change_cart(e, quantity) {
		
		infoLog += '\ncart.js/change_cart(): Executing: ' + arguments.callee.name + '()\n';		
		var productId = e.parent().parent().data('id');
		infoLog += 'cart.js/change_cart(): Product id =  ' + productId + ' quantity = ' + quantity + '\n';
		
		if((productId === parseInt(productId, 10)) && (quantity === parseInt(quantity, 10))) {
			 
			assert(productId === parseInt(productId, 10), 'cart.js/change_cart():\nAssert Error: productId must be integer'); 
			assert(quantity === parseInt(quantity, 10), 'cart.js/change_cart():\nAssert Error: quantity must be integer'); 
			 
			if(quantity > 0) {
			
				assert(quantity > 0, 'cart.js/change_cart():\nAssert Error: quantity must be > 0');
				
				infoLog += 'cart.js/change_cart(): Sending request to ' + changeQuantityUrl + ' with params: productId = ' + productId + ', quantity = ' + quantity +'\n';
				$.post(changeQuantityUrl, {productId: productId, quantity: quantity}, function(data, status) {
					if(data) {
						if(data != 'login') {
							infoLog += 'cart.js/change_cart(): Reqest successfull\n';
							update_cart();
							e.parent().parent().find('.cart_product_sum_td').text(formatter.format(data.quantity * data.price_leva));
							//window.alert("Продуктът е добавен успешно в количката.");
						} else {
							infoLog += 'cart.js/change_cart(): User trying to change cart while not logged in. Redirecting to ' + redirectUrl + '\n';
							window.location.href = redirectUrl;
						}			
						
					} else {
						infoLog += 'cart.js/change_cart(): Reqest failed\n';
						window.alert("Имаше проблем в обработването на заявката ви.");
					}
					logger.info(infoLog);
					infoLog = "";
				});
			} else {
				infoLog += 'cart.js/change_cart(): Quantity is <= 0. Changing input value to 1\n';
				logger.info(infoLog);
				infoLog = "";
				e.val(1);
			}
	  } else {
		  infoLog += 'cart.js/change_cart(): Product id or/and quantity is not integer\n';
		  logger.info(infoLog);
		  infoLog = "";
		  window.alert("Имаше проблем в обработването на заявката ви.");
	  }
	}
	
	var formatter = new Intl.NumberFormat('en-US', {
		style: 'decimal', 
		maximumFractionDigits : 2, 
		minimumFractionDigits : 2 
	});
	
});

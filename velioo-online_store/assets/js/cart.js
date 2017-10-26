$(document).ready(function() {
	
	var logger = getLogger();
	var infoLog = "";
	
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

		infoLog += '\nExecuting: ' + arguments.callee.name + '\n';
		infoLog += 'Clicked on .remove_product\n';
		
		if (confirm('Сигурни ли сте, че искате да премахнете продукта.')) {
			
			infoLog += 'Agreed to remove product\n';
			
			var productId = $(this).parent().parent().data('id');
			
			if (productId === parseInt(productId, 10)) {
			
				infoLog += 'Product id = ' + productId + '\n';
				assert(productId === parseInt(productId, 10), 'Assert Error: productId must be integer');
				
				var product = $(this).parent().parent();
				
				infoLog += 'Sending request to ' + removeFromCartUrl + ' with params: productId = ' + productId + '\n';
				$.post(removeFromCartUrl, {productId: productId}, function(data, status) {
					if(data) {
						if(data != 'login') {
							infoLog += 'Reqest successfull\n';
							update_cart();
							infoLog += 'Cart update successfull\n';
							product.remove();
							if($('.remove_product').length <= 0) {
								$('.cart_purchase_div').remove();
								$("<h3>Нямате продукти в кошницата</h3>").insertBefore(".table-responsive");
							}
						} else {
							infoLog += 'User trying to delete product while not logged in. Redirecting to users/login\n';
							window.location.href = redirectUrl;
						}			
						
					} else {
						infoLog += 'Request failed\n';
						window.alert("Имаше проблем в обработването на заявката ви.");
					}
					
					logger.info(infoLog);
					infoLog = "";
				});
			
			} else {
				infoLog += 'product id is not integer: ' + productId + '\n';
				if(infoLog != '' && caller == '') {
					logger.info(infoLog);
					infoLog = "";
				}
			}
		}

	});
	
	$('.input_change_count').on('change', function() {
		change_cart($(this), $(this).val());
	});
	
	function update_cart() {

		infoLog += '\nExecuting: ' + arguments.callee.name + '\n';
		infoLog += 'Sending request to ' + cartCountPriceUrl + '\n';
		$.post(cartCountPriceUrl, function(data, status) {
			if(data) {				
				infoLog += 'Request returned data\n';
				assert(data[0].count == parseInt(data[0].count, 10), 'Assert Error: data[0].count must be integer');
				assert(!isNaN(data[0].price_leva) && data[0].price_leva.toString().indexOf('.') != -1, 'Assert Error: data[0].price_leva must be float');
				$('#cart_count_price').text(data[0].count + " артикул(а) - " + formatter.format(data[0].price_leva) + " лв.");	
				if($('.cart_sum').length > 0) {
					$('.cart_sum').text(formatter.format(data[0].price_leva));
				}	
			} else {
				infoLog += 'Request didn\'t return anything\n';
			}
			logger.info(infoLog);
			infoLog = "";
		});

	}	
	
	function add_to_cart(e) {
		var product_id = e.parent().data('id');
		$.post(addToCartUrl, {product_id: product_id}, function(data, status) {
			if(data) {
				if(data != 'login') {
					update_cart();
					window.alert("Продуктът е добавен успешно в количката.");
				} else {
					window.location.href = redirectUrl;
				}			
				
			} else {
				window.alert("Имаше проблем в обработването на заявката ви.");
			}
		});
	}
		
	function change_cart(e, quantity) {
		var product_id = e.parent().parent().data('id');
		if(quantity > 0) { 
			$.post(changeQuantityUrl, {product_id: product_id, quantity:quantity}, function(data, status) {
				if(data) {
					if(data != 'login') {
						update_cart();
						e.parent().parent().find('.cart_product_sum_td').text(formatter.format(data.quantity * data.price_leva));
						//window.alert("Продуктът е добавен успешно в количката.");
					} else {
						window.location.href = redirectUrl;
					}			
					
				} else {
					window.alert("Имаше проблем в обработването на заявката ви.");
				}
			});
		} else {
			e.val(1);
		}
	}
	
	var formatter = new Intl.NumberFormat('en-US', {
		style: 'decimal', 
		maximumFractionDigits : 2, 
		minimumFractionDigits : 2 
	});
	
});

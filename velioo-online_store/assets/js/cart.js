$(document).ready(function() {
	
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
		
		if (confirm('Сигурни ли сте, че искате да премахнете продукта.')) {
			var product_id = $(this).parent().parent().data('id');
			var product = $(this).parent().parent();
			$.post(removeFromCartUrl, {product_id: product_id}, function(data, status) {
				if(data) {
					if(data != 'login') {
						update_cart();
						product.remove();
					} else {
						window.location.href = redirectUrl;
					}			
					
				} else {
					window.alert("Имаше проблем в обработването на заявката ви.");
				}
			});
		}
	});
	
	$('.input_change_count').on('change', function() {
		change_cart($(this), $(this).val());
	});
	
	function update_cart() {
		$.post(cartCountPriceUrl, function(data, status) {
			if(data) {
				$('#cart_count_price').text(data[0].count + " артикул(а) - " + formatter.format(data[0].price_leva) + " лв.");	
				if($('.cart_sum').length > 0) {
					$('.cart_sum').text(formatter.format(data[0].price_leva));
				}	
			} 
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

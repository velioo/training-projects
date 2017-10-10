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
		
		var product_id = $(this).parent().data('id');
		var self = $(this).parent();
		$.post(removeFromCartUrl, {product_id: product_id}, function(data, status) {
			if(data) {
				if(data != 'login') {
					update_cart();
					self.next().remove();
					self.remove();
					window.alert("Продуктът е премахнат успешно от количката.");
				} else {
					window.location.href = redirectUrl;
				}			
				
			} else {
				window.alert("Имаше проблем в обработването на заявката ви.");
			}
		});
	});
	
	$('.input_change_count').on('change', function() {
		change_cart($(this), $(this).val());
	});
	
	function update_cart() {
		$.post(cartCountPriceUrl, function(data, status) {
			if(data) {
				$('#cart_count_price').text(data[0].count + " артикул(а) - " + data[0].price_leva + " лв.");	
				if($('.cart_sum').length > 0) {
					$('.cart_sum').text("Обща сума: " + data[0].price_leva + " лв.");
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
						e.parent().parent().find('.product_price_p').text('Цена: ' + (data.quantity * data.price_leva) + ' лв.');
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
	
});

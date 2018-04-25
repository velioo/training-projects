$(document).ready(() => {
  logger.info(`cart.js loaded`);

  // rewrite
  var addToCartUrl = getAddToCartUrl();
  var changeQuantityUrl = getChangeQuantityUrl();
  var removeFromCartUrl = getRemoveFromCartUrl();
  var cartCountPriceUrl = getCartCountPriceUrl();
  var redirectUrl = getRedirectUrl();
  var userLoggedIn = isUserLoggedIn();

  if (userLoggedIn === true) {
    updateCart();
  }

  $(`.buy_button`).on(`click`, function () {
    addToCart($(this));
  });

  $(`.remove_product`).on(`click`, function () {
    if ($(`.purchase_button`).length > 0) {
      $(`.purchase_button`).prop(`disabled`, true);
    }

    if ($(`#paymentSubmit`).length > 0) {
      $(`#paymentSubmit`).prop(`disabled`, true);
    }

    logger.info(`cart.js/.remove_product: Executing... `);

    if (confirm(`Сигурни ли сте, че искате да премахнете продукта.`)) {
      logger.info(`cart.js/.remove_product: Agreed to remove product`);

      var productId = $(this).parent().parent().data(`id`);

      if (productId === parseInt(productId)) {
        logger.info(`cart.js/.remove_product: Product id = ` + productId);

        assert(productId === parseInt(productId),
          `cart.js/.remove_product:\nAssert Error: productId must be integer`);

        var product = $(this).parent().parent();

        logger.info(`cart.js/.remove_product: Sending request to ` +
          removeFromCartUrl + ` with params: productId = ` + productId);

        $.ajax({
          type: `POST`,
          async: true,
          url: removeFromCartUrl,
          data: {
            productId: productId
          },
          dataType: `json`,
          success: function (data, status) {
            assert(data === true);

            logger.info(`cart.js/.remove_product: Request successfull`);

            updateCart();

            product.remove();

            if ($(`.remove_product`).length <= 0) {
              $(`.cart_purchase_div`).remove();
              $(`<h3>Нямате продукти в кошницата</h3>`)
                .insertBefore(`.table-responsive`);
            }
          },
          error: failHandler,
          timeout: 10000
        });
      } else {
        logger.info(`cart.js/.remove_product: Product id is not integer: ` +
          productId);

        window.alert(`Имаше проблем в обработването на заявката ви.`);
      }
    }
  });

  var delayTimer;
  var requestsInProcess = 0;

  $(`.input_change_count`).on(`change`, function () {
    var self = $(this);

    clearTimeout(delayTimer);

    if ($(`.purchase_button`).length > 0) {
      $(`.purchase_button`).prop(`disabled`, true);
    }

    if ($(`#paymentSubmit`).length > 0) {
      $(`#paymentSubmit`).prop(`disabled`, true);
    }

    delayTimer = setTimeout(function () {
      requestsInProcess++;

      logger.info(`cart.js/.input_change_count: Executing...`);

      var val = parseInt($(self).val());

      logger.info(`cart.js/.input_change_count: Invoking function changeCart($(this)` +
        `,, ` + val + `)`);

      changeCart($(self), val);
    }, 500);
  });

  function updateCart () {
    logger.info(`cart.js/updateCart(): Executing...`);
    logger.info(`cart.js/updateCart(): Sending request to ` + cartCountPriceUrl);

    $(`.spinner.cart`).show();
    if ($(`.cart_sum`).length > 0) {
      $(`.spinner.order_sum`).show();
    }

    $.ajax({
      type: `POST`,
      async: true,
      url: cartCountPriceUrl,
      dataType: `json`,
      success: function (data, status) {
        logger.info(`cart.js/updateCart(): Request returned data`);
        logger.info(`cart.js/updateCart(): Checking if returned data is valid JSON...`);

        assert(ajv.validate(updateCartSchema, data), 'Request didn\'t return a valid JSON object' +
          JSON.stringify(ajv.errors, null, 2));

        logger.info(`cart.js/updateCart(): Data is valid JSON`);

        $(`#cart_count_price`).text(data.count + ` артикул(а) - ` +
          formatter.format(data.price_leva) + ` лв.`);

        if ($(`.cart_sum`).length > 0) {
          $(`.cart_sum`).text(formatter.format(data.price_leva));
          $(`.spinner.order_sum`).hide();
        }

        logger.info(`cart.js/updateCart(): Cart update successfull`);

        if (requestsInProcess > 0) {
          requestsInProcess--;
        }

        if (requestsInProcess === 0) {
          if ($(`.purchase_button`).length > 0) {
            $(`.purchase_button`).prop(`disabled`, false);
          }

          if ($(`#paymentSubmit`).length > 0) {
            $(`#paymentSubmit`).prop(`disabled`, false);
          }
        }

        $(`.spinner.cart`).css(`margin-top`, `-42px`);
        $(`.spinner.cart`).css(`margin-left`, `40px`);
        $(`.spinner.cart`).hide();
      },
      error: failHandler,
      timeout: 10000
    });
  }

  function addToCart (element) {
    logger.info(`cart.js/addToCart(): Executing...`);

    var productId = element.parent().data(`id`);

    if (productId === parseInt(productId)) {
      assert(productId === parseInt(productId),
        `cart.js/addToCart:\nAssert Error: productId must be integer`);

      logger.info(`cart.js/addToCart(): Sending request to ` + addToCartUrl +
        ` with params: productId = ` + productId);

      $(element).parent().find(`.spinner.buy`).show();

      $.ajax({
        type: 'POST',
        async: true,
        url: addToCartUrl,
        data: {
          productId: productId
        },
        dataType: 'json',
        success: function (data, status) {
          assert(ajv.validate(addToCartSchema, data), 'Request didn\'t return a valid JSON object' +
            JSON.stringify(ajv.errors, null, 2));

          logger.info(`cart.js/addToCart(): Reqest successfull`);

          updateCart();

          $(element).parent().find(`.spinner.buy`).hide();

          window.alert(`Продуктът е добавен успешно в количката.`);
        },
        error: failHandler,
        timeout: 10000
      });
    } else {
      logger.info(`cart.js/addToCart(): ProductId is not integer`);

      window.alert(`Имаше проблем в обработването на заявката ви.`);
    }
  }

  function changeCart (element, quantity) {
    logger.info(`cart.js/changeCart(): Executing...`);

    var productId = element.parent().parent().data(`id`);

    logger.info(`cart.js/changeCart(): Product id =  ` + productId + ` quantity = ` +
      quantity);

    if ((productId === parseInt(productId)) && (quantity === parseInt(quantity))) {
      assert(productId === parseInt(productId),
        `cart.js/changeCart():\nAssert Error: productId must be integer`);
      assert(quantity === parseInt(quantity),
        `cart.js/changeCart():\nAssert Error: quantity must be integer`);

      if (quantity <= 0) {
        quantity = 1;

        logger.info(`cart.js/changeCart(): Quantity is <= 0. Changing input value to 1`);

        element.val(1);
      }

      assert(quantity > 0, `cart.js/changeCart():\nAssert Error: quantity must be > 0`);

      logger.info(`cart.js/changeCart(): Sending request to ` + changeQuantityUrl +
        ` with params: productId = ` + productId + `, quantity = ` + quantity);

      $(element).parent().find(`.spinner.changeCart`).show();

      $.ajax({
        type: `POST`,
        async: true,
        url: addToCartUrl,
        data: { productId: productId, quantity: quantity },
        dataType: `json`,
        success: function (data, status) {
          logger.info(`cart.js/changeCart(): Request returned data`);
          logger.info(`cart.js/changeCart(): Checking if returned data is valid JSON...`);

          assert(ajv.validate(addToCartSchema || typeof data === 'string', data),
            'Request didn\'t return a valid JSON object' +
          JSON.stringify(ajv.errors, null, 2));

          logger.info(`cart.js/changeCart(): Reqest successfull`);

          updateCart();

          element.parent().parent().find(`.cart_product_sum_td`)
            .text(formatter.format(data.quantity * data.price_leva));

          $(element).parent().find(`.spinner.changeCart`).hide();
        },
        error: failHandler
      });
    } else {
      logger.info(`cart.js/changeCart(): Product id or/and quantity is not integer`);

      window.alert(`Имаше проблем в обработването на заявката ви.`);
    }
  }

  function failHandler (xhr, status, errorThrown) {
    if (status === `timeout`) {
      logger.info(`Request timed out`);

      window.alert(`Request timed out`);
    } else {
      if (xhr.readyState === 0) {
        logger.info(`Internet connection is off or server is
          not responding`);

        window.alert(`Internet connection is off or server is not responding`);
      } else if (xhr.readyState === 1) {
      } else if (xhr.readyState === 2) {
      } else if (xhr.readyState === 3) {
      } else {
        if (xhr.status === 200) {
          logger.info(`Error parsing JSON data`);
        } else if (xhr.status === 404) {
          logger.info(`The resource at the requested location
            could not be found`);
        } else if (xhr.status === 403) {
          if (xhr.responseText === 'login') {
            return window.location.href = redirectUrl;
          }
          logger.info(`You don\`t have permission to access this data`);
        } else if (xhr.status === 500) {
          logger.info(`Internal sever error`);
        }
      }
      window.alert(`There was a problem while processing your request. Please try again later.`);
    }

    logger.info(`Response Text: ` +
      xhr.responseText + `\n Ready State: ` +
      xhr.readyState + `\n Status Code: ` + xhr.status);

    $(`.spinner.cart`).hide();
  }

  var formatter = new Intl.NumberFormat(`en-US`, {
    style: `decimal`,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
});

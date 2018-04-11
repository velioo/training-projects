$(document).ready(() => {
  infoLog += `\ncart.js loaded\n`;

  var addToCartUrl = getAddToCartUrl();
  var changeQuantityUrl = getChangeQuantityUrl();
  var removeFromCartUrl = getRemoveFromCartUrl();
  var cartCountPriceUrl = getCartCountPriceUrl();
  var redirectUrl = getRedirectUrl();

  updateCart();

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

    infoLog += `\ncart.js/.remove_product: Executing... \n`;

    if (confirm(`Сигурни ли сте, че искате да премахнете продукта.`)) {
      infoLog += `cart.js/.remove_product: Agreed to remove product\n`;

      var productId = $(this).parent().parent().data(`id`);

      if (productId === parseInt(productId, 10)) {
        infoLog += `cart.js/.remove_product: Product id = ` + productId + `\n`;

        assert(productId === parseInt(productId, 10),
          `cart.js/.remove_product:\nAssert Error: productId must be integer`);

        var product = $(this).parent().parent();

        infoLog += `cart.js/.remove_product: Sending request to ` +
          removeFromCartUrl + ` with params: productId = ` + productId + `\n`;

        $.post(removeFromCartUrl, {productId: productId}, function (data, status) {
          if (data) {
            if (data != `login`) {
              infoLog += `cart.js/.remove_product: Reqest successfull\n`;
              updateCart();
              product.remove();
              if ($(`.remove_product`).length <= 0) {
                $(`.cart_purchase_div`).remove();
                $(`<h3>Нямате продукти в кошницата</h3>`)
                  .insertBefore(`.table-responsive`);
              }
            } else {
              infoLog += `cart.js/.remove_product: User trying to delete product
              while not logged in. Redirecting to users/login\n`;
              window.location.href = redirectUrl;
            }
          } else {
            infoLog += `cart.js/.remove_product: Request failed\n`;

            window.alert(`Имаше проблем в обработването на заявката ви.`);
          }

          logger.info(infoLog);
          infoLog = ``;
        });
      } else {
        infoLog += `cart.js/.remove_product: Product id is not integer: ` +
          productId + `\n`;

        logger.info(infoLog);
        infoLog = ``;
        window.alert(`Имаше проблем в обработването на заявката ви.`);
      }
    }
  });

  var delayTimer;
  var requests = 0;

  $(`.input_change_count`).on(`change`, function () {
    var e = $(this);
    clearTimeout(delayTimer);
    if ($(`.purchase_button`).length > 0) {
      $(`.purchase_button`).prop(`disabled`, true);
    }
    if ($(`#paymentSubmit`).length > 0) {
      $(`#paymentSubmit`).prop(`disabled`, true);
    }
    delayTimer = setTimeout(function () {
      requests++;
      console.log(`In: ` + requests);

      infoLog += `\ncart.js/.input_change_count: Executing...\n`;

      var val = parseInt($(e).val(), 10);

      infoLog += `cart.js/.input_change_count: Invoking function changeCart($(this)` +
        `,, ` + val + `)\n`;

      changeCart($(e), val);
    }, 500);
  });

  function updateCart () {
    infoLog += `\ncart.js/updateCart(): Executing...\n`;
    infoLog += `cart.js/updateCart(): Sending request to ` + cartCountPriceUrl + `\n`;

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
        infoLog += `cart.js/updateCart(): Request returned data\n`;
        infoLog += `cart.js/updateCart(): Checking if returned data is valid JSON...\n`;

        if (typeof data === `object` && ajv.validate(cartSchema, data) &&
          !data.hasOwnProperty(`not_logged`)) {
          infoLog += `cart.js/updateCart(): Data is valid JSON\n`;

          $(`#cart_count_price`).text(data.count + ` артикул(а) - ` +
            formatter.format(data.price_leva) + ` лв.`);

          if ($(`.cart_sum`).length > 0) {
            $(`.cart_sum`).text(formatter.format(data.price_leva));
            $(`.spinner.order_sum`).hide();
          }

          infoLog += `cart.js/updateCart(): Cart update successfull\n`;

          console.log(`Out: ` + requests);

          if (requests <= 1) {
            if ($(`.purchase_button`).length > 0) {
              $(`.purchase_button`).prop(`disabled`, false);
            }

            if ($(`#paymentSubmit`).length > 0) {
              $(`#paymentSubmit`).prop(`disabled`, false);
            }
          }

          if (requests > 0) {
            requests--;
          }

          $(`.spinner.cart`).css(`margin-top`, `-42px`);
          $(`.spinner.cart`).css(`margin-left`, `40px`);
        } else {
          if (data.hasOwnProperty(`not_logged`)) {
            infoLog += `cart.js/updateCart(): User is not logged. No cart data returned\n`;
          } else {
            infoLog += `cart.js/updateCart(): Request didn\`t return a valid JSON object\n`;
            infoLog += JSON.stringify(ajv.errors, null, 2);

            window.alert(`Failed to get data from server. Please try again later`);
          }
        }
        logger.info(infoLog);
        infoLog = ``;

        $(`.spinner.cart`).hide();
      },
      error: function (xhr, status, errorThrown) {
        if (status === `timeout`) {
          infoLog += `cart.js/updateCart(): Request timed out\n`;

          window.alert(`Request timed out`);
        } else {
          if (xhr.readyState === 0) {
            infoLog += `cart.js/updateCart(): Internet connection is off or server is
              not responding\n`;

            window.alert(`Internet connection is off or server is not responding`);
          } else if (xhr.readyState == 1) {
          } else if (xhr.readyState == 2) {
          } else if (xhr.readyState == 3) {
          } else {
            if (xhr.status === 200) {
              infoLog += `cart.js/updateCart(): Error parsing JSON data\n`;
            } else if (xhr.status === 404) {
              infoLog += `cart.js/updateCart(): The resource at the requested location
                could not be found\n`;
            } else if (xhr.status === 403) {
              infoLog += `cart.js/updateCart(): You don\`t have permission to access
                this data\n`;
            } else if (xhr.status === 500) {
              infoLog += `cart.js/updateCart(): Internal sever error\n`;
            }
          }
          window.alert(`Failed to get data from server. Please try again later`);
        }

        infoLog += `cart.js/updateCart():\n Response Text:` + xhr.responseText +
                         `\n Ready State:` + xhr.readyState +
                         `\n Status Code: ` + xhr.status;
        logger.info(infoLog);
        infoLog = ``;

        $(`.spinner.cart`).hide();
      },
      timeout: 10000
    });
  }

  function addToCart (e) {
    infoLog += `\ncart.js/addToCart(): Executing...\n`;

    var productId = e.parent().data(`id`);

    if (productId === parseInt(productId, 10)) {
      assert(productId === parseInt(productId, 10),
        `cart.js/addToCart:\nAssert Error: productId must be integer`);

      infoLog += `cart.js/addToCart(): Sending request to ` + addToCartUrl +
        ` with params: productId = ` + productId + `\n`;

      $(e).parent().find(`.spinner.buy`).show();

      $.post(addToCartUrl, { productId: productId }, function (data, status) {
        if (data) {
            infoLog += `cart.js/addToCart(): Reqest successfull\n`;

            updateCart();

            $(e).parent().find(`.spinner.buy`).hide();

            window.alert(`Продуктът е добавен успешно в количката.`);
        } else {
          infoLog += `cart.js/addToCart(): Reqest failed\n`;

          window.alert(`Имаше проблем в обработването на заявката ви.`);
        }
      });
    } else {
      infoLog += `cart.js/addToCart(): ProductId is not integer`;

      window.alert(`Имаше проблем в обработването на заявката ви.`);
    }
  }

  function changeCart (e, quantity) {
    infoLog += `\ncart.js/changeCart(): Executing...\n`;

    var productId = e.parent().parent().data(`id`);

    infoLog += `cart.js/changeCart(): Product id =  ` + productId + ` quantity = ` +
      quantity + `\n`;

    if ((productId === parseInt(productId, 10)) && (quantity === parseInt(quantity, 10))) {
      assert(productId === parseInt(productId, 10),
        `cart.js/changeCart():\nAssert Error: productId must be integer`);
      assert(quantity === parseInt(quantity, 10),
        `cart.js/changeCart():\nAssert Error: quantity must be integer`);

      if (quantity <= 0) {
        quantity = 1;

        infoLog += `cart.js/changeCart(): Quantity is <= 0. Changing input value to 1\n`;

        e.val(1);
      }

      assert(quantity > 0, `cart.js/changeCart():\nAssert Error: quantity must be > 0`);

      infoLog += `cart.js/changeCart(): Sending request to ` + changeQuantityUrl +
        ` with params: productId = ` + productId + `, quantity = ` + quantity + `\n`;

      $(e).parent().find(`.spinner.changeCart`).show();

      $.ajax({
        type: `POST`,
        async: true,
        url: changeQuantityUrl,
        data: {productId: productId, quantity: quantity},
        dataType: `json`,
        success: function (data, status) {
          infoLog += `cart.js/changeCart(): Request returned data\n`;
          infoLog += `cart.js/changeCart(): Checking if returned data is valid JSON...\n`;

          if (typeof data === `object` && ajv.validate(cartChangeQuantitySchema, data)) {
            infoLog += `cart.js/changeCart(): Reqest successfull\n`;

            updateCart();

            e.parent().parent().find(`.cart_product_sum_td`)
              .text(formatter.format(data.quantity * data.price_leva));
            $(e).parent().find(`.spinner.changeCart`).hide();
          } else {
            infoLog += `cart.js/changeCart(): Request didn\`t return a valid JSON object\n`;
            infoLog += JSON.stringify(ajv.errors, null, 2);

            window.alert(`Имаше проблем в обработването на заявката ви.`);
          }
          logger.info(infoLog);
          infoLog = ``;
        },
        error: function (msg, status, errorThrown) {
          infoLog += `cart.js/changeCart(): Error parsing JSON data\n`;
          infoLog += `cart.js/changeCart(): ` + errorThrown + `\n`;

          logger.info(infoLog);
          infoLog = ``;

          window.alert(`Имаше проблем в обработването на заявката ви.`);
        }
      });
    } else {
      infoLog += `cart.js/changeCart(): Product id or/and quantity is not integer\n`;
      logger.info(infoLog);
      infoLog = ``;

      window.alert(`Имаше проблем в обработването на заявката ви.`);
    }
  }

  var formatter = new Intl.NumberFormat(`en-US`, {
    style: `decimal`,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
});

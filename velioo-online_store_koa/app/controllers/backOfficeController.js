const logger = require('../helpers/logger');
const sha256 = require('js-sha256').sha256;
const escape = require('escape-html');
const root = require('../helpers/pug_helpers/root');

async function renderEmployeeLogin(ctx, next) {
    ctx.status = 200;
    logger.info("In renderEmployeelogin");
    ctx.data = {user: {}};
    if (ctx.session.employeeData) {
        return ctx.redirect('/employee/dashboard');
    }
    await next();
    ctx.render('employee_login.pug', ctx.data);
}

async function employeeLogin(ctx, next) {
    ctx.status = 200;
    ctx.data = {user: {}};
    let userData = await ctx.myPool().query("SELECT password, salt, id FROM employees WHERE username = ?", [ctx.request.body.username]);
    if (userData instanceof Array && userData.length === 1 && (sha256(ctx.request.body.password + userData[0].salt) === userData[0].password)) {
        
        ctx.session.employeeData = {employeeId: userData[0].id};
        return ctx.redirect('/employee/dashboard');
    } else {
        ctx.data.message = "Wrong username or password";
    }
    
    await next();
    ctx.render('employee_login.pug', ctx.data);
}

async function renderDashboard(ctx, next) {
    ctx.status = 200;
    ctx.data = {user: {}};
    let logged = await next();
    if(ctx.data.employeeLogged === true) {
        ctx.render('dashboard.pug', ctx.data);
    } else {
        ctx.redirect('/employee_login');
    }
}

async function employeeLogOut(ctx, next) {
    ctx.data = {};
    if(ctx.session.employeeData) {
        ctx.session.employeeData = null;
        await next();
    }
    ctx.redirect('/products'); 
}

async function getProducts(ctx, next) {
		
        let productsQuery = "SELECT products.*, categories.name as category FROM products JOIN categories ON categories.id = products.category_id ";
        let productsQueryArgs = [];
        let orderClause = [];
        let likeClause = [];
        let conditionClause = [];
        let whereClauseStarted = false;
        
        console.log("Query: ", ctx.request);
        console.log("Query params: ", ctx.query);
        let sortColumns = {};
        let filterColumns = {};
        Object.keys(ctx.query).forEach(function(key) {
            if(key.startsWith('col[')) {
                if(typeof (+key.charAt(4)) == "number") {
                    sortColumns[+key.charAt(4)] = ctx.query[key];
                }
            }
            if(key.startsWith('fcol[')) {
                if(typeof (+key.charAt(5)) == "number") {
                    filterColumns[+key.charAt(5)] = ctx.query[key];
                }
            }
        });
        console.log("sortColumns = ", sortColumns);
        console.log("filterColumns = ", filterColumns);
		if(Object.keys(sortColumns).length !== 0 && sortColumns.constructor === Object) {
			Object.keys(sortColumns).forEach(function(key) {
                let value = sortColumns[key];
                switch(key) {
					case '0':
						if(value === '1') {
                            orderClause.push("products.created_at DESC");
						} else {
                            orderClause.push("products.created_at ASC");
						}
						break;
					case '1':
						if(value === '1') {
                            orderClause.push("products.updated_at DESC");
						} else {
                            orderClause.push("products.updated_at ASC");
						}
						break;
					case '2':
						if(value === '1') {
                            orderClause.push("products.name DESC");
						} else {
                            orderClause.push("products.name ASC");
						}
						break;
					case '3': 
						if(value === '1') {
                            orderClause.push("categories.name DESC");
						} else {
                            orderClause.push("categories.name ASC");
						}
						break;
					case '4': 
						if(value === '1') {
                            orderClause.push("products.price_leva DESC");
						} else {
                            orderClause.push("products.price_leva ASC");
						}
						break;
					case '5': 
						if(value === '1') {
                            orderClause.push("products.quantity DESC");
						} else {
                            orderClause.push("products.quantity ASC");
						}	
						break;
					case '6': 
						break;
					case '7': 
						break;
					default: 	
						//assert_v(false);
						break;
				}
            });
        }
        
		if(Object.keys(filterColumns).length !== 0 && filterColumns.constructor === Object) {		
			Object.keys(filterColumns).forEach(function(key) {
                let value = filterColumns[key].replace(/%/g, "!%").replace(/_/g, "!_").replace(/'/g, "\\'").replace(/"/g, '\\"');;
				switch(key) {
					case '0': 
                        likeClause.push("products.created_at LIKE '%" + value + "%'");
						break;
					case '1': 
                        likeClause.push("products.updated_at LIKE '%" + value + "%'");
						break;
					case '2': 
                        likeClause.push("products.name LIKE '%" + value + "%'");
						break;
					case '3': 
                        likeClause.push("categories.name LIKE '%" + value + "%'");
						break;
					case '4': 
                        likeClause.push("products.price_leva LIKE '%" + value + "%'");
						break;
					case '5': 
                        likeClause.push("products.quantity LIKE '%" + value + "%'");
						break;
					case '6': 
						break;
					case '7': 
						break;
					default: 	
						//assert_v(false);
						break;
				}
			});
		}
        
        likeClause.forEach(function(e, index) {
            if(index === 0) {
                productsQuery+=" WHERE ";
                whereClauseStarted = true;
            } else {
                productsQuery+=" AND ";
            }
            productsQuery+=e;
            if(index == likeClause.length - 1) {
                productsQuery+=" ESCAPE '!' ";
            }
        });
        
        if(ctx.query.date_c_from != '') {
            conditionClause.push(" DATE(products.created_at) >= ? ");
            productsQueryArgs.push(ctx.query.date_c_from);
			//$getRows['conditions']['DATE(products.created_at) >= '] = $this->input->get('date_c_from');
			//log_message('user_info', 'Got filter by date created_at >= : ' . $this->input->get('date_c_from'));
		}	
		
		if(ctx.query.date_c_to != '') {
            conditionClause.push(" DATE(products.created_at) <= ? ");
            productsQueryArgs.push(ctx.query.date_c_to);
			//$getRows['conditions']['DATE(products.created_at) <= '] = $this->input->get('date_c_to');
			//log_message('user_info', 'Got filter by date created_at <=: ' . $this->input->get('date_c_to'));
		}	
																			 
		if(ctx.query.date_m_from != '') {
            conditionClause.push(" DATE(products.updated_at) >= ? ");
            productsQueryArgs.push(ctx.query.date_m_from);
			//$getRows['conditions']['DATE(products.updated_at) >= '] = $this->input->get('date_m_from');
			//log_message('user_info', 'Got filter by date updated_at >= : ' . $this->input->get('date_m_from'));
		}	
		
		if(ctx.query.date_m_to != '') {
            conditionClause.push(" DATE(products.updated_at) <= ? ");
            productsQueryArgs.push(ctx.query.date_m_to);
			//$getRows['conditions']['DATE(products.updated_at) <= '] = $this->input->get('date_m_to');
			//log_message('user_info', 'Got filter by date updated_at <= : ' . $this->input->get('date_m_to'));
		}	
																			 
		if(ctx.query.price_from != '') {
            conditionClause.push(" products.price_leva >= ? ");
            productsQueryArgs.push(ctx.query.price_from);
			//$getRows['conditions']['products.price_leva >= '] = floatval($this->input->get('price_from'));
			//log_message('user_info', 'Got filter by price >= : ' . $this->input->get('price_from'));
		}	
		
		if(ctx.query.price_to != '') {
            conditionClause.push(" products.price_leva <= ? ");
            productsQueryArgs.push(ctx.query.price_to);
			//$getRows['conditions']['products.price_leva <= '] = floatval($this->input->get('price_to'));
			//log_message('user_info', 'Got filter by price <= : ' . $this->input->get('price_to'));
		}
        
        conditionClause.forEach(function(e, index) {
            if(index === 0) {
                if(!whereClauseStarted) {
                    productsQuery+=" WHERE ";
                } else {
                    productsQuery+=" AND ";
                }
            } else {
                productsQuery+=" AND ";
            }
            productsQuery+=e;
        });
        
        console.log("ProductsQuery: " + productsQuery);
		                                          
		
		//log_message('user_info', 'Executing products result query...');
        let result = {};
        
        let productsCount = await ctx.myPool().query(productsQuery, productsQueryArgs);
        productsCount = productsCount.length;
        result.total_rows = productsCount;
        
        orderClause.forEach(function(e, index) {
            if(index === 0) {
                productsQuery+=" ORDER BY ";
            } else {
                productsQuery+=", ";
            }
            productsQuery+=e;
        });
        
        if(ctx.query.size) {
            productsQuery+=" LIMIT ? ";
            productsQueryArgs.push(ctx.query.size);
            console.log("Limit : " + ctx.query.size);
        } else {
            productsQuery+=" LIMIT 50 ";
            productsQueryArgs.push(50);
        }
        
        if(ctx.query.page) {
            productsQuery+=" OFFSET ? ";
            let offset = +ctx.query.page * (ctx.query.size) ? +ctx.query.size : 50;
            console.log("Offset: " + offset);
            productsQueryArgs.push(offset);
        } else {
            productsQuery+=" OFFSET 0 ";
        }
        
		let products = await ctx.myPool().query(productsQuery, productsQueryArgs);											  
        
        //~ let productArray = [];
        //~ let productsArray = [];
        //~ if(products.length > 0) {
            //~ products.forEach(function(product) {
                //~ productArray.push(escape(product['created_at']));
                //~ productArray.push(escape(product['updated_at']));
                //~ productArray.push("<a href=\"" + root.moduleBody() + "products/" + escape(product['id']) + "\">" + escape(product['name']) + "</a>");
                //~ productArray.push(escape(product['category']));
                //~ productArray.push(escape(product['price_leva']));
                //~ productArray.push(escape(product['quantity']));
                //~ productArray.push("<a href=\"" + root.moduleBody() + "employee/update_product/" + escape(product['id']) +"\" class=\"product_details\">Редактирай</a>");
                //~ productArray.push("<a href="" data-id=\"" + escape(product['id']) + "\" class=\"delete_record\">Изтрий</a>");
                
            //~ });
        //~ }					
        
        
        
        
        						  
			//~ foreach($products as $product) {
				//~ $productArray[] = htmlentities($product['created_at'], ENT_QUOTES);
				//~ $productArray[] = htmlentities($product['updated_at'], ENT_QUOTES);
				//~ $productArray[] = "<a href=\"" . site_url("products/product/") . htmlentities($product['id'], ENT_QUOTES) . "\">" . htmlentities($product['name'], ENT_QUOTES) . "</a>";
				//~ $productArray[] = htmlentities($product['category'], ENT_QUOTES);
				//~ $productArray[] = htmlentities($product['price_leva'], ENT_QUOTES);
				//~ $productArray[] = htmlentities($product['quantity'], ENT_QUOTES);
				//~ $productArray[] = '<a href="' . site_url("employees/update_product/" . htmlentities($product['id'], ENT_QUOTES)) . '" class="product_details">Редактирай</a>';
				//~ $productArray[] = '<a href="#" data-id="' . htmlspecialchars($product['id'], ENT_QUOTES) .'" class="delete_record">Изтрий</a>';
				//~ $productsArray[] = $productArray;
				//~ $productArray = array();
			//~ }
		
		//~ $resultArray['rows'] = $productsArray;
		
		//~ //log_message('user_info', 'Returning result to browser');		
			
		//~ header('Content-Type:application/json');													  		
		//~ echo json_encode($resultArray);	
        ctx.body = products;
}

module.exports = {renderEmployeeLogin, employeeLogin, renderDashboard, employeeLogOut, getProducts}

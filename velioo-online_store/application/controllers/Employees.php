<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Employees extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->library('form_validation');
		$this->load->model('employee_model');
		$this->load->model('product_model');
		$this->load->model('order_model');
		$this->load->model('tag_model');
	}
	
	public function index() {
		redirect('/employees/login/');
	}
	
	public function login() {	
		
		log_message('user_info', "\n\n" . site_url('employees/login') . ' loaded.');
				
		$data = array();      
        $data['title'] = 'Employee login';               
        
        if($this->input->post('loginSubmit')) {

			log_message('user_info', 'Matching submitted fields...');
			
			$checkLogin = $this->employee_model->getRows(array('select' => array('password', 'salt', 'id'), 
															   'conditions' => array('username' => $this->input->post('username')), 
															   'returnType' => 'single'));
	
			assert_v(count($checkLogin) == 3);
	
			if($checkLogin && ((hash("sha256", $this->input->post('password') . $checkLogin['salt'])) === $checkLogin['password'])) {								
				log_message('user_info', 'Record matched');
				$this->session->set_userdata('isEmployeeLoggedIn',TRUE);
				$this->session->set_userdata('employeeId', $checkLogin['id']);
				redirect('/employees/orders/');
				
			} else {
				$this->session->set_userdata('error_msg_timeless', 'Wrong email or password.');
				log_message('user_info', 'No records matched');
			}                 
            
            log_message('user_info', 'Loading employee_login page');
            $this->load->view('employee_login', $data);
            
        } elseif ($this->session->userdata('isEmployeeLoggedIn')) {
			log_message('user_info', 'User trying to load login page while logged in. Redirecting to: ' . site_url('employee/orders'));
			redirect('/employees/orders/');
		} else {
			log_message('user_info', 'Loading employee_login page');
			$this->load->view('employee_login', $data);
		}
	}
	
	public function logout() {
		log_message('user_info', "\n\n" . site_url('employees/logout') . ' loaded.');
		log_message('user_info', 'Unseting employee data from session');
        $this->session->unset_userdata('isEmployeeLoggedIn');
        $this->session->unset_userdata('employeeId');
        //$this->session->sess_destroy();
        log_message('user_info', 'Redirecting to ' . site_url('employees/login'));
        redirect('/employees/login/');
    }
	
	public function dashboard() {				
		log_message('user_info', "\n\n" . site_url('employees/dashboard') . ' loaded.');										
		$data = array();													
		$data['title'] = 'Dashboard';	
		log_message('user_info', 'Loading dashboard');													
		$this->load->view('dashboard', $data);
	}
	
	public function add_product() {
		log_message('user_info', "\n\n" . site_url('employees/add_product') . ' loaded.');	
		$data = array();		
		log_message('user_info', 'Getting categories');	
		$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));
		$categories = array();
		log_message('user_info', 'Processing categories');	
		foreach ($data['categories'] as $key => $row) {
			$categories[$key] = $row['name'];
		}		
		array_multisort($categories, SORT_ASC, $data['categories']);	
		$data['title'] = 'Добави продукт';
		log_message('user_info', 'Loading add_product page');
		$this->load->view('add_product', $data);
	}
	
	public function update_product($productId=null) {
		log_message('user_info', "\n\n" . site_url('employees/update_product') . ' loaded.');
		if($productId !== null && is_numeric($productId)) {
			
			log_message('user_info', 'Product id: ' . $productId);
			assert_v(is_numeric($productId));
			
			$data = array();
			log_message('user_info', 'Getting product details');
			$data['product'] = $this->product_model->getRows(array('id' => $productId));
			if($data['product']) {
				log_message('user_info', 'Getting product tags');
				$data['tags'] = $this->tag_model->getRows(array('select' => array('tags.name'),
																'joins' => array('product_tags' => 'product_tags.tag_id = tags.id',
																				 'products' => 'products.id = product_tags.product_id'),
																'conditions' => array('products.id' => $productId)));	
				if(!$data['tags']) {
					log_message('user_info', 'No tags associated with this product found');
				}												
				
				log_message('user_info', 'Getting product categories');
				$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));
				
				if(!$data['categories']) {
					log_message('user_info', 'Product has no category');
					assert_v(false);
				}	
				$data['title'] = 'Редактирай продукт';
				
				log_message('user_info', 'Loading update_product page');
				$this->load->view('update_product', $data);
			
			} else {
				log_message('user_info', 'Product with id = ' . $productId . ' doesn\'t exist');
			}
		} else {
			log_message('user_info', 'Invalid product id specified: ' . $productId);
		}
	}
	
	public function tags() {
		
		log_message('user_info', "\n\n" . site_url('employees/tags') . ' loaded.');
		
		$data = array();		
		
		log_message('user_info', 'Loading pagination library');
		$this->load->library('pagination');
		log_message('user_info', 'Configuring pagination');
		$config = $this->configure_pagination();
		$config['base_url'] = site_url("employees/tags");
		$config['per_page'] = 50;
		
		log_message('user_info', 'Limit set to: ' . $config['per_page']);
			
		if($this->input->get('page') != NULL && is_numeric($this->input->get('page')) && $this->input->get('page') > 0) {
			log_message('user_info', 'Got page number: ' . $this->input->get('page'));
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
			log_message('user_info', 'Records offset set to: ' . $start);
		} else {
			$start = 0;
			log_message('user_info', 'No page number specified. Using default offset: ' . $start);
		}		
		
		assert_v(is_numeric($start));
		
		log_message('user_info', 'Getting tags');
		$data['tags'] = $this->tag_model->getRows(array('start' => $start,
														'limit' => $config['per_page']));
														
		log_message('user_info', 'Getting total tags count');
		$config['total_rows'] = $this->tag_model->getRows(array('returnType' => 'count'));	
			
		assert_v(is_numeric($config['total_rows']));
								
		log_message('user_info', 'Initializing pagination');							
		$this->pagination->initialize($config);							
		$data['pagination'] = $this->pagination->create_links();
													
		$data['title'] = 'Тагове';
		log_message('user_info', 'Loading tags page');	
		$this->load->view('tags', $data);
	}
	
	public function add_tag() {
		
		log_message('user_info', "\n\n" . site_url('employees/add_tag') . ' loaded.');
		
		$data = array();
		$data['title'] = 'Нов таг';
		log_message('user_info', 'Loading add_tag page');
		$this->load->view('add_tag', $data);
	}
	
	public function orders() {
		
		log_message('user_info', "\n\n" . site_url('employees/orders') . ' loaded.');
		
		$data = array();														  
		$data['title'] = 'Orders';
		log_message('user_info', 'Loading client_orders page');
		$this->load->view('client_orders', $data);
	}
	
	public function get_orders() {
		
		log_message('user_info', "\n\n" . site_url('employees/get_orders') . ' loaded.');
		
		$getRows = array('select' => array('orders.id as order_id',
										   'orders.created_at as order_created_at',
										   'orders.updated_at as order_updated_at',
										   'orders.amount_leva',
										   'statuses.name as status_name',
										   'statuses.id as status_id',
										   'users.email as user_email'), 
						 'joins' => array('statuses' => 'statuses.id = orders.status_id',
										  'users' => 'users.id = orders.user_id'));
		
		if($this->input->get('size') && is_numeric($this->input->get('size'))) {		
			log_message('user_info', 'Got records limit size: ' . $this->input->get('size'));
			$getRows['limit'] = $this->input->get('size');
			assert_v(is_numeric($getRows['limit']));
		}
		
		if($this->input->get('page') && is_numeric($this->input->get('page'))) {
			log_message('user_info', 'Got page number: ' . $this->input->get('page'));
			if(isset($getRows['limit'])) {
				$start = $this->input->get('page') * $getRows['limit'];
				log_message('user_info', 'Offset set to: ' . $start);
			} else {
				$start = 0;
				log_message('user_info', 'Using default offset: ' . $start);
			}			
			$getRows['start'] = $start;
			assert_v(is_numeric($getRows['start']));
		} else {
			log_message('user_info', 'No page number specified');
		}
		
		if($this->input->get('col')) {
			log_message('user_info', 'Got sorting params');
			$sort = $this->input->get('col');				
			foreach($sort as $key => $value) {
				switch($key) {
					case 0: 
						if($value) {
							$getRows['order_by']['orders.created_at'] = 'DESC';
							log_message('user_info', 'Sorting by created_at DESC');
						} else {
							$getRows['order_by']['orders.created_at'] = 'ASC';		
							log_message('user_info', 'Sorting by created_at ASC');		
						}
						break;
					case 1: 
						if($value) {
							$getRows['order_by']['orders.updated_at'] = 'DESC';
							log_message('user_info', 'Sorting by updated_at DESC');		
						} else {
							$getRows['order_by']['orders.updated_at'] = 'ASC';
							log_message('user_info', 'Sorting by updated_at ASC');						
						}
						break;
					case 2: 
						if($value) {
							$getRows['order_by']['orders.id'] = 'DESC';
							log_message('user_info', 'Sorting by id DESC');		
						} else {
							$getRows['order_by']['orders.id'] = 'ASC';	
							log_message('user_info', 'Sorting by id ASC');
						}
						break;
					case 3: 
						if($value) {
							$getRows['order_by']['users.email'] = 'DESC';
							log_message('user_info', 'Sorting by email DESC');
						} else {				
							$getRows['order_by']['users.email'] = 'ASC';		
							log_message('user_info', 'Sorting by email ASC');				
						}
						break;
					case 4: 
						if($value) {
							$getRows['order_by']['orders.amount_leva'] = 'DESC';
							log_message('user_info', 'Sorting by amount DESC');
						} else {
							$getRows['order_by']['orders.amount_leva'] = 'ASC';	
							log_message('user_info', 'Sorting by amount ASC');
						}
						break;
					case 5: 
						if($value) {
							$getRows['order_by']['statuses.name'] = 'DESC';
							log_message('user_info', 'Sorting by name DESC');
						} else {
							$getRows['order_by']['statuses.name'] = 'ASC';	
							log_message('user_info', 'Sorting by name ASC');
						}
						break;
					case 6:
						break;
					default: 
						assert_v(false);
						break;
				}
			}
		}
		
		if($this->input->get('fcol')) {
			$filter = $this->input->get('fcol');						
			foreach($filter as $key => $value) {
				switch($key) {
					case 0: 
						$getRows['like']['orders.created_at'] = $value;		
						log_message('user_info', 'Filtering by created_at');	
						break;
					case 1: 
						$getRows['like']['orders.updated_at'] = $value;
						log_message('user_info', 'Filtering by updated_at');
						break;
					case 2: 
						$getRows['conditions']['orders.id'] = $value;
						log_message('user_info', 'Filtering by id');
						break;
					case 3: 
						$getRows['like']['users.email'] = $value;	
						log_message('user_info', 'Filtering by email');
						break;
					case 4: 
						$getRows['conditions']['orders.amount_leva'] = $value;
						log_message('user_info', 'Filtering by amount');
						break;
					case 5: 
						$getRows['like']['statuses.name'] = $value;
						log_message('user_info', 'Filtering by status');
						break;
					default: 		
						assert_v(false);			
						break;
				}
			}
		}
				
		if($this->input->get('date_c_from') != '') {
			$getRows['conditions']['DATE(orders.created_at) >= '] = $this->input->get('date_c_from');
			log_message('user_info', 'Got filter by date created_at >= : ' . $this->input->get('date_c_from'));
		}	
		
		if($this->input->get('date_c_to') != '') {
			$getRows['conditions']['DATE(orders.created_at) <= '] = $this->input->get('date_c_to');
			log_message('user_info', 'Got filter by date created_at <= : ' . $this->input->get('date_c_to'));
		}	
																			 
		if($this->input->get('date_m_from') != '') {
			$getRows['conditions']['DATE(orders.updated_at) >= '] = $this->input->get('date_m_from');
			log_message('user_info', 'Got filter by date updated_at >= : ' . $this->input->get('date_m_from'));
		}	
		
		if($this->input->get('date_m_to') != '') {
			$getRows['conditions']['DATE(orders.updated_at) <= '] = $this->input->get('date_m_to');
			log_message('user_info', 'Got filter by date updated_at <= : ' . $this->input->get('date_m_to'));
		}	
																			 
		if($this->input->get('price_from') != '') {
			$getRows['conditions']['orders.amount_leva >= '] = floatval($this->input->get('price_from'));
			log_message('user_info', 'Got filter by price >= : ' . $this->input->get('price_from'));
		}	
		
		if($this->input->get('price_to') != '') {
			$getRows['conditions']['orders.amount_leva <= '] = floatval($this->input->get('price_to'));
			log_message('user_info', 'Got filter by price <= : ' . $this->input->get('price_to'));
		}																	 
		
		log_message('user_info', 'Executing orders query...');
		$orders = $this->order_model->getRows($getRows);
		log_message('user_info', 'Query executed');
			
		log_message('user_info', 'Getting statuses');						
		$statuses = $this->order_model->getRows(array('table' => 'statuses',
													  'order_by' => array('statuses.name' => 'ASC')));						
		log_message('user_info', 'Statuses got');	
									  
		$tempArray = array();													  
		$tempArray2 = array();
		if($orders) {		
			log_message('user_info', 'Processing orders');											  
			foreach($orders as $order) {
				$tempArray[] = htmlentities($order['order_created_at'], ENT_QUOTES);
				$tempArray[] = htmlentities($order['order_updated_at'], ENT_QUOTES);
				$tempArray[] = htmlentities($order['order_id'], ENT_QUOTES);
				$tempArray[] = htmlentities($order['user_email'], ENT_QUOTES);
				$tempArray[] = htmlentities($order['amount_leva'], ENT_QUOTES);
				$selectStatus = '<select class="select_status">';
				foreach($statuses as $status) {
					$selectStatus .= '<option value="' . htmlentities($status['id'], ENT_QUOTES) . '"';
					if(htmlspecialchars($order['status_id'], ENT_QUOTES) == htmlentities($status['id'], ENT_QUOTES)) {
						$selectStatus .= 'selected="selected">';
					} else {
						$selectStatus .= '>';
					} 			
					$selectStatus .= htmlentities($status['name'], ENT_QUOTES) . '</option>';
				}
				$selectStatus .= '</select>';
				$tempArray[] = $selectStatus;
				$tempArray[] = '<a href="' . site_url("employees/order_details/" . htmlentities($order['order_id'], ENT_QUOTES)) . '" class="order_details">Детайли</a>';
				$tempArray2[] = $tempArray;
				$tempArray = array();
			}
			log_message('user_info', 'Orders processed');	
		}
			
		$resultArray['rows'] = $tempArray2;
		log_message('user_info', 'Orders added to result array');						
																					 
		unset($getRows['start']);		
		unset($getRows['limit']);		
		$getRows['returnType'] = 'count';
		log_message('user_info', 'Getting total orders count');			
		$resultArray['total_rows'] = $this->order_model->getRows($getRows);	
		log_message('user_info', 'Got count: ' . $resultArray['total_rows']);		
		assert_v(is_numeric($resultArray['total_rows']));
		
		unset($getRows['returnType']);
		$getRows['limit'] = 10000;
		$getRows['start'] = 0;	
		$totalSum['Всички'] = 0.00;
		$totalSum['Настоящи'] = 0.00;
		$totalSum['Очаквани'] = 0.00;
		$resultArray['sums'] = $totalSum;
		log_message('user_info', 'Getting all eligible records');		
		while ($allRows = $this->order_model->getRows($getRows)) {
				
			if($allRows) {		
				foreach($allRows as $row) {			
					if($row['status_name'] === 'Delivered' || $row['status_name'] === 'Awaiting Shipment' || $row['status_name'] === 'Awaiting Delivery') {
						$totalSum['Настоящи'] += $row['amount_leva'];				
					}
					if($row['status_name'] === 'Awaiting Payment' || $row['status_name'] === 'Payment being verified') {
						$totalSum['Очаквани'] += $row['amount_leva'];
					}
				}											
			}
			
			$getRows['start'] += $getRows['limit'];
		}
		log_message('user_info', 'Processed all records');
		
		$totalSum['Всички'] = number_format($totalSum['Настоящи'] + $totalSum['Очаквани'], 2);
		$totalSum['Настоящи'] = number_format($totalSum['Настоящи'], 2);
		$totalSum['Очаквани'] = number_format($totalSum['Очаквани'], 2);				
		$resultArray['sums'] = $totalSum;	
		log_message('user_info', 'Total orders sum added to result array');
		
		log_message('user_info', 'Returning result to browser');
		
		header('Content-Type:application/json');													  		
		echo json_encode($resultArray);												  												  
	}
	
	
	public function get_products() {

		log_message('user_info', "\n\n" . site_url('employees/get_products') . ' loaded.');
		
		$getRows = array('select' => array('products.*' , 'categories.name as category'), 
										   'joins' => array('categories' => 'categories.id = products.category_id'));
		
		if($this->input->get('size') && is_numeric($this->input->get('size'))) {
			log_message('user_info', 'Got records limit size: ' . $this->input->get('size'));		
			$getRows['limit'] = $this->input->get('size');
		} else {
			$getRows['limit'] = 50;
			log_message('user_info', 'Using default records limit: ' . $getRows['limit']);		
		}
		
		assert_v(is_numeric($getRows['limit']));
		
		if($this->input->get('page') && is_numeric($this->input->get('page'))) {
			log_message('user_info', 'Got page number: ' . $this->input->get('page'));
			if(isset($getRows['limit'])) {
				$start = $this->input->get('page') * $getRows['limit'];
				log_message('user_info', 'Offset set to: ' . $start);
			} else {
				$start = 0;
				log_message('user_info', 'Using default offset: ' . $start);
			}			
			$getRows['start'] = $start;
		} else {
			log_message('user_info', 'No page number specified');
		}
		
		if($this->input->get('col')) {
			log_message('user_info', 'Got sorting params');
			$sort = $this->input->get('col');			
			foreach($sort as $key => $value) {
				switch($key) {
					case 0: 
						if($value) {
							$getRows['order_by']['products.created_at'] = 'DESC';
							log_message('user_info', 'Sorting by created_at DESC');
						} else {
							$getRows['order_by']['products.created_at'] = 'ASC';
							log_message('user_info', 'Sorting by created_at ASC');
						}				
						break;
					case 1: 
						if($value) {
							$getRows['order_by']['products.updated_at'] = 'DESC';
							log_message('user_info', 'Sorting by updated_at DESC');
						} else {
							$getRows['order_by']['products.updated_at'] = 'ASC';
							log_message('user_info', 'Sorting by updated_at ASC');
						}
						break;
					case 2: 
						if($value) {
							$getRows['order_by']['products.name'] = 'DESC';
							log_message('user_info', 'Sorting by name DESC');
						} else {
							$getRows['order_by']['products.name'] = 'ASC';	
							log_message('user_info', 'Sorting by name ASC');
						}
						break;
					case 3: 
						if($value) {
							$getRows['order_by']['categories.name'] = 'DESC';
							log_message('user_info', 'Sorting by category DESC');
						} else {
							$getRows['order_by']['categories.name'] = 'ASC';	
							log_message('user_info', 'Sorting by category ASC');
						}
						break;
					case 4: 
						if($value) {
							$getRows['order_by']['products.price_leva'] = 'DESC';
							log_message('user_info', 'Sorting by price DESC');
						} else {
							$getRows['order_by']['products.price_leva'] = 'ASC';	
							log_message('user_info', 'Sorting by price ASC');
						}
						break;
					case 5: 
						if($value) {
							$getRows['order_by']['products.quantity'] = 'DESC';
							log_message('user_info', 'Sorting by quantity DESC');
						} else {
							$getRows['order_by']['products.quantity'] = 'ASC';
							log_message('user_info', 'Sorting by quantity ASC');
						}	
						break;
					case 6: 
						break;
					case 7: 
						break;
					default: 	
						assert_v(false);
						break;
				}
			}
		}
		
		if($this->input->get('fcol')) {
			log_message('user_info', 'Filtering records... ');
			$filter = $this->input->get('fcol');	
			log_message('user_info', 'Filters: ' . $filter);					
			foreach($filter as $key => $value) {
				switch($key) {
					case 0: 
						$getRows['like']['products.created_at'] = $value;	
						log_message('user_info', 'Filtering by created_at');		
						break;
					case 1: 
						$getRows['like']['products.updated_at'] = $value;
						log_message('user_info', 'Filtering by updated_at');
						break;
					case 2: 
						$getRows['like']['products.name'] = $value;
						log_message('user_info', 'Filtering by name');
						break;
					case 3: 
						$getRows['like']['categories.name'] = $value;	
						log_message('user_info', 'Filtering by category');
						break;
					case 4: 
						$getRows['like']['products.price_leva'] = $value;
						log_message('user_info', 'Filtering by price');
						break;
					case 5: 
						$getRows['conditions']['products.quantity'] = $value;
						log_message('user_info', 'Filtering by quantity');
						break;
					case 6: 
						break;
					case 7: 
						break;
					default: 	
						assert_v(false);
						break;
				}
			}
		}
		
		if($this->input->get('date_c_from') != '') {
			$getRows['conditions']['DATE(products.created_at) >= '] = $this->input->get('date_c_from');
			log_message('user_info', 'Got filter by date created_at >= : ' . $this->input->get('date_c_from'));
		}	
		
		if($this->input->get('date_c_to') != '') {
			$getRows['conditions']['DATE(products.created_at) <= '] = $this->input->get('date_c_to');
			log_message('user_info', 'Got filter by date created_at <=: ' . $this->input->get('date_c_to'));
		}	
																			 
		if($this->input->get('date_m_from') != '') {
			$getRows['conditions']['DATE(products.updated_at) >= '] = $this->input->get('date_m_from');
			log_message('user_info', 'Got filter by date updated_at >= : ' . $this->input->get('date_m_from'));
		}	
		
		if($this->input->get('date_m_to') != '') {
			$getRows['conditions']['DATE(products.updated_at) <= '] = $this->input->get('date_m_to');
			log_message('user_info', 'Got filter by date updated_at <= : ' . $this->input->get('date_m_to'));
		}	
																			 
		if($this->input->get('price_from') != '') {
			$getRows['conditions']['products.price_leva >= '] = floatval($this->input->get('price_from'));
			log_message('user_info', 'Got filter by price >= : ' . $this->input->get('price_from'));
		}	
		
		if($this->input->get('price_to') != '') {
			$getRows['conditions']['products.price_leva <= '] = floatval($this->input->get('price_to'));
			log_message('user_info', 'Got filter by price <= : ' . $this->input->get('price_to'));
		}																	 
		
		log_message('user_info', 'Executing products result query...');
		$products = $this->product_model->getRows($getRows);													  
		log_message('user_info', 'Products result query executed');
									 
		unset($getRows['start']);		
		unset($getRows['limit']);
		$getRows['returnType'] = 'count';	
		log_message('user_info', 'Getting count of total records');
		$resultArray['total_rows'] = $this->product_model->getRows($getRows);
		log_message('user_info', 'Count returned: ' . $resultArray['total_rows']);

		assert_v(is_numeric($resultArray['total_rows']));		
													  
		$productArray = array();													  
		$productsArray = array();
		if($products) {		
			log_message('user_info', 'Processing each product...');											  
			foreach($products as $product) {
				$productArray[] = htmlentities($product['created_at'], ENT_QUOTES);
				$productArray[] = htmlentities($product['updated_at'], ENT_QUOTES);
				$productArray[] = "<a href=\"" . site_url("products/product/") . htmlentities($product['id'], ENT_QUOTES) . "\">" . htmlentities($product['name'], ENT_QUOTES) . "</a>";
				$productArray[] = htmlentities($product['category'], ENT_QUOTES);
				$productArray[] = htmlentities($product['price_leva'], ENT_QUOTES);
				$productArray[] = htmlentities($product['quantity'], ENT_QUOTES);
				$productArray[] = '<a href="' . site_url("employees/update_product/" . htmlentities($product['id'], ENT_QUOTES)) . '" class="product_details">Редактирай</a>';
				$productArray[] = '<a href="#" data-id="' . htmlspecialchars($product['id'], ENT_QUOTES) .'" class="delete_record">Изтрий</a>';
				$productsArray[] = $productArray;
				$productArray = array();
			}
			log_message('user_info', 'Products processed');			
		}
		
		$resultArray['rows'] = $productsArray;
		
		log_message('user_info', 'Returning result to browser');		
			
		header('Content-Type:application/json');													  		
		echo json_encode($resultArray);	
	
	}
	
	public function order_details($orderId=null) {
		
		log_message('user_info', "\n\n" . site_url('employees/order_details') . ' loaded.');
		
		if(is_numeric($orderId)) {
			
			log_message('user_info', 'Order id: ' . $orderId);
			assert_v(is_numeric($orderId));

			$data = array();		
			log_message('user_info', 'Loading user_model');
			$this->load->model('user_model');										

			log_message('user_info', 'Checking if order exists');
			$orderData = $this->order_model->getRows(array('select' => array('orders.user_id'), 'conditions' => array('orders.id' => $orderId), 'returnType' => 'single'));
			if($orderData) {
				
				log_message('user_info', 'Getting user data associated with the order');
				$data['userData'] = $this->user_model->getRows(array('id' => $orderData['user_id']));
				
				assert_v($data['userData']);
				
				log_message('user_info', 'Getting order details');					
				$data['order'] = $this->order_model->getRows(array('select' => array('orders.id as order_id',
																			  'orders.report as report',
																			  'orders.created_at as order_created_at',
																			  'orders.amount_leva',
																			  'statuses.name as status_name',
																			  'statuses.id as status_id',
																			  'payment_methods.name as payment_method_name', 
																			  'payment_methods.image as payment_method_image', 
																			  'payment_methods.details as payment_method_details'), 
															'conditions' => array('orders.id' => $orderId), 
															'joins' => array('statuses' => 'statuses.id = orders.status_id', 
																			 'payment_methods' => 'payment_methods.id = orders.payment_method_id'),
															'returnType' => 'single'));
				
				assert_v($data['order']);
					
				log_message('user_info', 'Getting products associated with the order');																 
				$data['products'] = $this->product_model->getRows(array('select' => array(
																				  'products.name as name', 
																				  'products.image as image', 
																				  'products.id as product_id', 
																				  'products.price_leva',
																				  'order_products.quantity'),
																		'joins' => array('order_products' => 'order_products.product_id = products.id',
																						 'orders' => 'orders.id = order_products.order_id'),
																		'conditions' => array('orders.id' => $orderId)));
				
				if(!$data['products']) {
					log_message('user_info', 'Products found');
				} else {
					log_message('user_info', 'No products associated with the order found');
				}
																																							
				$data['title'] = 'Order Details';
				log_message('user_info', 'Loading order_details page');
				$this->load->view('order_details.php', $data);			

			} else {
				log_message('user_info', 'No order with id = ' . $orderId . ' found. Redirecting to client_orders');
				redirect('/employees/orders/');
			}
			
		} else {
			log_message('user_info', 'Order id is not numeric: ' . $orderId);
			redirect('/employees/');
		}
	}
	
	public function change_status() {
		
		log_message('user_info', "\n\n" . site_url('employees/change_status') . ' loaded.');
		
		if($this->input->post('statusId') && $this->input->post('orderId') && 
			is_numeric($this->input->post('statusId')) && is_numeric($this->input->post('orderId'))) {
			
			log_message('user_info', 'Status id: ' . $this->input->post('statusId') . ' Order id: ' . $this->input->post('orderId'));
			
			assert_v(is_numeric($this->input->post('statusId')) && is_numeric($this->input->post('orderId')));
			
			log_message('user_info', 'Updating order status');
			$update = $this->order_model->update(array('set' => array('status_id' => $this->input->post('statusId')),
													   'conditions' => array('id' => $this->input->post('orderId'))));
													   
													   
			if($update) { 
				log_message('user_info', 'Successfully updated status');
				echo true;
			} else { 
				log_message('user_info', 'Failed to update status');
				echo false;
			}			
			
		}
	}
	
	//~ public function get_user_emails($input=null) {
		
		//~ log_message('user_info', "\n\n" . site_url('employees/get_user_email') . ' loaded.');
		
		//~ if($input !== null) {
			
			//~ $this->load->model('user_model');
		
			//~ $input = urldecode($input);	

			//~ header('Content-Type:application/json');	
		
			//~ $emails = $this->user_model->getRows(array('select' => array('users.email'), 
													   //~ 'like' => array('users.email' => $input)));
													
			//~ if($emails) echo json_encode($emails); else echo false;					
			
		//~ } else {
			//~ echo false;
		//~ }
	//~ }
	
	public function configure_pagination() {
		$config['num_links'] = 5;
		$config['use_page_numbers'] = TRUE;
		$config['page_query_string'] = TRUE;
		$config['reuse_query_string'] = TRUE;
		$config['query_string_segment'] = 'page';
		$config['full_tag_open'] = "<ul class='pagination'>";
		$config['full_tag_close'] ="</ul>";
		$config['num_tag_open'] = '<li>';
		$config['num_tag_close'] = '</li>';
		$config['cur_tag_open'] = "<li class='disabled'><li class='active'><a href='#'>";
		$config['cur_tag_close'] = "<span class='sr-only'></span></a></li>";
		$config['next_tag_open'] = "<li>";
		$config['next_tagl_close'] = "</li>";
		$config['prev_tag_open'] = "<li>";
		$config['prev_tagl_close'] = "</li>";
		$config['first_tag_open'] = "<li>";
		$config['first_tagl_close'] = "</li>";
		$config['last_tag_open'] = "<li>";
		$config['last_tagl_close'] = "</li>";
		$config['next_link'] = "Next";
		$config['prev_link'] = "Prev";
	
		return $config;
	}
	
}	
?>

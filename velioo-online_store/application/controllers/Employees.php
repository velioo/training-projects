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
		$data = array();      
        $data['title'] = 'Employee login';               
        
        if($this->input->post('loginSubmit')) {
			
			$checkLogin = $this->employee_model->getRows(array('select' => array('password', 'salt', 'id'), 'conditions' => array('username' => $this->input->post('username')), 'returnType' => 'single'));

			if($checkLogin && ((hash("sha256", $this->input->post('password') . $checkLogin['salt'])) === $checkLogin['password'])) {								
				
				$this->session->set_userdata('isEmployeeLoggedIn',TRUE);
				$this->session->set_userdata('employeeId', $checkLogin['id']);
				redirect('/employees/orders/');
				
			} else {
				$this->session->set_userdata('error_msg_timeless', 'Wrong email or password.');
			}                 
            
            $this->load->view('employee_login', $data);
            
        } elseif ($this->session->userdata('isEmployeeLoggedIn')) {
			redirect('/employees/orders/');
		} else {
			$this->load->view('employee_login', $data);
		}
	}
	
	public function logout() {
        $this->session->unset_userdata('isEmployeeLoggedIn');
        $this->session->unset_userdata('employeeId');
        //$this->session->sess_destroy();
        redirect('/employees/login/');
    }
	
	public function dashboard() {														
		$data = array();													
		$data['title'] = 'Dashboard';														
		$this->load->view('dashboard', $data);
	}
	
	public function add_product() {
		$data = array();		
		$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));
		$categories = array();
		foreach ($data['categories'] as $key => $row) {
			$categories[$key] = $row['name'];
		}		
		array_multisort($categories, SORT_ASC, $data['categories']);	
		$data['title'] = 'Добави продукт';
		$this->load->view('add_product', $data);
	}
	
	public function update_product($productId=null) {
		if($productId !== null && is_numeric($productId)) {
			$data = array();
			$data['product'] = $this->product_model->getRows(array('id' => $productId));
			$data['tags'] = $this->tag_model->getRows(array('select' => array('tags.name'),
															'joins' => array('product_tags' => 'product_tags.tag_id = tags.id',
																			 'products' => 'products.id = product_tags.product_id'),
															'conditions' => array('products.id' => $productId)));	
			$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));	
			$data['title'] = 'Редактирай продукт';
			$this->load->view('update_product', $data);
		} else {
			echo "Invalid arguments";
		}
	}
	
	public function tags() {
		$data = array();		
		
		$this->load->library('pagination');
		$config = $this->configure_pagination();
		$config['base_url'] = site_url("employees/tags");
		$config['per_page'] = 50;
			
		if($this->input->get('page') != NULL and is_numeric($this->input->get('page')) and $this->input->get('page') > 0) {
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
		} else {
			$start = 0;
		}		
		
		$data['tags'] = $this->tag_model->getRows(array('start' => $start,
														'limit' => $config['per_page']));
														
		
		$config['total_rows'] = $this->tag_model->getRows(array('returnType' => 'count'));		
															
		$this->pagination->initialize($config);							
		$data['pagination'] = $this->pagination->create_links();
													
		$data['title'] = 'Тагове';
		$this->load->view('tags', $data);
	}
	
	public function add_tag() {
		$data = array();
		$data['title'] = 'Нов таг';
		$this->load->view('add_tag', $data);
	}
	
	public function orders() {
		$data = array();														  
		$data['title'] = 'Orders';
		$this->load->view('client_orders', $data);
	}
	
	
	public function get_orders() {
	
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
			$getRows['limit'] = $this->input->get('size');
		} 
		
		if($this->input->get('page') && is_numeric($this->input->get('page'))) {
			if(isset($getRows['limit'])) {
				$start = $this->input->get('page') * $getRows['limit'];
			} else {
				$start = 0;
			}			
			$getRows['start'] = $start;
		}
		
		if($this->input->get('col')) {
			$sort = $this->input->get('col');				
			foreach($sort as $key => $value) {
				switch($key) {
					case 0: 
						if($value)
							$getRows['order_by']['orders.created_at'] = 'DESC';
						else
							$getRows['order_by']['orders.created_at'] = 'ASC';				
						break;
					case 1: 
						if($value)
							$getRows['order_by']['orders.updated_at'] = 'DESC';
						else
							$getRows['order_by']['orders.updated_at'] = 'ASC';				
						break;
					case 2: 
						if($value)
							$getRows['order_by']['orders.id'] = 'DESC';
						else
							$getRows['order_by']['orders.id'] = 'ASC';	
						break;
					case 3: 
						if($value)
							$getRows['order_by']['users.email'] = 'DESC';
						else
							$getRows['order_by']['users.email'] = 'ASC';	
						break;
					case 4: 
						if($value)
							$getRows['order_by']['orders.amount_leva'] = 'DESC';
						else
							$getRows['order_by']['orders.amount_leva'] = 'ASC';	
						break;
					case 5: 
						if($value)
							$getRows['order_by']['statuses.name'] = 'DESC';
						else
							$getRows['order_by']['statuses.name'] = 'ASC';	
						break;
					default: 
						
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
						break;
					case 1: 
						$getRows['like']['orders.updated_at'] = $value;
						break;
					case 2: 
						$getRows['conditions']['orders.id'] = $value;
						break;
					case 3: 
						$getRows['like']['users.email'] = $value;	
						break;
					case 4: 
						$getRows['conditions']['orders.amount_leva'] = $value;
						break;
					case 5: 
						$getRows['like']['statuses.name'] = $value;
						break;
					default: 		
										
						break;
				}
			}
		}
		
		if($this->input->get('date_c_from') != '') {
			$getRows['conditions']['DATE(orders.created_at) >= '] = $this->input->get('date_c_from');
		}	
		
		if($this->input->get('date_c_to') != '') {
			$getRows['conditions']['DATE(orders.created_at) <= '] = $this->input->get('date_c_to');
		}	
																			 
		if($this->input->get('date_m_from') != '') {
			$getRows['conditions']['DATE(orders.updated_at) >= '] = $this->input->get('date_m_from');
		}	
		
		if($this->input->get('date_m_to') != '') {
			$getRows['conditions']['DATE(orders.updated_at) <= '] = $this->input->get('date_m_to');
		}	
																			 
		if($this->input->get('price_from') != '') {
			$getRows['conditions']['orders.amount_leva >= '] = floatval($this->input->get('price_from'));
		}	
		
		if($this->input->get('price_to') != '') {
			$getRows['conditions']['orders.amount_leva <= '] = floatval($this->input->get('price_to'));
		}																		 
		
		$orders = $this->order_model->getRows($getRows);													  
															 
		unset($getRows['start']);		
		unset($getRows['limit']);		
		$allRows = $this->order_model->getRows($getRows);
		if($allRows)
			$resultArray['total_rows'] = count($allRows);
		else
			$resultArray['total_rows'] = 0;
		
		$statuses = $this->order_model->getRows(array('table' => 'statuses',
													  'order_by' => array('statuses.name' => 'ASC')));
													  
		$tempArray = array();													  
		$tempArray2 = array();
		if($orders) {													  
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
		}
		
		$resultArray['rows'] = $tempArray2;
		
		$totalSum['Всички'] = 0.00;
		$totalSum['Настоящи'] = 0.00;
		$totalSum['Очаквани'] = 0.00;
		$resultArray['sums'] = $totalSum;
		if($allRows) {		
			$totalSum['Всички'] = 0;
			$totalSum['Настоящи'] = 0;
			$totalSum['Очаквани'] = 0;
			foreach($allRows as $row) {			
				if($row['status_name'] === 'Delivered' || $row['status_name'] === 'Awaiting Shipment' || $row['status_name'] === 'Awaiting Delivery') {
					$totalSum['Настоящи'] += $row['amount_leva'];				
				}
				if($row['status_name'] === 'Awaiting Payment' || $row['status_name'] === 'Payment being verified') {
					$totalSum['Очаквани'] += $row['amount_leva'];
				}
			}
									
			$totalSum['Всички'] = number_format($totalSum['Настоящи'] + $totalSum['Очаквани'], 2);
			$totalSum['Настоящи'] = number_format($totalSum['Настоящи'], 2);
			$totalSum['Очаквани'] = number_format($totalSum['Очаквани'], 2);
						
			$resultArray['sums'] = $totalSum;		
		}
		
		header('Content-Type:application/json');													  		
		echo json_encode($resultArray);												  												  
	}
	
	
	public function get_products() {
		
		$getRows = array('select' => array('products.*' , 'categories.name as category'), 
										   'joins' => array('categories' => 'categories.id = products.category_id'));
		
		if($this->input->get('size') && is_numeric($this->input->get('size'))) {		
			$getRows['limit'] = $this->input->get('size');
		} 
		
		if($this->input->get('page') && is_numeric($this->input->get('page'))) {
			if(isset($getRows['limit'])) {
				$start = $this->input->get('page') * $getRows['limit'];
			} else {
				$start = 0;
			}			
			$getRows['start'] = $start;
		}
		
		if($this->input->get('col')) {
			$sort = $this->input->get('col');				
			foreach($sort as $key => $value) {
				switch($key) {
					case 0: 
						if($value)
							$getRows['order_by']['products.created_at'] = 'DESC';
						else
							$getRows['order_by']['products.created_at'] = 'ASC';				
						break;
					case 1: 
						if($value)
							$getRows['order_by']['products.updated_at'] = 'DESC';
						else
							$getRows['order_by']['products.updated_at'] = 'ASC';				
						break;
					case 2: 
						if($value)
							$getRows['order_by']['products.name'] = 'DESC';
						else
							$getRows['order_by']['products.name'] = 'ASC';	
						break;
					case 3: 
						if($value)
							$getRows['order_by']['categories.name'] = 'DESC';
						else
							$getRows['order_by']['categories.name'] = 'ASC';	
						break;
					case 4: 
						if($value)
							$getRows['order_by']['products.price_leva'] = 'DESC';
						else
							$getRows['order_by']['products.price_leva'] = 'ASC';	
						break;
					case 5: 
						if($value)
							$getRows['order_by']['products.quantity'] = 'DESC';
						else
							$getRows['order_by']['products.quantity'] = 'ASC';	
						break;
					default: 						
						break;
				}
			}
		}
		
		if($this->input->get('fcol')) {
			$filter = $this->input->get('fcol');						
			foreach($filter as $key => $value) {
				switch($key) {
					case 0: 
						$getRows['like']['products.created_at'] = $value;			
						break;
					case 1: 
						$getRows['like']['products.updated_at'] = $value;
						break;
					case 2: 
						$getRows['like']['products.name'] = $value;
						break;
					case 3: 
						$getRows['like']['categories.name'] = $value;	
						break;
					case 4: 
						$getRows['like']['products.price_leva'] = $value;
						break;
					case 5: 
						$getRows['conditions']['products.quantity'] = $value;
						break;
					default: 											
						break;
				}
			}
		}
		
		if($this->input->get('date_c_from') != '') {
			$getRows['conditions']['DATE(products.created_at) >= '] = $this->input->get('date_c_from');
		}	
		
		if($this->input->get('date_c_to') != '') {
			$getRows['conditions']['DATE(products.created_at) <= '] = $this->input->get('date_c_to');
		}	
																			 
		if($this->input->get('date_m_from') != '') {
			$getRows['conditions']['DATE(products.updated_at) >= '] = $this->input->get('date_m_from');
		}	
		
		if($this->input->get('date_m_to') != '') {
			$getRows['conditions']['DATE(products.updated_at) <= '] = $this->input->get('date_m_to');
		}	
																			 
		if($this->input->get('price_from') != '') {
			$getRows['conditions']['products.price_leva >= '] = floatval($this->input->get('price_from'));
		}	
		
		if($this->input->get('price_to') != '') {
			$getRows['conditions']['products.price_leva <= '] = floatval($this->input->get('price_to'));
		}																		 
		
		$products = $this->product_model->getRows($getRows);													  
															 
		unset($getRows['start']);		
		unset($getRows['limit']);		
		$allRows = $this->product_model->getRows($getRows);
		if($allRows)
			$resultArray['total_rows'] = count($allRows);
		else
			$resultArray['total_rows'] = 0;

													  
		$tempArray = array();													  
		$tempArray2 = array();
		if($products) {													  
			foreach($products as $product) {
				$tempArray[] = htmlentities($product['created_at'], ENT_QUOTES);
				$tempArray[] = htmlentities($product['updated_at'], ENT_QUOTES);
				$tempArray[] = htmlentities($product['name'], ENT_QUOTES);
				$tempArray[] = htmlentities($product['category'], ENT_QUOTES);
				$tempArray[] = htmlentities($product['price_leva'], ENT_QUOTES);
				$tempArray[] = htmlentities($product['quantity'], ENT_QUOTES);
				$tempArray[] = '<a href="' . site_url("employees/update_product/" . htmlentities($product['id'], ENT_QUOTES)) . '" class="product_details">Редактирай</a>';
				$tempArray[] = '<a href="#" data-id="' . htmlspecialchars($product['id'], ENT_QUOTES) .'" class="delete_record">Изтрий</a>';
				$tempArray2[] = $tempArray;
				$tempArray = array();
			}
		}
		
		$resultArray['rows'] = $tempArray2;
		
		header('Content-Type:application/json');													  		
		echo json_encode($resultArray);	
	
	}
	
	public function order_details($orderId=null) {
		
		if(is_numeric($orderId)) {

			$data = array();		
			$this->load->model('user_model');					
			$this->load->model('product_model');						

			$orderData = $this->order_model->getRows(array('select' => array('orders.user_id'), 'conditions' => array('orders.id' => $orderId), 'returnType' => 'single'));
			if($orderData) {
				
				$data['userData'] = $this->user_model->getRows(array('id' => $orderData['user_id']));
												
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
																			 
				$data['products'] = $this->product_model->getRows(array('select' => array(
																				  'products.name as name', 
																				  'products.image as image', 
																				  'products.id as product_id', 
																				  'products.price_leva',
																				  'order_products.quantity'),
																		'joins' => array('order_products' => 'order_products.product_id = products.id',
																						 'orders' => 'orders.id = order_products.order_id'),
																		'conditions' => array('orders.id' => $orderId)));
																																							
				$data['title'] = 'Order Details';
				$this->load->view('order_details.php', $data);			

			} else {
				
			}
			
		} else {
			redirect('/employees/');
		}
	}
	
	public function change_status() {
		if($this->input->post('statusId') && $this->input->post('orderId')) {
			
			$update = $this->order_model->update(array('set' => array('status_id' => $this->input->post('statusId')),
													   'conditions' => array('id' => $this->input->post('orderId'))));
			if($update) echo true; else echo false;			
			
		}
	}
	
	public function get_user_emails($input=null) {
		if($input !== null) {
			
			$this->load->model('user_model');
		
			$input = urldecode($input);	

			header('Content-Type:application/json');	
		
			$emails = $this->user_model->getRows(array('select' => array('users.email'), 
													   'like' => array('users.email' => $input)));
													
			if($emails) echo json_encode($emails); else echo false;					
			
		} else {
			echo false;
		}
	}
	
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
		$config["next_link"] = "Next";
		$config["prev_link"] = "Prev";
	
		return $config;
	}
	
}	
?>

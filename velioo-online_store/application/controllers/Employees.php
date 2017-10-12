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
		
		$this->load->library('pagination');
		$config = $this->configure_pagination();
		$config['base_url'] = site_url("employees/dashboard");
		$config['per_page'] = 10;
			
		if($this->input->get('page') != NULL and is_numeric($this->input->get('page')) and $this->input->get('page') > 0) {
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
		} else {
			$start = 0;
		}
		

		$data['products'] = $this->product_model->getRows(array('select' => array('products.*' , 'categories.name as category'), 
																'joins' => array('categories' => 'categories.id = products.category_id'),
																'order_by' => array('created_at' => 'DESC'),
																'start' => $start,
																'limit' => $config['per_page']));
																
		$config['total_rows'] = $this->product_model->getRows(array('returnType' => 'count'));		
															
		$this->pagination->initialize($config);							
		$data['pagination'] = $this->pagination->create_links();														
																
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
		$config['per_page'] = 100;
			
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
		
		$this->load->library('pagination');
		$config = $this->configure_pagination();
		$config['base_url'] = site_url("employees/orders");
		$config['per_page'] = 50;
			
		if($this->input->get('page') != NULL and is_numeric($this->input->get('page')) and $this->input->get('page') > 0) {
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
		} else {
			$start = 0;
		}			
		
		$data['orders'] = $this->order_model->getRows(array('select' => array('orders.id as order_id',
																			  'orders.created_at as order_created_at',
																		      'orders.amount_leva',
																			  'statuses.name as status_name',
																			  'statuses.id as status_id'), 
															  'joins' => array('statuses' => 'statuses.id = orders.status_id'),
															  'order_by' => array('created_at' => 'DESC'),
															  'start' => $start,
															  'limit' => $config['per_page']));													  
															  
		$config['total_rows'] = $this->order_model->getRows(array('returnType' => 'count'));	
															  
		$data['statuses'] = $this->order_model->getRows(array('table' => 'statuses', 
															  'where_in' => array('name' => array('Awaiting Payment', 'Payment being verified', 'Awaiting Shipment', 'Awaiting Delivery'))));
															  
		$this->pagination->initialize($config);							
		$data['pagination'] = $this->pagination->create_links();
															  
		$data['title'] = 'Orders';
		$this->load->view('client_orders', $data);
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

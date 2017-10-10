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
		$data['products'] = $this->product_model->getRows(array('select' => array('products.*' , 'categories.name as category'), 
																'joins' => array('categories' => 'categories.id = products.category_id'),
																'order_by' => array('created_at' => 'DESC')));
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
	
	public function update_product($product_id=null) {
		if($product_id !== null && is_numeric($product_id)) {
			$data = array();
			$data['product'] = $this->product_model->getRows(array('id' => $product_id));
			$data['tags'] = $this->tag_model->getRows(array('select' => array('tags.name'),
															'joins' => array('product_tags' => 'product_tags.tag_id = tags.id',
																			 'products' => 'products.id = product_tags.product_id')));	
			$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));	
			$data['title'] = 'Редактирай продукт';
			$this->load->view('update_product', $data);
		} else {
			echo "Invalid arguments";
		}
	}
	
	public function orders() {
		$data = array();
		$data['title'] = 'Orders';
		$data['orders'] = $this->order_model->getRows(array('select' => array('orders.id as order_id',
																			  'orders.created_at as order_created_at',
																		      'orders.amount_leva',
																			  'statuses.name as status_name',
																			  'statuses.id as status_id'), 
															  'joins' => array('statuses' => 'statuses.id = orders.status_id', 
																			   'payment_methods' => 'payment_methods.id = orders.payment_method_id'),
															  'order_by' => array('created_at' => 'DESC')));
		$data['statuses'] = $this->order_model->getRows(array('table' => 'statuses', 'where_in' => array('id' => array('4', '5', '6', '7'))));
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
	
}	
?>

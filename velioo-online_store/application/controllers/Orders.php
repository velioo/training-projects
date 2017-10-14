<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Orders extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->library('form_validation');
		$this->load->model('order_model');
	}
	
	public function index() {
		if($this->session->userdata('isUserLoggedIn')) {
			redirect('/users/account/');
		} else {
			redirect('/users/login/');
		}
	}
	
	public function confirm_order() {
		if($this->input->post('paymentSubmit')) {
			$data = array();		
			$this->load->model('cart_model');
			$this->load->model('user_model');
			$cartData = $this->cart_model->getRows(array('select' => array('products.*', 'cart.quantity as cart_quantity'), 
														   'joins' => array('products' => 'products.id = cart.product_id'), 
														   'conditions' => array('cart.user_id' => $this->session->userdata('userId'))));
			$payment_method = $this->order_model->getRows(array('table' => 'payment_methods', 'id' => $this->input->post('payment_method')));	
			$data['userData'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
			if($cartData) {	
				if($payment_method) {
					$this->session->set_userdata('payment_method', $payment_method['id']);
					$data['products'] = $cartData;
					$data['payment_method'] = $payment_method;
					$data['title'] = 'Confirm Order';
					$this->load->view('confirm_order.php', $data);	
				} else {
					$this->session->set_userdata('error_msg', 'Моля изберете начин на плащане.');
					redirect('/orders/payment_method/');
				}
			} else {
				redirect('/welcome/');
			}	
		} else {
			redirect('/welcome/');
		}
	}
	
	public function create_order() {
		
		if($this->input->post('confirmSubmit')) {
			$data = array();
			
			$this->load->model('cart_model');
			$cartData = $this->cart_model->getRows(array('select' => array('products.id', 'products.price_leva', 'cart.quantity as cart_quantity'), 
														   'joins' => array('products' => 'products.id = cart.product_id'), 
														   'conditions' => array('cart.user_id' => $this->session->userdata('userId'))));		
			if($cartData) {											   
			
				$amountLeva = 0.0;										   
				foreach($cartData as $c) {
					$c['price_leva'] = (float)$c['price_leva'];
					$amountLeva += ($c['price_leva'] * $c['cart_quantity']);
				}

				$orderData = array(
					'user_id' => $this->session->userdata('userId'),
					'report' => '',
					'amount_leva' => $amountLeva,
				);
				
				$this->db->trans_begin();

				$orderId = $this->order_model->insert($orderData);		
				foreach($cartData as $c) {		
					$purchaseData = array(
						'product_id' => $c['id'],
						'order_id' => $orderId,
						'price_leva' => $c['price_leva'],
						'quantity' => $c['cart_quantity']
					);			
					$insert = $this->order_model->insert($purchaseData, 'order_products');
				}
				
				$update = $this->order_model->update(array('set' => array('payment_method_id' => $this->session->userdata('payment_method')), 'conditions' => array('orders.id' => $orderId)));
				if($update) {
					$data['payment_details'] = $this->order_model->getRows(array('table' => 'payment_methods', 'conditions' => array('payment_methods.id' => $this->session->userdata('payment_method')), 'returnType' => 'single'));
					$this->session->unset_userdata('payment_method');
				}
				
				$delete = $this->cart_model->delete(array('conditions' => array('user_id' => $this->session->userdata('userId'))));

				if ($this->db->trans_status() === FALSE) {
					$this->db->trans_rollback();
				} else {
					$this->db->trans_commit();
				}
				$data['title'] = 'Order Placed';
				$this->load->view('order_created.php', $data);
							
			} else {
				redirect('/welcome/');
			}	
		} else {
			echo redirect('/welcome/');
		}
	}
	
	public function payment_method() {
									
			$data = array();
			
			$this->load->model('cart_model');
			$cartData = $this->cart_model->getRows(array('select' => array('products.*', 'cart.quantity as cart_quantity'), 
														   'joins' => array('products' => 'products.id = cart.product_id'), 
														   'conditions' => array('cart.user_id' => $this->session->userdata('userId'))));		
			if($cartData) {
				$data['products'] = $cartData;											
				$data['payment_methods'] = $this->order_model->getRows(array('table' => 'payment_methods'));
				$data['title'] = 'Payment Method';
				$this->load->view('payment_method.php', $data);
			} else {
				redirect('/welcome/');
			}
	}
	
	public function show_order($orderId=null) {
		
		if(is_numeric($orderId)) {

			$data = array();		
			$this->load->model('user_model');					
			$this->load->model('product_model');					
			$data['userData'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));	

			$orderData = $this->order_model->getRows(array('select' => array('orders.user_id'), 'conditions' => array('orders.id' => $orderId), 'returnType' => 'single'));
			if($orderData) {
				if($orderData['user_id'] === $this->session->userdata('userId')) {
					
						
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
						
					$data['title'] = 'Show Order';
					$this->load->view('show_order.php', $data);			
				} else {
					redirect('/welcome/');
				}
			} else {
				
			}
			
		} else {
			redirect('/welcome/');
		}
	}
	
	function decline_order() {
		if($this->input->post('orderId')) {
						
			$update = $this->order_model->update(array('set' => array('orders.status_id' => 2), 'conditions' => array('orders.id' => $this->input->post('orderId'))));
			
			if($update) {
				echo 1;
			} else {
				echo 0;
			}
			
		} else {
			redirect('/welcome/');
		}
	}
	
	function deliver_order() {
		if($this->input->post('orderId')) {
						
			$update = $this->order_model->update(array('set' => array('orders.status_id' => 1), 'conditions' => array('orders.id' => $this->input->post('orderId'))));
			
			if($update) {
				echo 1;
			} else {
				echo 0;
			}
			
		} else {
			redirect('/welcome/');
		}
	}
	
}


?>

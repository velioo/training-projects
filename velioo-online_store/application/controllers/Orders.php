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
		
		log_message('user_info', "\n\n" . site_url('orders/confirm_order') . ' loaded.');
		
		if($this->input->post('paymentSubmit')) {
			$data = array();		
			$this->load->model('cart_model');
			$this->load->model('user_model');
			log_message('user_info', 'cart_model and user_model loaded');
			$cartData = $this->cart_model->getRows(array('select' => array('products.*', 'cart.quantity as cart_quantity'), 
														   'joins' => array('products' => 'products.id = cart.product_id'), 
														   'conditions' => array('cart.user_id' => $this->session->userdata('userId'))));													   
			if($cartData) {				
				log_message('user_info', 'Cart products returned');
				log_message('user_info', 'Getting payment method details...Payment method id = ' . $this->input->post('payment_method'));							   
				$payment_method = $this->order_model->getRows(array('table' => 'payment_methods', 'id' => $this->input->post('payment_method')));
				if($payment_method) {	
					log_message('user_info', 'Payment method details returned');
					log_message('user_info', 'Getting user data...');	
					assert_v(is_numeric($this->session->userdata('userId')));		
					$data['userData'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
					assert_v($data['userData']);	
					log_message('user_info', 'User data returned');
					log_message('user_info', 'Saving payment method id in session. Id = ' . $payment_method['id']);
					$this->session->set_userdata('payment_method', $payment_method['id']);
					$data['products'] = $cartData;
					$data['payment_method'] = $payment_method;
					$data['title'] = 'Confirm Order';
					log_message('user_info', 'Loading confirm_order page');
					$this->load->view('confirm_order.php', $data);	
				} else {
					log_message('user_info', 'No payment method found with the specified id, payment_method_id = ' . $this->input->post('payment_method'));
					$this->session->set_userdata('error_msg', 'Моля изберете начин на плащане.');
					redirect('/orders/payment_method/');
				}
			} else {
				log_message('user_info', 'Failed to get cart products data');
				redirect('/welcome/');
			}	
		} else {
			log_message('user_info', 'paymentSubmit is NULL. No form submitted. Redirecting to ' . site_url('/welcome/'));
			redirect('/welcome/');
		}
	}
	
	public function create_order() {
		
		log_message('user_info', "\n\n" . site_url('orders/create_order') . ' loaded.');
		
		if($this->input->post('confirmSubmit')) {
			$data = array();
			
			$this->load->model('cart_model');
			log_message('user_info', 'cart model loaded');
			assert_v(is_numeric($this->session->userdata('userId')));
			log_message('user_info', 'Getting cart products...');
			$cartData = $this->cart_model->getRows(array('select' => array('products.id', 'products.price_leva', 'cart.quantity as cart_quantity'), 
														   'joins' => array('products' => 'products.id = cart.product_id'), 
														   'conditions' => array('cart.user_id' => $this->session->userdata('userId'))));		
			if($cartData) {		
													   
				log_message('user_info', 'Cart products returned');
				
				$amountLeva = 0.0;
				log_message('user_info', 'Calculating total order price...');
				foreach($cartData as $c) {
					$c['price_leva'] = (float)$c['price_leva'];
					$amountLeva += ($c['price_leva'] * $c['cart_quantity']);
				}
				log_message('user_info', 'Total order price calculated: ' . $amountLeva);
				
				assert_v(is_float($amountLeva));

				$orderData = array(
					'user_id' => $this->session->userdata('userId'),
					'report' => '',
					'amount_leva' => $amountLeva,
				);
				
				log_message('user_info', 'Begin transaction');
				$this->db->trans_begin();

				log_message('user_info', 'Creating new order...');
				$orderId = $this->order_model->insert($orderData);	
				if($orderId) {
					log_message('user_info', 'New order created. Order id = ' . $orderId);
					log_message('user_info', 'Creating relations between order and products...');
					foreach($cartData as $c) {		
						$purchaseData = array(
							'product_id' => $c['id'],
							'order_id' => $orderId,
							'price_leva' => $c['price_leva'],
							'quantity' => $c['cart_quantity']
						);			
						$insert = $this->order_model->insert($purchaseData, 'order_products');
					}
					log_message('user_info', 'All relations created');
					assert_v($this->session->userdata('payment_method') !== null && is_numeric($this->session->userdata('payment_method')));
					log_message('user_info', 'Updating order payment method. Seting payment_method_id = ' . $this->session->userdata('payment_method'));
					$update = $this->order_model->update(array('set' => array('payment_method_id' => $this->session->userdata('payment_method')), 
															   'conditions' => array('orders.id' => $orderId)));															   
					if($update) {
						log_message('user_info', 'Order payment method successfully updated');
						$data['payment_details'] = $this->order_model->getRows(array('table' => 'payment_methods', 'conditions' => array('payment_methods.id' => $this->session->userdata('payment_method')), 'returnType' => 'single'));
						$this->session->unset_userdata('payment_method');
						$delete = $this->cart_model->delete(array('conditions' => array('user_id' => $this->session->userdata('userId'))));
						if($delete) {
							log_message('user_info', 'All user cart products deleted');
						} else {
							log_message('user_info', 'Failed to delete user cart products records');
						}
					} else {
						log_message('user_info', 'Failed to update order payment method');
					}				

					if ($this->db->trans_status() === FALSE) {
						log_message('user_info', 'Transaction failed...rolling back');
						$this->db->trans_rollback();
					} else {
						log_message('user_info', 'Transaction successfull');
						$this->db->trans_commit();
					}
					$data['title'] = 'Order Placed';
					log_message('user_info', 'Loading order_created page');
					$this->load->view('order_created.php', $data);
				} else {
					log_message('user_info', 'Failed to insert new order');
					$this->db->trans_rollback();
				}			
			} else {
				log_message('user_info', 'Failed to get cart products data');
				redirect('/welcome/');
			}	
		} else {
			log_message('user_info', 'confirmSubmit is NULL. No form submitted. Redirecting to ' . site_url('/welcome/'));
			echo redirect('/welcome/');
		}
	}
	
	public function payment_method() {
							
			log_message('user_info', "\n\n" . site_url('orders/payment_method') . ' loaded.');
									
			$data = array();	
			$this->load->model('cart_model');
			log_message('user_info', 'cart_model loaded');
			log_message('user_info', 'Getting cart products data');
			assert_v(is_numeric($this->session->userdata('userId')));	
			$cartData = $this->cart_model->getRows(array('select' => array('products.id', 'products.name', 'products.price_leva', 'products.image', 'cart.quantity'), 
														 'joins' => array('products' => 'products.id = cart.product_id'), 
														 'conditions' => array('cart.user_id' => $this->session->userdata('userId'))));		
			if($cartData) {
				log_message('user_info', 'Cart products data returned');
				$data['products'] = $cartData;			
				log_message('user_info', 'Getting payment methods...');								
				$data['payment_methods'] = $this->order_model->getRows(array('table' => 'payment_methods'));
				log_message('user_info', 'Payment methods returned');	
				$data['title'] = 'Payment Method';
				log_message('user_info', 'Loading payment_method page');	
				$this->load->view('payment_method.php', $data);
			} else {
				log_message('user_info', 'Failed to get cart products data. Redirecting to ' . site_url('/welcome/'));
				redirect('/welcome/');
			}
	}
	
	public function show_order($orderId=null) {
		
		log_message('user_info', "\n\n" . site_url('orders/show_order') . ' loaded.');
		
		if(is_numeric($orderId)) {
			
			log_message('user_info', 'orderId = ' . $orderId);
			assert_v(is_numeric($orderId));

			$data = array();		
			$this->load->model('user_model');					
			$this->load->model('product_model');	
			log_message('user_info', 'user_model and product_model loaded');
							
			assert_v(is_numeric($this->session->userdata('userId')));	
			log_message('user_info', 'Getting user data...');			
			$data['userData'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
			assert_v($data['userData']);	
			log_message('user_info', 'User data returned');

			log_message('user_info', 'Getting order user id...');
			$orderUserId = $this->order_model->getRows(array('select' => array('orders.user_id'), 'conditions' => array('orders.id' => $orderId), 'returnType' => 'single'))['user_id'];
			if($orderUserId) {
				log_message('user_info', 'Order user id returned');
				if($orderUserId === $this->session->userdata('userId')) {
					
						
					$result = $this->order_model->getRows(array('select' => array('orders.id as order_id',
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
					if($result) {
						
						log_message('user_info', 'Order data returned');
						$data['order'] = $result;
						
						$result = $this->product_model->getRows(array('select' => array(
																					  'products.name as name', 
																					  'products.image as image', 
																					  'products.id as product_id', 
																					  'products.price_leva',
																					  'order_products.quantity'),
																			'joins' => array('order_products' => 'order_products.product_id = products.id',
																							 'orders' => 'orders.id = order_products.order_id'),
																			'conditions' => array('orders.id' => $orderId)));
						
						if($result) {
							log_message('user_info', 'Order products returned');
							$data['products'] = $result;
						} else {
							log_message('user_info', 'Failed to get order products data Redirecting to ' . site_url('/welcome/'));
							redirect('/welcome/');
						}	
							
						$data['title'] = 'Show Order';
						log_message('user_info', 'Loading show_order page');
						$this->load->view('show_order.php', $data);		
						
					} else {
						log_message('user_info', 'Failed to get order data. Redirecting to ' . site_url('/welcome/'));
						redirect('/welcome/');
					}
																				 
						
				} else {
					log_message('user_info', 'Permission denied. This order doesn\'t belong to this user. 
										      Current user id = ' . $this->session->userdata('userId') . ', order user id = ' . $orderUserId . ' Redirecting to ' . site_url('/welcome/'));
					redirect('/welcome/');
				}
			} else {
				log_message('user_info', 'No order found with the specified id');
			}
			
		} else {
			log_message('user_info', 'orderId is NULL or not numeric, orderId = ' . $orderId . ' Redirecting to ' . site_url('/welcome/'));
			redirect('/welcome/');
		}
	}
	
	function decline_order() {
		
		log_message('user_info', "\n\n" . site_url('orders/decline_order') . ' loaded.');
		
		if($this->input->post('orderId') && is_numeric($this->input->post('orderId'))) {
			
			log_message('user_info', 'orderId = ' . $this->input->post('orderId'));
			assert_v(is_numeric($this->input->post('orderId')));
						
			$update = $this->order_model->update(array('set' => array('orders.status_id' => 2), 'conditions' => array('orders.id' => $this->input->post('orderId'))));
			
			if($update) {
				log_message('user_info', 'Update successfull');
				echo 1;
			} else {
				log_message('user_info', 'Update failed');
				echo 0;
			}
			
		} else {
			log_message('user_info', 'orderId is NULL or not numeric, orderId = ' . $this->input->post('orderId'));
			redirect('/welcome/');
		}
	}
	
	function deliver_order() {
		
		log_message('user_info', "\n\n" . site_url('orders/deliver_order') . ' loaded.');
		
		if($this->input->post('orderId') && is_numeric($this->input->post('orderId'))) {
			
			log_message('user_info', 'orderId = ' . $this->input->post('orderId'));
			assert_v(is_numeric($this->input->post('orderId')));
						
			$update = $this->order_model->update(array('set' => array('orders.status_id' => 1), 'conditions' => array('orders.id' => $this->input->post('orderId'))));
			
			if($update) {
				log_message('user_info', 'Update successfull');
				echo 1;
			} else {
				log_message('user_info', 'Update failed');
				echo 0;
			}
			
		} else {
			log_message('user_info', 'orderId is NULL or not numeric, orderId = ' . $this->input->post('orderId'));
			redirect('/welcome/');
		}
	}
	
}


?>

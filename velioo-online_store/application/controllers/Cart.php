<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Cart extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->model('cart_model');
	}
	
	public function index() {
		redirect('/users/cart/');
	}
	
	public function add() {
		
		log_message('user_info', "\n\n" . site_url('cart/add') . ' loaded.');
		
		if($this->session->userdata('isUserLoggedIn')) {
			if($this->input->post('productId') && is_numeric($this->input->post('productId'))) {
				
				log_message('user_info', 'Product id: ' . $this->input->post('productId'));
				assert_v(is_numeric($this->input->post('productId')));
					
				$product = array();
				$product['product_id'] = $this->input->post('productId');
				assert_v(is_numeric($this->session->userdata('userId')));
				$product['user_id'] = $this->session->userdata('userId');
				
				$exists = $this->cart_model->getRows(array('conditions' => array('user_id' => $product['user_id'],
																				 'product_id' => $product['product_id']),
														   'returnType' => 'single'));
																			
				if($exists) {
					log_message('user_info',  'Product exists in users\' cart. Updating...');
					$update =  $this->cart_model->update(array('conditions' => array('user_id' => $product['user_id'], 'product_id' => $product['product_id']), 
													   'set' => array('quantity' => ++$exists['quantity'])));														   
					
					if($update) {
						log_message('user_info',  'Update successfull');
						echo true; 
					} else {
						log_message('user_info',  'Update failed');
						echo false;		
					}			 
													
				} else {
					log_message('user_info',  'Product doesn\'t exist in users\' cart. Inserting...');
					$insert = $this->cart_model->insert($product);
					if($insert) {
						log_message('user_info',  'Insert successfull');
						 echo true; 
					} else {
						log_message('user_info',  'Insert failed');
						echo false;		
					}	
				}
			} else {
				log_message('user_info',  'productId is NULL or not numeric. productId = ' . $this->input->post('productId'));
				echo false;
			}						
		} else {
			log_message('user_info', 'User is not logged '. 'Returning "login"');
			echo 'login';
		}
	}
	
	public function change_quantity() {
		
		log_message('user_info', "\n\n" . site_url('cart/change_quantity') . ' loaded.');
		
		if($this->session->userdata('isUserLoggedIn')) {
			if($this->input->post('productId') && $this->input->post('quantity') && 
				is_numeric($this->input->post('productId')) && is_numeric($this->input->post('quantity'))) {
				
				log_message('user_info', 'Product id: ' . $this->input->post('productId'));
				log_message('user_info', 'Quantity: ' . $this->input->post('quantity'));
				assert_v(is_numeric($this->input->post('productId')) && is_numeric($this->input->post('quantity')));
				
				$product = array();
				$product['product_id'] = $this->input->post('productId');
				assert_v(is_numeric($this->session->userdata('userId')));
				$product['user_id'] = $this->session->userdata('userId');
				
				$exists = $this->cart_model->getRows(array('conditions' => array('user_id' => $product['user_id'],
																				 'product_id' => $product['product_id']),
														   'returnType' => 'single'));
																			
				if($exists) {	
					if($this->input->post('quantity') > 0) {
						$update =  $this->cart_model->update(array('conditions' => array('user_id' => $product['user_id'], 'product_id' => $product['product_id']), 
														   'set' => array('quantity' => $this->input->post('quantity'))));														   
						
						if($update) {
							log_message('user_info',  'Update successfull');
							
							$product = $this->cart_model->getRows(array('select' => array('cart.quantity', 'products.price_leva'), 
																		'joins' => array('products' => 'products.id = cart.product_id'),
																		'conditions' => array('user_id' => $product['user_id'],
																							 'product_id' => $product['product_id']),
																		'returnType' => 'single'));
																		
							header('Content-Type:application/json');
							log_message('user_info',  'Returning new values for product');
							echo json_encode($product);
						} else { 
							log_message('user_info',  'Update failed');
							echo false;								
						}			
					} else {
						log_message('user_info', 'Product quantity must be > 0, quantity = ' . $this->input->post('quantity'));
						echo false;			
					}	 												
				} else {
					log_message('user_info', 'Product doesn\'t exist. Cannot change quantity of non-existent product');
					echo false;
				}
			} else {
				log_message('user_info',  'productId is NULL or not numeric OR quantity is NULL or not numeric: productId = ' . $this->input->post('productId') . ', quantity = ' . $this->input->post('quantity'));
				echo false;
			}				
		} else {
			log_message('user_info', 'User is not logged '. 'Returning "login"');
			echo 'login';
		}
	}
	
		
	public function remove() {
		
		log_message('user_info', "\n\n" . site_url('cart/remove') . ' loaded.');
		
		if($this->session->userdata('isUserLoggedIn')) {
			if($this->input->post('productId') && is_numeric($this->input->post('productId'))) {
				
				log_message('user_info', 'Product id: ' . $this->input->post('productId'));
				log_message('user_info', 'User id: ' . $this->session->userdata('userId'));
				assert_v(is_numeric($this->input->post('productId')));
				assert_v(is_numeric($this->session->userdata('userId')));
				
				$delete = $this->cart_model->delete(array('conditions' => array('product_id' => $this->input->post('productId'), 
																				'user_id' => $this->session->userdata('userId'))));			
				if($delete) { 
					log_message('user_info', 'Delete successfull');
					echo true;
				} else {
					log_message('user_info', 'Delete failed');
					 echo false;	
				}
			} else {
				log_message('user_info', 'productId is NULL or not numeric: productId = ' . $this->input->post('productId'));
				echo false;
			} 
		} else {
			log_message('user_info', 'User is not logged '. 'Returning "login"');
			echo 'login';
		}
	}
	
	public function cart_count_price() {
		
		log_message('user_info', "\n\n" . site_url('cart/cart_count_price') . ' loaded.');
		
		if($this->session->userdata('isUserLoggedIn')) {
			
			assert_v(is_numeric($this->session->userdata('userId')));
			log_message('user_info', 'Getting cart products quantity and price...');
			$result = $this->cart_model->getRows(array('select' => array('IFNULL(SUM(cart.quantity), 0) as count', 'IFNULL(SUM(products.price_leva * cart.quantity), 0) as price_leva'), 
													   'joins' => array('products' => 'products.id = cart.product_id'), 
													   'conditions' => array('cart.user_id' => $this->session->userdata('userId')),
													   'returnType' => 'single'));
													   
			assert_v(array_key_exists('count', $result));
			log_message('user_info', 'Count is: ' . $result['count']);										   					
			assert_v(is_int($result['count'] = intval($result['count'])));
			
			assert_v(array_key_exists('price_leva', $result));
			log_message('user_info', 'Price_leva is: ' . $result['price_leva']);				
			assert_v(is_float($result['price_leva'] = floatval($result['price_leva'])));
			
			header('Content-Type:application/json');	
			log_message('user_info', 'Returning user cart data');									   
			echo json_encode($result);
			//echo "[{\"smaller\": 5,\"larger\": 7}]";
		} else {
			log_message('user_info', 'User is not logged');
			echo false;
		}
	}
	
}	
?>

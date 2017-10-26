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
		if($this->session->userdata('isUserLoggedIn') && $this->input->post('product_id')) {
				
			$product = array();
			$product['product_id'] = $this->input->post('product_id');
			$product['user_id'] = $this->session->userdata('userId');
			
			$exists = $this->cart_model->getRows(array('conditions' => array('user_id' => $product['user_id'],
														                     'product_id' => $product['product_id']),
													   'returnType' => 'single'));
																		
			if($exists) {	
				$update =  $this->cart_model->update(array('conditions' => array('user_id' => $product['user_id'], 'product_id' => $product['product_id']), 
												   'set' => array('quantity' => ++$exists['quantity'])));														   
				
				if($update) echo true; else echo false;					 
									   			
			} else {
				$insert = $this->cart_model->insert($product);
				if($insert) echo true; else echo false;
			}
								
		} else {
			echo 'login';
			//redirect('/users/login/');
		}
	}
	
	public function change_quantity() {
		if($this->session->userdata('isUserLoggedIn')) {
			if($this->input->post('product_id') && $this->input->post('quantity') && 
				is_numeric($this->input->post('product_id')) && is_numeric($this->input->post('quantity'))) {
				
				$product = array();
				$product['product_id'] = $this->input->post('product_id');
				$product['user_id'] = $this->session->userdata('userId');
				
				$exists = $this->cart_model->getRows(array('conditions' => array('user_id' => $product['user_id'],
																				 'product_id' => $product['product_id']),
														   'returnType' => 'single'));
																			
				if($exists) {	
					if(is_numeric($this->input->post('quantity')) && ($this->input->post('quantity') > 0)) {
						$update =  $this->cart_model->update(array('conditions' => array('user_id' => $product['user_id'], 'product_id' => $product['product_id']), 
														   'set' => array('quantity' => $this->input->post('quantity'))));														   
						
						if($update) {
							
							$product = $this->cart_model->getRows(array('select' => array('cart.quantity', 'products.price_leva'), 
																		'joins' => array('products' => 'products.id = cart.product_id'),
																		'conditions' => array('user_id' => $product['user_id'],
																							 'product_id' => $product['product_id']),
																		'returnType' => 'single'));
																		
							header('Content-Type:application/json');
							echo json_encode($product);
						} else { 
							echo false;								
						}			
					} else echo false;				 
													
				} else {
					echo false;
				}
			} else {
				echo false;
			}				
		} else {
			echo 'login';
		}
	}
	
		
	public function remove() {
		if($this->session->userdata('isUserLoggedIn')) {
			if($this->input->post('productId')) {
				$delete = $this->cart_model->delete(array('conditions' => array('product_id' => $this->input->post('productId'), 'user_id' => $this->session->userdata('userId'))));			
				if($delete) echo true; else echo false;	
			} else {
				echo false;
			} 
		} else {
			echo 'login';
		}
	}
	
	public function cart_count_price() {
		if($this->session->userdata('isUserLoggedIn')) {
			$result = $this->cart_model->getRows(array('select' => array('IFNULL(SUM(cart.quantity), 0) as count', 'IFNULL(SUM(products.price_leva * cart.quantity), 0) as price_leva'), 
													   'joins' => array('products' => 'products.id = cart.product_id'), 
													   'conditions' => array('cart.user_id' => $this->session->userdata('userId'))));
			header('Content-Type:application/json');										   
			echo json_encode($result);
		} else {
			echo false;
			//redirect('/users/login/');
		}
	}
	
}	
?>

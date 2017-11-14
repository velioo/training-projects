<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Tags extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->library('form_validation');
		$this->load->model('tag_model');
	}
	
	public function index() {
		redirect('/employees/dashboard/');
	}
	
	public function get_tags($input=null) {		
		
		log_message('user_info', "\n\n" . site_url('tags/get_tags') . ' loaded.');
		
		if($input !== null) {
			log_message('user_info', 'Input = ' . $input);
			$input = urldecode($input);
			log_message('user_info', 'Decoded input = ' . $input);
			
			header('Content-Type:application/json');	
		
			log_message('user_info', 'Executing tags search query');
			$tags = $this->tag_model->getRows(array('select' => array('name'), 
													'like' => array('name' => $input)));												
			if($tags) {				
				log_message('user_info', 'Tags found. Returning them to browser.');					
				echo json_encode($tags);
			} else {
				log_message('user_info', 'No tags matched');	
				echo false;
			}
		} else {
			log_message('user_info', 'Input is null');
			echo false;
		}
	}
	
	public function insert_tag() {
		
		log_message('user_info', "\n\n" . site_url('tags/insert_tag') . ' loaded.');
		
		$data = array();
		$data['title'] = 'Добави таг';
		
		if($this->input->post('tagSubmit')) {
			
			log_message('user_info', 'Setting form validation rules...');
			$this->form_validation->set_rules('name', 'Name', 'required|trim|callback_tag_validate|callback_tag_check');				
			
			log_message('user_info', 'Processing tag name:' . $this->input->post('name'));			
			$tag = trim($this->input->post('name'));
			$tag = explode(':', $tag, 2);
			$tag = array_map('trim', $tag);
			$tag = implode(':', $tag);
			
			$tagData = array(
                'name' => $tag
            );              
            
            if($this->form_validation->run() == true) {				
							
				log_message('user_info', 'Fields validated successfully');
				log_message('user_info', 'Inserting new tag...');
				$insert = $this->tag_model->insert($tagData);
				
				if($insert) {
					log_message('user_info', 'Tag insertion successfull. Redirecting to ' . site_url('/employees/tags/'));
					$this->session->set_userdata('success_msg', 'Тагът е успешно добавен. ');
                    redirect('/employees/tags/');   
				} else {
					log_message('user_info', 'Failed to insert new tag');
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля свържете се с вашия администратор');
				}
				
			}   
			
			$data['tag'] = $tagData;   
			
		} else {
			log_message('user_info', 'tagSubmit is NULL. No Form submitted');				
		}
		
		log_message('user_info', 'Loading add_tag page');			
		$this->load->view('add_tag', $data);
	}

	public function delete_product_tag() {
		
		log_message('user_info', "\n\n" . site_url('tags/delete_product_tag') . ' loaded.');
		
		if($this->input->post('tagName') && $this->input->post('productId') && is_numeric($this->input->post('productId'))) {
			
			log_message('user_info', 'tagName = ' . $this->input->post('tagName'));	
			log_message('user_info', 'productId = ' . $this->input->post('productId'));	
			assert_v(is_numeric($this->input->post('productId')));
			
			$tagId = $this->tag_model->getRows(array('select' => array('id'),
													 'conditions' => array('name' => $this->input->post('tagName')),
													 'returnType' => 'single'));
			if($tagId) {
				$delete = $this->tag_model->delete(array('conditions' => array('tag_id' => $tagId['id'], 
																			   'product_id' => $this->input->post('productId'))), 'product_tags');		
				if($delete) {
					log_message('user_info', 'Deletion successfull');
					echo true;
				} else {
					log_message('user_info', 'Deletion failed');
					echo false;
				}
			} else {
				log_message('user_info', 'No tag found with name = ' . $this->input->post('tagName'));	
				return false;
			}									 
			
		} else {
			log_message('user_info', 'tagName or productId is NULL or productId is not numeric. tagName = ' . 
									  $this->input->post('tagName') . ', productId = ' . $this->input->post('productId'));
			redirect('/welcome/');
		}
	}
	
	public function delete_tag() {
		
		log_message('user_info', "\n\n" . site_url('tags/delete_tag') . ' loaded.');
		
		if($this->input->post('tagName')) {
			
			$delete = $this->tag_model->delete(array('conditions' => array('name' => $this->input->post('tagName'))));
			
			if($delete) {
				log_message('user_info', 'Tag deleted successfully');
				echo true;
			} else {
				log_message('user_info', 'Failed to delete tag');
				echo false;
			}
			
		} else {
			log_message('user_info', 'tagName is NULL. tagName = ' . $this->input->post('tagName'));	
			redirect('/welcome/');
		}
	}
	
	public function tag_check($str) {
	
		log_message('user_info', "\n\n" . site_url('tags/tag_check') . ' loaded.');
		log_message('user_info', 'Checking if tag already exists...');
		
		$str = trim($str);
		$str = explode(':', $str, 2);
		$str = array_map('trim', $str);
		$str = implode(':', $str);
		$str = preg_replace("/\s+/u", " ", $str);

		$params['returnType'] = 'count';
		$params['conditions'] = array('name' => $str);
		
		$checkTag = $this->tag_model->getRows($params);
		
		if($checkTag > 0){
			log_message('user_info', 'Tag already exists');
			$this->form_validation->set_message('tag_check', 'Тагът вече съществува.');
			return FALSE;
		} else {
			log_message('user_info', 'Tag is ok');
			return TRUE;
		}		
	}
	
	 public function check_tag() {
		 
		log_message('user_info', "\n\n" . site_url('tags/check_tag') . ' loaded.');
		 
 		if($this->input->post('tagName')) {
 			
 			log_message('user_info', 'tagName = ' . $this->input->post('tagName'));
 			$exists = $this->tag_model->getRows(array('conditions' => array('name' => $this->input->post('tagName'))));
 			
 			if($exists) {
				log_message('user_info', 'Tag exists');
				echo true;
			} else {
				log_message('user_info', 'Tag doesn\'t exist');
				echo false;
			} 								
 			
 		} else {
			log_message('user_info', 'tagName is NULL. tagName = ' . $this->input->post('tagName'));	
 			echo false;
 		}
 	}
	
	public function tag_validate($str) {
	
		log_message('user_info', "\n\n" . site_url('tags/tag_validate') . ' loaded.');
		log_message('user_info', 'Validating tag');
		
		if(preg_match('/.+:.+/', $str)) {
			log_message('user_info', 'Tag is valid');
			return TRUE;
		} else {
			log_message('user_info', 'Tag is invalid');
			$this->form_validation->set_message('tag_validate', 'Тагът трябва да е във валиден формат (име:стойност)');
			return FALSE;
		}
		
	}

	
}	
?>

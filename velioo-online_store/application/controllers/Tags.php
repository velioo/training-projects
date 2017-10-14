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
		
		$input = urldecode($input);
		
		header('Content-Type:application/json');	
	
		$tags = $this->tag_model->getRows(array('select' => array('name'), 
												'like' => array('name' => $input)));
		if($tags)										
			echo json_encode($tags);
		else
			echo false;
	}
	
	public function insert_tag() {
		
		$data = array();
		$data['title'] = 'Добави таг';
		
		if($this->input->post('tagSubmit')) {
			
			$this->form_validation->set_rules('name', 'Name', 'required|trim|callback_tag_validate|callback_tag_check');				
			
			$tag = trim($this->input->post('name'));
			$tag = explode(':', $tag, 2);
			$tag = array_map('trim', $tag);
			$tag = implode(':', $tag);
					
			$tagData = array(
                'name' => $tag
            );              
            
            if($this->form_validation->run() == true) {				
							
				$insert = $this->tag_model->insert($tagData);
				
				if($insert) {
					$this->session->set_userdata('success_msg', 'Тагът е успешно добавен. ');
                    redirect('/employees/tags/');   
				} else {
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля свържете се с вашия администратор');
				}
				
			}   
			
			$data['tag'] = $tagData;   
			
		} 
		
		$this->load->view('add_tag', $data);
	}

	public function delete_product_tag() {
		if($this->input->post('tagName') && $this->input->post('productId')) {
			
			$tagId = $this->tag_model->getRows(array('select' => array('id'),
													 'conditions' => array('name' => $this->input->post('tagName')),
													 'returnType' => 'single'));
			
			$delete = $this->tag_model->delete(array('conditions' => array('tag_id' => $tagId['id'], 'product_id' => $this->input->post('productId'))), 'product_tags');
			
			echo ($delete) ? true : false;
			
		} else {
			redirect('/welcome/');
		}
	}
	
	public function delete_tag() {
		if($this->input->post('tagName')) {
			
			$delete = $this->tag_model->delete(array('conditions' => array('name' => $this->input->post('tagName'))));
			
			echo ($delete) ? true : false;
			
		} else {
			redirect('/welcome/');
		}
	}
	
	public function tag_check($str) {
		
		$str = trim($str);
		$str = explode(':', $str, 2);
		$str = array_map('trim', $str);
		$str = implode(': ', $str);
		$str = preg_replace("/\s+/u", " ", $str);

		$params['returnType'] = 'count';
		$params['conditions'] = array('name' => $str);
		
		$checkTag = $this->tag_model->getRows($params);
		
		if($checkTag > 0){
			$this->form_validation->set_message('tag_check', 'Тагът вече съществува.');
			return FALSE;
		} else {
			return TRUE;
		}		
	}
	
	public function tag_validate($str) {
	
		if(preg_match('/:/', $str)) {
			return TRUE;
		} else {
			$this->form_validation->set_message('tag_validate', 'Тагът трябва да е във валиден формат (име:стойност)');
			return FALSE;
		}
		
	}

	
}	
?>

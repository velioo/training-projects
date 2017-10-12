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
		
		echo json_encode($tags);
	}
	
	public function insert_tag() {
		
		$data = array();
		$data['title'] = 'Добави таг';
		
		if($this->input->post('tagSubmit')) {
			
			$this->form_validation->set_rules('name', 'Name', 'required|callback_tag_check');		
					
			$tagData = array(
                'name' => $this->input->post('name')
            );              

            
            if($this->form_validation->run() == true) {
				
				$splitTag = explode(':', $this->input->post('name'));
            
				if(count($splitTag) > 1) {
					$tagData['value'] = $splitTag[1];			
				}
				
				$tagData['key_name'] = $splitTag[0];
				
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
	
	public function check_tag() {
		if($this->input->post('tagName')) {
			
			$exists = $this->tag_model->getRows(array('conditions' => array('name' => $this->input->post('tagName'))));
			
			echo ($exists) ? true : false;										
			
		} else {
			redirect('/welcome/');
		}
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

	
}	
?>

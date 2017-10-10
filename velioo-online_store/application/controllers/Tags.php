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

		header('Content-Type:application/json');		
		$tags = $this->tag_model->getRows(array('select' => array('name'), 
												'like' => array('name' => $input)));
		
		echo json_encode($tags);
	}
	
	public function check_tag() {
		if($this->input->post('tagName')) {
			
			$exists = $this->tag_model->getRows(array('conditions' => array('name' => $this->input->post('tagName'))));
			
			echo ($exists) ? true : false;										
			
		} else {
			redirect('/welcome/');
		}
	}
	
	public function delete_tag() {
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

	
}	
?>

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

	function __construct() {
		parent::__construct();
		$this->load->model('product_model');
		$this->load->library('pagination');
	}

	public function index() {
		
		$config = $this->configure_pagination();
		$config['base_url'] = site_url();
		$config['per_page'] = 28;
		
		if($this->input->get('page') != NULL and is_numeric($this->input->get('page')) and $this->input->get('page') > 0) {
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
		} else {
			$start = 0;
		}
		
		$data['products'] = $this->product_model->getRows( array('select' => array('products.*', 'categories.name as category') ,
																 'joins' => array('categories' => 'categories.id=products.category_id') ,
																 'order_by' => array('created_at' => 'DESC'),
																 'start' => $start,
																 'limit' => $config['per_page']) );	
																																											
		$config['total_rows'] = $this->product_model->getRows(array('returnType' => 'count'));								
		$this->pagination->initialize($config);							
		$data['pagination'] = $this->pagination->create_links();
		$data['category_id'] = 0;
			 
		$data['title'] = "Home";
		$this->load->view('home', $data);
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

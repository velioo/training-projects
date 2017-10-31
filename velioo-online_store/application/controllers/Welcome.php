<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

	function __construct() {
		parent::__construct();
		$this->load->model('product_model');
		$this->load->library('pagination');
	}

	public function index() {
		
		log_message('user_info', "\n\n" . site_url('welcome/index') . ' loaded.');
		
		log_message('user_info', 'Configuring pagination');
		$config = $this->configure_pagination();
		$config['base_url'] = site_url();
		$config['per_page'] = 28;
		log_message('user_info', 'Limit set to ' . $config['per_page']);
		
		if($this->input->get('page') != NULL and is_numeric($this->input->get('page')) and $this->input->get('page') > 0) {
			log_message('user_info', 'Got page number: ' . $this->input->get('page'));
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
			log_message('user_info', 'Records offset set to: ' . $start);
		} else {
			$start = 0;
			log_message('user_info', 'No page number specified. Using default offset: ' . $start);
		}

		assert_v(is_numeric($start));
		
		log_message('user_info', 'Getting products...');
		$result = $this->product_model->getRows( array('select' => array('products.*', 'categories.name as category') ,
																 'joins' => array('categories' => 'categories.id=products.category_id') ,
																 'order_by' => array('created_at' => 'DESC'),
																 'start' => $start,
																 'limit' => $config['per_page']) );	
		if($result) {
			log_message('user_info', 'Products returned successfully');
			$data['products'] = $result;
			log_message('user_info', 'Get count of total records');
			$config['total_rows'] = $this->product_model->getRows(array('returnType' => 'count'));
			log_message('user_info', 'Total count: ' . $config['total_rows']);
			assert_v(is_numeric($config['total_rows']));
			log_message('user_info', 'Initializing pagination...');
			$this->pagination->initialize($config);							
			$data['pagination'] = $this->pagination->create_links();
			$data['category_id'] = 0;
			$data['title'] = "Home";
			log_message('user_info', 'Loading home page');
			$this->load->view('home', $data);
			
		} else {
			log_message('user_info', 'Failed to return any products.');
		}																																												

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

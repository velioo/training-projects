<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Products extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->library('form_validation');
		$this->load->model('product_model');
	}
	
	public function index() {
		redirect();
	}
	
	public function search($searchCategoryId=null) {
		$this->load->library('pagination');
		$config = $this->configure_pagination();
		$config['base_url'] = site_url("products/search");
		$config['per_page'] = 28;
		
		if($this->input->get('page') != NULL and is_numeric($this->input->get('page')) and $this->input->get('page') > 0) {
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
		} else {
			$start = 0;
		}
		
		if($searchCategoryId === null) {
			
			$searchWord = $this->input->get('search_input');
			$data['products'] = $this->product_model->getRows( array('select' => array('products.*', 'categories.name as category', 'categories.id as category_id'),
																 'joins' => array('categories' => 'categories.id=products.category_id'),
																 'like' => array('products.name' => $searchWord),
																 'or_like' => array('products.description' => $searchWord),
																 'order_by' => array('created_at' => 'DESC'),
																 'start' => $start,
																 'limit' => $config['per_page']) );	
																																											
			$config['total_rows'] = $this->product_model->getRows(array('returnType' => 'count'));						
			
			
		} else {
			
			$data['products'] = $this->product_model->getRows( array('select' => array('products.*', 'categories.name as category', 'categories.id as category_id'),
																 'joins' => array('categories' => 'categories.id=products.category_id'),
																 'conditions' => array('categories.id' => $searchCategoryId),
																 'order_by' => array('created_at' => 'DESC'),
																 'start' => $start,
																 'limit' => $config['per_page']) );	
																																											
			$config['total_rows'] = $this->product_model->getRows( array('joins' => array('categories' => 'categories.id=products.category_id'),
																     'conditions' => array('categories.name' => $searchCategoryId)) );		
			
			$data['category_id'] = $searchCategoryId;				
		}
		
				
		$this->pagination->initialize($config);							
		$data['pagination'] = $this->pagination->create_links();
			 
		$data['title'] = "Search Results";
		$this->load->view('home', $data);
	}
	
	public function insert_product() {
		
		$data = array();
		$data['title'] = 'Добави продукт';

		if($this->input->post('productSubmit')) {
			
			$this->form_validation->set_rules('name', 'Name', 'required');
            $this->form_validation->set_rules('category_id', 'Category', 'required|integer');
            $this->form_validation->set_rules('price_leva', 'Price', 'required|callback_price_check');
            $this->form_validation->set_rules('quantity', 'Quantity', 'required|integer');
            $this->form_validation->set_rules('tags', 'Tags', 'trim');

            $productData = array(
				'category_id' => $this->input->post('category_id'),
                'name' => $this->input->post('name'),
                'description' => $this->input->post('description'),
                'price_leva' => $this->input->post('price_leva'),
                'quantity' => $this->input->post('quantity'),
            );           
            
            $imageSuccess = TRUE;
            
            if (!empty($_FILES['image']['name'])) {
				
				if(!file_exists("./assets/imgs/{$_FILES['image']['name']}")) {
				
					$config['upload_path']          = './assets/imgs/';
					$config['allowed_types']        = 'gif|jpg|png|jpeg';
					$config['max_size']             = 5000;
					$config['max_width']            = 2048;
					$config['max_height']           = 2048;

					$this->load->library('upload', $config);

					if (!$this->upload->do_upload('image')) {
						$productData['image_error'] = array('error' => $this->upload->display_errors());
						$imageSuccess = FALSE;
					} 										
				}	
					
				$productData['image'] = $_FILES['image']['name'];

			}                      

            if(($this->form_validation->run() == true) && $imageSuccess) {
               
                $this->db->trans_begin();
               
                $insertId = $this->product_model->insert($productData);
                
                if($this->input->post('tags')) {
                         
					$this->load->model('tag_model');
					$tagIds = $this->tag_model->getRows(array('select' => array('tags.id'),
															  'where_in' => array('tags.name' => $this->input->post('tags'))));
					
					foreach($tagIds as $key => $value) {
						$productTag['product_id'] = $insertId;
						$productTag['tag_id'] = $value['id'];
						$this->product_model->insert($productTag, 'product_tags'); 
					}
				}
				
				if ($this->db->trans_status() === FALSE) {
					$this->db->trans_rollback();
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля свържете се с вашия администратор');
				} else {
					$this->db->trans_commit();
					 $this->session->set_userdata('success_msg', 'Продуктът е успешно добавен. ');
                    redirect('/employees/dashboard/');   
				}                         
            }  
            
           $data['product'] = $productData;   
           $data['tags'] = $this->input->post('tags');      
			
		} 
		
		$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));
		$categories = array();
		foreach ($data['categories'] as $key => $row) {
			$categories[$key] = $row['name'];
		}		
		array_multisort($categories, SORT_ASC, $data['categories']);	
		
		$this->load->view('add_product', $data);
		
	}
	
	public function update_product($productId=null) {
		if($productId !== null && is_numeric($productId)) {
			$data = array();
			$data['title'] = 'Редактирай продукт';

			if($this->input->post('productSubmit')) {
				
				$this->form_validation->set_rules('name', 'Name', 'required');
				$this->form_validation->set_rules('category_id', 'Category', 'required|integer');
				$this->form_validation->set_rules('price_leva', 'Price', 'required|callback_price_check');
				$this->form_validation->set_rules('quantity', 'Quantity', 'required|integer');

				$productData = array(
					'category_id' => $this->input->post('category_id'),
					'name' => $this->input->post('name'),
					'description' => $this->input->post('description'),
					'price_leva' => $this->input->post('price_leva'),
					'quantity' => $this->input->post('quantity'),
				);
				
				$imageSuccess = TRUE;
						 
				
				if (!empty($_FILES['image']['name'])) {
					
					if(!file_exists("./assets/imgs/{$_FILES['image']['name']}")) {
					
						$config['upload_path']          = './assets/imgs/';
						$config['allowed_types']        = 'gif|jpg|png|jpeg';
						$config['max_size']             = 5000;
						$config['max_width']            = 2048;
						$config['max_height']           = 2048;

						$this->load->library('upload', $config);

						if (!$this->upload->do_upload('image')) {
							$productData['image_error'] = array('error' => $this->upload->display_errors());
							$imageSuccess = FALSE;
						} 
					} 		
					
					$productData['image'] = $_FILES['image']['name'];

				}                      

				if(($this->form_validation->run() == true) && $imageSuccess) {
					
					$this->db->trans_begin();
					
					$update = $this->product_model->update(array('set' => $productData, 'conditions' => array('id' => $productId)));
					
					 if($this->input->post('tags')) {
                         
						$this->load->model('tag_model');
						$tagIds = $this->tag_model->getRows(array('select' => array('tags.id'),
																  'where_in' => array('tags.name' => $this->input->post('tags'))));
						
						foreach($tagIds as $key => $value) {
							$productTag['product_id'] = $productId;
							$productTag['tag_id'] = $value['id'];
							$exists = $this->tag_model->getRows(array('table' => 'product_tags','conditions' => array('product_id' => $productId, 'tag_id' => $value['id'])));
							if(!$exists) {
								$this->product_model->insert($productTag, 'product_tags'); 
							} 					
						}
					}
					           
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$this->session->set_userdata('error_msg', 'Възникна проблем, моля свържете се с вашия администратор');
					} else {
						$this->db->trans_commit();
						$this->session->set_userdata('success_msg', 'Продуктът е успешно добавен. ');
						redirect('/employees/dashboard/');   
					}    
				}  
				
			   $productData['id'] = $productId;
			   $data['product'] = $productData; 
			   $data['tags'] = $this->input->post('tags');			               
				
			} 
			
			$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));
			$categories = array();
			foreach ($data['categories'] as $key => $row) {
				$categories[$key] = $row['name'];
			}		
			array_multisort($categories, SORT_ASC, $data['categories']);	
			
			$this->load->view('update_product', $data);
		} else {
			echo "Invalid arguments";
		}
	}
	
	public function delete_product($product_id) {
		if($product_id !== null && is_numeric($product_id)) {
			
			$delete = $this->product_model->delete(array('id' => $product_id));
			if($delete) {					
				echo 1;				                    
			} else {
				echo 0;
			}
			
		} else {
			echo 0;
		}
		
	}
		
    public function price_check($val) {
		$val = floatval($val);
        if (!is_float($val) && $val < 0) {
            $this->form_validation->set_message('price_check', 'Цената трябва да е цяло или десетично число');
            return FALSE;
        } else {
            return TRUE;
        }
    }
    
    public function quantity_check($val) {
		if (!is_int($val) || $val < 1) {
		    return FALSE;
		} else {
			return TRUE;
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
?>

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
		
		log_message('user_info', "\n\n" . site_url('products/search') . ' loaded.');
		
		log_message('user_info', 'Loading pagination library');
		$this->load->library('pagination');
		log_message('user_info', 'Configuring pagination');
		$config = $this->configure_pagination();
		$config['base_url'] = site_url("products/search/{$searchCategoryId}");
		$config['per_page'] = 40;
		
		log_message('user_info', 'Records limit: ' . $config['per_page']);
		
		if($this->input->get('page') != NULL and is_numeric($this->input->get('page')) and $this->input->get('page') > 0) {
			log_message('user_info', 'Got page number: ' . $this->input->get('page'));
			$start = $this->input->get('page') * $config['per_page'] - $config['per_page'];
			log_message('user_info', 'Records offset set to: ' . $start);
		} else {
			$start = 0;
			log_message('user_info', 'No page number specified. Using default offset: ' . $start);
		}
		
		assert_v(is_numeric($start));
		
		$rowsArray = array(
			'select' => array('p.*', 'categories.name as category', 'categories.id as category_id'),
			'joins' => array('categories' => 'categories.id=p.category_id', 
							'product_tags' => array('product_tags.product_id = p.id', 'left'), 
							'tags' => array('tags.id = product_tags.tag_id', 'left')),
			'start' => $start,
			'limit' => $config['per_page'],
			'group_by' => 'p.id',
			'alias' => 'p'
		);
		
		$tagsArray = array(
			'select' => array('tags.name, COUNT(tags.name) as tag_count'),
			'joins' => array('categories' => 'categories.id=products.category_id', 
							 'product_tags' => 'product_tags.product_id=products.id', 
							 'tags' => 'tags.id=product_tags.tag_id'),
			'group_by' => 'tags.name'
		);
		
		
		$filterTags = $this->input->get('tags');
		if($filterTags) {
			log_message('user_info', 'Filtering by tags: ' . implode(", ",$filterTags));
			$rowsArray['where_in'] = array('tags.name' => $filterTags);
		} 
		
		if($this->input->get('price_from')) {
			log_message('user_info', 'Filtering by price >= ' . floatval($this->input->get('price_from')));
			$rowsArray['conditions']['p.price_leva >= '] = floatval($this->input->get('price_from'));
			$tagsArray['conditions']['p.price_leva >= '] = floatval($this->input->get('price_from'));
			$data['price_from'] = $this->input->get('price_from');
		}
		
		if($this->input->get('price_to')) {
			log_message('user_info', 'Filtering by price <= ' . floatval($this->input->get('price_to')));
			$rowsArray['conditions']['p.price_leva <= '] = floatval($this->input->get('price_to'));
			$tagsArray['conditions']['p.price_leva <= '] = floatval($this->input->get('price_to'));
			$data['price_to'] = $this->input->get('price_to');
		}
		
		if($this->input->get('sort_products')) {
			log_message('user_info', 'Sorting by tags: ' . $this->input->get('sort_products'));
			switch($this->input->get('sort_products')) {
				case 'most_buyed':
					$rowsArray['select'][] = '(SELECT SUM(quantity) FROM order_products WHERE order_products.product_id = p.id) as most_buyed';
					$rowsArray['order_by']['most_buyed'] = 'DESC';
					log_message('user_info', 'Sorting by most buyed DESC');
					break;
				case 'price_asc':
					$rowsArray['order_by']['p.price_leva'] = 'ASC';
					log_message('user_info', 'Sorting price ASC');
					break;
				case 'price_desc':
					$rowsArray['order_by']['p.price_leva'] = 'DESC';
					log_message('user_info', 'Sorting price DESC');
					break;
				case 'newest':
					$rowsArray['order_by']['p.created_at'] = 'DESC';
					log_message('user_info', 'Sorting created_at DESC');
					break;
				default:
					assert_v(false);
			}
			$data['sort_products'] = $this->input->get('sort_products');
		} else {
			log_message('user_info', 'No sorting method specified, using default: by most buyed');
			$data['sort_products'] = 'most_buyed';
		}
		
		if($searchCategoryId === null) {
			
			assert_v($searchCategoryId === null);
			
			log_message('user_info', 'Search category is NULL. Records will be filtered by search input...');
			log_message('user_info', 'Search input: ' . $this->input->get('search_input'));
			
			$data['search_input'] = $this->input->get('search_input');		
			$data['search_title'] = 'Резултати за "' . htmlentities($this->input->get('search_input'), ENT_QUOTES) . '"';
			$whereClause = "( p.name LIKE '%" . addcslashes(addslashes($this->input->get('search_input')), '%_') . "%' OR p.description LIKE '%" . addcslashes(addslashes($this->input->get('search_input')), '%_') . "%'  ESCAPE '!')"; //
			//$whereClause = "(MATCH (products.name, products.description) AGAINST ('" . $this->input->get('search_input') . "'" . "))";
			$rowsArray['where'] = $whereClause;
			
			$totalRows = $rowsArray;
			unset($totalRows['start']);		
			unset($totalRows['limit']);		
			$totalRows['returnType'] = 'count';	
											
			log_message('user_info', 'Getting total count of eligible records');																																					
			$config['total_rows'] = $this->product_model->getRows($totalRows);
			assert_v(is_numeric($config['total_rows']));	
			log_message('user_info', 'Total count: ' . $config['total_rows']);
				
			$tagsArray['like'] = array('products.name' => $this->input->get('search_input'));										
			
		} else {
			
			log_message('user_info', 'Category id: ' . $searchCategoryId);
			
			assert_v($searchCategoryId !== null);
			
			$rowsArray['conditions']['categories.id'] = $searchCategoryId;
			log_message('user_info', 'Get the name of the searched category');
			$data['search_title'] = $this->product_model->getRows(array('table' => 'categories',
																		'select' => array('name'),
																		'conditions' => array('id' => $searchCategoryId),
																		'returnType' => 'single'))['name'];
																																
			log_message('user_info', 'Name of category: ' . $data['search_title']);
			$rowsArray['group_by'] = 'p.id';
			
			$totalRows = $rowsArray;
			unset($totalRows['start']);
			unset($totalRows['limit']);
			$totalRows['returnType'] = 'count';
			
			log_message('user_info', 'Get count of total eligible records');
			$config['total_rows'] = $this->product_model->getRows($totalRows);
			assert_v(is_numeric($config['total_rows']));
			log_message('user_info', 'Total count: ' . $config['total_rows']);
																       			
			$tagsArray['conditions']['categories.id'] = $searchCategoryId;
			$data['category_id'] = $searchCategoryId;				
		}
		
		log_message('user_info', 'Executing search query...');
		$data['products'] = $this->product_model->getRows($rowsArray);	
		log_message('user_info', 'Query finished');
		log_message('user_info', 'Getting the tags(and their count) associated with the records found');
		$tags = $this->product_model->getRows($tagsArray);	
		
		$new_tags = array();
		$checked_tags = "";
		if($tags) {
			log_message('user_info', 'Tags found. Processing tags...');
			foreach($tags as $tag) {
				$temp_array = array();
				if($filterTags) {
					if(in_array($tag['name'], $filterTags)) {
						$checked_tags .= $tag['name'] . ', ';
						$temp_array['checked'] = 1;
					}
				}
				$splited_tag = explode(':', $tag['name'], 2);
				if(count($splited_tag) > 1) {
					$temp_array['value'] = trim($splited_tag[1]);
					$temp_array['count'] = $tag['tag_count'];
					$new_tags[$splited_tag[0]][] = $temp_array;	
				}			
			}
			log_message('user_info', 'Checked tags: ' . $checked_tags);	
			log_message('user_info', 'Tags processed');
		}	
																																		
		$data['tags'] = $new_tags;	
				
		log_message('user_info', 'Initializing pagination');
		$this->pagination->initialize($config);							
		$data['pagination'] = $this->pagination->create_links();
			 
		$data['title'] = "Search Results";
		log_message('user_info', 'Loading home');
		$this->load->view('home', $data);
	}
	
	public function product($productId=null) {
		
		log_message('user_info', "\n\n" . site_url('products/product') . ' loaded.');
		
		if(is_numeric($productId)) {
			
			assert_v(is_numeric($productId));
			
			$data = array();
			
			log_message('user_info', 'Getting product details');
			$data['product'] = $this->product_model->getRows(array('select' => array('products.*', 'categories.name as category', 'categories.id as category_id'),
																   'joins' => array('categories' => 'categories.id = products.category_id'),
																   'conditions' => array('products.id' => $productId),
																   'returnType' => 'single'));
			if($data['product']) {
				
				log_message('user_info', 'Processing product description');
				$specLines = explode(PHP_EOL, $data['product']['description']);
				$specs = array();
				if(count($specLines) !== 0) {
					foreach($specLines as $line) {
						$temp = explode('|', $line);					
						if(count($temp) > 1)
							$specs[] = array('name' => $temp[0], 'value' => $temp[1]);
					}
					
					$data['product']['specs'] = $specs;
				}
				
				$data['title'] = $data['product']['name'];
				log_message('user_info', 'Loading product page');
				$this->load->view('product', $data);
				
			} else {
				log_message('user_info', 'Product with id = ' .  $productId . ' doesn\'t exist. Redirecting to ' . site_url('employees/dashboard'));
				redirect('/employee/dashboard/');
			}															   			
			
			
		} else {
			log_message('user_info', 'Product id is not numeric: ' . $productId . '. Redirecting to ' . site_url('employees/dashboard'));
			redirect('/employee/dashboard/');
		}
	}
	
	public function insert_product() {
		
		log_message('user_info', "\n\n" . site_url('products/insert_product') . ' loaded.');
		
		$data = array();
		$data['title'] = 'Добави продукт';

		if($this->input->post('productSubmit')) {
			
			log_message('user_info', 'Found submitted form');
			
			log_message('user_info', 'Setting form validation rules');
			$this->form_validation->set_rules('name', 'Name', 'required');
            $this->form_validation->set_rules('category_id', 'Category', 'required|integer');
            $this->form_validation->set_rules('price_leva', 'Price', 'required|callback_price_check');
            $this->form_validation->set_rules('quantity', 'Quantity', 'required|integer');
            $this->form_validation->set_rules('tags', 'Tags', 'trim');

			log_message('user_info', 'Saving product data in array');
            $productData = array(
				'category_id' => $this->input->post('category_id'),
                'name' => $this->input->post('name'),
                'description' => $this->input->post('description'),
                'price_leva' => $this->input->post('price_leva'),
                'quantity' => $this->input->post('quantity'),
            );        
            
            log_message('user_info', 'Product data:' .
				 PHP_EOL . 'category_id = ' . $productData['category_id'] .
				 PHP_EOL . 'name = ' . $productData['name'] .
				 PHP_EOL . 'description = ' . $productData['description'] . 
				 PHP_EOL . 'price_leva = ' . $productData['price_leva'] . 
				 PHP_EOL . 'quantity = ' . $productData['quantity'] 
			);
            
            $imageSuccess = TRUE;
            
            if (!empty($_FILES['image']['name'])) {
						
				log_message('user_info', 'Image submitted');		
							
				$fileName = str_replace(' ', '_', $_FILES['image']['name']);

				if(!file_exists("./assets/imgs/{$fileName}")) {
					log_message('user_info', 'Image doesn\'t exist. Uploading...');	
				
					$config['upload_path']          = './assets/imgs/';
					$config['allowed_types']        = 'gif|jpg|png|jpeg';
					$config['max_size']             = 5000;
					$config['max_width']            = 2048;
					$config['max_height']           = 2048;
					$config['file_name']           = $fileName;

					log_message('user_info', 'Loading upload library');	
					$this->load->library('upload', $config);

					if (!$this->upload->do_upload('image')) {
						log_message('user_info', 'Image uploading failed');	
						$productData['image_error'] = array('error' => $this->upload->display_errors());
						$imageSuccess = FALSE;
					} else {
						log_message('user_info', 'Image successfully uploaded');	
					}										
				}	
					
				$productData['image'] = $fileName;
				
				log_message('user_info', 'Adding image column to productData, image = ' . $productData['image']);	

			} else {
				log_message('user_info', 'No image submited');		
			}          	

            if(($this->form_validation->run() == true) && $imageSuccess) {
				
				log_message('user_info', 'Validation successfull');	
               
                log_message('user_info', 'Begin transaction to insert the product');	
                $this->db->trans_begin();
               
                $insertId = $this->product_model->insert($productData);
                
				if($insertId) {
					log_message('user_info', 'Update successfull');	
				} else {
					log_message('user_info', 'Update failed');
				}
				
                log_message('user_info', 'Product inserted id = ' . $insertId);
                
                if($this->input->post('tags')) {
					
					$msg = "";
					foreach($this->input->post('tags') as $tag) {
						$msg .= $tag . ', ';
					}
					log_message('user_info', 'Found submitted tags: ' . $msg);
                         
					$this->load->model('tag_model');
					log_message('user_info', 'tag_model loaded');
					log_message('user_info', 'Getting tag ids');
					$tagIds = $this->tag_model->getRows(array('select' => array('tags.id'),
															  'where_in' => array('tags.name' => $this->input->post('tags'))));
					
					if($tagIds) {
					
						log_message('user_info', 'Tag ids successfully returned');
						log_message('user_info', 'Creating relations between product and tags');
						foreach($tagIds as $key => $value) {
							$productTag['product_id'] = $insertId;
							$productTag['tag_id'] = $value['id'];
							$this->product_model->insert($productTag, 'product_tags'); 
						}
						
						log_message('user_info', 'Successfully created relations');
					} else {
						log_message('user_info', 'No tag ids matched');
					}
				}
				
				if ($this->db->trans_status() === FALSE) {
					log_message('user_info', 'Transaction failed...rolling back');
					$this->db->trans_rollback();
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля свържете се с вашия администратор');
				} else {
					$this->db->trans_commit();
					$this->session->set_userdata('success_msg', 'Продуктът е успешно добавен. ');
					log_message('user_info', 'Transaction successfull. Redirecting to ' . site_url('employees/dashboard'));
                    redirect('/employees/dashboard/');   
				}                         
            }  
            
           $data['product'] = $productData;   
           $data['tags'] = $this->input->post('tags');      
			
		} 
		
		log_message('user_info', 'Getting all product categories');
		$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));
		$categories = array();
		log_message('user_info', 'Processing returned categories');
		foreach ($data['categories'] as $key => $row) {
			$categories[$key] = $row['name'];
		}		
		array_multisort($categories, SORT_ASC, $data['categories']);	
		
		log_message('user_info', 'Loading add_product page');
		$this->load->view('add_product', $data);
		
	}
	
	public function update_product($productId=null) {
		
		log_message('user_info', "\n\n" . site_url('products/update_product') . ' loaded.');
		
		if($productId !== null && is_numeric($productId)) {
			
			assert_v(is_numeric($productId));
			
			$data = array();
			$data['title'] = 'Редактирай продукт';

			if($this->input->post('productSubmit')) {
				
				log_message('user_info', 'Found submitted form');
				
				log_message('user_info', 'Setting validation rules');
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
					
			    log_message('user_info', 'Product data:' .
					PHP_EOL . 'category_id = ' . $productData['category_id'] .
					PHP_EOL . 'name = ' . $productData['name'] .
					PHP_EOL . 'description = ' . $productData['description'] . 
					PHP_EOL . 'price_leva = ' . $productData['price_leva'] . 
					PHP_EOL . 'quantity = ' . $productData['quantity'] 
				);
					
				$imageSuccess = TRUE;
						 
				
				if (!empty($_FILES['image']['name'])) {
					
					log_message('user_info', 'Image submitted');
					
					$fileName = str_replace(' ', '_', $_FILES['image']['name']);
					
					if(!file_exists("./assets/imgs/{$_FILES['image']['name']}")) {
					
						$config['upload_path']          = './assets/imgs/';
						$config['allowed_types']        = 'gif|jpg|png|jpeg';
						$config['max_size']             = 5000;
						$config['max_width']            = 2048;
						$config['max_height']           = 2048;
						$config['file_name']           = $fileName;

						log_message('user_info', 'Loading upload library');	
						$this->load->library('upload', $config);

						if (!$this->upload->do_upload('image')) {
							log_message('user_info', 'Image uploading failed');	
							$productData['image_error'] = array('error' => $this->upload->display_errors());
							$imageSuccess = FALSE;
						} else {
							log_message('user_info', 'Image successfully uploaded');	
						}
					} 		
					
					$productData['image'] = $fileName;				
					log_message('user_info', 'Adding image column to productData, image = ' . $productData['image']);	

				} else {
					log_message('user_info', 'No image submited');		
				}                     

				if(($this->form_validation->run() == true) && $imageSuccess) {
					
					log_message('user_info', 'Validation successfull');		   
					log_message('user_info', 'Begin transaction to update the product');	
					
					$this->db->trans_begin();
					
					$update = $this->product_model->update(array('set' => $productData, 'conditions' => array('id' => $productId)));
					
					if($update) {
						log_message('user_info', 'Update successfull');	
					} else {
						log_message('user_info', 'Update failed');
					}
					
					if($this->input->post('tags')) {
                         
                        $msg = "";
						foreach($this->input->post('tags') as $tag) {
							$msg .= $tag . ', ';
						}
						log_message('user_info', 'Found submitted tags: ' . $msg);
                        
						$this->load->model('tag_model');
						log_message('user_info', 'tag_model loaded');
						log_message('user_info', 'Getting tag ids');
						$tagIds = $this->tag_model->getRows(array('select' => array('tags.id'),
																  'where_in' => array('tags.name' => $this->input->post('tags'))));
						
						if($tagIds) {
						
							log_message('user_info', 'Tag ids successfully returned');
							log_message('user_info', 'Creating relations between product and tags');
							
							foreach($tagIds as $key => $value) {
								$productTag['product_id'] = $productId;
								$productTag['tag_id'] = $value['id'];
								$exists = $this->tag_model->getRows(array('table' => 'product_tags','conditions' => array('product_id' => $productId, 'tag_id' => $value['id'])));
								if(!$exists) {
									$this->product_model->insert($productTag, 'product_tags'); 
								} 					
							}
							
							log_message('user_info', 'Successfully created relations');
							
						} else {
							log_message('user_info', 'No tag ids matched');
						}					
					}
					           
					if ($this->db->trans_status() === FALSE) {
						log_message('user_info', 'Transaction failed...rolling back');
						$this->db->trans_rollback();
						$this->session->set_userdata('error_msg', 'Възникна проблем, моля свържете се с вашия администратор');
					} else {
						$this->db->trans_commit();
						$this->session->set_userdata('success_msg', 'Продуктът е успешно променен. ');
						log_message('user_info', 'Transaction successfull. Redirecting to ' . site_url('employees/dashboard'));
						redirect('/employees/dashboard/');   
					}    
				}  
				
			   $productData['id'] = $productId;
			   $data['product'] = $productData; 
			   $data['tags'] = $this->input->post('tags');			               
				
			} 
					
			log_message('user_info', 'Getting all product categories');
			$data['categories'] = $this->product_model->getRows(array('table' => 'categories'));
			$categories = array();
			log_message('user_info', 'Processing returned categories');
			foreach ($data['categories'] as $key => $row) {
				$categories[$key] = $row['name'];
			}		
			array_multisort($categories, SORT_ASC, $data['categories']);	
			log_message('user_info', 'Loading update_product page');
			$this->load->view('update_product', $data);
		} else {
			log_message('user_info', 'Product id is not numeric: ' . $productId . '. Redirecting to ' . site_url('employees/dashboard'));
			redirect('employees/dashboard');
		}
	}
	
	public function delete_product() {

		log_message('user_info', "\n\n" . site_url('products/delete_product') . ' loaded.');
		
		if($this->input->post('productId') && is_numeric($this->input->post('productId'))) {
			
			log_message('user_info', 'Deleting product with id = ' . $this->input->post('productId'));
			assert_v(is_numeric($this->input->post('productId')));
			
			$delete = $this->product_model->delete(array('id' => $this->input->post('productId')));
			
			if($delete) {
				log_message('user_info', 'Successfully deleted product');
				echo true;
			} else {
				log_message('user_info', 'Failed to delete product');
				echo false;
			}

		} else {
			log_message('user_info', 'Product id is not numeric: ' . $this->input->post('productId'));
			echo false;
		}
	}
	
	public function get_menu_items() {
		
		log_message('user_info', "\n\n" . site_url('products/get_menu_items') . ' loaded.');
		
		header('Content-Type:application/json');
		log_message('user_info', 'Getting menu items...');
		$items = $this->product_model->getRows(array('table' => 'categories'));
		log_message('user_info', 'Returning items to browser');
		echo json_encode($items);
		
	}
		
    public function price_check($val) {
		
		log_message('user_info', "\n\n" . site_url('products/price_check') . ' loaded.');
		
		$val = floatval($val);
		log_message('user_info', 'Float value = ' . $val);
        if (!is_float($val) && $val < 0) {
			log_message('user_info', 'It\'s not float');
            $this->form_validation->set_message('price_check', 'Цената трябва да е цяло или десетично число');
            return FALSE;
        } else {
			log_message('user_info', 'It\'s float');
            return TRUE;
        }
    }
    
    public function quantity_check($val) {
		
		log_message('user_info', "\n\n" . site_url('products/quality check') . ' loaded.');
		
		if (!is_int($val) || $val < 1) {
			log_message('user_info', 'It\'s not int');
		    return FALSE;
		} else {
			log_message('user_info', 'It\'s int');
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
		$config['next_link'] = "Next";
		$config['prev_link'] = "Prev";
	
		return $config;
	}
	
}	
?>

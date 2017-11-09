<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Users extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->library('form_validation');
		$this->load->model('user_model');
	}
	
	public function index() {
		if($this->session->userdata('isUserLoggedIn')) {
			redirect('/users/account/');
		} else {
			redirect('/users/login/');
		}
	}
	
	public function account() {
		
		log_message('user_info', "\n\n" . site_url('users/account') . ' loaded.');
		
        $data = array();
        $data['title'] = "Account settings";
        if($this->session->userdata('isUserLoggedIn')){
			log_message('user_info', 'Getting user info...');
			assert_v(is_numeric($this->session->userdata('userId')));
            $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
            log_message('user_info', 'Loading account page...');
            $this->load->view('account', $data);
        } else {
			log_message('user_info', 'User trying to access account page without being logged. Redirecting to ' . site_url('/users/login/'));
            redirect('/users/login/');
        }
    }
    
    public function details() {
		
		log_message('user_info', "\n\n" . site_url('users/details') . ' loaded.');
		
		$data = array();
		log_message('user_info', 'Getting list of countries...');
		$data['countries'] = $this->user_model->getRows(array('table' => 'countries', 'select' => array('nicename', 'phonecode')));
		log_message('user_info', 'List returned');
        $data['title'] = "Account details";
        if($this->session->userdata('isUserLoggedIn')) {
			log_message('user_info', 'Getting user info...');
			assert_v(is_numeric($this->session->userdata('userId')));
            $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));          
            log_message('user_info', 'Loading details page...');
            $this->load->view('details', $data);
        } else {
			log_message('user_info', 'User trying to access details page without being logged. Redirecting to ' . site_url('/users/login/'));
            redirect('/users/login/');
        }
	}
	
	public function orders() {
		
		log_message('user_info', "\n\n" . site_url('users/orders') . ' loaded.');
		
		$data = array();
        $data['title'] = "Orders details";
        if($this->session->userdata('isUserLoggedIn')) {
			log_message('user_info', 'Loading order_model...');
			$this->load->model('order_model');
			assert_v(is_numeric($this->session->userdata('userId')));
            $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
            log_message('user_info', 'Getting user orders...');
            $data['orders'] = $this->order_model->getRows(array('select' => array('orders.id as order_id',
																				  'orders.created_at as order_created_at',
																				  'orders.amount_leva',
																				  'statuses.name as status_name',
																				  'statuses.id as status_id'), 
															    'conditions' => array('user_id' => $this->session->userdata('userId')), 
															    'joins' => array('statuses' => 'statuses.id = orders.status_id'),
																'order_by' => array('order_id' => 'DESC')));
			if($data['orders']) {
				log_message('user_info', 'User orders returned successfully');
			} else {
				log_message('user_info', 'No orders found');		
			}				
			
			log_message('user_info', 'Loading orders page...');													
			$this->load->view('orders', $data);											

        } else {
			log_message('user_info', 'User trying to access orders page without being logged. Redirecting to ' . site_url('/users/login/'));
            redirect('/users/login/');
        }
	}
	
	//~ public function payments() {
		
		//~ log_message('user_info', "\n\n" . site_url('users/payments') . ' loaded.');
		
		//~ $data = array();
        //~ $data['title'] = "Payments";
        //~ if($this->session->userdata('isUserLoggedIn')){
            //~ $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
            //~ $this->load->view('payments', $data);
        //~ } else {
            //~ redirect('/users/login/');
        //~ }
	//~ }
	
	public function cart() {
		
		log_message('user_info', "\n\n" . site_url('users/cart') . ' loaded.');
		
		$data = array();
        $data['title'] = "Количка";
        if($this->session->userdata('isUserLoggedIn')) {
			log_message('user_info', 'Loading product_model...');
			$this->load->model('product_model');		
			assert_v(is_numeric($this->session->userdata('userId')));
            $data['products'] = $this->product_model->getRows(array('select' => array('products.id', 'products.name', 'products.price_leva', 'products.image', 'cart.quantity'), 
																    'joins' => array('cart' => 'cart.product_id = products.id', 'users' => 'users.id = cart.user_id'),
																    'conditions' => array('users.id' => $this->session->userdata('userId'))));															    
			if($data['products']) {
				log_message('user_info', 'User cart data returned successfully');
			} else {
				log_message('user_info', 'No products in cart found');	
			}		
			
			log_message('user_info', 'Loading cart page...');													
			$this->load->view('cart', $data);
															    
        } else {
			log_message('user_info', 'User trying to access cart page without being logged. Redirecting to ' . site_url('/users/login/'));
            redirect('/users/login/');
        }
	}
    
    public function login() {
		
		log_message('user_info', "\n\n" . site_url('users/login') . ' loaded.');
		
        $data = array();      
        $data['title'] = "Login";
        
        if($this->input->post('loginSubmit')) {
				
			log_message('user_info', 'Getting credentials for email: ' . $this->input->post('email'));
			$checkLogin = $this->user_model->getRows(array('select' => array('password', 'salt', 'id', 'confirmed'), 
														   'conditions' => array('email' => $this->input->post('email')), 
														   'returnType' => 'single'));

			log_message('user_info', 'Matching credentials with input fields');
			if($checkLogin && ((hash("sha256", $this->input->post('password') . $checkLogin['salt'])) === $checkLogin['password'])) {								
				
				assert_v((hash("sha256", $this->input->post('password') . $checkLogin['salt'])) === $checkLogin['password']);
				
				log_message('user_info', 'Credentials matched');		
				log_message('user_info', 'Check if user confirmed his email');
				if($checkLogin['confirmed'] == 1) {
					log_message('user_info', 'Email is confirmed. Storing user data in session');
					$this->session->set_userdata('isUserLoggedIn',TRUE);
					$this->session->set_userdata('userId', $checkLogin['id']);
					log_message('user_info', 'Redirecting to ' . site_url('/welcome/'));
					redirect('/welcome/');
				} else {
					log_message('user_info', 'Email is not confirmed');
					$this->session->set_userdata('error_msg_timeless', 'You need to confirm your email before logging in! <a href="' . site_url('users/resend_page') . '">Click Here</a> to resend confirmation mail.');
				}
				
			} else {
				log_message('user_info', 'Credentials didn\'t match. Wrong email or/and password');
				$this->session->set_userdata('error_msg_timeless', 'Wrong email or password.');
			}                 
            
            log_message('user_info', 'Loading login page...');
            $this->load->view('login', $data);
            
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			log_message('user_info', 'User trying to log in while logged. Redirecting to ' . site_url('/users/account/'));
			redirect('/users/account/');
		} else {
			log_message('user_info', 'loginSubmit is NULL. No form submitted. Loading login page');
			$this->load->view('login', $data);
		}
    }
    
    public function registration() {
		
		log_message('user_info', "\n\n" . site_url('users/registration') . ' loaded.');
		
        $data = array();
        $data['title'] = "Registration";
        $userData = array();           

        if($this->input->post('registrSubmit')) {

			log_message('user_info', 'Setting form validation rules...');
            $this->form_validation->set_rules('name', 'Name', 'trim|required|max_length[64]');
            $this->form_validation->set_rules('last_name', 'trim|max_length[128]');
            $this->form_validation->set_rules('email', 'Email', 'trim|required|valid_email|max_length[64]|callback_email_check');
            $this->form_validation->set_rules('phone', 'Phone', 'trim|required|max_length[32]|callback_validate_phone');
            $this->form_validation->set_rules('country', 'Country', 'trim|max_length[64]');
            $this->form_validation->set_rules('region', 'Region', 'trim|max_length[64]');
            $this->form_validation->set_rules('street_address', 'trim|Street Address', 'max_length[255]');
            $this->form_validation->set_rules('password', 'password', 'required|callback_password_validate|max_length[255]');
            $this->form_validation->set_rules('conf_password', 'confirm password', 'required|matches[password]|max_length[255]');
            $this->form_validation->set_rules('g-recaptcha-response','Captcha','callback_recaptcha');

			log_message('user_info', 'Generating random salt');
			$salt = bin2hex(random_bytes(32));
			
			log_message('user_info', 'Saving user data to array...');
			$userData = array(
				'name' => $this->input->post('name'),
				'last_name' => $this->input->post('last_name'),
				'email' => $this->input->post('email'),
				'password' => hash("sha256", $this->input->post('password') . $salt),
				'salt' => $salt,
				'gender' => ($this->input->post('gender')) ? $this->input->post('gender') : 'Unknown',
				'phone' => 	str_replace(' ', '', $this->input->post('phone')),
				'phone_unformatted' => $this->input->post('phone'),
				'country' => $this->input->post('country'),
				'region' => $this->input->post('region'),
				'street_address' => $this->input->post('street_address')
			);		
			
			log_message('user_info', 'User data:' .
				 PHP_EOL . 'name = ' . $userData['name'] .
				 PHP_EOL . 'last_name = ' . $userData['last_name'] .
			     PHP_EOL . 'email = ' . $userData['email'] . 
			     PHP_EOL . 'gender = ' . $userData['gender'] . 
				 PHP_EOL . 'phone = ' . $userData['phone'] . 
				 PHP_EOL . 'phone_unformatted = ' . $userData['phone_unformatted'] . 
				 PHP_EOL . 'country = ' . $userData['country'] . 
				 PHP_EOL . 'region = ' . $userData['region'] . 
				 PHP_EOL . 'street_address = ' . $userData['street_address']
			);

            if($this->form_validation->run() === TRUE) {
				
				log_message('user_info', 'Form validation successfull');			
				
				$userData['phone'] = preg_replace("/[^0-9]/","", $userData['phone']);
				
				log_message('user_info', 'Beginning database transaction');
				$this->db->trans_begin();
				
				log_message('user_info', 'Creating new user...');
                $insertId = $this->user_model->insert($userData);      

                if($insertId) {		
					
					assert_v(is_numeric($insertId));			
					
					log_message('user_info', 'User successfully created');
					
					log_message('user_info', 'Generating random temporary code to pass to confirmation email link');
					$temp_pass = bin2hex(random_bytes(64));
						
					log_message('user_info', 'Loading email library...');
					$this->load->library('email');
					
					log_message('user_info', 'Configuring email options...');
					$config['protocol']    = 'smtp';
					$config['smtp_host']    = 'ssl://smtp.gmail.com';
					$config['smtp_port']    = '465';
					$config['smtp_timeout'] = '7';
					$config['smtp_user']    = 'vanime.staff@gmail.com';
					$config['smtp_pass']    = '!@#$%QWERT';
					$config['charset']    = 'utf-8';
					$config['newline']    = "\r\n";
					$config['mailtype'] = 'html';     

					log_message('user_info', 'Initializing email configuration...');
					$this->email->initialize($config);
					
					log_message('user_info', 'Setting email content, subject, author and receiver...');
					$this->email->from('vanime.staff@gmail.com', "CompMax Confirm Email");
					$this->email->to(htmlentities($this->input->post('email'), ENT_QUOTES));
					$this->email->subject("Confirm Account");
						
					$message = "<p>Click on the link below to confirm your account on CompMax</p>";
					$message .= "<p><a href='".site_url("users/confirm_email/$temp_pass")."'> \nClick here </a></p>";
						
					$this->email->message($message);
					
					log_message('user_info', 'Sending email...');
					if($this->email->send()) {
						
						log_message('user_info', 'Email sent successfully');
						
						log_message('user_info', 'Deleting existent user email records in temp_codes table');
						$delete = $this->user_model->delete(array('conditions' => array('user_id' => $insertId, 'type' => 'email')), 'temp_codes');
						log_message('user_info', 'Inserting new email record in temp_codes table');
						$insert = $this->user_model->insert(array('user_id' => $insertId, 'hash' => $temp_pass, 'type' => 'email'), 'temp_codes');
				
						if($insert) {
							log_message('user_info', 'New record successfully inserted');
							$this->session->set_userdata('long_msg', "Следвайте инструкциите, изпратени на посоченият от вас имейл, за да активирате своя акаунт.");
						} else {
							log_message('user_info', 'Failed to insert new record');
							$this->session->set_userdata('long_msg', "Възникна проблем, моля опитайте по-късно.");
						}								
							
					} else {
						log_message('user_info', 'Failed to send email');
						$this->session->set_userdata('long_msg', "Failed to send confirmation email...");
					}  							
                 
                } else {
					log_message('user_info', 'User insertion failed');
                    $this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
                }
                
                if ($this->db->trans_status() === FALSE) {
					log_message('user_info', 'Transaction failed...rolling back');
					$this->db->trans_rollback();
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
				} else {
					$this->db->trans_commit();
					log_message('user_info', 'Transaction successfull');
					log_message('user_info', 'Redirecting to ' . site_url('/users/login/'));
                    redirect('/users/login/');    
				}    
            } else {
				log_message('user_info', 'Form validation failed');
			}
            
           $data['user'] = $userData;
           log_message('user_info', 'Getting countries list...');
		   $data['countries'] = $this->user_model->getRows(array('table' => 'countries', 'select' => array('nicename', 'phonecode')));
           log_message('user_info', 'Loading registration page...');
           $this->load->view('registration', $data);   
                
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			 log_message('user_info', 'User trying to register while logged. Redirecting to ' . site_url('/users/account/'));
			 redirect('/users/account/');
		} else {
			log_message('user_info', 'Getting countries list...');
			$data['countries'] = $this->user_model->getRows(array('table' => 'countries', 'select' => array('nicename', 'phonecode')));
			log_message('user_info', 'registrSubmit is NULL. No form submitted. Loading registration page');
			$this->load->view('registration', $data);
		}		
       
    }
    
    public function update_password() {
		
		log_message('user_info', "\n\n" . site_url('users/update_password') . ' loaded.');
		
		$data = array();
		
		if($this->input->post('passwordSubmit')) {
			
			log_message('user_info', 'Setting form validation rules...');
            $this->form_validation->set_rules('old_password', 'Old password', 'required|callback_password_check|max_length[255]');
            $this->form_validation->set_rules('password', 'Password', 'required|max_length[255]|callback_password_validate|max_length[255]');
            $this->form_validation->set_rules('conf_password', 'confirm password', 'required|matches[password]|max_length[255]');
            
            if($this->form_validation->run() === TRUE) {
				
				log_message('user_info', 'Form validation successfull');		
				log_message('user_info', 'Generating random salt');
				$salt = bin2hex(random_bytes(32));
				
				assert_v(is_numeric($this->session->userdata('userId')));
				$params = array(
					'set' => array('password' => hash("sha256", $this->input->post('password') . $salt), 'salt' => $salt), 
					'conditions' => array('id' => $this->session->userdata('userId'))
				);
				
				log_message('user_info', 'Updating user password');	
                $update = $this->user_model->update($params); 
                          
                if($update) {		
					log_message('user_info', 'Update successfull');
                    $this->session->set_userdata('success_msg', 'Ти успешно промени паролата си.');                  
                } else {
					log_message('user_info', 'Update failed');
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');                   
                }
                
                log_message('user_info', 'Redirecting to ' . site_url('/users/account/'));
                redirect('/users/account/');
                              
            } 
		} else {
			log_message('user_info', 'passwordSubmit is NULL. No form submitted');
		}
		
		log_message('user_info', 'Invoking account() function');
		$this->account();	

	}
	
	//~ public function update_name_email() {
		
		//~ log_message('user_info', "\n\n" . site_url('users/update_name_email') . ' loaded.');
		
		//~ $data = array();
		
		//~ if($this->input->post('nameEmailSubmit')) {

			//~ log_message('user_info', 'Setting form validation rules...');
            //~ $this->form_validation->set_rules('name', 'Name', 'required|max_length[64]');
            //~ $this->form_validation->set_rules('last_name', 'Last Name', 'max_length[128]');
            //~ $this->form_validation->set_rules('email', 'Email', 'required|valid_email|max_length[64]|callback_email_check_without_current');
            
            //~ if($this->form_validation->run() === TRUE) {
				
				//~ log_message('user_info', 'Form validation successfull');
				//~ assert_v(is_numeric($this->session->userdata('userId')));
				
				//~ $params = array(
					//~ 'set' => array('name' => $this->input->post('name'), 'last_name' => $this->input->post('last_name'), 'email' => $this->input->post('email')), 
					//~ 'conditions' => array('id' => $this->session->userdata('userId'))
				//~ );
					
                //~ $update = $this->user_model->update($params); 
                          
                //~ if($update) {		
					//~ log_message('user_info', 'Update successfull');
                    //~ $this->session->set_userdata('success_msg', 'Успешна промяна на данни.');                 
                //~ } else {
					//~ log_message('user_info', 'Update failed');
					//~ $this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
                //~ }         
                
                //~ log_message('user_info', 'Redirecting to ' . site_url('/users/account/'));
                //~ redirect('/users/account/');
                    
            //~ } 
		//~ } else {
			//~ log_message('user_info', 'nameEmailSubmit is NULL. No form submitted');
		//~ }
		
		//~ log_message('user_info', 'Invoking account() function');
		//~ $this->account();
	//~ }
	
	public function update_name_email() {
		
		log_message('user_info', "\n\n" . site_url('users/update_name_email') . ' loaded.');
		
		$data = array();
		
		if($this->input->post('nameEmailSubmit')) {

			log_message('user_info', 'Setting form validation rules...');
            $this->form_validation->set_rules('name', 'Name', 'required|max_length[64]');
            $this->form_validation->set_rules('last_name', 'Last Name', 'max_length[128]');
            $this->form_validation->set_rules('email', 'Email', 'required|valid_email|max_length[64]|callback_email_check_without_current');
            
            if($this->form_validation->run() === TRUE) {
				
				log_message('user_info', 'Form validation successfull');
				assert_v(is_numeric($this->session->userdata('userId')));
				
				log_message('user_info', 'Getting users\' email...');
				$currentEmail = $this->user_model->getRows(array('select' => array('email'), 
																  'conditions' => array('id' => $this->session->userdata('userId')),
																  'returnType' => 'single'))['email'];
				if($currentEmail) {												  
					if ($this->input->post('email') == $currentEmail) {
						log_message('user_info', 'users\' email is same as input email, updating only first and last name...');
						$params = array(
							'set' => array('name' => $this->input->post('name'), 'last_name' => $this->input->post('last_name')), 
							'conditions' => array('id' => $this->session->userdata('userId'))
						);
							
						$update = $this->user_model->update($params); 
								  
						if($update) {		
							log_message('user_info', 'Update successfull');
							$this->session->set_userdata('success_msg', 'Успешна промяна на данни.');                 
						} else {
							log_message('user_info', 'Update failed');
							$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
						}         
						
						log_message('user_info', 'Redirecting to ' . site_url('/users/account/'));
						redirect('/users/account/');
					} else {
						log_message('user_info', 'Beginning database transaction');
						$this->db->trans_begin();
						
						//$update = $this->user_model->update(array('set'));
						$params = array(
							'set' => array('unconfirmed_email' => $this->input->post('email')), 
							'conditions' => array('id' => $this->session->userdata('userId'))
						);
						
						log_message('user_info', 'Updating user unconfirmed_email field with email: ' . $this->input->post('email'));	
						$update = $this->user_model->update($params); 
						
						if($update) {		
													
							log_message('user_info', 'Generating random temporary code to pass to confirmation email link');
							$temp_pass = bin2hex(random_bytes(64));
								
							log_message('user_info', 'Loading email library...');
							$this->load->library('email');
							
							log_message('user_info', 'Configuring email options...');
							$config['protocol']    = 'smtp';
							$config['smtp_host']    = 'ssl://smtp.gmail.com';
							$config['smtp_port']    = '465';
							$config['smtp_timeout'] = '7';
							$config['smtp_user']    = 'vanime.staff@gmail.com';
							$config['smtp_pass']    = '!@#$%QWERT';
							$config['charset']    = 'utf-8';
							$config['newline']    = "\r\n";
							$config['mailtype'] = 'html';     

							log_message('user_info', 'Initializing email configuration...');
							$this->email->initialize($config);
							
							log_message('user_info', 'Setting email content, subject, author and receiver...');
							$this->email->from('vanime.staff@gmail.com', "CompMax Confirm Email");
							$this->email->to(htmlentities($this->input->post('email'), ENT_QUOTES));
							$this->email->subject("Confirm Account");
								
							$message = "<p>Click on the link below to confirm your account on CompMax</p>";
							$message .= "<p><a href='".site_url("users/confirm_email/$temp_pass")."'> \nClick here </a></p>";
								
							$this->email->message($message);
							
							log_message('user_info', 'Sending email...');
							if($this->email->send()) {					
								log_message('user_info', 'Email sent successfully');		
								log_message('user_info', 'Deleting existent user email records in temp_codes table');
								$delete = $this->user_model->delete(array('conditions' => array('user_id' => $this->session->userdata('userId'), 'type' => 're_email')), 'temp_codes');
								log_message('user_info', 'Inserting new email record in temp_codes table');
								$insert = $this->user_model->insert(array('user_id' => $this->session->userdata('userId'), 'hash' => $temp_pass, 'type' => 're_email'), 'temp_codes');
						
								if($insert) {
									log_message('user_info', 'New record successfully inserted');
									$this->session->set_userdata('long_msg', "Следвайте инструкциите, изпратени на посоченият от вас имейл, за да промените своя имейл.");
								} else {
									log_message('user_info', 'Failed to insert new record');
									$this->session->set_userdata('long_msg', "Възникна проблем, моля опитайте по-късно.");
								}								
									
							} else {
								log_message('user_info', 'Failed to send email');
								$this->session->set_userdata('long_msg', "Възника грешка при изпращането на имейла, моля опитайте по-късно");
							}  
							
							   
							if ($this->db->trans_status() === FALSE) {
								log_message('user_info', 'Transaction failed...rolling back');
								$this->db->trans_rollback();
							} else {
								$this->db->trans_commit();
								log_message('user_info', 'Transaction successfull');
							} 	
						} else {
							log_message('user_info', 'Couldn\'t update user unconfirmed_email field');
							log_message('user_info', 'Transaction failed...rolling back');
							$this->db->trans_rollback();
						}	
					}
				} else {
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
					log_message('user_info', 'Error getting users\' email, redirecting to ' . site_url('/users/account/'));
					redirect('/users/account/');
				}
                    
            } 
		} else {
			log_message('user_info', 'nameEmailSubmit is NULL. No form submitted');
		}
		
		log_message('user_info', 'Invoking account() function');
		$this->account();
	}
	
    public function update_info() {
		
		log_message('user_info', "\n\n" . site_url('users/update_info') . ' loaded.');
		
		$data = array();
		
		if($this->input->post('infoSubmit')) {
			
			log_message('user_info', 'Setting form validation rules...');
            $this->form_validation->set_rules('phone', 'Phone', 'trim|required|max_length[32]|callback_validate_phone');
            $this->form_validation->set_rules('country', 'Country', 'trim|max_length[64]');
            $this->form_validation->set_rules('region', 'Region', 'trim|max_length[64]');
            $this->form_validation->set_rules('street_address', 'Street Address', 'trim|max_length[255]');
            
            if($this->form_validation->run() === TRUE) {
				
				log_message('user_info', 'Form validation successfull');
				assert_v(is_numeric($this->session->userdata('userId')));
				
				log_message('user_info', 'Saving user data to array...');
				
				$userData = array(
					'gender' => ($this->input->post('gender')) ? $this->input->post('gender') : 'Unknown',
					'phone' => 	str_replace(' ', '', $this->input->post('phone')),
					'phone_unformatted' => $this->input->post('phone'),
					'country' => $this->input->post('country'),
					'region' => $this->input->post('region'),
					'street_address' => $this->input->post('street_address')
				);	
				
								
				log_message('user_info', 'User data:' .
					 PHP_EOL . 'gender = ' . $userData['gender'] . 
					 PHP_EOL . 'phone = ' . $userData['phone'] . 
					 PHP_EOL . 'phone_unformatted = ' . $userData['phone_unformatted'] . 
					 PHP_EOL . 'country = ' . $userData['country'] . 
					 PHP_EOL . 'region = ' . $userData['region'] . 
					 PHP_EOL . 'street_address = ' . $userData['street_address']
				);	
								
				$params = array(
					'set' => $userData, 
					'conditions' => array('id' => $this->session->userdata('userId'))
				);
				
				$params['set']['phone'] = preg_replace("/[^0-9]/","", $params['set']['phone']);
					
				log_message('user_info', 'Updating user info...');
                $update = $this->user_model->update($params); 
                          
                if($update) {
					log_message('user_info', 'Update successfull');			
                    $this->session->set_userdata('success_msg', 'Успешна промяна на данни.');
                } else {
					log_message('user_info', 'Update failed');
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
                }
                
                log_message('user_info', 'Redirecting to ' . site_url('/users/details/'));
                redirect('/users/details/');
                              
            }
		} else {
			log_message('user_info', 'infoSubmit is NULL. No form submitted');
		}
		
		log_message('user_info', 'Invoking details() function');
		$this->details();	

	}

	public function reset_page() {
		
		log_message('user_info', "\n\n" . site_url('users/reset_page') . ' loaded.');
		
		$data = array();      
        $data['title'] = "Reset password";
        
        if($this->input->post('resetSubmit')) {
	
			log_message('user_info', 'Set form validation');
			$this->form_validation->set_rules('email', 'Email', 'trim|required|valid_email|callback_email_check_reverse');
			
			log_message('user_info', 'Input email = ' . $this->input->post('email'));
			
			if ($this->form_validation->run() === TRUE) {

				assert_v($this->email_check_reverse($this->input->post('email')));

				log_message('user_info', 'Form validation successfull');
				log_message('user_info', 'Generating random temporary code to pass to reset link');
				$temp_pass = bin2hex(random_bytes(64));
					
				log_message('user_info', 'Loading email library...');
				$this->load->library('email');
				
				log_message('user_info', 'Configuring email options...');
				$config['protocol']    = 'smtp';
				$config['smtp_host']    = 'ssl://smtp.gmail.com';
				$config['smtp_port']    = '465';
				$config['smtp_timeout'] = '7';
				$config['smtp_user']    = 'vanime.staff@gmail.com';
				$config['smtp_pass']    = '!@#$%QWERT';
				$config['charset']    = 'utf-8';
				$config['newline']    = "\r\n";
				$config['mailtype'] = 'html';     

				log_message('user_info', 'Initializing email configuration...');
				$this->email->initialize($config);
				
				log_message('user_info', 'Setting email content, subject, author and receiver...');
				$this->email->from('vanime.staff@gmail.com', "Computer Store Reset Password");
				$this->email->to(htmlentities($this->input->post('email'), ENT_QUOTES));
				$this->email->subject("Reset your Password");
					
				$message = "<p>This email has been sent as a request to reset your password</p>";
				$message .= "<p><a href='".site_url("users/reset_password_form/$temp_pass")."'> \nClick here </a>if you want to reset your password, if not, then ignore</p>";
					
				$this->email->message($message);
				
				log_message('user_info', 'Sending email...');	
				if($this->email->send()) {
		
					log_message('user_info', 'Email successfully sent');			
					log_message('user_info', 'Getting user id by provided email');
					$user_id = $this->user_model->getRows(array('select' => array('users.id'), 'conditions' => array('email' => $this->input->post('email')), 'returnType' => 'single'))['id'];								
						
					if($user_id) {	
						
						assert_v(is_numeric($user_id));
						log_message('user_info', 'Beginning database transaction');
						$this->db->trans_begin();
												
						log_message('user_info', 'User found. User id = ' . $user_id);
						log_message('user_info', 'Deleting existent user password records in temp_codes table');		
						$delete = $this->user_model->delete(array('conditions' => array('user_id' => $user_id, 'type' => 'password')), 'temp_codes');
						log_message('user_info', 'Inserting new password record in temp_codes table');
						$insert = $this->user_model->insert(array('user_id' => $user_id, 'hash' => $temp_pass, 'type' => 'password'), 'temp_codes');
				
						if($insert) {
							log_message('user_info', 'New record successfully inserted');
							$this->session->set_userdata('long_msg', "Email was sent to {$this->input->post('email')}. <br/>Follow the instructions in it to reset your password.");
						} else {
							log_message('user_info', 'Failed to insert new record');
							$this->session->set_userdata('long_msg', "There was an internal error...");
						}
						
						if ($this->db->trans_status() === FALSE) {
							log_message('user_info', 'Transaction failed...rolling back');
							$this->db->trans_rollback();
						} else {
							$this->db->trans_commit();
							log_message('user_info', 'Transaction successfull');
						} 
					} else {
						log_message('user_info', 'No user found with the specified email');
						$this->session->set_userdata('long_msg', "There was an internal error...");
					}									
						
				} else {
					log_message('user_info', 'Failed to send email');
					$this->session->set_userdata('long_msg', "Failed to send email...");
				}  

				log_message('user_info', 'Redirecting to ' . site_url('/users/login/'));
				redirect('/users/login/');
			}						    
				
			 $this->load->view('forgotten_password', $data);
            
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			log_message('user_info', 'User trying to access reset password page while logged. Redirecting to ' . site_url('/users/account/'));
			redirect('/users/account/');
		} else {
			log_message('user_info', 'resetSubmit is NULL. No form submitted. Loading forgotten_password page');
			$this->load->view('forgotten_password', $data);
		}
	}
	
	public function reset_password_form($hash=null) {
		
		log_message('user_info', "\n\n" . site_url('users/reset_password_form') . ' loaded.');
		
		if($hash != null) {
			
			log_message('user_info', 'Temp code found: ' . $hash);		
			log_message('user_info', 'Checking if temp code exists...');
			$exists = $this->user_model->getRows(array('select' => array('temp_codes.hash'),
													   'table' => 'temp_codes', 
													   'conditions' => array('hash' => $hash),
													   'returnType' => 'single'));			
			
			if($exists) {
				
				log_message('user_info', 'Temp code exists. Storing code in session');
				
				$this->session->set_userdata('reset_hash', $exists['hash']);
				
				$data = array();
				$data['title'] = 'Change Password';
				log_message('user_info', 'Loading change_password page');
				$this->load->view('change_password.php', $data);
				
			} else {
				log_message('user_info', 'Temp code doesn\'t exist. Redirecting to ' . site_url('/users/login/'));
				$this->session->set_userdata('long_msg', 'Линкът е изтекъл или е невалиден.');
				redirect('/users/login/');
			}
			
		} else {
			log_message('user_info', 'Temp code not provided. Redirecting to ' . site_url('/users/login/'));
			redirect('users/login/');
		}
	}
	
	public function reset_password() {
		
		log_message('user_info', "\n\n" . site_url('users/reset_password') . ' loaded.');
		
		$data = array();
		
		if($this->input->post('resetSubmit')) {
			
			log_message('user_info', 'Setting form validation rules');
            $this->form_validation->set_rules('password', 'Password', 'required|max_length[255]|callback_password_validate|max_length[255]');
            $this->form_validation->set_rules('conf_password', 'confirm password', 'required|matches[password]|max_length[255]');
            
            log_message('user_info', 'Checking if user exists...');
            $exists = $this->user_model->getRows(array('select' => array('users.id'),
													   'table' => 'temp_codes', 
													   'conditions' => array('hash' => $this->session->userdata('reset_hash')),
													   'joins' => array('users' => 'users.id = temp_codes.user_id'),
													   'returnType' => 'single'));
            
            if(($this->form_validation->run() === TRUE) && $exists['id']) {
				
				assert_v(is_numeric($exists['id']));
				log_message('user_info', 'Form validation successfull. User exists. User id = ' . $exists['id']);
				log_message('user_info', 'Generating random salt');
				$salt = bin2hex(random_bytes(32));
				
				$params = array(
					'set' => array('password' => hash("sha256", $this->input->post('password') . $salt), 'salt' => $salt), 
					'conditions' => array('id' => $exists['id'])
				);
					
				log_message('user_info', 'Beginning database transaction');
				$this->db->trans_begin();
				
				log_message('user_info', 'Updating user password...');
                $update = $this->user_model->update($params);
                          
                if($update) {
					log_message('user_info', 'Password updated successfully');
					log_message('user_info', 'Deleting user password record in temp_codes...');
					$delete = $this->user_model->delete(array('conditions' => array('user_id' => $exists['id'])), 'temp_codes');
					if($delete) {
						log_message('user_info', 'Unsetting reset code in session');
						$this->session->unset_userdata('reset_hash');
						$this->session->set_userdata('long_msg', 'Ти успешно промени паролата си.');
					} else {
						log_message('user_info', 'Failed to delete records in temp_codes');
						$this->session->set_userdata('long_msg', 'Възникна проблем, моля опитайте по-късно.');
					}            
                } else {
					log_message('user_info', 'Password update failed');
					$this->session->set_userdata('long_msg', 'Възникна проблем, моля опитайте по-късно.');
                }
                
                if ($this->db->trans_status() === FALSE) {
					log_message('user_info', 'Transaction failed...rolling back');
					$this->db->trans_rollback();
				} else {
					$this->db->trans_commit();
					log_message('user_info', 'Transaction successfull');
				}
                
                log_message('user_info', 'Redirecting to ' . site_url('/users/login/'));
                redirect('/users/login/');
                              
            } else {
				log_message('user_info', 'Form validation failed or user doesn\'t exist. Code in session: ' . $this->session->userdata('reset_hash'));
			}
		} 
		
		log_message('user_info', 'Invoking reset_password_form() function with argument: ' . $this->session->userdata('reset_hash'));
		$this->reset_password_form($this->session->userdata('reset_hash'));	
		
	}
	
	public function confirm_email($hash=null) {
		
		log_message('user_info', "\n\n" . site_url('users/confirm_email') . ' loaded.');
		
		if($hash != null) {
			
			log_message('user_info', 'Temp code found: ' . $hash);		
			log_message('user_info', 'Checking if temp code exists...');
			
			$exists = $this->user_model->getRows(array('select' => array('temp_codes.user_id', 'type'),
													   'table' => 'temp_codes',
													   'conditions' => array('hash' => $hash),
													   'returnType' => 'single'));		
			if($exists) {
				
				assert_v(is_numeric($exists['user_id']));
				log_message('user_info', 'Temp code exists');			
				log_message('user_info', 'Beginning database transaction');
				$this->db->trans_begin();
				
				log_message('user_info', 'Updating user record...');
				
				if($exists['type'] == 'email') {
					log_message('user_info', 'Setting users\' confirmed field to 1');
					$update = $this->user_model->update(array('set' => array('confirmed' => '1'),
														  'conditions' => array('id' => $exists['user_id'])));														  													  
				} elseif($exists['type'] == 're_email') {
					log_message('user_info', 'Changing users\' email field with the unconfirmed_field');
					$update = $this->user_model->update(array('set' => array('email' => "(SELECT unconfirmed_email FROM users WHERE id = {$exists['user_id']})"),
														  'conditions' => array('id' => $exists['user_id'])));														
				} else {
					log_message('user_info', 'Temp code type is unknown, redirecting to ' . site_url('users/login'));
					$this->session->set_userdata('long_msg', 'Неуспешно потвърждение на акаунт. Линкът е изтекъл или е невалиден.');
					redirect('/users/login/');
				}
				if($update) {
					log_message('user_info', 'Account confirmed successfully');
					log_message('user_info', 'Deleting user email record in temp_codes...');
					$delete = $this->user_model->delete(array('conditions' => array('hash' => $hash)), 'temp_codes');	
					if($delete) {
						$this->session->set_userdata('long_msg', 'Ти успешно потвърди акаунта си. Можеш да се логнеш.');  
					} else {
						log_message('user_info', 'Failed to delete records in temp_codes');
						$this->session->set_userdata('long_msg', 'Възникна проблем, моля опитайте по-късно.');
					}
				} else {
					log_message('user_info', 'Failed to update record');
					$this->session->set_userdata('long_msg', 'Неуспешно потвърждение на акаунт. Линкът е изтекъл или е невалиден.'); 
				}
				
				if ($this->db->trans_status() === FALSE) {
					log_message('user_info', 'Transaction failed...rolling back');
					$this->db->trans_rollback();
				} else {
					$this->db->trans_commit();
					log_message('user_info', 'Transaction successfull');
				}										  

				log_message('user_info', 'Invoking login() function');
				$this->login();
				
			} else {
				log_message('user_info', 'Temp code doesn\'t exist. Redirecting to ' . site_url('/users/login/'));
				$this->session->set_userdata('long_msg', 'Неуспешно потвърждение на акаунт. Линкът е изтекъл или е невалиден.');
				redirect('/users/login/');
			}
			
		} else {
			log_message('user_info', 'Temp code not provided. Redirecting to ' . site_url('/users/login/'));
			redirect('users/login/');
		}
	}
	
	public function resend_page() {
		
		log_message('user_info', "\n\n" . site_url('users/resend_page') . ' loaded.');
		
		$data = array();      
        $data['title'] = "Resend Email";
        
        if($this->input->post('resetSubmit')) {
	
			log_message('user_info', 'Setting form validation rules');
			$this->form_validation->set_rules('email', 'Email', 'trim|required|valid_email|callback_email_check_reverse');
			
			log_message('user_info', 'Input email = ' . $this->input->post('email'));
			
			if ($this->form_validation->run() === TRUE) {

				assert_v($this->email_check_reverse($this->input->post('email')));
				log_message('user_info', 'Form validation successfull');
				log_message('user_info', 'Generating random temporary code to pass to confirmation email link');
				$temp_pass = bin2hex(random_bytes(64));
					
				log_message('user_info', 'Loading email library...');
				$this->load->library('email');
				
				log_message('user_info', 'Configuring email options...');
				$config['protocol']    = 'smtp';
				$config['smtp_host']    = 'ssl://smtp.gmail.com';
				$config['smtp_port']    = '465';
				$config['smtp_timeout'] = '7';
				$config['smtp_user']    = 'vanime.staff@gmail.com';
				$config['smtp_pass']    = '!@#$%QWERT';
				$config['charset']    = 'utf-8';
				$config['newline']    = "\r\n";
				$config['mailtype'] = 'html';     

				log_message('user_info', 'Initializing email configuration...');
				$this->email->initialize($config);			
				
				log_message('user_info', 'Setting email content, subject, author and receiver...');
				$this->email->from('vanime.staff@gmail.com', "CompMax Confirm Email");
				$this->email->to(htmlentities($this->input->post('email'), ENT_QUOTES));
				$this->email->subject("Confirm Account");
						
				$message = "<p>Click on the link below to confirm your account on CompMax</p>";
				$message .= "<p><a href='".site_url("users/confirm_email/$temp_pass")."'> \nClick here </a></p>";							
					
				$this->email->message($message);
					
				log_message('user_info', 'Sending email...');
				if($this->email->send()) {
		
					log_message('user_info', 'Email successfully sent');					
					log_message('user_info', 'Getting user id by provided email');
					$user_id = $this->user_model->getRows(array('select' => array('users.id'), 'conditions' => array('email' => $this->input->post('email')), 'returnType' => 'single'))['id'];								
						
					if($user_id) {		
						
						assert_v(is_numeric($user_id));
						log_message('user_info', 'User found. User id = ' . $user_id);
						log_message('user_info', 'Beginning database transaction');
						$this->db->trans_begin();
							
						log_message('user_info', 'Deleting existent user email records in temp_codes...');	
						$delete = $this->user_model->delete(array('conditions' => array('user_id' => $user_id, 'type' => 'email')), 'temp_codes');
						log_message('user_info', 'Inserting new password record in temp_codes table');
						$insert = $this->user_model->insert(array('user_id' => $user_id, 'hash' => $temp_pass, 'type' => 'email'), 'temp_codes');				
						if($insert) {
							log_message('user_info', 'New record successfully inserted');
							$this->session->set_userdata('long_msg', "Следвайте инструкциите, изпратени на {$this->input->post('email')}, за да активирате своя акаунт.");
						} else {
							log_message('user_info', 'Failed to insert new record');
						}					
						
						if ($this->db->trans_status() === FALSE) {
							log_message('user_info', 'Transaction failed...rolling back');
							$this->session->set_userdata('long_msg', "Възникна проблем, моля опитайте по-късно.");
							$this->db->trans_rollback();
						} else {
							$this->db->trans_commit();
							log_message('user_info', 'Transaction successfull');
						}
					} else {
						log_message('user_info', 'No user found with the specified email');
						$this->session->set_userdata('long_msg', "Възникна грешка, моля оптайте по-късно.");
					}									
						
				} else {
					log_message('user_info', 'Failed to send email');
					$this->session->set_userdata('long_msg', "Failed to send email...");
				}  

				log_message('user_info', 'Redirecting to ' . site_url('/users/login/'));
				redirect('/users/login/');
			}						    
				
			log_message('user_info', 'Loading resend_page page');
			$this->load->view('resend_page', $data);
            
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			log_message('user_info', 'User trying to access resend page while logged in. Redirecting to ' . site_url('/users/account/'));
			redirect('/users/account/');
		} else {
			log_message('user_info', 'resetSubmit is NULL. No form submitted. Loading resend page');
			$this->load->view('resend_page', $data);
		}
	}
    
    public function logout() {
		
		log_message('user_info', "\n\n" . site_url('users/logout') . ' loaded.');
		
		if ($this->session->userdata('isUserLoggedIn')) {
			$this->load->model('cart_model');
			$this->load->model('order_model');
			log_message('user_info', 'Loaded cart_model and order_model');
			log_message('user_info', 'Removing users\' cart records');
			$this->cart_model->delete(array('conditions' => array('user_id' => $this->session->userdata('userId'))));
			//$statusId = $this->order_model->getRows(array('table' => 'statuses', 'conditions' => array('name' => 'Temporary'), 'returnType' => 'single'))['id'];
			//$this->order_model->delete(array('conditions' => array('user_id' => $this->session->userdata('userId'), 'status_id' => $statusId)));
			log_message('user_info', 'Unsetting user session data');
			$this->session->unset_userdata('isUserLoggedIn');
			$this->session->unset_userdata('userId');               
			//$this->session->sess_destroy();
			log_message('user_info', 'Redirecting to ' . site_url('users/login'));
			redirect('/users/login/');
		} else {
			log_message('user_info', 'Cannot logout while not logged in. Redirecting to ' . site_url('users/accout'));
			redirect('/users/account/');
		}
    }
    
    public function email_check($str) {
		
		log_message('user_info', "\n\n" . site_url('users/email_check') . ' loaded.');
		log_message('user_info', 'Email to check = ' . $str);
		
        $params['returnType'] = 'count';
        $params['conditions'] = array('email' => $str);
        
        log_message('user_info', 'Checking if email exists...');
        $checkEmail = $this->user_model->getRows($params);
        
        if($checkEmail > 0){
			log_message('user_info', 'The email exists');
            $this->form_validation->set_message('email_check', 'The email is already taken.');
            return FALSE;
        } else {
			log_message('user_info', 'The email doesn\'t exist');
            return TRUE;
        }
    }
   
     public function email_check_reverse($str) {
		 
		log_message('user_info', "\n\n" . site_url('users/email_check_reverse') . ' loaded.');
		log_message('user_info', 'Email to check = ' . $str);
		
        $params['returnType'] = 'count';
        $params['conditions'] = array('email' => $str);
        
        log_message('user_info', 'Checking if email exists...');
        $checkEmail = $this->user_model->getRows($params);
        
        if($checkEmail > 0) {
			 log_message('user_info', 'The email exists');
             return TRUE;
        } else {        
			log_message('user_info', 'The email doesn\'t exist');
            $this->form_validation->set_message('email_check_reverse', "The email doesn't exist");
            return FALSE;
        }
    }
   
    public function password_check($str) {
		
		log_message('user_info', "\n\n" . site_url('users/password_check') . ' loaded.');
		assert_v(is_numeric($this->session->userdata('userId')));
		log_message('user_info', 'Checking if input password matches the users\'');
		$checkLogin = $this->user_model->getRows(array('select' => array('password', 'salt'), 'conditions' => array('id' => $this->session->userdata('userId')), 'returnType' => 'single'));

		if($checkLogin && ((hash("sha256", $str . $checkLogin['salt'])) === $checkLogin['password'])) {	
			log_message('user_info', 'Password matches');		
			return TRUE;
		} else {
			log_message('user_info', 'Password doesn\'t matche');	
			$this->form_validation->set_message('password_check', 'Wrong password.');
            return FALSE;
		}
    }     
	
	public function password_validate($str) {
		
		log_message('user_info', "\n\n" . site_url('users/password_validate') . ' loaded.');
		log_message('user_info', 'Validating password requirements');
		
		if(!preg_match("/^\S*(?=\S{8,})(?=\S*[a-z])(?=\S*[A-Z])(?=\S*[\d])\S*$/", $str)) {
			log_message('user_info', 'The password doesn\'t pass the requirements');
			$this->form_validation->set_message('password_validate', 'The password must be at least 8 characters long, have at least 1 lowercase letter, 1 uppercase letter and 1 number.');
			return FALSE;
		} else {
			log_message('user_info', 'The password passes the requirements');
			return TRUE;
		}
		
	}
	
	public function recaptcha($str='') {
		
		log_message('user_info', "\n\n" . site_url('users/recaptcha') . ' loaded.');
		
		log_message('user_info', 'Forging reCaptcha url');
		$google_url = "https://www.google.com/recaptcha/api/siteverify";
		log_message('user_info', 'Base url = ' . $google_url);
		$secret = SECRET_CODE_RECAPTCHA;
	    $ip = $_SERVER['REMOTE_ADDR'];
	    log_message('user_info', 'Ip = ' . $ip);
		$url = $google_url."?secret=" . $secret . "&response=" . $str . "&remoteip=" . $ip;
		log_message('user_info', 'Initializing curl...');
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_TIMEOUT, 10);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
		
		log_message('user_info', 'Sending request...');
		$res = curl_exec($curl);
		curl_close($curl);
		log_message('user_info', 'Decoding response...');
		$res = json_decode($res, true);

		if($res['success']) {
			log_message('user_info', 'Response successfull');
			return TRUE;
		}
		else {
			log_message('user_info', 'Request failed. reCaptcha validation unsuccessfull');
			$this->form_validation->set_message('recaptcha', 'reCAPTCHA validation failed');
			return FALSE;
		}
   }
    
    public function email_check_without_current($str) {
		
		log_message('user_info', "\n\n" . site_url('users/email_check_without_current') . ' loaded.');
		log_message('user_info', 'Input email to check = ' . $str);
		assert_v(is_numeric($this->session->userdata('userId')));
		log_message('user_info', 'Getting current users\' email by user id');
		$user_email = $this->user_model->getRows(array('id' => $this->session->userdata('userId')))['email'];
		
        $params['returnType'] = 'single';
        $params['conditions'] = array('email' => $str);
        
        log_message('user_info', 'Getting user data by input email');
        $result = $this->user_model->getRows($params);
        
        log_message('user_info', 'Checking if a user with the input email exists and if the input email matches the current users\' email');
        if($result && $result['email'] != $user_email) {
			log_message('user_info', 'The input email exists and doesn\'t match the current users\'s email');
            $this->form_validation->set_message('email_check_without_current', 'The email is already taken.');
            return FALSE;
        } else {
			log_message('user_info', 'The input email doesn\'t exist or it matches the current users\' email');
            return TRUE;
        }
    }
    
    public function validate_phone($str) {
		
		log_message('user_info', "\n\n" . site_url('users/validate_phone') . ' loaded.');
		log_message('user_info', 'Phone to validate = ' . $str);
		
		$str = str_replace(' ', '', $str);
		
		if(preg_match("/\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/", $str)) {
			log_message('user_info', 'Phone matches the 1-st pattern');
			return TRUE;				
		} elseif(preg_match("/^(\d[\s-]?)?[\(\[\s-]{0,2}?\d{3}[\)\]\s-]{0,2}?\d{3}[\s-]?\d{4}$/i", $str)) {
			log_message('user_info', 'Phone matches the 2-nd pattern');
			return TRUE;
		} elseif(preg_match("/^\d{10,14}$/", $str)) {
			log_message('user_info', 'Phone matches the 3-rd pattern');
			return TRUE;
		} else {
			log_message('user_info', 'Phone doesn\'t matches any of the given patterns');
			$this->form_validation->set_message('validate_phone', 'Invalid phone number.');
			return FALSE;
		}
	}
	
}


?>

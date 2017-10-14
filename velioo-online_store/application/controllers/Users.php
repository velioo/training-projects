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
        $data = array();
        $data['title'] = "Account settings";
        if($this->session->userdata('isUserLoggedIn')){
            $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
            $this->load->view('account', $data);
        } else {
            redirect('/users/login/');
        }
    }
    
    public function details() {
		$data = array();
		$data['countries'] = $this->user_model->getRows(array('table' => 'countries', 'select' => array('nicename', 'phonecode')));
        $data['title'] = "Account details";
        if($this->session->userdata('isUserLoggedIn')){
            $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
            $this->load->view('details', $data);
        } else {
            redirect('/users/login/');
        }
	}
	
	public function orders() {
		$data = array();
        $data['title'] = "Orders details";
        if($this->session->userdata('isUserLoggedIn')) {
			$this->load->model('order_model');
            $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
            $data['orders'] = $this->order_model->getRows(array('select' => array('orders.id as order_id',
																				  'orders.created_at as order_created_at',
																				  'orders.amount_leva',
																				  'statuses.name as status_name',
																				  'statuses.id as status_id'), 
															    'conditions' => array('user_id' => $this->session->userdata('userId')), 
															    'joins' => array('statuses' => 'statuses.id = orders.status_id'),
																'order_by' => array('order_id' => 'DESC')));
			$this->load->view('orders', $data);
        } else {
            redirect('/users/login/');
        }
	}
	
	public function payments() {
		$data = array();
        $data['title'] = "Payments";
        if($this->session->userdata('isUserLoggedIn')){
            $data['user'] = $this->user_model->getRows(array('id' => $this->session->userdata('userId')));
            $this->load->view('payments', $data);
        } else {
            redirect('/users/login/');
        }
	}
	
	public function cart() {
		$data = array();
        $data['title'] = "Количка";
        if($this->session->userdata('isUserLoggedIn')){
			$this->load->model('product_model');
            $data['products'] = $this->product_model->getRows(array('select' => array('products.id', 'products.name', 'products.price_leva', 'products.image', 'cart.quantity'), 
																    'joins' => array('cart' => 'cart.product_id = products.id', 'users' => 'users.id = cart.user_id'),
																    'conditions' => array('users.id' => $this->session->userdata('userId'))));
            $this->load->view('cart', $data);
        } else {
            redirect('/users/login/');
        }
	}
    
    public function login() {
		
        $data = array();      
        $data['title'] = "Login";
        
        if($this->input->post('loginSubmit')) {
				
			$checkLogin = $this->user_model->getRows(array('select' => array('password', 'salt', 'id', 'confirmed'), 'conditions' => array('email' => $this->input->post('email')), 'returnType' => 'single'));

			if($checkLogin && ((hash("sha256", $this->input->post('password') . $checkLogin['salt'])) === $checkLogin['password'])) {								
				
				if($checkLogin['confirmed'] == 1) {
					$this->session->set_userdata('isUserLoggedIn',TRUE);
					$this->session->set_userdata('userId', $checkLogin['id']);
					redirect('/welcome/');
				} else {
					$this->session->set_userdata('error_msg_timeless', 'You need to confirm your email before logging in! <a href="' . site_url("users/resend_page") . '">Click Here</a> to resend confirmation mail.');
				}
				
			} else{
				$this->session->set_userdata('error_msg_timeless', 'Wrong email or password.');
			}                 
            
            $this->load->view('login', $data);
            
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			redirect('/users/account/');
		} else {
			$this->load->view('login', $data);
		}
    }
    
    public function registration() {
        $data = array();
        $data['title'] = "Registration";
        $userData = array();           

		$data['countries'] = $this->user_model->getRows(array('table' => 'countries', 'select' => array('nicename', 'phonecode')));

        if($this->input->post('registrSubmit')) {

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

			$salt = bin2hex(random_bytes(32));

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

            if($this->form_validation->run() === TRUE) {
				
				$userData['phone'] = preg_replace("/[^0-9]/","", $userData['phone']);
				
                $insertId = $this->user_model->insert($userData);      

                if($insertId) {					
					
					$temp_pass = bin2hex(random_bytes(64));
						
					$this->load->library('email');
					
					$config['protocol']    = 'smtp';
					$config['smtp_host']    = 'ssl://smtp.gmail.com';
					$config['smtp_port']    = '465';
					$config['smtp_timeout'] = '7';
					$config['smtp_user']    = 'vanime.staff@gmail.com';
					$config['smtp_pass']    = '!@#$%QWERT';
					$config['charset']    = 'utf-8';
					$config['newline']    = "\r\n";
					$config['mailtype'] = 'html';     

					$this->email->initialize($config);
					
					$this->email->from('vanime.staff@gmail.com', "CompMax Confirm Email");
					$this->email->to(htmlentities($this->input->post('email'), ENT_QUOTES));
					$this->email->subject("Confirm Account");
						
					$message = "<p>Click on the link below to confirm your account on CompMax</p>";
					$message .= "<p><a href='".site_url("users/confirm_email/$temp_pass")."'> \nClick here </a></p>";
						
					$this->email->message($message);
						
					if($this->email->send()) {							
										
						$delete = $this->user_model->delete(array('conditions' => array('user_id' => $insertId, 'type' => 'email')), 'temp_codes');			
						$insert = $this->user_model->insert(array('user_id' => $insertId, 'hash' => $temp_pass, 'type' => 'email'), 'temp_codes');
				
						if($insert) {
							$this->session->set_userdata('long_msg', "Следвайте инструкциите, изпратени на посоченият от вас имейл, за да активирате своя акаунт.");
						} else {
							$this->session->set_userdata('long_msg', "Възникна проблем, моля опитайте по-късно.");
						}								
							
					} else {
						$this->session->set_userdata('long_msg', "Failed to send confirmation email...");
					}  							

                    redirect('/users/login/');                    
                } else {
                    $this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
                }
            }  
            
           $data['user'] = $userData; 
           $this->load->view('registration', $data);   
                
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			 redirect('/users/account/');
		} else {
			$this->load->view('registration', $data);
		}		
       
    }
    
    public function update_password() {
		$data = array();
		
		if($this->input->post('passwordSubmit')) {
			
            $this->form_validation->set_rules('old_password', 'Old password', 'required|callback_password_check|max_length[255]');
            $this->form_validation->set_rules('password', 'Password', 'required|max_length[255]|callback_password_validate|max_length[255]');
            $this->form_validation->set_rules('conf_password', 'confirm password', 'required|matches[password]|max_length[255]');
            
            if($this->form_validation->run() === TRUE) {
				
				$salt = bin2hex(random_bytes(32));
				
				$params = array(
					'set' => array('password' => hash("sha256", $this->input->post('password') . $salt), 'salt' => $salt), 
					'conditions' => array('id' => $this->session->userdata('userId'))
				);
					
                $update = $this->user_model->update($params); 
                          
                if($update) {					
                    $this->session->set_userdata('success_msg', 'Ти успешно промени паролата си.');                  
                } else {
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');                   
                }
                
                redirect('/users/account/');
                              
            } 
		} 
		
		$this->account();	

	}
	
	public function update_name_email() {
		$data = array();
		
		if($this->input->post('nameEmailSubmit')) {

            $this->form_validation->set_rules('name', 'Name', 'required|max_length[64]');
            $this->form_validation->set_rules('last_name', 'Last Name', 'max_length[128]');
            $this->form_validation->set_rules('email', 'Email', 'required|valid_email|max_length[64]|callback_email_check_without_current');
            
            if($this->form_validation->run() === TRUE) {
				
				$params = array(
					'set' => array('name' => $this->input->post('name'), 'last_name' => $this->input->post('last_name'), 'email' => $this->input->post('email')), 
					'conditions' => array('id' => $this->session->userdata('userId'))
				);
					
                $update = $this->user_model->update($params); 
                          
                if($update) {					
                    $this->session->set_userdata('success_msg', 'Успешна промяна на данни.');                 
                } else {
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');
                }         
                
                redirect('/users/account/');
                    
            } 
		}
		
		$this->account();
	}
	
    public function update_info() {
		$data = array();
		
		if($this->input->post('infoSubmit')) {
			
            $this->form_validation->set_rules('phone', 'Phone', 'trim|required|max_length[32]|callback_validate_phone');
            $this->form_validation->set_rules('country', 'Country', 'trim|max_length[64]');
            $this->form_validation->set_rules('region', 'Region', 'trim|max_length[64]');
            $this->form_validation->set_rules('street_address', 'Street Address', 'trim|max_length[255]');
            
            if($this->form_validation->run() === TRUE) {
				
				$params = array(
					'set' => array('gender' => $this->input->post('gender'),
						'phone' => str_replace(' ', '', $this->input->post('phone')),
						'phone_unformatted' => $this->input->post('phone'),
						'country' => $this->input->post('country'),
						'region' => $this->input->post('region'),
						'street_address' => $this->input->post('street_address')), 
					'conditions' => array('id' => $this->session->userdata('userId'))
				);
				
				$params['set']['phone'] = preg_replace("/[^0-9]/","", $params['set']['phone']);
					
                $update = $this->user_model->update($params); 
                          
                if($update) {					
                    $this->session->set_userdata('success_msg', 'Успешна промяна на данни.');                  
                } else {
					$this->session->set_userdata('error_msg', 'Възникна проблем, моля опитайте по-късно.');                   
                }
                
                redirect('/users/details/');
                              
            }
		} 
		
		$this->details();	

	}

	public function reset_page() {
		$data = array();      
        $data['title'] = "Reset password";
        
        if($this->input->post('resetSubmit')) {
	
			$this->form_validation->set_rules('email', 'Email', 'trim|required|valid_email|callback_email_check_reverse');
			
			if ($this->form_validation->run() === TRUE) {

				$temp_pass = bin2hex(random_bytes(64));
					
				$this->load->library('email');
				
				$config['protocol']    = 'smtp';
				$config['smtp_host']    = 'ssl://smtp.gmail.com';
				$config['smtp_port']    = '465';
				$config['smtp_timeout'] = '7';
				$config['smtp_user']    = 'vanime.staff@gmail.com';
				$config['smtp_pass']    = '!@#$%QWERT';
				$config['charset']    = 'utf-8';
				$config['newline']    = "\r\n";
				$config['mailtype'] = 'html';     

				$this->email->initialize($config);
				
				$this->email->from('vanime.staff@gmail.com', "Computer Store Reset Password");
				$this->email->to(htmlentities($this->input->post('email'), ENT_QUOTES));
				$this->email->subject("Reset your Password");
					
				$message = "<p>This email has been sent as a request to reset your password</p>";
				$message .= "<p><a href='".site_url("users/reset_password_form/$temp_pass")."'> \nClick here </a>if you want to reset your password, if not, then ignore</p>";
					
				$this->email->message($message);
					
				if($this->email->send()) {
		
					$user_id = $this->user_model->getRows(array('select' => array('users.id'), 'conditions' => array('email' => $this->input->post('email')), 'returnType' => 'single'))['id'];								
						
					if($user_id) {				
						$delete = $this->user_model->delete(array('conditions' => array('user_id' => $user_id, 'type' => 'password')), 'temp_codes');			
						$insert = $this->user_model->insert(array('user_id' => $user_id, 'hash' => $temp_pass, 'type' => 'password'), 'temp_codes');
				
						if($insert) {
							$this->session->set_userdata('long_msg', "Email was sent to {$this->input->post('email')}. <br/>Follow the instructions in it to reset your password.");
						} else {
							$this->session->set_userdata('long_msg', "There was an internal error...");
						}
					} else {
						$this->session->set_userdata('long_msg', "There was an internal error...");
					}									
						
				} else {
					$this->session->set_userdata('long_msg', "Failed to send email...");
				}  

				redirect('/users/login/');
			}						    
				
			 $this->load->view('forgotten_password', $data);
            
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			redirect('/users/account/');
		} else {
			$this->load->view('forgotten_password', $data);
		}
	}
	
	public function reset_password_form($hash=null) {
		if($hash != null) {
			
			$exists = $this->user_model->getRows(array('select' => array('temp_codes.hash'),
													   'table' => 'temp_codes', 
													   'conditions' => array('hash' => $hash),
													   'returnType' => 'single'));			
			
			if($exists) {
				
				$this->session->set_userdata('reset_hash', $exists['hash']);
				
				$data = array();
				$data['title'] = 'Change Password';
				$this->load->view('change_password.php', $data);
				
			} else {
				redirect('/users/login/');
			}
			
		} else {
			redirect('users/login/');
		}
	}
	
	public function reset_password() {
		
		$data = array();
		
		if($this->input->post('resetSubmit')) {
			
            $this->form_validation->set_rules('password', 'Password', 'required|max_length[255]|callback_password_validate|max_length[255]');
            $this->form_validation->set_rules('conf_password', 'confirm password', 'required|matches[password]|max_length[255]');
            
            $exists = $this->user_model->getRows(array('select' => array('users.id'),
													   'table' => 'temp_codes', 
													   'conditions' => array('hash' => $this->session->userdata('reset_hash')),
													   'joins' => array('users' => 'users.id = temp_codes.user_id'),
													   'returnType' => 'single'));
            
            if(($this->form_validation->run() === TRUE) && $exists) {
				
				$salt = bin2hex(random_bytes(32));
				
				$params = array(
					'set' => array('password' => hash("sha256", $this->input->post('password') . $salt), 'salt' => $salt), 
					'conditions' => array('id' => $exists['id'])
				);
					
                $update = $this->user_model->update($params); 
                          
                if($update) {				
					$delete = $this->user_model->delete(array('conditions' => array('user_id' => $exists['id'])), 'temp_codes');	
					$this->session->unset_userdata('reset_hash');		
                    $this->session->set_userdata('long_msg', 'Ти успешно промени паролата си.');                  
                } else {
					$this->session->set_userdata('long_msg', 'Възникна проблем, моля опитайте по-късно.');                   
                }
                
                redirect('/users/login/');
                              
            } 
		} 
		
		$this->reset_password_form($this->session->userdata('reset_hash'));	
		
	}
	
	public function confirm_email($hash=null) {
		if($hash != null) {
			
			$data = array();
			
			$exists = $this->user_model->getRows(array('select' => array('temp_codes.user_id'),
													   'table' => 'temp_codes', 
													   'conditions' => array('hash' => $hash),
													   'returnType' => 'single'));			
			
			if($exists) {
				
				$update = $this->user_model->update(array('set' => array('confirmed' => '1'),
														  'conditions' => array('id' => $exists['user_id'])));
				if($update) {
					$this->session->set_userdata('long_msg', 'Ти успешно потвърди акаунта си. Можеш да се логнеш.');  
					$delete = $this->user_model->delete(array('conditions' => array('hash' => $hash)), 'temp_codes');	
				} else {
					$this->session->set_userdata('long_msg', 'Неуспешно потвърждение на акаунт. Линкът е изтекъл или е невалиден.'); 
				}										  

				$this->login();
				
			} else {
				$this->session->set_userdata('long_msg', 'Неуспешно потвърждение на акаунт. Линкът е изтекъл или е невалиден.');
				redirect('/users/login/');
			}
			
		} else {
			redirect('users/login/');
		}
	}
	
	public function resend_page() {
		$data = array();      
        $data['title'] = "Resend Email";
        
        if($this->input->post('resetSubmit')) {
	
			$this->form_validation->set_rules('email', 'Email', 'trim|required|valid_email|callback_email_check_reverse');
			
			if ($this->form_validation->run() === TRUE) {

				$temp_pass = bin2hex(random_bytes(64));
					
				$this->load->library('email');
				
				$config['protocol']    = 'smtp';
				$config['smtp_host']    = 'ssl://smtp.gmail.com';
				$config['smtp_port']    = '465';
				$config['smtp_timeout'] = '7';
				$config['smtp_user']    = 'vanime.staff@gmail.com';
				$config['smtp_pass']    = '!@#$%QWERT';
				$config['charset']    = 'utf-8';
				$config['newline']    = "\r\n";
				$config['mailtype'] = 'html';     

				$this->email->initialize($config);			
				
				$this->email->from('vanime.staff@gmail.com', "CompMax Confirm Email");
				$this->email->to(htmlentities($this->input->post('email'), ENT_QUOTES));
				$this->email->subject("Confirm Account");
						
				$message = "<p>Click on the link below to confirm your account on CompMax</p>";
				$message .= "<p><a href='".site_url("users/confirm_email/$temp_pass")."'> \nClick here </a></p>";							
					
				$this->email->message($message);
					
				if($this->email->send()) {
		
					$user_id = $this->user_model->getRows(array('select' => array('users.id'), 'conditions' => array('email' => $this->input->post('email')), 'returnType' => 'single'))['id'];								
						
					if($user_id) {				
						$delete = $this->user_model->delete(array('conditions' => array('user_id' => $user_id, 'type' => 'email')), 'temp_codes');			
						$insert = $this->user_model->insert(array('user_id' => $user_id, 'hash' => $temp_pass, 'type' => 'email'), 'temp_codes');
				
						if($insert) {
							$this->session->set_userdata('long_msg', "Следвайте инструкциите, изпратени на {$this->input->post('email')}, за да активирате своя акаунт.");
						} else {
							$this->session->set_userdata('long_msg', "Възникна проблем, моля опитайте по-късно.");
						}	
					} else {
						$this->session->set_userdata('long_msg', "Възникна грешка, моля оптайте по-късно.");
					}									
						
				} else {
					$this->session->set_userdata('long_msg', "Failed to send email...");
				}  

				redirect('/users/login/');
			}						    
				
			$this->load->view('resend_page', $data);
            
        } elseif ($this->session->userdata('isUserLoggedIn')) {
			redirect('/users/account/');
		} else {
			$this->load->view('resend_page', $data);
		}
	}
    
    public function logout() {
		if ($this->session->userdata('isUserLoggedIn')) {
			$this->load->model('cart_model');
			$this->load->model('order_model');
			$this->cart_model->delete(array('conditions' => array('user_id' => $this->session->userdata('userId'))));
			$statusId = $this->order_model->getRows(array('table' => 'statuses', 'conditions' => array('name' => 'Temporary'), 'returnType' => 'single'))['id'];
			$this->order_model->delete(array('conditions' => array('user_id' => $this->session->userdata('userId'), 'status_id' => $statusId)));
			$this->session->unset_userdata('isUserLoggedIn');
			$this->session->unset_userdata('userId');               
			//$this->session->sess_destroy();
			redirect('/users/login/');
		} else {
			redirect('users/account');
		}
    }
    
    public function email_check($str) {
		
        $params['returnType'] = 'count';
        $params['conditions'] = array('email' => $str);
        
        $checkEmail = $this->user_model->getRows($params);
        
        if($checkEmail > 0){
            $this->form_validation->set_message('email_check', 'The email is already taken.');
            return FALSE;
        } else {
            return TRUE;
        }
    }
   
     public function email_check_reverse($str) {
		
        $params['returnType'] = 'count';
        $params['conditions'] = array('email' => $str);
        
        $checkEmail = $this->user_model->getRows($params);
        
        if($checkEmail > 0){
             return TRUE;
        } else {        
            $this->form_validation->set_message('email_check_reverse', "The email doesn't exist");
            return FALSE;
        }
    }
   
    public function password_check($str) {
		
		$checkLogin = $this->user_model->getRows(array('select' => array('password', 'salt'), 'conditions' => array('id' => $this->session->userdata('userId')), 'returnType' => 'single'));

		if($checkLogin && ((hash("sha256", $str . $checkLogin['salt'])) === $checkLogin['password'])) {			
			return TRUE;
		} else {
			$this->form_validation->set_message('password_check', 'Wrong password.');
            return FALSE;
		}
    }     
	
	public function password_validate($str) {
		
		if(!preg_match("/^\S*(?=\S{8,})(?=\S*[a-z])(?=\S*[A-Z])(?=\S*[\d])\S*$/", $str)) {
			$this->form_validation->set_message('password_validate', 'The password must be at least 8 characters long, have at least 1 lowercase letter, 1 uppercase letter and 1 number.');
			return FALSE;
		} else {
			return TRUE;
		}
		
	}
	
	public function recaptcha($str='') {
		$google_url = "https://www.google.com/recaptcha/api/siteverify";
		$secret = SECRET_CODE_RECAPTCHA;
	    $ip = $_SERVER['REMOTE_ADDR'];
		$url = $google_url."?secret=" . $secret . "&response=" . $str . "&remoteip=" . $ip;
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_TIMEOUT, 10);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
		
		$res = curl_exec($curl);
		curl_close($curl);
		$res= json_decode($res, true);

		if($res['success']) {
			return TRUE;
		}
		else {
			$this->form_validation->set_message('recaptcha', 'The reCAPTCHA field is telling me that you are a robot. Shall we give it another try?');
			return FALSE;
		}
   }
    
    public function email_check_without_current($str) {
		
		$user_email = $this->user_model->getRows(array('id' => $this->session->userdata('userId')))['email'];
		
        $params['returnType'] = 'single';
        $params['conditions'] = array('email' => $str);
        
        $result = $this->user_model->getRows($params);
        
        if($result && $result['email'] != $user_email){
            $this->form_validation->set_message('email_check_without_current', 'The email is already taken.');
            return FALSE;
        } else {
            return TRUE;
        }
    }
    
    public function validate_phone($str) {
		
		$str = str_replace(' ', '', $str);
		
		if(preg_match("/\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/", $str)) {
			return TRUE;				
		} elseif(preg_match("/^(\d[\s-]?)?[\(\[\s-]{0,2}?\d{3}[\)\]\s-]{0,2}?\d{3}[\s-]?\d{4}$/i", $str)) {
			return TRUE;
		} elseif(preg_match("/^\d{10,14}$/", $str)) {
			return TRUE;
		} else {
			$this->form_validation->set_message('validate_phone', 'Invalid phone number.');
			return FALSE;
		}
	}
	
}


?>

<?php

class Back_office {
	
    var $ci;

    function __construct() {
        $this->ci = &get_instance();     
    }
    
    public function index() {
		$route = $this->ci->router->fetch_class();
		$method = $this->ci->router->fetch_method();
		if( ($route === 'employees') && (!$this->ci->session->userdata('isEmployeeLoggedIn')) && ($method !== 'login') ) {
            redirect('/employees/login/');
        }
        
        if( ($route === 'products') && (!$this->ci->session->userdata('isEmployeeLoggedIn')) && ($method !== 'search') && ($method !== 'product') && ($method !== 'get_menu_items')) {
            redirect('/employees/login/');
        }
        
        if( ($route === 'tags') && (!$this->ci->session->userdata('isEmployeeLoggedIn')) ) {
            redirect('/employees/login/');
        }
        
         if( ($route === 'orders') && (!$this->ci->session->userdata('isUserLoggedIn')) ) {
            redirect('/users/login/');
        }
	}

}

?>

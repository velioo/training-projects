<?php

class Cart_user {
	
    var $ci;

    function __construct() {
        $this->ci = &get_instance();     
    }
    
    public function index() {
		$route = $this->ci->router->fetch_class();
		$method = $this->ci->router->fetch_method();      
        if( ($route === 'cart') && (!$this->ci->session->userdata('isUserLoggedIn')) ) {
            redirect('/users/login/');
        }
	}

}

?>

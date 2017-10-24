<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Logger extends CI_Controller {
	
	function __construct() {
		parent::__construct();
	}
	
	public function index() {
		redirect();
	}
	
	public function js_logger() {
		//$f = file_put_contents('test.txt', array_keys($this->input->post()));
		if($this->input->post('logger')) {
			$logFile = file_put_contents('./application/logs/js_log-' . date("Y-m-d") . '.txt', 
										 $this->input->post('level') . " - " . date('Y-m-d H:i:s', $this->input->post('timestamp')/1000) . " --> " . preg_replace('/,/', '', $this->input->post('message'), 1) . PHP_EOL,									 
									     FILE_APPEND | LOCK_EX);
		}
		
	}
	
}

<?php

function asset_url(){
   return base_url() . 'assets/';
}

function assert_v($expression) {
	if(!$expression) {
		$backtrace = debug_backtrace()[0];
		log_message('error', "\n************************************\nFatal error: " . $backtrace['file'] . ":" . $backtrace['line'] . "\n************************************");
		die();
	}
}

?>

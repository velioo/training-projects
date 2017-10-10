<?php

//$first_line = array(6, 2);
//$goat_weights = array(26, 7, 10, 30, 5, 4);

//$first_line = array(6, 2);
//$goat_weights = array(4, 8, 15, 16, 23, 42);

$first_line = array(15, 3);
$goat_weights = array(666000, 42000, 7000, 13000, 400000, 511000, 600000, 200000, 202000, 111000, 313000, 94000, 280000, 72000, 42000);

$goats_num = $first_line[0];
$max_courses = $first_line[1];

$temp_courses = 0;

rsort($goat_weights);

$min_capacity = $goat_weights[0];

$temp_goat_weight = 0;

$goats_moved_count = 0;
$goats_moved_last_course = 0;

$current_goat_weights = $goat_weights;
$temp_current_goat_weights = array();

while(true) {
	
	$temp_goat_weight = 0;
	
	for($i = 0; $i < count($current_goat_weights); $i++) {	//  	
		
		if( ($temp_goat_weight + $current_goat_weights[$i]) <= $min_capacity ) { // 
			
			$temp_goat_weight+=$current_goat_weights[$i]; // 30, 26, 30
			$goats_moved_count++; // 1, 2, 3
			
		} else {
			array_push($temp_current_goat_weights, $current_goat_weights[$i]);
		}
	}
	
	$temp_courses++; // 1, 2
	
	$current_goat_weights = $temp_current_goat_weights;
	$temp_current_goat_weights = array();
	
	if( (($temp_courses >= $max_courses) && ($goats_moved_count != count($goat_weights))) ) {
		$current_goat_weights = $goat_weights;
		$temp_courses = 0;
		$goats_moved_count = 0;
		$min_capacity++;
	} else {
		if($goats_moved_count == count($goat_weights)) {
			break;
		}
	}

}


echo $min_capacity . "\n";

?>

<?php 

$N = 7;
$M = 10;

$roads = array( array(1, 3, 2),
				array(4, 2, 8),
				array(1, 2, 11),
				array(1, 4, 3),
				array(1, 3, 6),
				array(5, 3, 5),
				array(3, 6, 9),
				array(7, 6, 6),
				array(5, 6, 3),
				array(2, 5, 7));

$min = 0;
$max = 0;

$place_from;
$place_to;

$min_maxes = array();

$min_difference = 99999;

foreach ($roads as $key => $row) {
    $one[$key]  = $row[0];
    $two[$key] = $row[1];
}
array_multisort($one, SORT_ASC, $two, SORT_ASC, $roads);

$min = $roads[0][0];

for($i = 0; $i < $N; $i++) {
	
	$place_from = $i + 1;
	
	for($k = $i + 1; $k < $N; $k++) {
		
		$place_to = $k + 1;
		
		$temp_min = 0;
		$temp_max = 0;
		for($j = 0; $j < $M; $j++) {
			
			if(($roads[$j][0] == $i || $roads[$j][1] == $i) && ($roads[$j][0] == $k || $roads[$j][1] == $k)) {
				if($j == 0) {
					$temp_min = $roads[$j][2];
					$temp_max = $roads[$j][2];
				} else {
					
				}				
			}
			
		}
		
	}
	
	
}

/*

min = 0
max = 0;

1 3  Si = 2; min = max = 2
4 2 Si = 8; 

*/

?>

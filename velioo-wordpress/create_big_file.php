<?php

$file = fopen("markers_big.csv", "a+") or die("Unable to open file!");

$contents = fread($file,filesize("markers_big.csv"));


for($i = 0; $i < 8800; $i++) {
	
	fwrite($file, $contents);
	
}

fclose($file);

?>

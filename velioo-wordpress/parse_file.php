// This file parses "markers.csv" and pushes all values into db
<?php
ini_set('memory_limit', '8192M');
	include 'user_pass.php';
	$i = 0;
	$csv = array_map('str_getcsv', file('markers.csv'));
	die();
	foreach($csv as $e) {
		if($i != 0) {
			$city = $e[0];
			$city_ascii = $e[1];
			$lat = $e[2];
			$lng = $e[3];
			$population = $e[4];
			$country = $e[5];
			$iso2 = $e[6];
			$iso3 = $e[7];
			$province = $e[8];
			
			$connection=mysqli_connect('localhost', $username, $password,$database);
			if (!$connection) {
			  die('Not connected : ' . mysql_error());
			}

			$query = "INSERT INTO world_cities (city, city_ascii, lat, lng, population, country, iso2, iso3, province) VALUES 
			('$city', '$city_ascii', '$lat', '$lng', '$population', '$country', '$iso2', '$iso3', '$province')";
			$result = mysqli_query($connection, $query);
			if (!$result) {
			  
			}
		}
		$i++;
	}

?>

<?php
	ini_set('memory_limit', '8192M');
	include 'user_pass.php';
	$i = 0;
	
	$file = fopen("markers_big.csv","r");
	
	while($line = fgetcsv($file)) {	
		if($i != 0) {
			$city = $line[0];
			$city_ascii = $line[1];
			$lat = $line[2];
			$lng = $line[3];
			$population = $line[4];
			$country = $line[5];
			$iso2 = $line[6];
			$iso3 = $line[7];
			$province = $line[8];
			
			$conn = new mysqli($servername, $username, $password, $database);

			if ($conn->connect_error) {
				die("Connection failed: " . $conn->connect_error);
			} 
			
			$stmt = $conn->prepare("INSERT INTO world_c (city, city_ascii, lat, lng, population, country, iso2, iso3, province) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
			$stmt->bind_param("ssddissss", $city, $city_ascii, $lat, $lng, $population, $country, $iso2, $iso3, $province);
			if(!$stmt->execute()) echo $stmt->error;
		}
		$i++;
	}
	fclose($file);

?>

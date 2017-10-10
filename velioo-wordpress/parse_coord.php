// This is an attempt to parse some coordinates from google geocode api to db. Problem is that there is a limit to the requests per day.
<?php
ini_set('xdebug.var_display_max_depth', 10);
ini_set('xdebug.var_display_max_data', 999999);
ini_set('xdebug.var_display_max_children', 256);

include 'user_pass.php';

$i = 1;

//while($i < 10000) {
	$curl = curl_init();
	curl_setopt_array($curl, array(
	    CURLOPT_RETURNTRANSFER => 1,
	    CURLOPT_URL => "https://maps.googleapis.com/maps/api/geocode/json?address=$i&key=AIzaSyCcdlwT2IX6CZJpcfAn7LgfLztMya60nnU"
	));

	$result = curl_exec($curl);
	$data = json_decode($result);
	var_dump($data);
die();
	$httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

	if($httpcode == 200 && $data != null) {

		foreach($data->results as $e) {
			$lat = $e->geometry->location->lat;
			$lng = $e->geometry->location->lng;
			$address = $e->formatted_address;
			$name = $e->address_components[6]->long_name;
			$type = $e->types[0];
			if($type == NULL) $type = 'Unknown';

			$connection=mysqli_connect('localhost', $username, $password,$database);
			if (!$connection) {
			  die('Not connected : ' . mysql_error());
			}

			$query = "INSERT INTO markers (name, address, lat, lng, type) VALUES ('a', 'b', '$lat', '$lng', 'c')";
			$result = mysqli_query($connection, $query);
			if (!$result) {
			  
			}
			$i++;
		}

	}

//}


?>

<!doctype html>
<html>
<head>
  <meta charset="utf-8">	
  <title>Google map</title>
  <meta name="description" content="The HTML5 Herald">
  <meta name="author" content="SitePoint">   
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>    
    <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAx-l-Y0c4aZGowK8eTZBZGbQEBMhtxkg8&callback=initMap">
    </script>
<style>
       #map {
        height: 1000px;
        width: 100%;
       }
    </style>


</head>


<?php

	include 'user_pass.php';

	$connection=mysqli_connect('localhost', $username, $password,$database);
	if (!$connection) {
	  die('Not connected : ' . mysqli_error($connection));
	}

	$query = "SELECT * FROM world_cities";
	$result = mysqli_query($connection, $query);
	if (!$result) {
	  die('Invalid query: ' . mysqli_error($connection));
	}

	$lat = array();
	$lon = array();
	while ($row = @mysqli_fetch_assoc($result)){
		$lat[] = $row['lat'];
		$lon[] = $row['lng'];
	}


?>

<body>
<div id="map"></div>

	<script>
		
		
	var lat = <?php echo json_encode($lat) ?>;
	var lon = <?php echo json_encode($lon) ?>;

    function initMap() {
	
		var center = {lat: parseFloat(lat[0]), lng: parseFloat(lon[0])};

			var map = new google.maps.Map(document.getElementById('map'), {
			  zoom: 4,
		      center: center
			});

		$.each(lat, function(i, value) {
			var point = {lat: parseFloat(lat[i]), lng: parseFloat(lon[i])};

			var marker = new google.maps.Marker({
			  position: point,
			  map: map
			});

		});


      }
    </script>
  

</body>
</html>



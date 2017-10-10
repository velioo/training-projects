// This code is written directly into the "GOOGLE MAP" post in wordpress
<div id="map"></div>

<?php
$connection=mysqli_connect('localhost', 'root', '12345678','wpdb');
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
        $city = array();
        $country = array();
        $population = array();
	while ($row = @mysqli_fetch_assoc($result)){
		$lat[] = $row['lat'];
		$lon[] = $row['lng'];
                $city[] = $row['city'];
                $country[] = $row['country'];
                $population[] = $row['population'];
	}

?>

<script type="text/javascript"> 
     var lat = <?php echo json_encode($lat); ?>;
     var lon = <?php echo json_encode($lon); ?>;
     var city = <?php echo json_encode($city); ?>;
     var country = <?php echo json_encode($country); ?>;
     var population = <?php echo json_encode($population); ?>;
</script>
<?php $available_countries = array(); ?>
<select id="cities" onchange="filterMarkers(this.value);">
<option value="">All</option>
  <?php foreach($country as $c) {?>
         <?php if(!(in_array($c, $available_countries))) { ?>      
             <option value="<?php echo $c; ?>"><?php echo $c; ?></option>      
        <?php $available_countries[] = $c; } ?>    
  <?php } ?>
</select>


<input type="number" id="population1" min="0" max="9999999999" step="1000" value="0" onchange="filterMarkers();">
<input type="number" id="population2" min="0" max="9999999999" step="1000" value="8000000000" onchange="filterMarkers();">

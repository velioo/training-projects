// This code is written in the "GOOGLE MAP" post in Wordpress 
<div id="map"></div>
 <!-- noformat on -->

<script>
  var lat = [];
  var lon = [];
  var city = [];
  var country = [];
  var population = [];
</script>

<?php

remove_filter('the_content', 'wpautop');

$connection=mysqli_connect('localhost', 'root', '12345678','wpdb');
	if (!$connection) {
	  die('Not connected : ' . mysqli_error($connection));
	}

	$query = "SELECT * FROM world_cities";
	$result = mysqli_query($connection, $query);
	if (!$result) {
	  die('Invalid query: ' . mysqli_error($connection));
	}  
?>

<script> 
   <?php while ($row = @mysqli_fetch_assoc($result)){ ?>
      lat.push(<?php echo json_encode($row['lat']); ?>); 
      lon.push(<?php echo json_encode($row['lng']); ?>);
      city.push(<?php echo json_encode($row['city']); ?>);
      country.push(<?php echo json_encode($row['country']); ?>);
      population.push(<?php echo json_encode($row['population']); ?>);
   <?php } ?>
</script>	

<br>
Filter Countries: </br>
<select id="countries" onchange="filterMarkers(this.value);">
<option value="All">All</option>

<script>
  var available_countries = [];

  $.each(country, function(index, item) {
     if($.inArray(item, available_countries) === -1) {
        $('#countries').append('<option value="' + item + '">' + item + '</option>');
        available_countries.push(item);
     } 
  });  

</script>

</select>
</br></br>
<p id="cities_title" style="display:none;">Cities:</p>
<select id="cities" onchange="filterMarkers(this.value);" style="display:none;">
</select>
</br></br>
Filter Population:
</br>
From: <input type="number" class="population" id="population1" min="0" max="9999999999" step="1000" value="0" onchange="filterMarkers();">
To: <input type="number" class="population" id="population2" min="0" max="9999999999" step="1000" value="8000000000" onchange="filterMarkers();">

<script>
var markers_count = 0;     
var markers = [];
var visible_markers = [];

function initMap() {
	
      var center = {lat: parseFloat(lat[0]), lng: parseFloat(lon[0])};
      var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: center
      });

      $.each(lat, function(i, value) {
         var point = {lat: parseFloat(lat[i]), lng: parseFloat(lon[i])};
         var infowindow = new google.maps.InfoWindow({
             content: "City: " + city[i] + "<br>Country: " + country[i]  + "<br>Population: " + population[i]
         });

          	
       var marker = new google.maps.Marker({
	 position: point,
	 map: map ,
         title: "City: " + city[i] + "\nCountry: " + country[i]  + "\nPopulation: " + population[i],
         category: country[i],
         population: population[i],
         city: city[i]
       });
         
       marker.addListener('click', function() {
         infowindow.open(map, marker);
       });
           
       markers.push(marker);
       markers_count++;
     });


}


filterMarkers = function (category) {
    var pop1 = parseInt(document.getElementById("population1").value);
    var pop2 = parseInt(document.getElementById("population2").value);
    var category = document.getElementById('countries').options[document.getElementById('countries').selectedIndex].value;
    visible_markers = [];
  
    for (i = 0; i < markers_count; i++) { 
      marker = markers[i]; 
      if ((marker.category == category || category === "All") && (marker.population >= pop1 && marker.population <= pop2)) {
            marker.setVisible(true);
            visible_markers.push(marker);
        }
        else {
            marker.setVisible(false);
        }
    }
}

$('#countries').on('change', function() {
  if($('#countries').val() !== "All") {
    $('#cities').find('option').remove();
    $('#cities_title').show();
    $('#cities').append('<option value="All">All</option>');
    for (i = 0; i < visible_markers.length; i++) {
       $('#cities').append('<option value="' + visible_markers[i].city + '">' + visible_markers[i].city + '</option>');
    }
    $('#cities').show();
  } else {
    $('#cities_title').hide();
    $('#cities').hide();
    $('#cities').find('option').remove();
  }
});

$('#cities').on('change', function() {
  
  var city = $('#cities').val();
  if(city !== "All") {
   for (i = 0; i < visible_markers.length; i++) {
      visible_markers[i].setVisible(false);
     if(visible_markers[i].city === city) {
        visible_markers[i].setVisible(true);
     }
   }
  } else {
     for (i = 0; i < visible_markers.length; i++) {
      visible_markers[i].setVisible(true);
     }
  }
  
});

$('.population').on('change', function() {
  
  $('#cities').find('option').remove();
  $('#cities').append('<option value="All">All</option>');
  for (i = 0; i < visible_markers.length; i++) {
     $('#cities').append('<option value="' + visible_markers[i].city + '">' + visible_markers[i].city + '</option>');
  }
  
});
</script>

<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAx-l-Y0c4aZGowK8eTZBZGbQEBMhtxkg8&callback=initMap"></script>

<!-- noformat off -->

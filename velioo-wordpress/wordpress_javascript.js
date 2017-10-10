//This code is written into the "Scripts n Styles" wordpress plgin javascript box
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
        if ((marker.category == category || category.length === 0) && (marker.population >= pop1 && marker.population <= pop2)) {
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



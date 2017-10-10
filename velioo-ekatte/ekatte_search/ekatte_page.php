<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>EKATTE Search</title>
  <meta name="description" content="EKATE Search">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

</head>

<body>
	
  <script>
      $(document).ready(function() {
		  
		  $('#search_selishta').on('keyup', function(e) { 
			  var selishte = $('#search_selishta').val();
			  if(e.keyCode == 13) {
				$.get("ekatte_search.php", { name:selishte }, function(data) {
					$('#results').empty();
					$('#no_results').hide();
					if(data != 0) {						
						$('#results').append(data);
			     	} else {
						$('#no_results').show();
					}
				});	  
			  }
	      });
		  
	  });
  </script>
  <div style="margin:0% 20% 20% 20%;">
  <p>Търси селища</p>
  <hr>
  <input type="search" value="" id="search_selishta">
  </br></br>
  <div style="">
  <table border="1" cellpadding="5">
	  <thead>
		 <tr>
			 <td>Селище</td>		
			 <td>Община</td>
			 <td>Област</td>
	     </tr>
	  </thead>
	  <tbody id="results">
	  </tbody>
  </table>
  </div>
  <div id="no_results" style="display:none;">
	  Няма намерени резултати
  </div>
  </div>
</body>

</html>

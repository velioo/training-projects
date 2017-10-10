<?php

include 'user_pass_ekatte.php';

    $conn = new mysqli($servername, $username, $password, $database);
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	} 	  
	//$sql = "SELECT COUNT(oblast) as oblasti_count, COUNT(obshtina) as obshtini_count, COUNT(kmetstvo) as selishta_count FROM oblasti, obshtini, selishta;"; 
	$sql = "SELECT COUNT(*) as oblasti_count, (SELECT COUNT(*) FROM obshtini) as obshtini_count, (SELECT COUNT(*) FROM selishta) as selishta_count FROM oblasti"; 
	if ($result = $conn->query($sql)) {
		if($result->num_rows > 0) {
			$row = $result->fetch_assoc();
			$results = "Objects in Oblasti: " . $row["oblasti_count"]. "\nObjects in Obshtini: " . $row["obshtini_count"]. "\nObjects in Selishta: " . $row["selishta_count"]. "\n";
			$file = fopen("results.txt", "w") or die("Unable to open file!");
			fwrite($file, $results);
			fclose($file);
			echo "Objects in Oblasti: " . $row["oblasti_count"]. "<br> Objects in Obshtini: " . $row["obshtini_count"]. "<br> Objects in Selishta: " . $row["selishta_count"]. "<br>";	
		}
	} else {
		echo("Error description: " . mysqli_error($conn));
	}
	
	$conn->close(); 

?>

<?php

include '../user_pass_ekatte.php';

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
} 	  
	
mysqli_set_charset($conn,"utf8");

$selishte = mysqli_real_escape_string($conn, $_GET['name']);

$sql = "SELECT selishta.type, selishta.name, obshtini.name as obshtina_name, oblasti.name as oblast_name FROM selishta 
											 JOIN obshtini on obshtini.obshtina = selishta.obshtina_f
											 JOIN oblasti on oblasti.oblast = obshtini.oblast_f											 
											 WHERE selishta.name LIKE '%[{$selishte}]%'";  
if ($result = $conn->query($sql)) {
	if($result->num_rows > 0) {
		while($row = mysqli_fetch_assoc($result)) {			
			echo "<tr>" 
			    ."<td>" . htmlentities($row['type']) . " " . htmlentities($row['name']) . "</td>"
			    ."<td>" . htmlentities($row['obshtina_name']) . "</td>"
			    ."<td>" . htmlentities($row['oblast_name']) . "</td>"
			    ."</tr>";			
		}
	} else {
		echo 0;
	}
} else {
	echo("Error description: " . $stmt->error);
}


$conn->close();


?>

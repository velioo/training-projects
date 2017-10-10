<?php
// Тhis script parses xls files and inserts the data in database. The library used is PHPExcel. 
//A loop is used to go through each row of the spreadsheet inserting the data from the row read into the db.
require_once dirname(__FILE__) . '/Classes/PHPExcel.php';

include 'user_pass_ekatte.php';

$fileOblasti = "ekatte_files/Ek_obl.xls";
$fileObshtini = "ekatte_files/Ek_obst.xls";
$fileSelishta = "ekatte_files/Ek_atte.xls";

$conn = new mysqli($servername, $username, $password, $database);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
} 
mysqli_set_charset($conn,"utf8");

try {
	
	$excelReader = PHPExcel_IOFactory::createReaderForFile($fileOblasti);
	$excelReader->setReadDataOnly();
	$excelObj = $excelReader->load($fileOblasti);
	
} catch(Exception $e) {
	die('Error loading file "'.pathinfo($fileOblasti,PATHINFO_BASENAME).'": '.$e->getMessage());
}

$sheet = $excelObj->getSheet(0);
$highestRow = $sheet->getHighestRow();
$highestColumn = $sheet->getHighestColumn();

$stmt = $conn->prepare("INSERT INTO oblasti (oblast, ekatte_num, name, region, document, abc) VALUES (?, ?, ?, ?, ?, ?)"); 
$paramTypes = "sissii"; 

for ($row = 2; $row <= $highestRow; $row++){

    $rowData = $sheet->rangeToArray('A' . $row . ':' . $highestColumn . $row, NULL, TRUE, FALSE); 

    $conn2 = new mysqli($servername, $username, $password, $database);
	if ($conn2->connect_error) {
		die("Connection failed: " . $conn2->connect_error);
	} 	  
	$data = mysqli_real_escape_string($conn2, $rowData[0][0]);
	$sql = "SELECT oblast FROM oblasti WHERE oblast = '{$data}'";	  
	if ($result = $conn2->query($sql)) {
		if($result->num_rows <= 0) {
			$conn2->close(); 
			$stmt->bind_param($paramTypes, $rowData[0][0], $rowData[0][1],$rowData[0][2], $rowData[0][3], $rowData[0][4], $rowData[0][5]);
			if(!$stmt->execute()) echo $stmt->error;
		}
	}  
}

try {
	
	$excelReader = PHPExcel_IOFactory::createReaderForFile($fileSelishta);
	$excelReader->setReadDataOnly();
	$excelObj = $excelReader->load($fileSelishta);
	
} catch(Exception $e) {
	die('Error loading file "'.pathinfo($fileSelishta,PATHINFO_BASENAME).'": '.$e->getMessage());
}

$sheet = $excelObj->getSheet(0);
$highestRow = $sheet->getHighestRow();
$highestColumn = $sheet->getHighestColumn();

$stmtSelishta = $conn->prepare("INSERT INTO selishta (ekatte_num, type, name, obshtina_f, kmetstvo_f, category, altitude, document, tsb, abc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"); 
$stmtObshtini = $conn->prepare("INSERT INTO obshtini (obshtina, oblast_f) VALUES (?, ?)"); 
$paramTypeSelishta = "sssssiiisi";
$paramTypeObshtini = "ss";

$flag = TRUE;

for ($row = 2; $row <= $highestRow; $row++) { 

    $rowData = $sheet->rangeToArray('A' . $row . ':' . $highestColumn . $row, NULL, TRUE, FALSE); 

    $conn2 = new mysqli($servername, $username, $password, $database);
	if ($conn2->connect_error) {
		die("Connection failed: " . $conn2->connect_error);
	} 	  	
	$data = mysqli_real_escape_string($conn2, $rowData[0][0]);
	$sql = "SELECT ekatte_num FROM selishta WHERE ekatte_num = '{$data}'";
	
	if ($result = $conn2->query($sql)) {		
		if($result->num_rows <= 0) {
				
			$conn->autocommit(FALSE);
				
			$stmtObshtini->bind_param($paramTypeObshtini, $rowData[0][4], $rowData[0][3]); 		
				
			$stmtSelishta->bind_param($paramTypeSelishta, $rowData[0][0], $rowData[0][1],$rowData[0][2],
						$rowData[0][4], $rowData[0][5], $rowData[0][7], $rowData[0][8],  
						$rowData[0][9], $rowData[0][10], $rowData[0][11] ); 
					
															
			$data = mysqli_real_escape_string($conn2, $rowData[0][4]);
			$sql = "SELECT obshtina FROM obshtini WHERE obshtina = '{$data}'";			                                						                                
			
			if ($result = $conn2->query($sql)) {		
				if($result->num_rows <= 0) {
					if(!$stmtObshtini->execute()) {
						$flag = FALSE;
						echo "Error details: " . $stmtObshtini->error . ".";
					}
				}
			}
								
			if(!$stmtSelishta->execute()) {
				$flag = FALSE;
				echo "Error details: " . $stmtSelishta->error . ".";
			}
			
			
			if($flag) {
				$conn->commit();
				echo "All queries were executed successfully";
			} else {
				$conn->rollback();
				echo "All queries were rolled back";
			}			
			
			$flag = TRUE;
			
			$conn2->close(); 
		}	
	} 
    
}

try {
	
	$excelReader = PHPExcel_IOFactory::createReaderForFile($fileObshtini);
	$excelReader->setReadDataOnly();
	$excelObj = $excelReader->load($fileObshtini);
	
} catch(Exception $e) {
	die('Error loading file "'.pathinfo($fileObshtini,PATHINFO_BASENAME).'": '.$e->getMessage());
}

$sheet = $excelObj->getSheet(0);
$highestRow = $sheet->getHighestRow();
$highestColumn = $sheet->getHighestColumn();

$stmt = $conn->prepare("UPDATE obshtini SET ekatte_num = ? , name = ? , category = ? , document = ? , abc = ? WHERE obshtina = ?"); 
$paramTypes = "ssiiis"; 

for ($row = 2; $row <= $highestRow; $row++){

    $rowData = $sheet->rangeToArray('A' . $row . ':' . $highestColumn . $row, NULL, TRUE, FALSE);   
	$stmt->bind_param($paramTypes, $rowData[0][1],$rowData[0][2], $rowData[0][3], $rowData[0][4], $rowData[0][5], $rowData[0][0]);
	if(!$stmt->execute()) echo $stmt->error;

}

$conn->close(); 

?>

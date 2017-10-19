<?php 



$conn = new mysqli('localhost', 'root', '12345678', 'online_store');
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
} 	  
	
mysqli_set_charset($conn, "utf8");

for($i = 0; $i < 500; $i++) {
	$stmt = $conn->prepare("INSERT INTO tags (name) VALUES (?)"); 
	$paramTypes = "s"; 	
	$name = 'tag' . mt_rand(1, 100) . ':' . ($i + mt_rand(1, 500));										 
	$stmt->bind_param($paramTypes, $name);
		if(!$stmt->execute()) echo $stmt->error;
}

$category_ids = array();

$sql = "SELECT * FROM categories"; 
if ($result = $conn->query($sql)) {
	
	while($row = mysqli_fetch_assoc($result)) {	
		$category_ids[] = $row['id'];
	}
	
} else {
	echo "Error getting categories...";
}

$tag_ids = array();

$sql = "SELECT * FROM tags"; 
if ($result = $conn->query($sql)) {
	
	while($row = mysqli_fetch_assoc($result)) {	
		$tag_ids[] = $row['id'];
	}
	
} else {
	echo "Error getting categories...";
}

$re_tags = $tag_ids;

$product_id;
for($i = 0; $i < 100000; $i++) {
	$stmt = $conn->prepare("INSERT INTO products (category_id, name, description, price_leva, quantity, image) VALUES (?, ?, ?, ?, ?, ?)"); 
	$paramTypes = "issdis"; 
	
	$category_id = $category_ids[array_rand($category_ids)];
	$name = "Name" . $i;
	$description = "Description" . $i;
	$price_leva = random_float(1, 100000);;
	$quantity = mt_rand(0,1000);
	$image = "";											 
	$stmt->bind_param($paramTypes, $category_id, $name, $description, $price_leva, $quantity, $image);
	if(!$stmt->execute()) {
		echo $stmt->error;
	} else {	
		$product_id = $stmt->insert_id;
		$rand_num = mt_rand(1, 10);
		for($k = 0; $k < $rand_num; $k++) {
			$stmt = $conn->prepare("INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)"); 
			$paramTypes = "ii"; 
			if (empty($tag_ids))
				$tag_ids = $re_tags;
			$tag_id = array_pop($tag_ids);
			$stmt->bind_param($paramTypes, $product_id, $tag_id);
			if(!$stmt->execute()) echo $stmt->error;
		}
		$tag_ids = $re_tags;
	} 	
	
}


$conn->close();

function random_float ($min,$max) {
    return ($min + lcg_value()*(abs($max - $min)));
}

?>

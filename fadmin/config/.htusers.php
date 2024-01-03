<?php 
	// ensure this file is being included by a parent file
	if( !defined( '_JEXEC' ) && !defined( '_VALID_MOS' ) ) die( 'Restricted access' );

	$GLOBALS["users"] = array(
		array('admin','$2a$08$xAMaiE1tH/zj5i7QFy0hFuIC1PRT2KDNtNj9H4ErPBYtpMIXnYVdO','/var/www/html','http://localhost','1','','7',1),
	); 	
	/*

	$GLOBALS["users"] = array();	
	$servername = "localhost";
	$username = "root";
	$password = "xW6hy6V1u9";
	$dbname = "manager";

	// Create connection
	$conn = new mysqli($servername, $username, $password, $dbname);
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}

	$sql = "SELECT * FROM application";
	$result = $conn->query($sql);

	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$GLOBALS["users"][] = array(	$row["DESCRIZIONE"],
										password_hash($row["FADMIN"], PASSWORD_DEFAULT),
										'/var/www/html/archive/' . $row["DESCRIZIONE"] ,
										'https://geqo.it',
										'1',
										'',
										'7',
										1
										);
		 }
	}
	$conn->close();
	*/
	
?>
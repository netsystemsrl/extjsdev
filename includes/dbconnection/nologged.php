<?php
	$conn = ADONewConnection('mysqli');
	$conn->debug = 0;
	$conn->PConnect("localhost",'root','$Adm1n10','manager');
	$conn->EXECUTE("SET NAMES 'utf8'");
	$conn->EXECUTE("SET CHARACTER SET 'utf8'");
	$conn->EXECUTE("SET lc_time_names = 'it_IT'");
//	$conn->EXECUTE("SET NAMES 'latin1_swedish_ci'");

	$ExtJSDevTreeStartId = '0';
	
	/* SMS BIZ */
	$smsbizlogin = 'manager';
	$smsbizpassword = 'manager123';
	
	/* SMTP */
	$smtpsender = 'manager';
	$smtplogin = 'no-reply@geqo.it';
	$smtppassword = '$Servizi123';
	$smtpserver = 'mail.geqo.it';
	$smtpport = '587';
	$imapsecure = 'tls';
	
	
	/* SMB */
	$smblogin = 'domain/terrizzanoa'; 
	$smbpassword = 'Terr2016';
	
?>
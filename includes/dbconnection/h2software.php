<?php
	$conn = ADONewConnection('mysqli');
	$conn->debug = 0;
	$conn->PConnect("localhost",'root','$Adm1n10','h2software');
	$conn->EXECUTE("SET NAMES 'utf8'");
	$conn->EXECUTE("SET CHARACTER SET 'utf8'");
	$conn->EXECUTE("SET lc_time_names = 'it_IT'");
//	$conn->EXECUTE("SET NAMES 'latin1_swedish_ci'");

	$ExtJSDevTreeStartId = '0';
	
	/* DA MODIFICARE PER SUB INSTALLAZIONE*/
	$ExtJSDevArchive = 'archive/h2software/';
	$ExtJSDevDBNAME = $ExtJSDevWWW . $ExtJSDevArchive;
	
	/* SMS BIZ */
	$smsbizlogin = 'h2software';
	$smsbizpassword = 'h2software123';
	
	/* SMTP */
	$smtplogin = 'servizi@net-system.it';
	$smtppassword = '$Servizi123';
	$smtpserver = 'www24.netandwork.net';
	$smtpport = '587';
	$imapsecure = 'tls';
	
	/* SMB */
	$smblogin = 'domain/h2software'; 
	$smbpassword = 'h2software';
?>
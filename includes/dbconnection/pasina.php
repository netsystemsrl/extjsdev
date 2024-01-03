<?php
	$conn = ADONewConnection('mysqli');
	$conn->debug = 0;
	$conn->PConnect("localhost",'root','$Adm1n10','pasina');
	$conn->EXECUTE("SET NAMES 'utf8'");
	$conn->EXECUTE("SET CHARACTER SET 'utf8'");
	$conn->EXECUTE("SET lc_time_names = 'it_IT'");
//	$conn->EXECUTE("SET NAMES 'latin1_swedish_ci'");

	$ExtJSDevTreeStartId = '0';
	
	/* DA MODIFICARE PER SUB INSTALLAZIONE*/
	$ExtJSDevArchive = 'archive/pasina/';
	$ExtJSDevDBNAME = $ExtJSDevWWW . $ExtJSDevArchive;
	
	/* SMS BIZ */
	$smsbizlogin = 'pasina';
	$smsbizpassword = 'pasina123';
	
	/* SMTP */
	$smtpsender = 'pasina';
	$smtplogin = 'no-reply@geqo.it';
	$smtppassword = '$Servizi123';
	$smtpserver = 'mail.geqo.it';
	$smtpport = '587';
	$imapsecure = 'tls';
	
	/* SMB */
	$smblogin = 'domain/pasina'; 
	$smbpassword = 'pasina';
?>
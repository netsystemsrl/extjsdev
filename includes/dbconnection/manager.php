<?php
	$conn = ADONewConnection('mysqli');
	$conn->debug = 0;
	$conn->PConnect("localhost",'root','$Adm1n10','manager');
	$conn->EXECUTE("SET NAMES 'utf8'");
	$conn->EXECUTE("SET CHARACTER SET 'utf8'");
	$conn->EXECUTE("SET lc_time_names = 'it_IT'");

	$ExtJSDevTreeStartId = '0';
	
	/* DA MODIFICARE PER SUB INSTALLAZIONE*/
	$ExtJSDevArchive = 'archive/manager/';
	$ExtJSDevDBNAME = $ExtJSDevWWW . $ExtJSDevArchive;
	
	/* SMS BIZ */
	$smslogin = 'netsystem';
	$smspassword = 'netsystem123';
	$smsprovider = 'SMSBIZ';
	
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
<?php

	error_reporting(E_ALL); # report all errors
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
	ini_set('max_execution_time', 500);
	setlocale(LC_MONETARY, 'it_IT');
	date_default_timezone_set("Europe/Rome");
	
	//require_once('php-sql-parser.php');
	//require_once('PHPSQLParser.php');
	//require_once('Options.php');
	//namespace PHPSQLParser;
	
	require ('../PHPSQLParser/Autoload.php');
	require_once('PHPSQLParser.php');
	use PHPSQLParser\PHPSQLParser;
	//use PHPSQLParser;
	//use PHPSQLParser\PHPSQLParser;
	//use PHPSQLParser\Options;
	
	$parser = new PHPSQLParser("
							SELECT EXTRACT(YEAR FROM DATAREG) as ANNO, 
						EXTRACT(MONTH FROM DATAREG) as MESE, 
						CONCAT(COALESCE(`CG_CT_CONTABILEESERCIZI`,'0'), '-', COALESCE(`CT_SEZIONALI`,'0') , '-', LPAD( PROGRESSIVO, 5, '0' )) as PROGTOT, 
						cg_contabile.* 
						FROM cg_contabile ORDER BY PROGTOT;
													", true);


	echo('<PRE>');  
	var_dump($parser->parsed["FROM"][0]["table"]);
	
	//print_r($parser->parsed);  
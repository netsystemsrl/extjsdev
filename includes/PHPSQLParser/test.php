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
	require_once dirname(__FILE__) . '/vendor/autoload.php';
	//use PHPSQLParser;
	use PHPSQLParser\PHPSQLParser;
	//use PHPSQLParser\Options;
	$parser=new PHPSQLParser('
							SELECT a 
							  from some_table an_alias
							 WHERE d > 5;
							', true);

	print_r($parser->parsed);  
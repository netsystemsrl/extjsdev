<?php 
	if (is_array($_SERVER) && array_key_exists ('HTTP_ACCEPT_ENCODING', $_SERVER)) {
		if (substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip')) ob_start("ob_gzhandler"); else ob_start();
	}else{
		ob_start();
	}
	if(!isset($_SESSION)) {
		// server should keep session data for AT LEAST 1 hour
		//ini_set('session.gc_maxlifetime', 3600);
		// each client should remember their session id for EXACTLY 1 hour
		//session_set_cookie_params(3600);
		session_start();
	}
	if (!isset($_SESSION['debug'])){
		$_SESSION['debug'] = 'false';
		$_SESSION['ForceDebug'] = false;
	}
	$_SESSION['debug'] = 'false';
	$_SESSION['ForceDebug'] = false;
	error_reporting(E_ALL ^ E_DEPRECATED ^ E_WARNING);
	
	# report all errors
	/*	
	error_reporting(E_ALL); 
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
	*/

	
	ini_set('max_execution_time', 500);
	setlocale(LC_MONETARY, 'it_IT');
	date_default_timezone_set("Europe/Rome");
	
	define("LOG_DIR", "../log/");
	define("RETENTION_DAYS", 7);
	define('APACHE_MIME_TYPES_URL','http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types');

	require_once('PHPSQLParser' . DIRECTORY_SEPARATOR . 'Autoload.php');
	require_once('PHPSQLParser' . DIRECTORY_SEPARATOR . 'PHPSQLParser.php');
	use PHPSQLParser\PHPSQLParser;
	$parser = new PHPSQLParser();
	
	require_once('PHPHTMLParser' . DIRECTORY_SEPARATOR . 'PHPHTMLParser.php');
	require_once('Generic.php');
	require_once('simplexml.php');
	require_once('PHPivot.php');
	
	require_once('adodb5/adodb.inc.php');
	require_once(ADODB_DIR.'/adodb-active-record.inc.php');
	//require_once(ADODB_DIR.'/rsfilter.inc.php');
	//require_once(ADODB_DIR.'/tojson.inc.php');
	require_once(ADODB_DIR.'/adodb-exceptions.inc.php'); 
	require_once(ADODB_DIR.'/adodb-xmlschema03.inc.php');
	require_once(ADODB_DIR.'/adodb-errorpear.inc.php');
	require_once(ADODB_DIR.'/adodb-error.inc.php');
	
	# report ADODB errors
//	define('ADODB_ERROR_LOG_TYPE',3);
//	define('ADODB_ERROR_LOG_DEST','errors.log');
//	require_once('adodb-errorhandler.inc.php');
	
	$ExtJSDevDB         = 'aaa';
	$ExtJSDevCodeSWEAN  = '010';
	$ExtJSDevWWW        = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR;
	$ExtJSDevDBNAME 	= $ExtJSDevWWW . 'archive'  . DIRECTORY_SEPARATOR . 'empty' . DIRECTORY_SEPARATOR ;
	$ExtJSDevArchive    = $ExtJSDevWWW . 'archive'  . DIRECTORY_SEPARATOR . 'empty' . DIRECTORY_SEPARATOR ; 
	
	if (!isset($RegistrationId)) {
		$RegistrationId = time();
	}
	$RegistrationId 	= isset($_SESSION["RegistrationId"]) ? $_SESSION["RegistrationId"] : $RegistrationId;
	if (IsNullOrEmptyString($RegistrationId)) {$RegistrationId = time();}
	$_SESSION["RegistrationId"] = $RegistrationId;

	if (!isset($debugmessage)){
		$debugmessage 		= 0;
	}
	
	/*  INCLUDE CONNECTION DEFINE SUB INSTALLATION*/
	if (isset($_SESSION['dbname'])) {
		$dbname = $_SESSION['dbname'];
	}elseif (!isset($dbname)){
		$dbname = 'nologged';
	}elseif (IsNullOrEmptyString($dbname)) {
		$dbname = 'nologged';
	}
	
	/*autologin COOKIE */
	if ($dbname == 'nologged'){
		if ((isset($_COOKIE['LOGIN'])) && (isset($_COOKIE['PASSWORD'])) && (isset($_COOKIE['DBNAME']))) {
			$dbname = $_COOKIE['DBNAME'];
			$username = $_COOKIE['LOGIN'];
			$password = $_COOKIE['PASSWORD'];

			require($ExtJSDevWWW . DIRECTORY_SEPARATOR . 'includes'. DIRECTORY_SEPARATOR . 'dbconnection' . DIRECTORY_SEPARATOR . $dbname . '.php');
			$conn->bulkBind = true;
			
			require ($_SERVER['DOCUMENT_ROOT']. DIRECTORY_SEPARATOR . 'includes'. DIRECTORY_SEPARATOR . 'io'. DIRECTORY_SEPARATOR . 'LoginAuth.php');
		}
	}
	
	require($ExtJSDevWWW . DIRECTORY_SEPARATOR . 'includes'. DIRECTORY_SEPARATOR . 'dbconnection'. DIRECTORY_SEPARATOR  . $dbname . '.php');
	$conn->bulkBind = true;
	
	$connOriginal = clone $conn;
	
	$ExtJSDevDOC        = $ExtJSDevDBNAME .'repository'. DIRECTORY_SEPARATOR ;
	$ExtJSDevTMP        = $ExtJSDevDBNAME .'temp'. DIRECTORY_SEPARATOR ;
	$ExtJSDevLOG        = $ExtJSDevDBNAME .'log'. DIRECTORY_SEPARATOR ;
	$ExtJSDevImportRAW  = $ExtJSDevDBNAME .'importRAW'. DIRECTORY_SEPARATOR ;
	$ExtJSDevExportRAW  = $ExtJSDevDBNAME .'exportRAW'. DIRECTORY_SEPARATOR ;
	$ExtJSDevSCHEMA     = $ExtJSDevDBNAME .'schemadb'. DIRECTORY_SEPARATOR ;
	$ExtJSDevDOCExt     = array("gif", "png", "jpeg", "jpg");  
	$ExtJSDevDOCMaxSize = 100000; 
	$ExtJSDevDOCImport	= $ExtJSDevDBNAME .'ImportShare'. DIRECTORY_SEPARATOR . 'Parsed'. DIRECTORY_SEPARATOR ;
	$ExtJSDevURL		= (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
	$ExtJSDevURLPage	= (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	$ExtJSDevURLPage	= 'localhost';
	$formatOutput 		= 'JSON';
	

	$UserId = 0;
	$UserGroup = 0;
	$UserDeveloper = false;
	$UserAdmin = false;
	if (isset($_SESSION['UserId'])){
		$UserId = $_SESSION['UserId'];
		$UserDeveloper = $_SESSION['UserDeveloper'];
		$UserAdmin = $_SESSION['UserAdmin'];
		$UserGroup = $_SESSION['UserGroup'];
		$UserLocale = 'IT';
	}
	
	$LayoutIdSession = WFVALUESESSIONPRIV('LayoutId');
	$LayoutId = $LayoutIdSession;
	$LayoutId = isset($_POST["layoutid"]) ? $_POST["layoutid"] : $LayoutId;
	$LayoutId = isset($_GET["layoutid"]) ? $_GET["layoutid"] : $LayoutId;
	if (($LayoutId != '') && ($LayoutIdSession != $LayoutId)){
		WFVALUESESSIONSETPRIV('LayoutParent',$LayoutIdSession);
	}
	if ($LayoutId != '') {
		WFVALUESESSIONSETPRIV('LayoutId',$LayoutId);
	}else{
		$LayoutId = WFVALUESESSIONPRIV('LayoutId');
	}
	
	$LayoutViewType = '';
	$LayoutViewType = isset($_POST["layoutviewtype"]) ? $_POST["layoutviewtype"] : $LayoutViewType;
	$LayoutViewType = isset($_GET["layoutviewtype"]) ? $_GET["layoutviewtype"] : $LayoutViewType;
	if ($LayoutViewType != ''){
		WFVALUESESSIONSETPRIV('LayoutViewType',$LayoutViewType);
	}else{
		$LayoutViewType = WFVALUESESSIONPRIV('LayoutViewType');
	}
	
	$MenuId = '';
	$MenuId = isset($_POST["menuid"]) ? $_POST["menuid"] : $MenuId;
	$MenuId = isset($_GET["menuid"]) ? $_GET["menuid"] : $MenuId;
	if ($MenuId != ''){
		WFVALUESESSIONSETPRIV('MenuId',$MenuId);
	}else{
		$MenuId = WFVALUESESSIONPRIV('MenuId');
	}
	
	$FileId = '';
	if (isset($_GET['fileid']))  $FileId = $_GET['fileid'] ;
	if (isset($_POST['fileid'])) $FileId = $_POST['fileid'] ;
	if ($FileId != ''){
		$FileAppo = WFVALUESESSIONPRIV($FileId);
		if ($FileAppo !='') $FileId = $FileAppo;
	}
	
	//session_write_close();
?>
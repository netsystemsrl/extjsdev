<?php
global $is_debug, $debugmode, $geqoCalls, $postData, $callType, $content;
$geqoCalls = array();
$postData = array();
$is_debug = false;
$debugmode = 'none'; //display, log, ajax, console, none

if (substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip')) ob_start("ob_gzhandler"); else ob_start();
if(!isset($_SESSION)) {
	// server should keep session data for AT LEAST 1 hour
	//ini_set('session.gc_maxlifetime', 3600);
	// each client should remember their session id for EXACTLY 1 hour
	//session_set_cookie_params(3600);
	session_start();
}

//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

ini_set('max_execution_time', 500);
setlocale(LC_MONETARY, 'it_IT');
date_default_timezone_set("Europe/Rome");

require_once('vars.php');

//var_dump($_REQUEST);
//error_log(print_r($_REQUEST,true)."\n", 3, LOGFILE);	

if(isset($_REQUEST['layoutonly'])){
	
	if(isset($_REQUEST['debug'])) {
		$is_debug = true;
	}
	var_dump($_FILES);
	die();
	//$postData = $_POST;
	//$urlParams = create_url_params($_POST);
	$urlParams = '&layoutid='.$_REQUEST['layoutonly'];
	$returnStr = sw_nsextdev_make_curl('layout', $urlParams);
	//echo $returnStr;
	$return = json_decode($returnStr, true);
		
	//echo json_encode(array("message" => $returnStr));
	//error_log(print_r($return,true)."\n", 3, LOGFILE);	

	if (isset($return['data']) && !empty($return['data'][0]['layoutjson'])) {
		$content = $return['data'][0]['layoutjson'];
		$content = str_replace("BASEURL", BASEURL, $return['data'][0]['layoutjson']);
		$content = str_replace("ERP_ROOT_URL", ERP_ROOT_URL, $content);
		
		$ext = pathinfo($return['filename'], PATHINFO_EXTENSION);
		if($ext == 'pdf'){
			header("Content-type: application/pdf");
			echo base64_decode($content);
		} 
		elseif($ext == 'svg'){
			header("Content-type: image/svg+xml");
			echo base64_decode($content);
		}
		elseif($ext == 'stl'){
			header("Content-type: image/stl+xml");
			echo base64_decode($content);
		}
		else {
			header('Content-Description: File Transfer');
			header('Content-Type: application/octet-stream');
			header('Expires: 0');
			header('Cache-Control: must-revalidate');
			header('Pragma: public');
			header('Content-Disposition: attachment; filename="'.$return['filename'].'"');
			echo base64_decode($content);
		}
	} else {
		$content = "<h1>ERRORE, layoutjson vuoto</h1>\n<pre>".print_r($return, true)."</pre>";
	}
	
	exit;
}
//var_dump($_SERVER['HTTP_X_REQUESTED_WITH']);
if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'){
	//FILTRA CHIAMATA AJAX
	// handle request as AJAX
	$callType = 'ajax';
	
	//axios call params
	$data = json_decode(file_get_contents("php://input"), true);

	if(isset($_REQUEST['debug']) || isset($data['debug'])) {
		$is_debug = true;
		$debugmode = 'ajax';
		error_log("IS AJAX \n", 3, LOGFILE);
		error_log(print_r($_POST,true)."\n", 3, LOGFILE);
	}

	/*
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	*/
	
	if(isset($_POST['action'])){
		$action = $_POST['action'];
	} else {
		//var_dump($data);
		$action = $data['action'];
		$_POST = $data;
	}
	unset($_POST['action']);
	//error_log(print_r($action,true)."\n", 3, LOGFILE);
	if ($action == 'logout') {
		//for session
		//session_unset();
		session_destroy();

		//for cookie
		setcookie("registrationid", null, time() - 3600, "/");
		setcookie("SiteUserId", null, time() - 3600, "/");
		setcookie("SiteUserName", null, time() - 3600, "/");
		setcookie('SiteUserPsw', null, time() - 3600, "/");
		
		$returnArray = [
			'success'=>true,
			'message'=>'loggedout'
		];
		$returnStr = json_encode($returnArray);
	} else if($action == 'sequence'){
		//se ho una sequenza tipo layout -> process
		$postData = $_POST;
		if(isset($_POST['actionbefore'])) {
			//caso generico per qualsiasi sequenza
			$urlParams = create_url_params($_POST['actionbefore']);
			$returnStr = sw_nsextdev_make_curl($_POST['actionbefore']['action'], $urlParams);
			$urlParams = create_url_params($_POST['actionafter']);
			$returnStr = sw_nsextdev_make_curl($_POST['actionafter']['action'], $urlParams);
		} else {
			//se la sequenza è sempre write->process si può semplificare di molto
			$postData = $_REQUEST;
			//$urlParams = '&layoutid='.$_POST['layoutid'];
			$returnStr = sw_nsextdev_make_curl('write');
			
			if ($debugmode === 'console')
				error_log(print_r($returnStr,true)."\n", 3, LOGFILE);
			
			$postData = [];
			//$urlParams = create_url_params($_POST['actionafter']);
			$urlParams = '&layoutid='.$_POST['layoutid'].'&processid='.$_POST['processid'];
			$returnStr = sw_nsextdev_make_curl('process', $urlParams);
		}
	} else {
		//se ho una sola chiamata
		$postData = $_POST;
		$urlParams = create_url_params($_POST);
		$returnStr = sw_nsextdev_make_curl($action, $urlParams);
		
		//echo json_encode(array("message" => $returnStr));
	}
	if(isset($_REQUEST['debug'])) {
		error_log(print_r($returnStr,true)."\n", 3, LOGFILE);
	}
	echo $returnStr;	
	exit;
}
else if (isset($_POST['submit'])) {
	//IS FORM SUBMIT
	//error_log('qui in $_POST_submit'."\n", 3, LOGFILE);
	//error_log(print_r($_POST,true)."\n", 3, LOGFILE);
	//error_log(print_r($_REQUEST,true)."\n", 3, LOGFILE);
	
	if(isset($_REQUEST['debug'])) {
		$is_debug = true;
	}
	
	$action = $_POST['action'];
	unset($_POST['action']);
	if($action == 'sequence'){
		//se ho una sequenza tipo layout -> process
		//$urlParams = create_url_params($_POST['actionbefore']);
		//$urlParams = create_url_params($_POST);
		//$postData = $_POST;
		$postData = $_REQUEST;
		//$urlParams = '&layoutid='.$_POST['layoutid'];
		$returnStr = sw_nsextdev_make_curl('write');
		
		if ($debugmode === 'console')
			error_log(print_r($returnStr,true)."\n", 3, LOGFILE);
		
		$postData = [];
		//$urlParams = create_url_params($_POST['actionafter']);
		$urlParams = '&layoutid='.$_POST['layoutid'].'&processid='.$_POST['processid'];
		$returnStr = sw_nsextdev_make_curl('process', $urlParams);
	}
	$returnObj = json_decode($returnStr);
	//error_log(print_r($returnStr,true)."\n", 3, LOGFILE);

	if($is_debug) {
	if ($debugmode === 'console') {
		error_log(print_r($returnObj,true)."\n", 3, LOGFILE);
	} else if ($debugmode === 'display') {
		ini_set('display_errors', 1);
		ini_set('display_startup_errors', 1);
		error_reporting(E_ALL);
		error_log(print_r($returnObj,true)."\n", 3, LOGFILE);
		var_dump($returnObj);
		//die();
	}
	}
	
	if (isset($returnObj->redirect_url)) {
		$go_to_url = $returnObj->redirect_url;
	} else {
		$actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
		$go_to_url = $actual_link;
	}
	$go_to_url = str_replace("BASEURL", BASEURL, $go_to_url);
	//var_dump($go_to_url);
	header('Location: '.$go_to_url);
	//header('Location: '.BASEURL);
	exit();
}

if(isset($_REQUEST['debug'])) {
	$is_debug = true;
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
}

function create_url_params($params){
	if(!is_array($params))
		$params = json_decode($params);
	//error_log(print_r($params,true)."\n", 3, LOGFILE);
	$urlParams = '&';

	//$urlParam .= '&datawhere=EMAIL="'.$usermail.'" AND PWD="'.$password.'"';
	unset($params['action']);
	foreach($params as $key => $value){
		//$_POST['datawhere'][$key] = $value;
		if(is_object($value)) {
			$urlParams .= $value->name.'="'.$value->value.'" AND ';
		} elseif (is_array($value)) {
			if($key == 'datawhere') {
			foreach($_POST as $innerkey => $innervalue){
				$urlParams .= $key.'="'.$value.'" AND ';
			}
			$urlParams .= '1 = 1';
			}
		} else {
			//$urlParams .= $key.'="'.$value.'"&';
			$urlParams .= $key.'='.$value.'&';
		}
	}
	
	/*
	$datawhere = '';
	$datawhere = [];
	foreach($_POST['datawhere'] as $key => $value){
		//$datawhere[$key] = $value;
		$datawhere .= $key.'="'.$value.'" AND ';
	}
	$datawhere .= '1 = 1';
	*/
	
	return $urlParams;
}

function sw_nsextdev_make_curl($action = 'layout', $params = '', $return_url = false, $format = 'JSONP', $noOnlyData = false){
	global $is_debug, $debugmode, $geqoCalls, $postData, $callType;
	
	require_once('proxy.php');
	
	if ($action == 'login') {
		//is login action
		//error_log(_FILE__." line:".__LINE__." ".__FUNCTION__." ".print_r(_$_POST,true)."\n", 3, LOGFILE);
		$userName = $_POST["username"];
		$userPwd = $_POST["password"];
	} 
	else if (isset($_GET['userlogin']) && isset($_GET['password'])) {
		//error_log(__FILE__." line:".__LINE__." ".__FUNCTION__." ".print_r($_GET,true)."\n", 3, LOGFILE);
		//force Auth Credentials by get params
		$userName = $_GET["userlogin"];
		$userPwd = $_GET["password"];	
		$_SESSION["SiteUserLogin"] = $_GET["userlogin"];
		$_SESSION["SiteUserPsw"] = $_GET["Password"];
	} 
	else if (isset($_SESSION['SiteUserLogin']) && isset($_SESSION['SiteUserPsw'])) {
		//error_log(__FILE__." line:".__LINE__." ".__FUNCTION__." ".print_r($_SESSION,true)."\n", 3, LOGFILE);
		//user logged
		$userName = $_SESSION["SiteUserLogin"];
		$userPwd = $_SESSION["SiteUserPsw"];
	} 
	else if (isset($_COOKIE['SiteUserLogin']) && isset($_COOKIE['SiteUserPsw'])) {
		//error_log(__FILE__." line:".__LINE__." ".__FUNCTION__." ".print_r($_COOKIE,true)."\n", 3, LOGFILE);
		//user logged
		$userName = $_COOKIE['SiteUserLogin'];
		$userPwd = $_COOKIE['SiteUserPsw'];
		$_SESSION["SiteUserLogin"] = $userName;
		$_SESSION["SiteUserPsw"] = $userPwd;
	} 
	else {
		$userName = ERP_USER;
		$userPwd = ERP_PASSWORD;
	}
	
	$RegistrationId = false;
	if(isset($_SESSION["registrationid"])) {
		$RegistrationId = $_SESSION["registrationid"];
	}
	
	//error_log(print_r($action,true)."\n", 3, LOGFILE);
	
	switch ($action) {
		case 'layout':
			$actionFile = "LayoutReadRunExt";
			break;
		case 'read':
			$actionFile = "DataReadExt";
			break;
		case 'write':
			$actionFile = "DataWriteExt";
			break;
		case 'process':
			$actionFile = "CallProcessExt";
			break;
		case 'file':
			$actionFile = "CallFielExt";
			break;
		case 'menuRead':
			$actionFile = "MenuReadExt";
			break;
		case 'menuInfo':
			$actionFile = "MenuInfoExt";
			break;
		case 'login':
			$actionFile = "Login";
			break;
		default:
			$actionFile = "LayoutReadRunExt";
	}

	/*
	if ($action == 'login') {
		$url = ERP_ROOT_URL."includes/io/".$actionFile.".php?format=".$format.
																"&username=".$_POST['username'].
																"&password=".$_POST['password'].
																"&dbname=".ERP_DB.
																""
																//"&sort="
																;		
	} else {
		$url = ERP_ROOT_URL."includes/io/".$actionFile.".php?format=".$format.
																"&username=".ERP_USER.
																"&password=".ERP_PASSWORD.
																"&dbname=".ERP_DB.
																""
																//"&sort="
																;
	}
	*/

	$url = ERP_ROOT_URL."includes/io/".$actionFile.".php?format=".$format.
															"&username=".$userName.
															"&password=".$userPwd.
															"&dbname=".ERP_DB.
															"&registrationid=".$RegistrationId.
															"&dc=".rand(1, 2000000).
															"&baseurl=".BASEURL.
															""
															//"&sort="
															;

	if($format == 'JSONP' && !$noOnlyData && 1 == 2) $url .= "&onlydata=true";

	$completeUrl = $url . $params;
	
	//aggiunge i parametri di GET alla url
	$ricevedUrlArray = ["query" => ''];
	if($action == "layout") {
		//var_dump(parse_url( basename($_SERVER['REQUEST_URI'])));
		/*
		foreach($_REQUEST as $key => $value) {
			//$completeUrl .= 
		}
		*/
		$ricevedUrlArray = parse_url( basename($_SERVER['REQUEST_URI']));
		if(isset($ricevedUrlArray['query'])) {
			//$postData[] = $ricevedUrlArray['query'];
			//$postData['query'] = $ricevedUrlArray['query'];
			$completeUrl .= '&'.$ricevedUrlArray['query'];
			//var_dump($completeUrl);
			//$completeUrl .= strtoupper($ricevedUrlArray['query']);
		}
	}
	
	//correct malformed url
	//$completeUrl = rawurlencode($completeUrl);
	$completeUrl = str_replace(" ", '%20', $completeUrl);
	
	//var_dump($completeUrl);
	//collect all calls to geqo
	$geqoCalls[] = $completeUrl;

	if ($is_debug) {
		if ($debugmode === 'console') {
			error_log(print_r($completeUrl,true)."\n", 3, LOGFILE);
		} else if ($debugmode == 'display') {
			var_dump($completeUrl);
			error_log(print_r($completeUrl,true)."\n", 3, LOGFILE);
		}
	}

	//var_dump($completeUrl);
	//logInFile($completeUrl);
	if ($is_debug) {
		if ($debugmode === 'console') {
			error_log(print_r($completeUrl,true)."\n", 3, LOGFILE);
		}
	}
	
	if ($return_url) return $completeUrl;

	/*
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, ERP_ROOT_URL . "includes/io/".$actionFile.".php");
	curl_setopt($ch, CURLINFO_HEADER_OUT, true);
	//curl_setopt($ch, CURLOPT_HEADER, true);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "format=".$format.
										"&username=".$userName.
										"&password=".$userPwd.
										"&dbname=".ERP_DB.
										"&registrationid=".$RegistrationId.
										"&dc=".rand(1, 2000000).
										$params . '&'.$ricevedUrlArray['query']);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$result = curl_exec($ch);
	//$info = curl_getinfo($ch);
	//$info = curl_getinfo($ch, CURLINFO_HEADER_OUT);
	//var_dump($info);
	curl_close($ch);
	*/
	
	//error_log(print_r($completeUrl,true)."\n", 3, LOGFILE);
	
	//var_dump($completeUrl);
	
	$result = getCurlData($completeUrl);
	//var_dump($result);
	//error_log(print_r($result,true)."\n", 3, LOGFILE);

	$resultObj = json_decode($result);
	
	//error_log(print_r($geqoCalls,true)."\n", 3, LOGFILE);
	//error_log(print_r($resultObj,true)."\n", 3, LOGFILE);
	
	if(!$resultObj) {
		if($callType == 'ajax') {
			//error_log(print_r($result,true)."\n", 3, LOGFILE);
			return json_encode([
				'success' => false,
				'resultObj' => $resultObj,
				'geqoCalls' => $geqoCalls
			]);
		} else {
			ini_set('display_errors', 1);
			ini_set('display_startup_errors', 1);
			error_reporting(E_ALL);
			var_dump($resultObj);
			var_dump($geqoCalls);
			die('$result è false');
		}
	}
	if ($is_debug) {
		if ($debugmode === 'ajax') {
			$resultObj->completeUrl = $completeUrl;
			$result = json_encode($resultObj);
			error_log(print_r($result,true)."\n", 3, LOGFILE);
		} else if ($debugmode === 'display') {
			var_dump($result);
			error_log(print_r($result,true)."\n", 3, LOGFILE);
		}
	}
	
	if ($action == 'login' && $resultObj->success) {
		//error_log(print_r($resultObj,true)."\n", 3, LOGFILE);
		// Set Cookie expiration for 1 month
		/*
		$cookie_expiration_time = $current_time + (30 * 24 * 60 * 60);  // for 1 month
		setcookie("registrationid", $resultObj->RegistrationId, $cookie_expiration_time);
		setcookie("SiteUserId", $resultObj->UserId, $cookie_expiration_time);
		setcookie("SiteUserName", $resultObj->UserName, $cookie_expiration_time);
		setcookie("SiteUserPsw", $resultObj->UserName, $cookie_expiration_time);
		*/
		
		$resultArray = json_decode( $result );
		$resultArray->UserPsw = $_REQUEST['password'];
		$result = json_encode($resultArray);
		
		$_SESSION["registrationid"] = $resultObj->RegistrationId;
		$_SESSION["SiteUserId"] = $resultObj->UserId;
		$_SESSION["SiteUserName"] = $resultObj->UserName;
		//$_SESSION["UserLogin"] = $resultObj->UserName;
		$_SESSION["UserLogin"] = $_REQUEST['username'];
		$_SESSION["Password"] = $_REQUEST['password'];
		
		$_COOKIE['SiteUserLogin'] = $userName;
		$_COOKIE['SiteUserPsw'] = $userPwd;
		
		$_SESSION["UserLogin"] = $userName;
		$_SESSION["Password"] = $userPwd;
		
		//error_log(print_r($_SESSION,true)."\n", 3, LOGFILE);
	} else {
		//$_SESSION["registrationid"] = $resultObj->RegistrationId;
	}
	if($resultObj->message == 'user / password error'){
		//error_log(print_r(__FILE__." line:".__LINE__." ".__FUNCTION__." ".$resultObj->message,true)."\n", 3, LOGFILE);
		//manage user deleted in backend 
		setcookie('SiteUserLogin', null, time() - 3600, "/");
		unset($_SESSION['SiteUserLogin']);
		setcookie('SiteUserPsw', null, time() - 3600, "/");
		unset($_SESSION['SiteUserPsw']);
		setcookie("SiteUserName", null, time() - 3600, "/");
		unset($_SESSION['SiteUserName']);
		session_destroy();
		
		header('Location: '.BASEURL.'?resetUser=true');
		exit();
	}

	return $result;
}

function get_page_handler($varsIn = '/') {
	global $content, $routes, $postData;
	//var_dump($varsIn);
	//var_dump($routes);
	//error_log(date('Y-m-d H:i:sO')." ".print_r($routes,true)."\n", 3, LOGFILE);
	$varsArray = explode('/', rtrim($varsIn, '/'));
	//var_dump($varsArray);
	//error_log(date('Y-m-d H:i:sO')." ".print_r($varsArray,true)."\n", 3, LOGFILE);
		
	$refererPath = "";
	if(isset($_SERVER['HTTP_REFERER'])){
		$refererPath = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH);
		$refererPath = substr($refererPath, strlen(BASEROUTE)+1);
		//error_log(date('Y-m-d H:i:sO')." ".print_r($refererPath,true)."\n", 3, LOGFILE);
	}
	$refererPathArray = explode('/', rtrim($refererPath, '/'));
	//error_log(date('Y-m-d H:i:sO')." ".print_r($refererPathArray,true)."\n", 3, LOGFILE);
	
	//$count = count($urlArray);
	if(count($varsArray) > 1) {
		$vars = $varsArray[0];
		$varsDetail = $varsArray[1];
	} else {
		$vars = $varsIn;
	}
	//var_dump($routes[$vars]);
	
	$urlParams = "&layoutid=".$routes[$vars].'&PAGE='.$varsArray[0].'&PAGEFROM='.$refererPathArray[0];
	$postData['PAGE'] = $varsArray[0];
	$postData['PAGEFROM'] = $refererPathArray[0];
	
	$parts = parse_url($_SERVER['REQUEST_URI']);
	//var_dump($parts);
	if(isset($parts['query'])) {
		parse_str($parts['query'], $query);
		if (isset($query['page'])) {
			$urlParams .= "&page=".$query['page'];
		} else {
			/*
			foreach($query as $key => $value) {
				$postData[$key] = $value;
			}
			*/
		}
	}
	/*
	var_dump($urlParams);
	die();
	*/
	if (isset($routes[$vars])) {
		if (isset($routes['FILTRO']))
			if(is_array($routes['FILTRO'])){
				$postData['FILTRO'] = $routes['FILTRO'];
			} else {
				$urlParams .= '&query='.$vars.'&details='.$varsDetail.'&FILTRO='.$routes['FILTRO'];
			}
		if (isset($routes['datawhere']))
			$urlParams .= '&'.$routes['datawhere'];
		
		//var_dump($urlParams);
		$returnStr = sw_nsextdev_make_curl('layout', $urlParams);
		$return = json_decode($returnStr, true);
	} else {
		//$urlParams = "&layoutid=".$routes[$vars];
	}
	//var_dump($urlParams);
	
	//var_dump($return);
	if (isset($return['data']) && !empty($return['data'][0]['layoutjson'])) {
		$content = $return['data'][0]['layoutjson'];
		$content = str_replace("BASEURL", BASEURL, $return['data'][0]['layoutjson']);
		$content = str_replace("ERP_ROOT_URL", ERP_ROOT_URL, $content);
	} else {
		$content = "<h1>ERRORE2, layoutjson vuoto</h1>\n<pre>".print_r($return, true)."</pre>";
	}
}

function logInFile($info = "np", $line = ""){
    $date = date('d.m.Y h:i:s');
    if(is_array($info)){
    	$msg = print_r($info,true);
    } else {
    	$msg = $info;
    }
    error_log($date." line: ".$line." msg: ".$msg."\n", 3, LOGFILE);
}

/*
if (isset($_GET['layoutid'])){
	$urlParams = "&layoutid=".$_GET['layoutid'];
} else {
	$urlParams = "&layoutid=web_page_main";
}
$returnStr = sw_nsextdev_make_curl('layout', $urlParams);

$return = json_decode($returnStr, true);

var_dump($return['registrationid']);
var_dump($_SESSION['registrationid']);

if (!isset($_SESSION['registrationid']) && isset($return['registrationid'])){
	$_SESSION['registrationid'] = $return['registrationid'];
};

if (isset($return['data']))
	$content = $return['data'][0]['layoutjson'];
else
	$content = '';
*/
//var_dump($return);
//error_log("You messed up in index!\n", 3, "/var/www/html/sito/my-errors.log");

require_once('route_mng.php');
create_routes();
//var_dump($_SESSION);
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>superSyncro eShop</title>

<!-- Boostrap CSS -->
<?php if(BOOSTRAP_VERSION == 5) : ?>
<!--
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
-->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
<?php else : ?>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
<?php endif; ?>

<!--
<link href="<?php echo BASEURL ?>css/mmenu.css" rel="stylesheet">
-->
<link href="<?php echo BASEURL ?>css/menukit.css?version=<?php echo VERSION;?>" rel="stylesheet">

<link href="<?php echo BASEURL ?>css/toast.min.css" rel="stylesheet">

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>

<!-- Boostrap JavaScript Bundle with Popper -->
<?php if(BOOSTRAP_VERSION == 5) : ?>
<!--
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous"></script>
-->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
<?php else : ?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct" crossorigin="anonymous"></script>
<?php endif; ?>

<!-- vuejs -->
<!--<script src="https://unpkg.com/vue@next"></script> -->
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vuex@4.0.0/dist/vuex.global.js"></script>
<!--
<script src="https://unpkg.com/vuex"></script>
<script src="https://unpkg.com/vue@3.0.5/dist/vue.global.prod.js" crossorigin="anonymous"></script>
-->

<!-- Font awesome 5 -->
<link href="<?php echo BASEURL ?>fonts/fontawesome/css/all.min.css" type="text/css" rel="stylesheet">

<!-- FacyBox -->
<link href="<?php echo BASEURL ?>css/jquery.fancybox.min.css" type="text/css" rel="stylesheet">

<!-- custom style -->
<link href="<?php echo BASEURL ?>css/ui.css?version=<?php echo VERSION;?>" rel="stylesheet" type="text/css"/>
<link href="<?php echo BASEURL ?>css/responsive.css?version=<?php echo VERSION;?>" rel="stylesheet" media="only screen and (max-width: 1200px)" />

<!-- custom css-->
<link href="<?php echo BASEURL ?>eshop.css?version=<?php echo VERSION;?>" rel="stylesheet">

<script>
	var baseroute = '<?php echo BASEROUTE; ?>';
	var baseurl = '<?php echo  BASEURL; ?>';
	
<?php if($is_debug && $debugmode == 'console'): ?>
	var debug = true;
	var geqoCalls = <?php echo json_encode($geqoCalls); ?>;
<?php endif ?>
</script>

</head>

<style>
.offcanvas{
width:350px;
visibility: hidden;
transform:translateX(-100%);
transition:all .2s;
border-radius:0; 
box-shadow: 0 5px 10px rgba(0,0,0, .2);
display:block;
position: fixed;
top: 0;
left: 0;
height: 100%;
z-index: 1200;
background-color: #fff;
overflow-y: auto;
overflow-x: hidden;
}

.offcanvas.show{
visibility: visible;
transform: translateX(0);
transition: transform .2s;
}
</style>

<body>
<?php //var_dump($content); ?>
<?php //var_dump($_SESSION) ?>
<?php //var_dump($_COOKIE) ?>
<b class="screen-overlay"></b>
<div id="main-content">
<?php echo $content ?>
</div>
<!-- OffCanvas Dynamic Menu -->
<!--
<nav id="offcanvas-menu">
	<ul id="offcanvas-menu-list">
	</ul>
</nav>
-->

<!-- offcanvas panel -->
<!-- spostato in layout apposito
<aside class="offcanvas offcanvas-right" id="offcanvas_el">
	<header class="p-4 bg-light border-bottom">
		<button class="btn btn-outline-danger btn-close"> &times Chiudi </button>
		<h6 class="mb-0">Carrello </h6>
	</header>
	<nav class="list-group list-group-flush">
		<a href="#" class="list-group-item"></a>
	</nav>
	<div class="fixed-bottom btn-group w-100">
		<a class="btn btn-primary" href="<?php //echo BASEURL ?>Carrello">Modifica il Carrello</a>
		<a class="btn btn-primary" href="<?php //echo BASEURL ?>Checkout">CheckOut</a>
	</div>
</aside>
-->

</body>

</html>

<script src="<?php echo BASEURL ?>js/bootstrap-input-spinner.js" type="text/javascript"></script>
<!--
<script src="<?php //echo BASEURL ?>js/mmenu.js" type="text/javascript"></script>
<script src="<?php //echo BASEURL ?>js/mmenu.polyfills.js" type="text/javascript"></script>
-->
<script src="<?php echo BASEURL ?>js/menukit.js?version=<?php echo VERSION;?>" type="text/javascript"></script>
<script src="<?php echo BASEURL ?>js/toast.min.js" type="text/javascript"></script>
<!-- JavaScript Cookie -->
<script src="https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js"></script>
<!-- FacyBox -->
<script src="<?php echo BASEURL ?>js/jquery.fancybox.min.js" type="text/javascript"></script>
<script src="<?php echo BASEURL ?>js/jquery.svg.min.js" type="text/javascript"></script>
<!-- vuejs eshop -->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<!-- <script src="https://unpkg.com/@chenfengyuan/vue-number-input@2"></script> -->
<script src="<?php echo BASEURL ?>js/vue-number-input.js" type="text/javascript"></script>
<script src="<?php echo BASEURL ?>js/vue-scripts.js?version=<?php echo VERSION;?>" type="text/javascript"></script>
<!-- eshop javascript -->
<script src="<?php echo BASEURL ?>js/script.js?version=<?php echo VERSION;?>" type="text/javascript"></script>
<script src="<?php echo BASEURL ?>js/snap.svg.js"></script>
<!--snap.svg-min.js
<script src="scripts.js"></script>
 -->
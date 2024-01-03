<?PHP

// Request:
// 
// > ba-simple-proxy.php?url=http://example.com/&mode=native
// 
// Response:
// 
// > <html>...</html>
// 												REQUIRE CURL !!!!


//	error_reporting(E_ALL);
//	ini_set('display_errors', 1);
//	$conn->debug=1; 

/*
# No need for the template engine
define( 'WP_USE_THEMES', false );
# Load WordPress Core
// Assuming we're in a subdir: "~/wp-content/plugins/current_dir"
require_once( '../../../wp-load.php' );

//error_log('in proxy');
//error_log(print_r($_SESSION, true));
//error_log(get_option('sw-extdev-items-list-logged'));

if(get_option('sw-extdev-items-list-logged')) {
	$NSDevUserName = $_SESSION['NSDevUserName'];
	$NSDevUserPsw = $_SESSION['NSDevUserPsw'] ;
}
*/

/*
if(isset($_GET['url'])) {
	// Generate appropriate content-type header.
	
	$is_xhr = strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
	header( 'Content-type: application/' . ( $is_xhr ? 'json' : 'x-javascript' ) );
	
	$url = $_GET['url'];
	print getCurlData($url);
}
*/

function getCurlData ($url, $postData = "") {
	global $postData;
	//error_log(print_r($_POST,true)."\n", 3, LOGFILE);
	//error_log('qua'."\n", 3, LOGFILE);
	//error_log(print_r($postData,true)."\n", 3, LOGFILE);
	//error_log(print_r(debug_backtrace(),true)."\n", 3, LOGFILE);
	if (isset($_SESSION['NSDevUserName'])) {
		$_POST['username'] = $_SESSION['NSDevUserName'];
		$_POST['password'] = $_SESSION['NSDevUserPsw'];
	} else {
		//$_POST['username'] = "WEBPLUBIC";
		//$_POST['password'] = "WEBPLUBIC";
	}
	
	//error_log(print_r($_SESSION, true));
	//clicla l'array di session per aggiungere i prametri alla chiamata
	if(isset($_SESSION['NSPassedParams'])) {
		foreach($_SESSION['NSPassedParams'] as $key => $value) {
			//error_log(print_r($key, true));
			//error_log(print_r($value, true));
			$_POST['datawhere'] = $key." = '$value'";
		}
	}
	
	if(isset($_COOKIE['RegistrationId'])){
		$_POST['RegistrationId'] = $_COOKIE['RegistrationId'];
	}
	
	//error_log(print_r($_POST, true));
	//var_dump($url);
	//error_log("You messed up in proxy!\n", 3, "/var/www/html/sito/my-errors.log");

	$enable_jsonp    = false;
	$enable_native   = false;
	$valid_url_regex = '/.*/';

	// ############################################################################

	//$url = $_GET['url'];

	if (!$url) {
		// Passed url not specified.
		$contents = 'ERROR: url not specified';
		$status = array( 'http_code' => 'ERROR' );
	} else if ( !preg_match( $valid_url_regex, $url ) ) {
		// Passed url doesn't match $valid_url_regex.
		$contents = 'ERROR: invalid url';
		$status = array( 'http_code' => 'ERROR' );
	} else {
		
		//$url = htmlentities($url);
		//$url = htmlspecialchars($url);
		
		$ch = curl_init($url);
		//var_dump($ch);
	
		if(isset($_SESSION['RegistrationId'])) $_POST['RegistrationId'] = $_SESSION['RegistrationId'];
		if(isset($_COOKIE['RegistrationId'])) $_POST['RegistrationId'] = $_COOKIE['RegistrationId'];

		//if ( strtolower($_SERVER['REQUEST_METHOD']) == 'post' ) {
		curl_setopt( $ch, CURLOPT_POST, true );
		//curl_setopt( $ch, CURLOPT_POSTFIELDS, $_POST );
		//var_dump($postData);
		//$postDataStr = implode("&", $postData);
		//error_log(print_r($postData,true)."\n", 3, LOGFILE);
		curl_setopt( $ch, CURLOPT_POSTFIELDS, http_build_query($postData) );
		
		//}

		//error_log(print_r($postData,true)."\n", 3, LOGFILE);

		if (isset($_GET['send_cookies'])) {
			$cookie = array();
			foreach ( $_COOKIE as $key => $value ) {
				$cookie[] = $key . '=' . $value;
			}
			if ( $_GET['send_session'] ) {
				$cookie[] = SID;
			}
			$cookie = implode( '; ', $cookie );

			curl_setopt( $ch, CURLOPT_COOKIE, $cookie );
		}

		curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $ch, CURLOPT_HEADER, false );
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );

		curl_setopt( $ch, CURLOPT_USERAGENT, isset($_GET['user_agent']) ? $_GET['user_agent'] : isset($_SERVER['HTTP_USER_AGENT']) );

		//var_dump($ch);

		$result = curl_exec($ch);

		// Check if any error occurred
		if(curl_errno($ch)) {
			$info = curl_getinfo($ch);
			echo 'Curl error num '.curl_errno($ch).' : '.curl_error($ch);
			error_log(print_r($info,true)."\n", 3, LOGFILE);
		}
		
		//var_dump($result);
		//error_log(print_r($result,true)."\n", 3, LOGFILE);

		//list( $header, $contents ) = preg_split( '/([\r\n][\r\n])\\1/', $result, 2 );
		$header = "";
		$contents = $result;

		//error_log(print_r($contents, true));

		//var_dump($contents);

		$status = curl_getinfo( $ch );
		//error_log(print_r($status,true)."\n", 3, LOGFILE);

		curl_close($ch);
	}

	// Split header text into an array.
	$header_text = preg_split( '/[\r\n]+/', $header );

	if (isset($_GET['mode']) && $_GET['mode'] == 'native' ) {
		if ( !$enable_native ) {
			$contents = 'ERROR: invalid mode';
			$status = array( 'http_code' => 'ERROR' );
		}

		// Propagate headers to response.
		foreach ( $header_text as $header ) {
			if ( preg_match( '/^(?:Content-Type|Content-Language|Set-Cookie):/i', $header ) ) {
				header( $header );
			}
		}

		return $contents;
	  
	} else {
	  
		// $data will be serialized into JSON data.
		$data = array();

		// Propagate all HTTP headers into the JSON data object.
		if ( isset($_GET['full_headers']) ) {
			$data['headers'] = array();

			foreach ( $header_text as $header ) {
				preg_match( '/^(.+?):\s+(.*)$/', $header, $matches );
				if ( $matches ) {
					$data['headers'][ $matches[1] ] = $matches[2];
				}
			}
		}

		// Propagate all cURL request / response info to the JSON data object.
		if ( isset($_GET['full_status']) ) {
			$data['status'] = array();
			$data['status']['http_code'] = $status['http_code'];
		}

		// Set the JSON data object contents, decoding it from JSON if possible.
		$decoded_json = json_decode( $contents );
		$data = $decoded_json ? $decoded_json : $contents;

		// Get JSONP callback.
		$jsonp_callback = $enable_jsonp && isset($_GET['callback']) ? $_GET['callback'] : null;

		// Generate JSON/JSONP string
		$json = json_encode( $data );
	  
		//error_log(print_r($json,true)."\n", 3, "/var/www/html/sito/my-errors.log");
	  
		return $jsonp_callback ? "$jsonp_callback($json)" : $json;
	}
}
?>
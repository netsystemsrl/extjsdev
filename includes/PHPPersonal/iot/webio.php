<?php
/**
* POST
* @param $pin
* @param $method ex) function/out or value/1
*/
function WebIOPiFunc($ip, $port = 8000, $pin , $value) {
	//http://192.168.1.x:8000/GPIO/4/function/out
	$url = 'http://' . $ip . '/GPIO/' . $pin . '/function/' . $value;
}


function WebIOPiSensor($ip, $port = 8000, $sensor , $value) {
	//http://192.168.1.x:8000/devices/dht0/sensor/humidity/percent
	$url = 'http://' . $ip . '/GPIO/' . $sensor . '/value/' . $value;
}


function WebIOPiValueSet($ip, $port = 8000, $pin , $value) {
	$username = 'webiopi';
	$password = 'raspberry';
	//http://192.168.1.x:8000/GPIO/4/value/1
	$url = 'http://' . $ip . ':' . $port . '/GPIO/' . $pin . '/value/' . $value;
    $response = array ();
	$post_array = array (
	   "email" => "someone@gmail.com",
	   "problem" => "error happened on backing up Google Drive files...bla bla bla"
   );
    $context = stream_context_create(array(
		'http' =>  array(
						'method'  =>  'SET',
						'header'  =>  sprintf("Authorization: Basic %s\r\n", base64_encode($username.':'.$password)).
						"Content-type:  application/x-www-form-urlencoded\r\n",
						'content' =>  $post_array,
						'timeout' =>  5,
					),
	));		 
	$result = file_get_contents($url, false, $context);
	return $result;
}

function WebIOPiValueGet($ip, $port = 8000, $pin ) {
	//http://192.168.1.x:8000
	$username = 'webiopi';
	$password = 'raspberry';
	$url = 'http://' . $ip . ':' . $port . '/*';
    $response = array ();
	$post_array = array (
	   "email" => "someone@gmail.com",
	   "problem" => "error happened on backing up Google Drive files...bla bla bla"
   );
    $context = stream_context_create(array(
		'http' =>  array(
						'method'  =>  'GET',
						'header'  =>  sprintf("Authorization: Basic %s\r\n", base64_encode($username.':'.$password)).
						"Content-type:  application/x-www-form-urlencoded\r\n",
						'content' =>  $post_array,
						'timeout' =>  5,
					),
	));		 
	$result = file_get_contents($url, false, $context);
	if (isJson($result)) {
		$json = array();
		$jsondata = array();
		$json = json_decode($result, true);
		$jsondata = $json['GPIO'][$pin];
		return $jsondata;
	}else{
		return 'error';
	}
}
?>

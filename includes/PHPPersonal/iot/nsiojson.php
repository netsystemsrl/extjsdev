<?php

function nsiojsonValueSet($ip, $port = 8080, $pin , $value) {
	$username = 'webiopi';
	$password = 'raspberry';
	//http://192.168.1.x:8000/set/relay1=1
	$url = 'http://' . $ip . ':' . $port . '/set/' . $pin . '=' . $value;
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
	return $result;
}

function nsiojsonValueReset($ip, $port = 8080, $pin ) {
	$username = 'webiopi';
	$password = 'raspberry';
	//http://192.168.1.x:8000/set/relay1=1
	$url = 'http://' . $ip . ':' . $port . '/reset/' . $pin;
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
	return $result;
}

function nsiojsonValueGet($ip, $port = 8080, $pin ) {
	//http://192.168.1.x:8000
	$username = 'webiopi';
	$password = 'raspberry';
	$url = 'http://' . $ip . ':' . $port . '/get/';
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
		$jsondata = $json['status'][$pin];
		return $jsondata;
	}else{
		return 'error: ' . $result;
	}
}
?>
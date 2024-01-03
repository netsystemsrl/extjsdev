<?php
	require_once($_SERVER['DOCUMENT_ROOT'] . '/includes/var.php');

//$algorithm = 'HS256';
$algorithm = 'RS256';
$secret = 'secret';
$time = time();
$leeway = 5; // seconds
$ttl = 30; // seconds
$claims = array('sub'=>'1234567890','name'=>'John Doe','admin'=>true);

// test that the functions are working
//$token = generateToken($claims,$time,$ttl,$algorithm,$secret);
//$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJmYXJpbmFuIiwiZXhwIjoxNTA1MjIwMDY0fQ.eSHYMQAs4b4IqHV3D7j4e3hLA3zyI9Qh99TucOiUG62W0Nr-vwA007AtyKJO5NI1weDIShQ7ILSq8kAopqaC-ZqaZu4ckFxF5brrgPGQfX7BbJ3CbjeN4POf2JIP8TPlR-bpe4UKwgkyoOj1BddpkfJiq_8esIvqRCbyWpz21vMdvYbqzCLd0cFK3A_vW-1hPplfGPOBXkC8iiK1ywWxRIaL981oaj1uLngTImhy62fpIaCqPKL9vhnuzDYL2LQn3td8WVYuAHFAiWaFMtM5ME0w8LKnekPinlX4Bmd87s0VlhtOdW0wPNaOFN0uGCwG-NBatMqej6zIbpuEXRdgdw';

$token = $_COOKIE["infoline-auth"];
//echo "$token\n";

$claims = getVerifiedClaims($token,$time,$leeway,$ttl,$algorithm,$secret);
//var_dump($claims);

//var_dump (date('m/d/Y', $claims['exp']));

//$date = new DateTime();
//$now = new DateTime();

//var_dump($date);
//print_r($now);

//var_dump(time());
//var_dump($claims['exp']);

if($claims['exp'] < time()) {
    echo "date expiration is in the past\n";
	die();
} else {
	//echo "date expiration is correct\n";
	//var_dump($claims);
}
?>
{
  "contexts": []
}

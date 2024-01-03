<?php

function PIVAVies($countryCode, $vatno) {
	$response = array();
	$response['valid'] = false;
	$response['error'] = '';
	$response['name'] = '';
	$response['address'] = '';
	$response['city'] = '';
	$response['state'] = '';
	$response['cap'] = '';
	
    if (strlen($vatno) <= 2) {
        $response['error'] =  "Incorrect VAT number";
        return $response;
    }
    $client = new SoapClient("http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl");
    if(!$client) {
        $response['error'] = "web service at ec.europa.eu unavailable";
        return $response;
    }
    try {
        $responseSoap = $client->checkVat(array('countryCode' => $countryCode,
												'vatNumber' => $vatno
												));
    }
    catch (SoapFault $e) {
        $faults = array (
            'INVALID_INPUT'       => 'The provided CountryCode is invalid or the VAT number is empty',
            'SERVICE_UNAVAILABLE' => 'The SOAP service is unavailable, try again later',
            'MS_UNAVAILABLE'      => 'The Member State service is unavailable, try again later or with another Member State',
            'TIMEOUT'             => 'The Member State service could not be reached in time, try again later or with another Member State',
            'SERVER_BUSY'         => 'The service cannot process your request. Try again later.'
        );
        $error = $faults[$e->faultstring];
        if (!isset($error)){
            $response['error'] = $e->faultstring;
			return $response;
		}
    }
    if (!$responseSoap->valid) {
        $response['error'] =  "Not a valid VAT number";
        return $response;
    }
	
	$response['valid'] = true;
    foreach ($responseSoap as $key => $prop) {
        if ($key == 'name')
			$response['name'] = $prop;
        else if ($key == 'address')
			$response['address'] = $prop;
    }
	$addArray = explode(PHP_EOL,$response['address']);
	if ($addArray){
		if (trim(right ($response['city'],3)) == right ($response['city'],2)){
			$response['state'] = right ($response['city'],2);
			$response['city'] = left($response['city'],len($response['city'])-3);
		}
		if (trim(left ($response['city'],6)) == left ($response['city'],5)){
			$response['cap'] = left ($response['city'],5);
			$response['city'] = right($response['city'],len($response['city'])-6);
		}
	}
	
    return $response;
}

function CFCheck($cf){
	if( $cf === '' )  return '';
	if( strlen($cf) != 16 )
		return false;
	$cf = strtoupper($cf);
	if( preg_match("/^[A-Z0-9]+\$/", $cf) != 1 ){
		return false;
	}
	$s = 0;
	for( $i = 1; $i <= 13; $i += 2 ){
		$c = $cf[$i];
		if( strcmp($c, "0") >= 0 and strcmp($c, "9") <= 0 )
			$s += ord($c) - ord('0');
		else
			$s += ord($c) - ord('A');
	}
	for( $i = 0; $i <= 14; $i += 2 ){
		$c = $cf[$i];
		switch( $c ){
		case '0':  $s += 1;  break;
		case '1':  $s += 0;  break;
		case '2':  $s += 5;  break;
		case '3':  $s += 7;  break;
		case '4':  $s += 9;  break;
		case '5':  $s += 13;  break;
		case '6':  $s += 15;  break;
		case '7':  $s += 17;  break;
		case '8':  $s += 19;  break;
		case '9':  $s += 21;  break;
		case 'A':  $s += 1;  break;
		case 'B':  $s += 0;  break;
		case 'C':  $s += 5;  break;
		case 'D':  $s += 7;  break;
		case 'E':  $s += 9;  break;
		case 'F':  $s += 13;  break;
		case 'G':  $s += 15;  break;
		case 'H':  $s += 17;  break;
		case 'I':  $s += 19;  break;
		case 'J':  $s += 21;  break;
		case 'K':  $s += 2;  break;
		case 'L':  $s += 4;  break;
		case 'M':  $s += 18;  break;
		case 'N':  $s += 20;  break;
		case 'O':  $s += 11;  break;
		case 'P':  $s += 3;  break;
		case 'Q':  $s += 6;  break;
		case 'R':  $s += 8;  break;
		case 'S':  $s += 12;  break;
		case 'T':  $s += 14;  break;
		case 'U':  $s += 16;  break;
		case 'V':  $s += 10;  break;
		case 'W':  $s += 22;  break;
		case 'X':  $s += 25;  break;
		case 'Y':  $s += 24;  break;
		case 'Z':  $s += 23;  break;
		/*. missing_default: .*/
		}
	}
	if( chr($s%26 + ord('A')) != $cf[15] )
		return false;
	return true;
}

function PIVACheck($pi){
	if( $pi === '' )  return '';
	if( strlen($pi) != 11 )
		return false;
	if( preg_match("/^[0-9]+\$/", $pi) != 1 )
		return false;
	$s = 0;
	for( $i = 0; $i <= 9; $i += 2 )
		$s += ord($pi[$i]) - ord('0');
	for( $i = 1; $i <= 9; $i += 2 ){
		$c = 2*( ord($pi[$i]) - ord('0') );
		if( $c > 9 )  $c = $c - 9;
		$s += $c;
	}
	if( ( 10 - $s%10 )%10 != ord($pi[10]) - ord('0') )
		return false;
	return true;
}

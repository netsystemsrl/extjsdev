<?php
	include('../var.php');
//	error_reporting(E_ALL);
//	ini_set('display_errors', 1);
//	$conn->debug=1; 
			
	WFSendLOG("GoogleMaps:","START");
	//directions(null, null, true);
	//file_put_contents('prova.txt', $_POST, FILE_APPEND);
	//var_dump(geocode('38.897669','-77.03655'));
	 
	$origin = false;
	$destination = false;

	if(isset($_POST['origin'])) $origin = $_POST['origin'];
	if(isset($_GET['origin'])) $origin = $_GET['origin'];
	if(isset($_POST['destination'])) $destination = $_POST['destination'];
	if(isset($_GET['destination'])) $destination = $_GET['destination'];

	if($origin == false) $origin = 'Reggio Emilia';
	if($destination == false) $destination = 'Monaco di Baviera';

	directions($origin,$destination);
	
	function geocode($lat,$lng){
		//$cityclean = str_replace (" ", "+", $city);
		$details_url = "http://maps.googleapis.com/maps/api/geocode/json?address=".$lat.",".$lng."&sensor=false";

		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $details_url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$return = curl_exec($curl);
		curl_close($curl);
		
		$geoloc = json_decode($return, true);

		$countryIndex = array_search(array('country','political'), array_column($geoloc['results'], 'types'));
		$countryCode = $geoloc['results'][$countryIndex]["address_components"][0]['short_name'];
		$countryName = $geoloc['results'][$countryIndex]["address_components"][0]['long_name'];
		
		echo '<pre>';
		var_dump($countryName);
		echo '<pre>';
		
		//return $results;
	}

	function directions($origin, $destination, $phpTest=null){
		file_put_contents('prova.txt', $origin." -> ".$destination."\n", FILE_APPEND);
		// Our parameters
		$params = array(
				'sensor'        => 'true',
				//'units'         => 'imperial',
				'language'		=> 'it-it'
			);
		if ($origin == null || $destination == null) {
			$params['origin'] = 'Guildford, Surrey';
			$params['destination'] = 'Embankment, London';
		} else {
			$params['origin'] = $origin;
			$params['destination'] = $destination;
		}

		$params_string = '';
		// Join parameters into URL string
		foreach($params as $var => $val){
			$params_string .= '&' . $var . '=' . urlencode($val);  
		}
			 
		// Request URL
		$url = "http://maps.googleapis.com/maps/api/directions/json?".ltrim($params_string, '&');
		
		// Make our API request
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		$return = curl_exec($curl);
		curl_close($curl);
		
		//file_put_contents('route.txt', $return);
		echo '<pre>'; var_dump($return); echo '</pre>';
		
		$directions = json_decode($return);
		
		$routeData = array();
		$routeData['status'] = $directions->status;
		$routeData['start_address'] = 'Partenza: '.$directions->routes[0]->legs[0]->start_address.'<br>';
		$routeData['end_address'] = 'Arrivo: '.$directions->routes[0]->legs[0]->end_address.'<br>';
		$routeData['distance'] = 'Distanza: '.$directions->routes[0]->legs[0]->distance->text.'<br>';
		$routeData['distanceValue'] = 'Distanza: '.$directions->routes[0]->legs[0]->distance->value.'<br>';
		$routeData['duration'] = 'Durata: '.$directions->routes[0]->legs[0]->duration->text.'<br>';
		$routeData['durationValue'] = 'Durata: '.$directions->routes[0]->legs[0]->duration->value.'<br>';
		
		$states = array();
		foreach($directions->routes[0]->legs[0]->steps as $step) {
			//$routeData['step'] = '<p>'.$step->html_instructions.'</p>');
			If ($str = strchr($step->html_instructions,'Ingresso in')) {
				if (!stripos($str,'zona')) {
					$states[] = str_replace('Ingresso in ', '', $str);
				}
			}
		}
		
		$routeData['states'] = $states;
		//var_dump($routeData);
		
		if (!$phpTest) {
			//ajax response		
			header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/json');
			echo Array2JSON($routeData);
			return;
		} else {
			//stamp on screen
			var_dump($routeData);
			print('<p>Percorso:</p>');

			foreach($directions->routes[0]->legs[0]->steps as $step) {
				print('<p>'.$step->html_instructions.'</p>');
			}
		}
	}
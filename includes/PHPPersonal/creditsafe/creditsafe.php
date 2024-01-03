<?php		

class CreditSafe {
	public $vatNo= '';
	public $countries= '';
	public $name = '';
	public $city= '';
	public $province= '';
	public $safeNo = '';
	private $token = '';
	private $username = 'a.terrizzano@net-system.it';
	private $password = 'v|1_;&2vVB2P75yc9eM5biqU';

	private $url = 'https://connect.creditsafe.com/v1/';
	
	function Connect() { 
		$data = array("username" => $this->username, "password" => $this->password);                                                                    
		$data_string = json_encode($data);                                                                                   
																															 
		$ch = curl_init("https://connect.creditsafe.com/v1/authenticate");     
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);                                                                 
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
			'Content-Type: application/json',                                                                                
			'Content-Length: ' . strlen($data_string)
			)                                                                       
		);                                                                                                                   
								
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		$resultjson = json_decode($result, true);
		$this->token = $resultjson['token'];
		return $resultjson;
	}
	function Search(){
		$SearchStr = "";
		$SearchStr = $SearchStr . "countries=" . urlencode($this->countries);
		//if ($this->vatNo != '') $SearchStr = $SearchStr . "&regNo=" . urlencode($this->vatNo);
		if ($this->name != '') $SearchStr = $SearchStr . "&name=" . urlencode($this->name);
		if ($this->city != '') $SearchStr = $SearchStr . "&city=" . urlencode($this->city);
		if ($this->province != '') $SearchStr = $SearchStr . "&province=" . urlencode($this->province);                                                                                  
																		
		$ch=curl_init("https://connect.creditsafe.com/v1/companies?". $SearchStr);      
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);                                                           
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");            
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);                                                                 
		curl_setopt($ch,CURLOPT_HTTPHEADER, array(                                                                          
			'Content-Type: application/json',    
			'Authorization:' . $this->token  
			)                                                                    
		);
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		$resultjson = json_decode($result, true);
		return $resultjson;
	}
	
	function GetReport($new_safeNo){
		$data = array(
				'countries'=> $this->countries,
				'vatNo' => $this->vatNo,
				'name'=> $this->name,
				'city'=> $this->city,
				'province'=> $this->province
			);                                                                    
		$data_string = json_encode($data);                                                                                    
																															 
		$ch = curl_init("https://connect-portal.creditsafe.com/search/report");   
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);                                                                   
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
			'Content-Type: application/json',    
			'Authorization:' . $this->token,
			'Content-Length: ' . strlen($data_string))                                                                       
		);                                                                                                                   
									
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		$resultjson = json_decode($result, true);
		return $resultjson;
	}
}
	
	
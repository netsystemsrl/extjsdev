<?php	

class docparser {
	public $vatNo= '';
	public $countries= '';
	public $name = '';
	public $city= '';
	public $province= '';
	public $safeNo = '';
	private $token = '';
	private $apikey = '69149545da1e7b9986307be01b7187fcc0d8c96a';
	private $url = 'https://api.docparser.com/v1/';
	private $username = '';
	private $password = '';
	
	function Connect($new_username = '', $new_password = '') { 	
		$ch = curl_init();    
		curl_setopt($ch, CURLOPT_URL, $this->url .'ping' .'?' . 'api_key=' . $this->apikey); 
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);   
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		$resultjson = json_decode($result, true);
		return $resultjson;
	}
	function GetModels(){                                                                                   
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->url .'parsers'.'?' . 'api_key=' . $this->apikey); 
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);                                                                                                          
						
		$resultjson = json_decode($result, true);
		return $resultjson;
	}
	function Upload($model= '',$file = ''){				
		$ch = curl_init();    
		if (function_exists('curl_file_create')) { 
		  $cFile = curl_file_create($file);
		} else { 
		  $cFile = '@' . realpath($file);
		}
		$post = array('extra_info' => '123456','file_contents'=> $cFile);

		curl_setopt($ch, CURLOPT_URL, $this->url .'document/upload/' . $model .'?' . 'api_key=' . $this->apikey); 
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);						
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);   
		$resultjson = json_decode($result, true);
		return $resultjson;
	}
	function ParsedList($model= ''){	
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, $this->url .'results/' . $model  .'?' . 'api_key=' . $this->apikey);  
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);						
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

		curl_setopt($ch, CURLOPT_USERPWD, '<secret_api_key>' . ':' . '');

		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		$resultjson = json_decode($result, true);
		return $resultjson;
	}
	function Download($model= '', $idfile= ''){	
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, $this->url .'results/' . $model . '/' . $idfile .'?' . 'api_key=' . $this->apikey);   
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);						
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

		curl_setopt($ch, CURLOPT_USERPWD, '<secret_api_key>' . ':' . '');

		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		$resultjson = json_decode($result, true);
		return $resultjson;
	}
}
	
	
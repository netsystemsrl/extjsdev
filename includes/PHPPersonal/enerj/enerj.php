<?php
class EnerjTx {
	public $apiUrl;
	public $apiToken;
	public $apiUserName;
	public $apiUserPwd;
	public $apiCompanyId;
	public $apiDebug = false;
	// ENUMS
	private $parameterLeftError = ["IsWarning" => false, "IsError" => ["errorCode" => "ParameterError", "errorMessage" => "Missing one or more parameter"]];
	private $parameterTypeError = ["IsWarning" => false, "IsError" => ["errorCode" => "ParameterError", "errorMessage" => "One or more parameter is not valid"]];
	private $body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:ener="http://schemas.datacontract.org/2004/07/Enerj.JFE.Service.WCFJFE">
                  <soapenv:Header/>
                  <soapenv:Body>
                    <tem:|METHOD|>
                      <tem:param>
                        |PARAMS|
                      </tem:param>
                    </tem:|METHOD|>
                  </soapenv:Body>
                </soapenv:Envelope>';
	public function __construct($apiUrl = "") {
		$this->apiUrl = $apiUrl ? $apiUrl : WFVALUEGLOBAL('SDI_ENERJ_LINK');
	}
	private function getBody($method, $params) {
		$xmlParams = [];
		foreach ($params as $key => $value) {
			$xmlParams[] = "<ener:" . $key . ">" . htmlspecialchars($value, ENT_XML1) . "</ener:" . $key . ">";
		}
		$xmlParams = join("\n", $xmlParams);
		$body = str_replace(["|METHOD|", "|PARAMS|"], [$method, $xmlParams], $this->body);
		if (!count($params)) {
			$body = str_replace("<tem:param>\n      </tem:param>", "", $body);
		}
		return $body;
	}
	private function parseXML($xml) {
		return simplexml_load_string($xml);
	}
	private function call($method, $params) {
		if ($this->apiDebug) {
			echo "Calling " . $method . " with params: " . json_encode($params) . BRCRLF;
		}
		$curl = curl_init();
		$headers = ['Content-Type: text/xml; charset=utf-8', "SOAPAction: http://tempuri.org/IWCFJFE/$method"];
		$body = $this->getBody($method, $params);
		if ($this->apiDebug) {
			echo "Calling body: <pre>$body</pre>" . $body . BRCRLF;
		}
		curl_setopt_array($curl, [CURLOPT_URL => $this->apiUrl, CURLOPT_RETURNTRANSFER => true, CURLOPT_ENCODING => '', CURLOPT_MAXREDIRS => 10, CURLOPT_TIMEOUT => 0, CURLOPT_FOLLOWLOCATION => true, CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, CURLOPT_CUSTOMREQUEST => "POST", CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers]);
		$response = curl_exec($curl);
		if ($this->apiDebug) {
			echo "response:";
			print_r($response);
			echo BRCRLF;
		}
		curl_close($curl);
		if (!$response) {
			echo ("ERRORE RISPOSTA VUOTA" . BRCRLF);
			var_dump($response);
			return NULL;
		}
		$start = strpos($response, "<s:Body>") + 8;
		$end = strrpos($response, "</s:Body>");
		$xml = $this->parseXML("<?xml version=\"1.0\" encoding=\"utf-8\"?>" . substr($response, $start, $end - $start));
		if (!$xml) {
			echo ("ERRORE XML" . BRCRLF);
			var_dump($response);
			return NULL;
		}
		// if ($this->apiDebug) {
		//   echo "responseXML:";
		//   var_dump($xml);
		//   echo BRCRLF;
		// }
		$ns = $xml->getNamespaces(true);
		// if ($this->apiDebug) {
		//   echo "responseXML:";
		//   var_dump($ns);
		//   echo BRCRLF;
		// }
		$resultTag = $method . "Result";
		// if ($this->apiDebug) {
		// echo "resultTag:";
		// var_dump($xml->$resultTag->children($ns["a"]));
		//   echo BRCRLF;
		// }
		return $xml->$resultTag->children($ns["a"]);
	}
	private function getError($xml) {
		$ns = $xml->getNamespaces(true);
		if (!$xml->IsError && !$xml->IsWarning) {
			return (["IsWarning" => false, "IsError" => false]);
		}
		$errorList = [];
		$warningList = [];
		if ($xml->IsError) {
			if ($xml->ErrorList) {
				$ErrorList = $xml->ErrorList->children($ns["a"]);
				foreach ($ErrorList as $Error) {
					$errorList[] = ["Code" => ($Error->ErrorCode->__toString()) , "Message" => ($Error->Message->__toString()) ];
				}
			}
		}
		if ($xml->IsWarning) {
			if ($xml->WarningList->__toString()) {
				$warningList = $xml->WarningList->children($ns["a"]);
				foreach ($warningList as $Warn) {
					$warningList[] = ["Code" => "" . ($Warn->WarningCode->__toString()) , "Message" => "" . ($Warn->WarningMessage->__toString()) ];
				}
			}
		}
		return (["IsWarning" => count($warningList) ? $warningList : false, "IsError" => count($errorList) ? $errorList : false]);
	}
	private function getStatus($xml) {
		$ns = $xml->getNamespaces(true);
		$statuses = $xml->children($ns["a"]);
		$invoiceStatus = [];
		foreach ($statuses as $key => $value) {
			$invoiceStatus[$key] = $value->__toString();
		}
		return ($invoiceStatus);
	}
	private function getInvoiceResult($xml) {
		return (["File" => $xml->File->__toString() , "FileName" => $xml->FileName->__toString() ]);
	}
	
    public function DoLogin() {
		if (!$this->apiUserName || !$this->apiUserPwd) {
			return false;
		}
		$res = $this->call("DoLogin", ["TokenOrPassword" => $this->apiUserPwd, 
                                        "Username" => $this->apiUserName, ]);
        if ($this->apiDebug) {
          echo "\nRes: " . $res->asXML();
          echo BRCRLF;
        }
        $ns = $res->getNamespaces(true);
        if ($this->apiDebug) {
            echo "responseXML:";
            var_dump($ns);
            echo BRCRLF;
        }
        $responseData = $res->children($ns["a"]);
        if ($responseData->Error->__toString()) {
            echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
            print_r($this->getError($responseData, true));
            return false;
        }
        [$token] = $res->Token;
        if ($this->apiDebug) {
            echo "TokenOrPassword:";
            var_dump($token);
            echo BRCRLF;
        }
        if (!$token) {
            echo "ERRORE TOKEN VUOTO" . BRCRLF;
            return false;
        }
		$this->apiToken = $token;
        return true;
	}
	public function TestConnection() {
		if (!$this->apiToken || !$this->apiUserName || !$this->apiCompanyId) {
			echo "ERRORE PARAMETRI" . ' apiToken:' . $this->apiToken .
                                      ' apiUserName:' . $this->apiUserName . 
                                      ' companyid:' . $this->apiCompanyId . BRCRLF;
			return false;
		}
		$res = $this->call("TestConnection", []);
		return (["Result" => $res->Result->__toString() , ...$this->getError($res) ]);
	}
	public function InsertInvoiceXML($autoSend, $fileName, $invoiceXml) {
		if (!$this->apiToken || !$this->apiUserName || !$this->apiCompanyId) {
			echo "ERRORE PARAMETRI" . ' apiToken:' . $this->apiToken .
                                      ' apiUserName:' . $this->apiUserName . 
                                      ' companyid:' . $this->apiCompanyId .BRCRLF;
			return false;
		}
		//$decoded = base64_decode($invoiceXml, true);
		//if (!$decoded) {//}
		$invoiceXml = htmlspecialchars(base64_encode($invoiceXml));
		$res = $this->call("InsertInvoiceXML", ["TokenOrPassword" => $this->apiToken, 
                                                "Username" => $this->apiUserName, 
                                                "AutoSend" => !!$autoSend ? "true" : "false", 
                                                "FileName" => $fileName, "InvoiceXml" => $invoiceXml]);
		$guid = $res->InvoiceGuid;
        $response = [];
        if ($res->Error->__toString()) {
          echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
          $response['Error'] = true;
          $response = $this->getError($res);
        }
        $response['Error'] = false;
        $response["FileName"] = $fileName;
		$response["Guid"] = $guid->__toString();
		return $response;
	}
	public function GetInvoiceStatusById($guid) {
		if (!$this->apiUserName || !$this->apiToken || !$guid) {
			echo "ERRORE PARAMETRI" . ' apiToken:' . $this->apiToken .
                                      ' apiUserName:' . $this->apiUserName . 
                                      ' companyid:' . $this->apiCompanyId .
                                      ' guid:' . $guid .BRCRLF;
		}
		$res = $this->call("GetInvoiceStatusById", ["TokenOrPassword" => $this->apiToken, 
													"Username" => $this->apiUserName,
													"Guid" => $guid]);
		return (["InvoiceStatus" => $this->getStatus($res->InvoiceStatus) , ...$this->getError($res) ]);
	}
	public function GetInvoiceByFileName($originalFileName) {
		if (!$this->apiUserName || !$this->apiToken || !$originalFileName) {
			echo "ERRORE PARAMETRI" . ' apiToken:' . $this->apiToken .
                                      ' apiUserName:' . $this->apiUserName . 
                                      ' apiCompanyId:' . $this->apiCompanyId .
                                      ' originalFileName:' . $originalFileName .BRCRLF;
		}
		$res = $this->call("GetInvoiceByFileName", ["TokenOrPassword" => $this->apiToken, 
													"Username" => $this->apiUserName,
													"CompanyId" => $this->apiCompanyId,
													"OriginalFileName" => $originalFileName,
													"Format" => 'XML']);
		$response = [];
        if ($res->IsError->__toString()) {
          $response['Error'] = true;
          $response = $this->getError($res);
        }
        $response['Error'] = false;
		return $response;
		
		//return ([...$this->getInvoiceResult($res) , ...$this->getError($res) ]);
	}
	// TODO: TEST
	public function GetInvoiceHistoryByFileName($originalFileName, $format = "XML") {
		if (!$this->apiUserName || !$this->apiToken || !$this->apiCompanyId || !$originalFileName) {
			return (["InvoiceStatusList" => NULL, ...$this->parameterLeftError]);
		}
		if (!is_numeric($this->apiCompanyId)) {
			return (["InvoiceStatusList" => NULL, ...$this->parameterTypeError]);
		}
		$res = $this->call("GetInvoiceHistoryByFileName", ["TokenOrPassword" => $this->apiToken, "Username" => $this->apiUserName, "CompanyId" => $this->apiCompanyId, "OriginalFileName" => $originalFileName, "Format" => $format]);
		$ns = $res->getNamespaces(true);
		$statusList = $res->InvoiceStatusList->children($ns["a"]);
		$invoiceStatusList = [];
		foreach ($statusList as $status) {
			$invoiceStatusList[] = $this->getStatus($status);
		}
		return (["InvoiceStatusList" => $invoiceStatusList, ...$this->getError($res) ]);
	}
	public function GetInvoiceStatusByFileName($originalFileName) {
		if (!$this->apiUserName || !$this->apiToken || !$this->apiCompanyId || !$originalFileName) {
			return (["InvoiceStatus" => NULL, ...$this->parameterLeftError]);
		}
		if (!is_numeric($this->apiCompanyId)) {
			return (["InvoiceStatus" => NULL, ...$this->parameterTypeError]);
		}
		$res = $this->call("GetInvoiceStatusByFileName", ["TokenOrPassword" => $this->apiToken, "Username" => $this->apiUserName, "CompanyId" => $this->apiCompanyId, "OriginalFileName" => $originalFileName, ]);
		$error = $this->getError($res);
		if (!!$error["IsError"]) {
			return (["InvoiceStatusList" => NULL, ...$error]);
		}
		$ns = $res->getNamespaces(true);
		$statusList = $res->InvoiceStatusList->children($ns["a"]);
		$invoiceStatusList = [];
		foreach ($statusList as $status) {
			$invoiceStatusList[] = $this->getStatus($status);
		}
		return (["InvoiceStatusList" => $invoiceStatusList, ...$this->getError($res) ]);
	}
	// TODO: TEST
	public function GetInvoiceById($guid, $format = "XML") {
		if (!$this->apiUserName || !$this->apiToken || !$guid) {
			return ["File" => NULL, "FileName" => NULL, ...$this->parameterLeftError];
		}
		$res = $this->call("GetInvoicebyId", ["TokenOrPassword" => $this->apiToken, "Username" => $this->apiUserName, "Guid" => $guid, "Format" => $format]);
		return ([...$this->getInvoiceResult($res) , ...$this->getError($res) ]);
	}
	public function GetInvoiceHistoryById($guid, $format = "XML") {
		if (!$this->apiUserName || !$this->apiToken || !$guid) {
			return (["InvoiceStatusList" => NULL, ...$this->parameterLeftError]);
		}
		$res = $this->call("GetInvoiceHistoryById", ["TokenOrPassword" => $this->apiToken, "Username" => $this->apiUserName, "Guid" => $guid, "Format" => $format]);
		$ns = $res->getNamespaces(true);
		$statusList = $res->InvoiceStatusList->children($ns["a"]);
		$invoiceStatusList = [];
		foreach ($statusList as $status) {
			$invoiceStatusList[] = $this->getStatus($status);
		}
		return (["InvoiceStatusList" => $invoiceStatusList, ...$this->getError($res) ]);
	}
	// TODO: TEST
	public function GetInvoiceByKeys($invoiceDate, $invoiceNumber, $invoiceType, $format) {
		if (!$this->apiUserName || !$this->apiToken || !$this->apiCompanyId || !$invoiceDate || !$invoiceNumber || !$invoiceType || !$format) {
			return (["File" => NULL, "FileName" => NULL, ...$this->parameterLeftError]);
		}
		if (!is_numeric($this->apiCompanyId)) {
			return (["File" => NULL, "FileName" => NULL, ...$this->parameterTypeError]);
		}
		$res = $this->call("GetInvoiceByKeys", ["TokenOrPassword" => $this->apiToken, "Username" => $this->apiUserName, "CompanyId" => $this->apiCompanyId, "InvoiceDate" => $invoiceDate, "InvoiceNumber" => $invoiceNumber, "InvoiceType" => $invoiceType, "Format" => $format]);
		return ([...$this->getInvoiceResult($res) , ...$this->getError($res) ]);
	}
	public function GetInvoiceHistoryByKeys($invoiceDate, $invoiceNumber, $invoiceType, $originalFileName, $format = "XML") {
		if (!$this->apiUserName || !$this->apiToken || !$this->apiCompanyId || !$invoiceDate || !$invoiceNumber || !$invoiceType) {
			return (["File" => NULL, "FileName" => NULL, ...$this->parameterLeftError]);
		}
		if (!is_numeric($this->apiCompanyId)) {
			return (["File" => NULL, "FileName" => NULL, ...$this->parameterTypeError]);
		}
		$res = $this->call("GetInvoiceHistoryByFileName", ["TokenOrPassword" => $this->apiToken, "Username" => $this->apiUserName, "CompanyId" => $this->apiCompanyId, "InvoiceDate" => $invoiceDate, "InvoiceNumber" => $invoiceNumber, "InvoiceType" => $invoiceType, "Format" => $format, "OriginalFileName" => $originalFileName]);
		$ns = $res->getNamespaces(true);
		$statusList = $res->InvoiceStatusList->children($ns["a"]);
		$invoiceStatusList = [];
		foreach ($statusList as $status) {
			$invoiceStatusList[] = $this->getStatus($status);
		}
		return (["InvoiceStatusList" => $invoiceStatusList, ...$this->getError($res) ]);
	}
	public function GetInvoiceStatusByKeys($invoiceDate, $invoiceNumber, $invoiceType, $originalFileName, $format = "XML") {
		if (!$this->apiUserName || !$this->apiToken || !$this->apiCompanyId || !$invoiceDate || !$invoiceNumber || !$invoiceType) {
			echo "1";
			return (["File" => NULL, "FileName" => NULL, ...$this->parameterLeftError]);
		}
		if (!is_numeric($this->apiCompanyId)) {
			echo "2";
			return (["File" => NULL, "FileName" => NULL, ...$this->parameterTypeError]);
		}
		$res = $this->call("GetInvoiceStatusById", ["TokenOrPassword" => $this->apiToken, "Username" => $this->apiUserName, "CompanyId" => $this->apiCompanyId, "InvoiceDate" => $invoiceDate, "InvoiceNumber" => $invoiceNumber, "InvoiceType" => $invoiceType, "OriginalFileName" => $originalFileName, "Format" => $format]);
		return (["InvoiceStatus" => $this->getStatus($res->InvoiceStatus) , ...$this->getError($res) ]);
	}
}
class EnerjRx {
	public $apiUrl;
	public $apiToken;
	public $apiUserName;
	public $apiUserPwd;
	public $apiCompanyId;
	public $apiDebug = false;
	// ENUMS
	public $viewed_state = ["ALL", "READ", "NOT_READ"];
	public $archive_state = ["ALL", "NOT_ARCHIVED", "ARCHIVING_IN_PROGRESS", "ARCHIVED", ];
	public $register_state = ["ALL", "NOT_REGISTERED", "REGISTERED"];
	public $export_state = ["ALL", "NOT_EXPORTED", "EXPORT_IN_PROGRESS", "EXPORTED", ];
	public $attachments = ["ALL", "WITH_ATTACHMENT", "WITHOUT_ATTACHMENT"];
	public $dispatched = ["ALL", "NOT_DISPATCHED", "DISPATCHED"];
	private $parameterLeftError = ["IsWarning" => false, "IsError" => ["errorCode" => "ParameterError", "errorMessage" => "Missing one or more parameter", ], ];
	private $parameterTypeError = ["IsWarning" => false, "IsError" => ["errorCode" => "ParameterError", "errorMessage" => "One or more parameter is not valid", ], ];
	private $body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:jfep="http://schemas.datacontract.org/2004/07/JFEP_WebServiceSAAS" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
                    <soapenv:Header/>
                      <soapenv:Body>
                        <tem:|METHOD|>
                          <tem:param>
                            |PARAMS|
                          </tem:param>
                        </tem:|METHOD|>
                      </soapenv:Body>
                    </soapenv:Envelope>';
	public function __construct($apiUrl = "") {
		$this->apiUrl = $apiUrl ? $apiUrl : WFVALUEGLOBAL("SDI_ENERJ_LINK");
	}
	private function getBody($method, $params) {
		$xmlParams = [];
		foreach ($params as $key => $value) {
			$xmlParams[] = "<jfep:$key>" . ($key === "barcodes" ? $this->parseBarcodes($value) : htmlspecialchars($value)) . "</jfep:$key>";
		}
		$xmlParams = join("        \n", $xmlParams);
		$body = str_replace(["|METHOD|", "|PARAMS|"], [$method, $xmlParams], $this->body);
		if (!count($params)) {
			$body = str_replace("<jfep:param>\n      </jfep:param>", "", $body);
		}
		return $body;
	}
	private function parseXML($xml) {
		return simplexml_load_string($xml);
	}
	private function call($method, $params) {
		if ($this->apiDebug) {
		   echo "Calling " . $method . " with params: " . json_encode($params) . BRCRLF;
		}
		$curl = curl_init();
		$headers = ["Content-Type: text/xml; charset=utf-8", "SOAPAction: http://tempuri.org/IJFEP_WebService/$method", ];
		$body = $this->getBody($method, $params);
		if ($this->apiDebug) {
          echo "Calling body:\n" . $body . BRCRLF;
		}
		curl_setopt_array($curl, [CURLOPT_URL => $this->apiUrl, CURLOPT_RETURNTRANSFER => true, CURLOPT_ENCODING => "", CURLOPT_MAXREDIRS => 10, CURLOPT_TIMEOUT => 0, CURLOPT_FOLLOWLOCATION => true, CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, CURLOPT_CUSTOMREQUEST => "POST", CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers, ]);
		$response = curl_exec($curl);
		if ($this->apiDebug) {
          echo "response:";
          print_r($response);
		  echo BRCRLF;
		}
		curl_close($curl);
		if (!$response) {
			echo "ERRORE RISPOSTA VUOTA" . BRCRLF;
			var_dump($response);
			return null;
		}
		$start = strpos($response, "<s:Body>") + 8;
		$end = strrpos($response, "</s:Body>");
		$xml = $this->parseXML("<?xml version=\"1.0\" encoding=\"utf-8\"?>" . substr($response, $start, $end - $start));
		if (!$xml) {
			echo "ERRORE XML" . BRCRLF;
			var_dump($response);
			return null;
		}
		if ($this->apiDebug) {
          echo "responseXML:";
          var_dump($xml);
          echo BRCRLF;
		}
		$ns = $xml->getNamespaces(true);
		if ($this->apiDebug) {
          echo "responseXML:";
          var_dump($ns);
          echo BRCRLF;
		}
		$resultTag = $method . "Result";
        if ($this->apiDebug) {
          echo "resultTag:";
          var_dump($xml->$resultTag->children($ns["a"]));
          echo BRCRLF;
		}
		return $xml->$resultTag;
	}
	private function getError($xml, $json = false) {
		$errorMessage = $json ? explode(": ", $xml->Error) : [$xml->Error];
		return ["IsException" => $xml->ErrorException ? $xml->ErrorException->__toString() : false, "IsError" => [$json ? "errorFunction" : "errorMessage" => (string)$errorMessage[0], ...$json ? json_decode($errorMessage[1], true) : [], ], ];
	}
	private function getInvoiceWS($xml) {
		$stateIdArchived = ["30" => "NOT_ARCHIVED", "32" => "ARCHIVING_IN_PROGRESS", "33" => "ARCHIVED", ];
		$stateIdExport = ["0" => "TO_EXPORT", "40" => "EXPORT_IN_PROGRESS", "41" => "EXPORTED", ];
		$stateIdView = ["11" => "NOT_READ", "10" => "READ"];
		$invoiceRegistered = ["0" => "NOT_REGISTERED", "1" => "REGISTERED"];
		$hasAttachment = ["0" => "WITHOUT_ATTACHMENT", "1" => "WITH_ATTACHMENT", ];
		$isDispatched = ["0" => "NOT_DISPATCHED", "1" => "DISPATCHED"];
		$ns = $xml->getNamespaces(true);
		$statuses = $xml->children($ns["b"]);
		$invoiceStatus = [];
		foreach ($statuses as $key => $value) {
			switch ($key) {
				case "state_id_archive":
					$invoiceStatus["state_id_archive"] = $stateIdArchived[$value->__toString() ];
				break;
				case "state_id_export":
					$invoiceStatus["state_id_export"] = $stateIdExport[(int)$value->__toString() ];
				break;
				case "state_id_view":
					$invoiceStatus["state_id_view"] = $stateIdView[$value->__toString() ];
				break;
				case "invoice_registered":
					$invoiceStatus["invoice_registered"] = $invoiceRegistered[(int)$value->__toString() ];
				break;
				case "hasattachments":
					$invoiceStatus["hasattachments"] = $hasAttachment[(int)$value->__toString() ];
				break;
				case "isdispatched":
					$invoiceStatus["isdispatched"] = $isDispatched[(int)$value->__toString() ];
				break;
				default:
					$invoiceStatus[$key] = $value->__toString();
				break;
			}
		}
		return $invoiceStatus;
	}
	private function parseBarcodes($barcodes) {
      $result = "";
      foreach ($barcodes as $barcode) {
          $result .= "<arr:string>$barcode</arr:string>";
      }
      return $result;
	}
	
    public function DoLogin() {
      if (!$this->apiUserName || !$this->apiUserPwd) {
          return false;
      }
      $res = $this->call("DoLogin", [ "TokenOrPassword" => $this->apiUserPwd, 
                                      "username" => $this->apiUserName, ]);
      if ($this->apiDebug) {
          echo "\nRes: " . $res->asXML();
          echo BRCRLF;
      }
      $ns = $res->getNamespaces(true);
      if ($this->apiDebug) {
          echo "responseXML:";
          var_dump($ns);
          echo BRCRLF;
      }
      $responseData = $res->children($ns["a"]);
      if ($responseData->Error->__toString()) {
          echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
          print_r($this->getError($responseData, true));
          return false;
      }
      [$token] = $responseData->Response->children($ns["b"]);
      if ($this->apiDebug) {
          echo "TokenOrPassword:";
          var_dump($token);
          echo BRCRLF;
      }
      if (!$token) {
          echo "ERRORE TOKEN VUOTO" . BRCRLF;
          return false;
      }
      $this->apiToken = $token;
      return true;
	}
	public function getDocumentList($archiveState = "ALL", $dispatched = "ALL", $export_state = "ALL", $registerState = "ALL", $viewedState = "ALL") {
      if (!$this->apiToken || !$this->apiUserName || !$this->apiCompanyId) {
          echo "ERRORE PARAMETRI" . BRCRLF;
          return false;
      }
      $res = $this->call("GetDocumentList", [ "TokenOrPassword" => $this->apiToken, 
                                              "username" => $this->apiUserName, 
                                              "company_id" => $this->apiCompanyId,
                                              "archive_state" => $archiveState,
                                              //"received_date_from" => "2022-01-01", 
                                              //"received_date_to" => "2022-12-31", 
											  "attachments" => 'ALL', 
											  "dispatched" => $dispatched, 
											  "export_state" => $export_state, 
                                              "register_state" => $registerState, 
                                              "viewed_state" => $viewedState, 
                                              "language" => "it", 
                                              "number_of_rows" => 100, 
                                              "page_number" => 1, ]);
      if ($this->apiDebug) {
          echo "res:";
          var_dump($res->asXML());
          echo BRCRLF;
      }
      $ns = $res->getNamespaces(true);
      if ($this->apiDebug) {
          echo "responseXML:";
          var_dump($ns);
          echo BRCRLF;
      }
      $responseData = $res->children($ns["a"]);
      if ($responseData->Error->__toString()) {
          echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
          print_r($this->getError($responseData, false));
          return false;
      }
      $data = $responseData->Response->children($ns["b"]);
      $invoices = $data->invoices->children($ns["b"]);
      $pages = (int)$data->pages->__toString();
      $documents = [];
      foreach ($invoices as $invoice) {
          $parsedInvoice = $this->getInvoiceWS($invoice);
          $documents[] = $parsedInvoice;
          if ($this->apiDebug) {
            echo BRCRLF . "INVOIC:" . BRCRLF;
            var_dump($parsedInvoice);
          }
      }
      return ["Invoices" => $documents, "TotalPages" => $pages, ];
	}
	public function getDocument($barcode, $outputType = "original") {
		if (!$barcode || !$this->apiToken || !$this->apiUserName || !$this->apiCompanyId || !in_array($outputType, ["original", "unsigned_xml"])) {
			echo "ERRORE PARAMETRI" . BRCRLF;
			return false;
		}
		$res = $this->Call("GetDocument", ["TokenOrPassword" => $this->apiToken, 
                                          "username" => $this->apiUserName, 
                                          "company_id" => $this->apiCompanyId, 
                                          "barcode" => $barcode, 
                                          "output_type" => $outputType, ]);
		if ($this->apiDebug) {
			echo "res:";
			var_dump($res->asXML());
			echo BRCRLF;
		}
		$ns = $res->getNamespaces(true);
		if ($this->apiDebug) {
			echo "responseXML:";
			var_dump($ns);
			echo BRCRLF;
		}
		$responseData = $res->children($ns["a"]);
		if ($responseData->Error->__toString()) {
			echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
			print_r($this->getError($responseData, false));
			return $this->getError($responseData, false);
		}
		$document = $responseData->Response->children($ns["b"]);
		$response = [];
		$response["Document"] = base64_decode($document->docuement->__toString());
		$response["FileName"] = $document->filename->__toString();
		$response["IdSdi"] = $document->id_sdi->__toString();
		return $response;
	}
	
    public function setDocumentStatusExport($barcode) {
		if (!$barcode || !$this->apiToken || !$this->apiUserName || !$this->apiCompanyId ) {
			echo "ERRORE PARAMETRI" . BRCRLF;
			return false;
		}
		$res = $this->Call("SetDocumentStatusExport", ["TokenOrPassword" => $this->apiToken, 
														"username" => $this->apiUserName, 
														"company_id" => $this->apiCompanyId,
														"barcodes" =>  array("arr:string" => $barcode)
														]);
		if ($this->apiDebug) {
			echo "res:";
			var_dump($res->asXML());
			echo BRCRLF;
		}
		$ns = $res->getNamespaces(true);
		if ($this->apiDebug) {
			echo "responseXML:";
			var_dump($ns);
			echo BRCRLF;
		}
		$responseData = $res->children($ns["a"]);
		//
		if ($responseData->Error->__toString()) {
			echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
			print_r($this->getError($responseData, false));
			return false;
		}
		return (bool)$responseData->Response->__toString();
	}
	public function setDocumentStatusDispatch($barcode ,) {
		if (!$barcode || !$this->apiToken || !$this->apiUserName || !$this->apiCompanyId ) {
			echo "ERRORE PARAMETRI" . BRCRLF;
			return false;
		}
		$res = $this->Call("SetDocumentStatusDispatch", ["TokenOrPassword" => $this->apiToken, 
															"username" => $this->apiUserName, 
															"company_id" => $this->apiCompanyId, 
															"barcodes" =>  array("arr:string" => $barcode)
															"dispatch_status" => "DISPATCHED", ]);
		if ($this->apiDebug) {
			echo "res:";
			var_dump($res->asXML());
			echo BRCRLF;
		}
		$ns = $res->getNamespaces(true);
		if ($this->apiDebug) {
			echo "responseXML:";
			var_dump($ns);
			echo BRCRLF;
		}
		$responseData = $res->children($ns["a"]);
		//
		if ($responseData->Error->__toString()) {
			echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
			print_r($this->getError($responseData, false));
			return false;
		}
		return (bool)$responseData->Response->__toString();
	}
    // TODO: TEST
	
	public function getDocumentListCount($archiveState = "ALL", $dispatched = "ALL", $export_state = "ALL", $registerState = "ALL", $viewedState = "ALL") {
		if ($this->apiDebug) {
			echo "Token: " . $this->apiToken . BRCRLF;
		}
		if (!$this->apiToken) {
			echo "ERRORE TOKEN VUOTO" . BRCRLF;
			return false;
		}
		$res = $this->call("GetDocumentListCount", ["TokenOrPassword" => $this->apiToken, 
													"username" => $this->apiUserName, 
													"company_id" => $this->apiCompanyId, 
													"archive_state" => $archiveState, 
													"register_state" => $registerState, 
													"viewed_state" => $viewedState, 
													"language" => "it", 
													"number_of_rows" => 1, 
													"page_number" => 1,
													//   "received_date_to>2022-12-31</jfep:received_date_to>
													]);
		if ($this->apiDebug) {
			echo "\nRes: " . $res->asXML();
			echo BRCRLF;
		}
		$ns = $res->getNamespaces(true);
		if ($this->apiDebug) {
			echo "responseXML:";
			var_dump($ns);
			echo BRCRLF;
		}
		$responseData = $res->children($ns["a"]);
		if ($responseData->Error->__toString()) {
			echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
			print_r($this->getError($responseData, false));
			return false;
		}
		return (int)$responseData->Response->__toString();
	}
	public function preserveDocument($barcode) {
		if (!$barcode || !$this->apiToken || !$this->apiUserName || !$this->apiCompanyId) {
			return false;
		}
		$res = $this->Call("PreserveDocument", ["TokenOrPassword" => $this->apiToken, "username" => $this->apiUserName, "company_id" => $this->apiCompanyId, "barcode" => $barcode, ]);
		if ($this->apiDebug) {
			echo "\nRes: " . $res->asXML();
			echo BRCRLF;
		}
		$ns = $res->getNamespaces(true);
		if ($this->apiDebug) {
			echo "responseXML:";
			var_dump($ns);
			echo BRCRLF;
		}
		$responseData = $res->children($ns["a"]);
		if ($responseData->Error->__toString()) {
			echo "ERROR " . $responseData->Error->__toString() . BRCRLF;
			print_r($this->getError($responseData, false));
			return false;
		}
		return (bool)$responseData->Response->__toString();
	}
}
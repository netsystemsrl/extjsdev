<?php
  class AndxorSDK {
    public $apiDebug = false;
    public $isGestione = true; // true: login con Cedente; false: login con Cedente e Gestione
    public $idPaeseLogin;
    public $idCodiceLogin;
    public $passwordLogin;
    public $gestioneIdPaese;
    public $gestioneIdCodice;
    public $faultCode;
    public $faultString;
    public $apiUrl = "https://tinv.andxor.it:443/userServices";
    
    public $token;
    
    private $body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsdl="http://www.andxor.com/fatturapa/wsdl">
                 <soapenv:Header/>
                 <soapenv:Body>
                    <wsdl:|METHOD|>
                       |LOGIN|
                       |PARAMS|
                    </wsdl:|METHOD|>
                 </soapenv:Body>
              </soapenv:Envelope>';
    
    public function __construct($apiUrl = NULL, $idPaeseLogin = NULL, $idCodiceLogin = NULL, $passwordLogin = NULL) {
      $this->apiUrl        = $apiUrl        != NULL ? $apiUrl        : "https://tinv.andxor.it:443/userServices";
      $this->idPaeseLogin  = $idPaeseLogin  != NULL ? $idPaeseLogin  : "IT";
      $this->idCodiceLogin = $idCodiceLogin != NULL ? $idCodiceLogin : "02519290353";
      $this->passwordLogin = $passwordLogin != NULL ? $passwordLogin : "H2Software@2021@";
    }
    
    private function getBody($method, $params) {
      $xmlParams = [];
      foreach ($params as $key => $value) {
        $xmlParams[] = "<$key>" . htmlspecialchars($value, ENT_XML1) . "</$key>";
      }
      
      $xmlParams = join("\n", $xmlParams);
      
      $body = str_replace(["|LOGIN|", "|METHOD|", "|PARAMS|"], [$this->getLogin(), $method, $xmlParams], $this->body);
      
      if (!count($params)) {
        $body = str_replace("<tem:param>\n      </tem:param>", "", $body);
      }
      
      return $body;
    }
    
    private function parseXML($xml) {
      return simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOWARNING | LIBXML_NOERROR);
    }
    
    private function getLogin() {
      return (
        "<Autenticazione>
          <Cedente>
            <IdPaese>$this->idPaeseLogin</IdPaese>
            <IdCodice>$this->idCodiceLogin</IdCodice>
          </Cedente>
          <Password>$this->passwordLogin</Password>
          " . (
        $this->isGestione && $this->gestioneIdPaese && $this->gestioneIdCodice ?
          "<Gestione>
                <IdPaese>$this->gestioneIdPaese</IdPaese>
                <IdCodice>$this->gestioneIdCodice</IdCodice>
              </Gestione>" : ""
        ) . "
        </Autenticazione>"
      );
    }
    
    private function call($method, $params) {
      if ($this->apiDebug) {
        echo "Calling " . $method . " with params: " . json_encode($params) . BRCRLF;
      }
      
      $curl = curl_init();
      $headers = ['Content-Type: text/xml; charset=utf-8', "SOAPAction: http://tempuri.org/IWCFJFE/$method"];
      $body = $this->getBody($method, $params);
      
      if ($this->apiDebug) {
        echo "------------" . BRCRLF;
        echo "Calling body:" . BRCRLF . $body . BRCRLF;
        echo "------------" . BRCRLF;
      }
      
      curl_setopt_array($curl, [CURLOPT_URL => $this->apiUrl, CURLOPT_RETURNTRANSFER => true, CURLOPT_ENCODING => '', CURLOPT_MAXREDIRS => 10, CURLOPT_TIMEOUT => 0, CURLOPT_FOLLOWLOCATION => true, CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, CURLOPT_CUSTOMREQUEST => "POST", CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers]);
      curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
      curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
      $response = curl_exec($curl);

      if ($this->apiDebug) {
        echo "response:";
        print_r($response);
        echo BRCRLF;
      }
      
      curl_close($curl);
      
      if (!$response) {
        echo("ERRORE RISPOSTA VUOTA" . BRCRLF);
        var_dump($response);
        return NULL;
      }
      
      $start = strpos($response, "<S:Body>") + 8;
      $end = strrpos($response, "</S:Body>");
      
      $xml = $this->parseXML("<?xml version=\"1.0\" encoding=\"utf-8\"?>" . substr($response, $start, $end - $start));
      
      if (!$xml) {
        preg_match("/<S:Body.*>[\s\S]*?<\/S:Body>/m", $response, $matches);
        if ($matches){
          $mXML = $this->parseXML($matches[0]);
          return ["faultcode" => (string)$mXML->{"S:Fault"}->faultcode, "faultstring" => (string)$mXML->{"S:Fault"}->faultstring];
        }
        else{
            return ["faultcode" => '00', "faultstring" => 'no response'];
        }
            
      }
      
      return $xml;
    }
    
    public function login() {
      $response = $this->call("LoginReq", []);
      
      if ($response != false){
        if (array_key_exists( 'faultcode',(array)$response)) { 
          $this->token = null;
          $this->faultCode = $response['faultcode'];
          $this->faultString= $response['faultstring'];
          return false;
        }
        else{           
          $this->token = $response->Token;
          if ($this->apiDebug) {
            echo "Token: " . $this->token . BRCRLF;
          }
          
          $this->faultCode = null;
          $this->faultString= null;
          return $this->token;
        }
      }
      else{
         return false;
      }
    }
    
    public function elencoFatture($filters = []) {
      $isSetDate = false;
      
      foreach ($filters as $key => $value) {
        
        if (
          !in_array(
            $key,
            ["Testo", "DataInizio", "DataOraInizio", "DataFine", "DataOraFine", "Limite", "DataParam",]
          )) {
          unset($filters[$key]);
          continue;
        }
        
        if (in_array($key, ["DataInizio", "DataFine"])) {
          $isSetDate = true;
          $filters[$key] = $value->format("Y-m-d");
        } elseif (in_array($key, ["DataOraInizio", "DataOraFine"])) {
          $isSetDate = true;
          $filters[$key] = $value->format("Y-m-d\TH:i:s");
        }
      }
      
      if (!$isSetDate) {
        echo "Errore parametri data non impostati, utilizza almeno uno tra i parametri 'DataInizio', 'DataFine' o 'DataOraInizio', 'DataOraFine'" . BRCRLF;
        return false;
      }
      
      $response = $this->call("Filter", $filters);
      
      return $response->Fattura;
    }
    
    public function Download(  $ProgressivoInvio = NULL, $ProgressivoRicezione  = NULL, $minimal = NULL) {
      
      if (!$ProgressivoInvio ) {
        echo "Errore parametri 'ProgressivoInvio'sono obbligatori" . BRCRLF;
        return false;
      }
      
      if ($ProgressivoInvio) {
        $others["ProgressivoInvio"] = $ProgressivoInvio;
      }
      if ($ProgressivoRicezione) {
        $others["ProgressivoRicezione"] = $ProgressivoRicezione;
      }
      
      if ($minimal) {
        $others["Minimal"] = $minimal;
      }
      
      $response = $this->call("Query", $others);
      return $response;
    }
    
    public function pasvElencoFatture($filters = []) {
      $isSetDate = false;
      
      if (!isset($filters["IncludiArchiviate"])) {
        echo "Errore parametri 'IncludiArchiviate' è obbligatoria" . BRCRLF;
        return false;
      }
      
      foreach ($filters as $key => $value) {
        if (
          !in_array(
            $key,
            ["IncludiArchiviate", "Testo", "DataInizio", "DataOraInizio", "DataFine", "DataOraFine", "Limite", "DataParam",]
          )
        ) {
          unset($filters[$key]);
          continue;
        }
        
        if (in_array($key, ["DataInizio", "DataFine"])) {
          $isSetDate = true;
          $filters[$key] = $value->format("Y-m-d");
        } 
        elseif (in_array($key, ["DataOraInizio", "DataOraFine"])) {
          $isSetDate = true;
          $filters[$key] = $value->format("Y-m-d\TH:i:s");
        }
      }
      
      if (!$isSetDate) {
        echo "Errore parametri data non impostati, utilizza almeno uno tra i parametri 'DataInizio', 'DataFine' o 'DataOraInizio', 'DataOraFine'" . BRCRLF;
        return false;
      }
      
      $response = $this->call("PasvFilter", $filters);
      
      return $response;
    }
    
    public function pasvDownload($identificativoSdI, $posizione = NULL, $unwrap = NULL, $minimal = NULL) {
      if (!$identificativoSdI) {
        echo "Errore parametri 'identificativoSdI' è obbligatorio" . BRCRLF;
        return false;
      }
      if (!$posizione || !$unwrap) {
        echo "Errore parametri 'posizione' e 'unwrap' sono obbligatori" . BRCRLF;
        return false;
      }
      
      $others = [
        "IdentificativoSdI" => $identificativoSdI,
      ];
      if ($posizione) {
        $others["Posizione"] = $posizione;
      }
      if ($unwrap) {
        $others["Unwrap"] = $unwrap;
      }
      
      if ($minimal) {
        $others["Minimal"] = $minimal;
      }
      
      $response = $this->call("PasvQuery", $others);
      return $response;
    }
    
    public function stato($progressivoInvio) {
      if (!$progressivoInvio) {
        echo "Errore parametri 'progressivoInvio' è obbligatorio" . BRCRLF;
        return false;
      }
      
      $response = $this->call(
        "SimpleQuery",
        ["ProgressivoInvio" => $progressivoInvio]
      );
      
      return $response;
    }
    
    public function invioFattura($fattura = []) {
      $response = $this->call("FatturaExt", $fattura);
      
      return $response;
    }
    
  }
  
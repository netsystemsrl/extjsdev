<?php
define("CR", chr(13));
define("LF", chr(10));

const CRLF = "<br>";
const BRCRLF = "<br>";

ini_set("xdebug.var_display_max_children", "-1");
ini_set("xdebug.var_display_max_data", "-1");
ini_set("xdebug.var_display_max_depth", "-1");

class ZucchettiSDK
{
  public $apiUrl;
  public $apiUserName;
  public $apiUserPwd;
  public $apiCompany;
  public $apiDebug = false;

  private $body = '<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <zpers_corteparma_badge_|METHOD| xmlns="http://zpers_corteparma_badge.ws.localhost/">
            |PARAMS|
          </zpers_corteparma_badge_|METHOD|>
        </soap:Body>
      </soap:Envelope>';

  public function __construct($apiUrl = "")
  {
    $this->apiUrl = $apiUrl ? $apiUrl : WFVALUEGLOBAL('SDI_ZUCCHETTI_LINK');
    // $this->apiUrl = $apiUrl; // ? $apiUrl : WFVALUEGLOBAL('SDI_ZUCCHETTI_LINK');

    if ($this->apiDebug) {
      echo "apiUrl: " . $this->apiUrl . BRCRLF;
    }
  }

  private function getBody($method, $params)
  {
    $xmlParams = [];
    foreach ($params as $key => $value) {
      $xmlParams[] = "<m_" . $key . ">" . htmlspecialchars($value, ENT_XML1) . "</m_" . $key . ">";
    }

    $xmlParams = join("\n", $xmlParams);

    $body = str_replace(["|METHOD|", "|PARAMS|"], [$method, $xmlParams], $this->body);

    if (!count($params)) {
      $body = str_replace("<tem:param>\n      </tem:param>", "", $body);
    }

    if ($this->apiDebug) {
      echo "Body: " . $body . BRCRLF;
    }

    return $body;
  }

  private function parseXML($xml)
  {
    return simplexml_load_string($xml);
  }

  private function call($method, $params)
  {
    if ($this->apiDebug) {
      echo "Calling " . $method . " with params: " . json_encode($params) . BRCRLF;
    }

    $curl = curl_init();
    $headers = ['Content-Type: text/xml; charset=utf-8'];
    $body = $this->getBody($method, $params);

    if ($this->apiDebug) {
      echo "Calling body: <pre>$body</pre>" . $body . BRCRLF;
    }

    curl_setopt_array($curl, [
      CURLOPT_URL => $this->apiUrl,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => '',
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => "POST",
      CURLOPT_POSTFIELDS => $body,
      CURLOPT_HTTPHEADER => $headers
    ]);

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

    $xml = $this->parseXML($response);

    $body = $xml->children('soap', true)->Body->children()[0];
    if ($this->apiDebug) {
      echo "Response body: " . $body . BRCRLF;
    }
    return $body;
  }

  public function getTabularData()
  {
    $res = $this->call("TabularQuery", [
      "UserName" => $this->apiUserName,
      "Password" => $this->apiUserPwd,
      "Company" => $this->apiCompany
    ])[0];

    if($this->apiDebug) {
      echo "Res: ";
      var_dump($res);
    }

    $records = [];

    foreach ($res->Records->item as $val) {
      $records[] = (array)$val;
    }

    return $records;
  }
}

// $zucchetti = new ZucchettiSDK("http://hr.studiofurlotti.it:80/PresJ/servlet/SQLDataProviderServer/zpers_corteparma_badge");
// $zucchetti->apiUserName = "utente_WSCORTEPARMA"; //WFVALUEGLOBAL('SDI_ZUCCHETTI_USERNAME');
// $zucchetti->apiUserPwd = "Zucchetti123!"; //WFVALUEGLOBAL('SDI_ZUCCHETTI_PASSWORD');
// $zucchetti->apiCompany = "001"; //WFVALUEGLOBAL('SDI_ZUCCHETTI_COMPANY');
// $res = $zucchetti->getTabularData();
// echo "<pre>";
// var_dump($res);
// echo "</pre>";

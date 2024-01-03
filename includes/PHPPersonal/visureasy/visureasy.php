<?php

    class SISApiSDK {

      // --------- Url ---------
      public $apiVersion = "v1";
      public $apiUrl = "https://api.visureasy.com/api/";

      // --------- Tokens ---------
      public $apiBearer;
      public $xsrfToken;
      public $sessionToken;
      public $intestatiStatusUri = NULL;
      public $intestatiResultUri = NULL;

      public $apiDebug = false;

      // --------- Retry ---------
      public $retryAfter;
      public $maxRetry = 10;
      public $retryCount = 0;

      // --------- Default functions ---------
      public function __construct($apiUrl = "") {
        $this->apiUrl = $apiUrl ? $apiUrl : $this->apiUrl;

        if ($this->apiDebug) {
          echo "apiUrl: " . $this->apiUrl . BRCRLF;
        }
      }

      private function call($endopoint, $params) {
        if ($this->apiDebug) {
          echo "call \n";
        };

        $curl = curl_init();

        if ($this->apiDebug) {
          echo "URL: " . $this->apiUrl . $this->apiVersion . "/" . $endopoint . BRCRLF;
          echo "Bearer: " . $this->apiBearer . BRCRLF;
          echo "XSRF: " . $this->xsrfToken . BRCRLF;
          echo "Session: " . $this->sessionToken . BRCRLF;
          echo "Params: " . $this->apiUrl . $this->apiVersion . "/" . $endopoint . "?" . $params . BRCRLF;
        }

        $headers = [];
        $headers_size = 0;

        curl_setopt_array($curl, [
          CURLOPT_URL => $this->apiUrl . $this->apiVersion . "/" . $endopoint . "?" . $params,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_HEADER => 1,
          CURLOPT_ENCODING => '',
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 0,
          CURLOPT_FOLLOWLOCATION => true,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_SSL_VERIFYPEER => 0,
          CURLOPT_CUSTOMREQUEST => 'GET',
          CURLOPT_HEADERFUNCTION => function ($curl, $header) use (&$headers, &$headers_size) {
            $len = strlen($header);
            $headers_size += $len;
            $header = explode(':', $header, 2);

            // Ignore invalid headers
            if (count($header) < 2) {
              return $len;
            }

            $headers[strtolower(trim($header[0]))][] = trim($header[1]);
            return $len;
          },
          CURLOPT_HTTPHEADER => [
            'Accept: application / json',
            'Authorization: Bearer ' . $this->apiBearer,
            'Cookie: XSRF-TOKEN=' . $this->xsrfToken . '; sisapi_session=' . $this->sessionToken
          ],
        ]);

        $response = curl_exec($curl);

        curl_close($curl);

        $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
        if(!$header_size) {
          $body =  substr($response, $headers_size);
        } else {
          $body = substr($response, $header_size);
        }

        if ($this->apiDebug) {
          echo "Response: ";
          var_dump($response);
          echo "Header: -$header_size-$headers_size-" . BRCRLF;
          // var_dump($headers);
          echo "Body: " . BRCRLF;
          var_dump($body);
          var_dump(json_decode($body, true));
          echo "--------- END CALL" . BRCRLF;
        }

        if (count($headers) && $headers["retry-after"]) {
          $this->retryAfter = date("Y-m-d H:i:s", strtotime("+" . $headers["retry-after"][0] . " seconds"));
        }

        return ([
          "header" => $headers,
          "body" => json_decode($body, true)
        ]);
      }

      // --------- Intestati ---------
      public function intestati($siglaProvincia, $comune, $indirizzo, $civicoDa, $civicoA) {
        if ($this->apiDebug) {
          echo "->intestati" . BRCRLF;
        }

        $siglaProvincia = rawurlencode($siglaProvincia);
        $comune = rawurlencode($comune);
        $indirizzo = rawurlencode($indirizzo);
        $civicoDa = rawurlencode($civicoDa);
        $civicoA = rawurlencode($civicoA);

        $res = $this->call("intestati", "siglaProvincia=$siglaProvincia&comune=$comune&indirizzo=$indirizzo&civicoDa=$civicoDa&civicoA=$civicoA");


        if ($res["header"]["location"]) {
          $this->intestatiStatusUri = substr($res["header"]["location"][0], strlen($this->apiUrl . $this->apiVersion . "/"));
        }

        return (["res" => $res,
          "location" => $this->intestatiStatusUri
        ]);
      }

      public function callIntestatiStatus() {
        if ($this->apiDebug) {
          echo "callIntestatiStatus" . BRCRLF;
        }

        if (!$this->intestatiStatusUri) {
          return ([
            "header" => [],
            "body" => ["messages" => "No location found"]
          ]);
        }

        if ($this->retryAfter && $this->retryAfter > date("Y-m-d H:i:s")) {
          sleep(date("s", strtotime($this->retryAfter) - time()));
        }

        $res = $this->call($this->intestatiStatusUri, "");

        if (
          $res["body"]["job_status"] !== "READY" &&
          $this->retryCount < $this->maxRetry &&
          $res["header"] && $res["header"]["retry-after"][0]
        ) {
          $this->retryAfter = date("Y-m-d H:i:s", strtotime("+" . $res["header"]["retry-after"][0] . " seconds"));
          $this->retryCount++;
          $res = $this->callIntestatiStatus();
        }

        $this->intestatiResultUri = substr($res["header"]["location"][0], strlen($this->apiUrl . $this->apiVersion . "/"));
        $this->retryCount = 0;

        return ([
          "header" => $res["header"],
          "body" => $res["body"]
        ]);
      }

      public function callIntestatiResource() {
        if ($this->apiDebug) {
          echo "callIntestatiResource \n";
        }

        if (!$this->intestatiResultUri) {
          return ([
            "header" => [],
            "body" => ["messages" => "No location found"]
          ]);
        }

        if ($this->retryAfter && $this->retryAfter > date("Y-m-d H:i:s")) {
          sleep(date("s", strtotime($this->retryAfter) - time()));
        }


        $res = $this->call($this->intestatiResultUri, "");

        if ($res["header"] && $res["header"]["retry-after"] && $this->retryCount < $this->maxRetry) {
          $this->retryAfter = date("Y-m-d H:i:s", strtotime("+" . $res["header"]["retry-after"][0] . " seconds"));
          $this->retryCount++;
          $res = $this->callIntestatiResource();
        }

        $this->retryCount = 0;

        return ([
          "header" => $res["header"],
          "body" => $res["body"]
        ]);
      }

      // --------- Credit ---------
      public function getCredit() {
        if ($this->apiDebug) {
          echo "getCredit \n";
        }

        $res = $this->call("user/credit", "");

        return ([
          "header" => $res["header"],
          "body" => $res["body"]
        ]);
      }

      // --------- Versioning ---------
      public function getVersion() {
        if ($this->apiDebug) {
          echo "getVersion \n";
        }

        $res = $this->call("system/version", "");
        $body = $res["body"];

        return ([
          "header" => $res["header"],
          "body" => $body,
          "version" => $body["version"]
        ]);
      }
    }

  
/* sample
	$sysApi = new SISApiSDK();
	$sysApi->apiDebug = true;

	// --------- Valori di test ---------
	$Bearer = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZmY1NjRkNjgyZGFmNTNhZDcwYzU1MTg0NGRmNjBkNzZmODg1NjIyMDBiMWE2ZDE3Nzg3NzRmMDdlMTU0NWZjNjJlOWRiZTkxZTYyMjEyNTIiLCJpYXQiOjE2ODUzODc1MjMuODczNDE2LCJuYmYiOjE2ODUzODc1MjMuODczNDE4LCJleHAiOjE3MTcwMDk5MjMuODY2NjgzLCJzdWIiOiIxMDAwIiwic2NvcGVzIjpbXX0.jxKWaiyngItTcgdBdta-yPBcaUkoZJ9PdxQYxWsHgtHPg9ovYDS0VTRdhDO4jcAE0oTdNE_mzlS_rW_jzEf2og16KXF4odCYpqZxYQC_GSeJBtT9xE3s1KSXZAsqo-eaOUnJw02MSY5e7v4KetbDflxBKtImzI49AoMLvXP8z8PwUqWq9X5JF7D8x6EQiVF5Nyrq4WlF4FvIczUMs8pSjZrNq-yOivT28bjcfu90Jk7vfeqv0UAtltc69_3cGLTPq1H9Bb9BYb4x3ieMHondu8UkMfpu1GZBTvWj7oJ-ezaEiqtCukcQUYI8yft1ijENh7qTIEUI1iXUeRxSoc-f7EL8TSAiiSBB1LJsZfdun9Jruhozo3a3otzeeLtrJJtkcGsaTiF3cFvPtTV91tq1wF43mEGiqepDz9MZBBWzwrYXm8v_Fab8_3NXcbUVLWYyzvM1h7IdafdkcZ-oQv6EeLmf4QCF7IelpDpl9plgrN6hYrtOGKs2Jr3UwcaDNLJ42uYOzKpvI3GreSEU-ldKHQ4CfQxugp9LybAQI_zf3p1zFUL_O2Sq-7gypr9LXOrPWtON1yS0YKHNBQQ_08I5BE87B4BtNYtiUNoo8FfN3eAmyLs27yLuzZUR6V1pQtKdu-36jzGHmdEqKJcYKYmFyiPG6O4dZYUsjThrQwQlxI4";
	$sysApi->apiBearer = $Bearer;
	$sysApi->xsrfToken = "eyJpdiI6IkM1YTllRUpBUzdoOC94MUxGSElGNXc9PSIsInZhbHVlIjoiQ0g3YUpjMGc3cXR3ZU45TWpKYjhHdURWY1dpcXAyd3prczVvM3FkalQ4TkJhKy9IdG90TmpZaEpSb1c5RG11cDRxU1BkOWY2RkNrRy9Mam0yUzhPQjlaMkhvODBIeFJ5bFVMck9MYnJMdldNUGs4Rmc2UlNRYU1mejR6NUlTWlMiLCJtYWMiOiIwNmUwOWEwZmIyY2I0MDVlZjA2ZmE2NTI5MjVmOTk5NDY2ZmUwMTdjNTE3MmYyYzY5ODMyNjk1ZmU4MTFmZTdiIiwidGFnIjoiIn0%3D";
	$sysApi->sessionToken = "eyJpdiI6Ikg2QlZoTE85U1VzWG0xdjdGUHZVU2c9PSIsInZhbHVlIjoiZUxvM3dMejdwejd0Q0RVRXlESUdzSG5MRGptNXpIRWh0dEIzck9lekJZSmgraVRvQ0NvSTVVcms5aDFFSTNyT1Uzei9rWFNlalhsZmphemkvdDJ3Q0ZrN1VsUWNnVVJOTkRPL1RqclFtbXgwR2hadDl0L2RZRjJ0Y2xKS3dSVVYiLCJtYWMiOiJjYmE1MzNhMGNjMGIwM2M2OGRmYjA0ZjcxMTA2ZmZhNWVjODEyN2IxYWUzMjc5NzlhN2UyNDcyYzFkMjJjZWUyIiwidGFnIjoiIn0%3D";
	$sysApi->intestatiStatusUri = "responses/status/33c0f418-a6ca-47d5-9707-8107e4d77b1b";

	// --------- Chiamate di prova ---------
	echo('<PRE>');
	// $siglaProvincia, $comune, $indirizzo, $civicoDa, $civicoA

	echo("\n" . 'intestati' . "\n");
	echo("intestati da RE Reggio Emilia, Via Rivoluzione D'Ottobre 1,100" . "\n");
	$intestati = $sysApi->intestati("RE", "Reggio Emilia", "Via Rivoluzione D'Ottobre",1,100);
	var_dump($intestati);

	echo("\n" .'callIntestatiStatus' ."\n");
	$intestatiStatus = $sysApi->callIntestatiStatus();
	var_dump($intestatiStatus);

	echo("\n" .'callIntestatiResource' ."\n");
	$intestatiResource = $sysApi->callIntestatiResource();
	var_dump($intestatiResource);

	echo("\n" . 'crediti' . "\n");
	$credito = $sysApi->getCredit();
	var_dump($credito);

	echo("\n". 'versione'. "\n");
	$version = $sysApi->getVersion();
	var_dump($version);


	echo('</PRE>');
 */
  ?>
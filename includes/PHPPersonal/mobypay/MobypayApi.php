<?php
session_start();
class MobypayAccessTokenRequestDto
{
	public $IdStudio;
	public $IdInstallazione;
}
class MobyPayCreateRequestDto
    {
        public $Token;
        public $CreateModel;
    }
class MobypayAccessTokenResponseDto
{
	public $item;
	public $code;
	public $type;
}
class MobypayDeleteRequestDto
{
	public $Id;
	public $PermissionToken;
}
 class MobypayPayer
    {
      
        public $address; 
        public $business_number;
        public $email;
        public $fiscal_code; 
        public $mobile_number;
        public $name; 
        public $payer_id;
        public $phone_number;
        public $totp_authentication;
    }

class MobypayDeleteResponseDto
    {
        public $Error;
        public $Message;

        function IsError()
		{
			return (strtoupper($this->Error)!="OK" && strtoupper($this->Error)!="NOT FOUND");
		}
    }
class MobypayUiInfo
    {
        public $label;
        public $value;
    }
class MobypayCheckout
    {
        public $bills; //Lista di MbpayBill
        public $payer;
    }
	
 class MobyPayCreateRequestItem
    {
        public $webhook_url ; 
        public $return_url; 
        public $checkouts; //lista di MobyPayCheckout Model
    }
	
 class MobyPaypayment
 {
 }	 
	
	
 class MbpayBill //attenzione minuscolemaiuscole
    {
     
        public $amount;
        public $bank_account;
        public $checkout_reference;
        public $currency;
        public $due_date;
        public $statement_descriptor; 
        public $ui_icon; 
        public $ui_info_array; //lista di MobypayUiInfo
        public $ui_title; 
    }

class MobyPayBill //attenzione minuscolemaiuscole
    {
     
        public $json_sent;
        public $state;
        public $bill_number;
        public $payer_id;
        public $error_message;
        public $created_date; 
        public $checkout_url; 
        public $webhook_response; 
		public $importo; 
		public $receipt_url;
		public $versamenti;
		public $MobyPayPayment; //lista di MobyPaypayment
		public $mobyPayPaymentResult;
    }

 class MobyPayCreateBillResponseDto
    {
        public $bill_number;
        public $checkout_reference;
        public $checkout_url;
        public $created_date;
        public $error_message;
		public $payer_id;
        public $state;
    }

class MPConfig
{
	public $ApiBaseEndpoint;
	public $MobypayEndpoint;
	public $CreateCheckoutUrl;
	public $TokenUrl;
	public $DeleteUrl;
	public $CreateUrl;
	public $WebhookEndpoint;
	public $CommonAuthToken;
	
	public function __construct() {
        $this->ApiBaseEndpoint = "https://h2web-api-prod-001.azurewebsites.net/api/v1/";
		$this->MobypayEndpoint = "mobypay/";
		$this->CreateCheckoutUrl = "create-checkout-url";
		$this->TokenUrl = "access-token";
		$this->DeleteUrl = "delete-bill";
		$this->CreateUrl = "create-bill";
		$this->WebhookEndpoint = "https://mobypay.cedhousesuite.it/api/mobypay/webhook";
		$this->CommonAuthToken = "eyJhbGciOiJFUzI1NiIsImtpZCI6InhhZFlTWURSQ0otMm9ucWpPWVVpMGtLZFowVlZjekkwbTZUaGNvWHA4Qk0iLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImNocy1pbnRlZ3JhdGlvbnNAaDJzb2Z0d2FyZS5pdCIsImp0aSI6IjYyODMwY2JhLTJiMzYtNDBmMy1iMWQ0LTYzMjliNDU3MjI4ZiIsInVuaXF1ZV9uYW1lIjoiNTA5NzE3NTEtOGYxZC00M2JlLThhOTctMWYwOTdjYzgzYWIyIiwicm9sZSI6WyJDaHNVc2VyIiwiSW50ZWdyYXRpb25Vc2VyIl0sIm5iZiI6MTYyMzkzOTQyNCwiZXhwIjoxNzUwMTY5ODI0LCJpYXQiOjE2MjM5Mzk0MjQsImlzcyI6Imh0dHBzOi8vaDJ3ZWItYXBpLXByb2QtMDAxLmF6dXJld2Vic2l0ZXMubmV0IiwiYXVkIjoiaHR0cHM6Ly9oMndlYi1hcGktcHJvZC0wMDEuYXp1cmV3ZWJzaXRlcy5uZXQifQ.C9DFY6JONBlh6PBqnYQuUHt9RUwSiCXnLl6vmZ89ENW4YFVnA3ZfLiPWcr3z7PDWk6-ogoehBw5gEb7dQe1_5w";
    }
}
$ApiBaseEndpoint = "https://h2web-api-prod-001.azurewebsites.net/api/v1/";
$MobypayEndpoint = "mobypay/";
$CreateCheckoutUrl = "create-checkout-url";
$TokenUrl = "access-token";
$DeleteUrl = "delete-bill";
$CreateUrl = "create-bill";
$WebhookEndpoint="https://mobypay.cedhousesuite.it/api/mobypay/webhook";
$CommonAuthToken="eyJhbGciOiJFUzI1NiIsImtpZCI6InhhZFlTWURSQ0otMm9ucWpPWVVpMGtLZFowVlZjekkwbTZUaGNvWHA4Qk0iLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImNocy1pbnRlZ3JhdGlvbnNAaDJzb2Z0d2FyZS5pdCIsImp0aSI6IjYyODMwY2JhLTJiMzYtNDBmMy1iMWQ0LTYzMjliNDU3MjI4ZiIsInVuaXF1ZV9uYW1lIjoiNTA5NzE3NTEtOGYxZC00M2JlLThhOTctMWYwOTdjYzgzYWIyIiwicm9sZSI6WyJDaHNVc2VyIiwiSW50ZWdyYXRpb25Vc2VyIl0sIm5iZiI6MTYyMzkzOTQyNCwiZXhwIjoxNzUwMTY5ODI0LCJpYXQiOjE2MjM5Mzk0MjQsImlzcyI6Imh0dHBzOi8vaDJ3ZWItYXBpLXByb2QtMDAxLmF6dXJld2Vic2l0ZXMubmV0IiwiYXVkIjoiaHR0cHM6Ly9oMndlYi1hcGktcHJvZC0wMDEuYXp1cmV3ZWJzaXRlcy5uZXQifQ.C9DFY6JONBlh6PBqnYQuUHt9RUwSiCXnLl6vmZ89ENW4YFVnA3ZfLiPWcr3z7PDWk6-ogoehBw5gEb7dQe1_5w";
        







    

        function Post($apiUrl, $requestObj) 
        {
			global $ApiBaseEndpoint;
			global $MobypayEndpoint;
			global $CommonAuthToken;
			$conf=new MPConfig;
            $response = null;
			$requestContent=json_encode($requestObj);
			//echo "\r\nSono in ".$apiUrl. " con questa request ";
			//print_r($requestContent);
			//echo "\r\n";
			$ch = curl_init();
			$url=$conf->ApiBaseEndpoint.$conf->MobypayEndpoint.$apiUrl;
			curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept: application/json", "Content-Type: application/json","Authorization: Bearer ".$CommonAuthToken));
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch, CURLOPT_POSTFIELDS, $requestContent);
			curl_setopt($ch, CURLOPT_URL, $conf->ApiBaseEndpoint.$conf->MobypayEndpoint.$apiUrl);
			
			
			
			$ch2 = curl_init();
			curl_setopt($ch2, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
			curl_setopt($ch2, CURLOPT_HTTPHEADER, array("Authorization: Bearer".$CommonAuthToken));
			curl_setopt($ch2, CURLOPT_HTTPHEADER, array("Accept: application/json", "Content-Type: application/json"));
			curl_setopt($ch2, CURLOPT_POST, true);
			curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch2, CURLOPT_POSTFIELDS, $requestContent);
			curl_setopt($ch2, CURLOPT_URL, $conf->ApiBaseEndpoint.$conf->MobypayEndpoint.$apiUrl);
			$mh = curl_multi_init();
			curl_multi_add_handle($mh,$ch);
			curl_multi_add_handle($mh,$ch2);
			// Start performing the request
			do {
				$execReturnValue = curl_multi_exec($mh, $runningHandles);
			} while ($execReturnValue == CURLM_CALL_MULTI_PERFORM);

			// Loop and continue processing the request
			while ($runningHandles && $execReturnValue == CURLM_OK) 
			{
				// !!!!! changed this if and the next do-while !!!!!

				if (curl_multi_select($mh) != -1) 
				{
					usleep(100);
				}

				do {
					$execReturnValue = curl_multi_exec($mh, $runningHandles);
				} while ($execReturnValue == CURLM_CALL_MULTI_PERFORM);
			}

			// Check for any errors
			if ($execReturnValue != CURLM_OK) 
			{
				trigger_error("Curl multi read error $execReturnValue\n", E_USER_WARNING);
			}
			 $curlError = curl_error($ch);
			 if ($curlError == "") 
            {
                $responseContent = curl_multi_getcontent($ch);
            
            } 
            else 
            {
                print "ERRORE - Curl error on handle $i: $curlError\n";
            }
			curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
			curl_multi_remove_handle($mh, $ch2);
            curl_close($ch2);
			curl_multi_close($mh);
			
            return $responseContent;
        }

        /*

        public Result<MobyPayCreateCheckoutUrlDTO> GetCheckoutUrl(Guid idStudio, Guid idInstallazione)
        {
            try
            {
                MobyPayCreateCheckoutUrlRequestDto request = new MobyPayCreateCheckoutUrlRequestDto()
                {
                    IdStudio = idStudio,
                    IdInstallazione = idInstallazione
                };

                return Post<MobyPayCreateCheckoutUrlRequestDto, MobyPayCreateCheckoutUrlDTO>(CreateCheckoutUrl, request);
            }
            catch (Exception ex)
            {
                return null;
            }
        }*/

         function SetAccessToken($idStudio, $idInstallazione)
        {
			global $TokenUrl;
			$conf=new MPConfig;
            try
            {
                $request = new MobypayAccessTokenRequestDto;
                $request->IdStudio = $idStudio;
                $request->IdInstallazione = $idInstallazione;
                //echo $idStudio . " - ". $idInstallazione;
				
                $result = Post($conf->TokenUrl, $request);
				//echo "RES: ".$result." -              ";
				$res=new MobypayAccessTokenResponseDto;
				$res=json_decode($result);
				if ($res)
				{
					$item=trim($res->item);
					$_SESSION['TOKEN']=$item;
					return true;
				}

                return false;
            }
            catch (Exception $ex)
            {
                 echo("ERRORE : ".$ex.Message);
                return false;
            }
        }

         function DeleteBill($idRata)
        {
			global $DeleteUrl;
			$conf=new MPConfig;
            try
            {
                $request = new MobyPayDeleteRequestDTO;
                $request->Id = $idRata;
				$request->PermissionToken = $_SESSION['TOKEN'];
                //echo $idStudio . " - ". $idInstallazione;
				
                $result = Post($conf->DeleteUrl, $request);
				$res=new MobypayDeleteResponseDto;
				$res=json_decode($result);
				//print_r ($res);
				
				if ($res)
				{
					//if ($res->isError()) return false;
					
					return true;
				}

                return false;
            }
            catch (Exception $ex)
            {
                echo("ERRORE : ".$ex.Message);
                return false;
            }
        }

        function CreateBill($mobypayItem)
        {
			$conf=new MPConfig;
            try
            {
                $request = new MobyPayCreateRequestDto;
                $request->Token = $_SESSION['TOKEN'];
                $request->CreateModel = $mobypayItem;
                

                return Post($conf->CreateUrl, $request);
            }
            catch (Exception $ex)
            {
                  echo("ERRORE : ".$ex.Message);
                return false;
            }
        }



?>
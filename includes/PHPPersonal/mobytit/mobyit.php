<?php
define('SDK_HOSTNAME','api.mobyt.it');
define('SDK_USERNAME','your@login');
define('SDK_PASSWORD','password');
define('SDK_DEFAULT_PORT',80);
define('SDK_PROXY','');
define('SDK_PROXY_PORT',8080);

define('SDK_CREDITS_REQUEST','/Mobyt/CREDITS');
define('SDK_SEND_SMS_REQUEST','/Mobyt/SENDSMS');
define('SDK_REMOVE_DELAYED_REQUEST','/Mobyt/REMOVE_DELAYED');
define('SDK_MSG_STATUS_REQUEST','/Mobyt/SMSSTATUS');
define('SDK_HISTORY_REQUEST','/Mobyt/SMSHISTORY');
define('SDK_LOOKUP_REQUEST','/OENL/NUMBERLOOKUP');
define('SDK_NEW_SMS_MO_REQUEST','/OESRs/SRNEWMESSAGES');
define('SDK_MO_HIST_REQUEST','/OESRs/SRHISTORY');
define('SDK_MO_BYID_REQUEST','/OESRs/SRHISTORYBYID');
define('SDK_SUBACCOUNTS_REQUEST','/Mobyt/SUBACCOUNTS');
define('SDK_SEPARATOR','|');
define('SDK_NEWLINE',';');
define('SDK_DATE_TIME_FORMAT','%Y%m%d%H%M%S');

define('SMSTYPE_NOTIFICA','N');
define('SMSTYPE_MEDIA','L');
define('SMSTYPE_BASSA','LL');

class Sdk_POST {
	var $params;
	var $result;

	function Sdk_POST() {
		$this->params['login'] = SDK_USERNAME;
		$this->params['password'] = SDK_PASSWORD;
	}

	function add_param($name, $value) {
		$this->params[$name] = $value;
	}

	function do_post($request) {
		$request_url = 'http://'.SDK_HOSTNAME;
		if (SDK_DEFAULT_PORT != 80) {
			$request_url = $request_url.':'.SDK_DEFAULT_PORT;
		}
		$request_url = $request_url.$request;
		$postdata = http_build_query($this->params);
		if (SDK_PROXY == '') {
			$opts = array('http' =>
	    		array(
	        		'method'  => 'POST',
			        'header'  => 'Content-type: application/x-www-form-urlencoded',
			        'content' => $postdata
			    )
			);
		}
		else
		{
			$opts = array('http' =>
	    		array(
	        		'method'  => 'POST',
			        'header'  => 'Content-type: application/x-www-form-urlencoded',
			        'content' => $postdata,
	    			'proxy' => SDK_PROXY.':'.SDK_PROXY_PORT, 
	    			'request_fulluri' => true
			    )
			);
		
		}
		$context  = stream_context_create($opts);
		$this->result = file_get_contents($request_url, false, $context);
		list($version,$status_code,$msg) = explode(' ',$http_response_header[0], 3);
		switch($status_code) {
			case 200: return new Sdk_response_parser($this->result);
			// maybe we could implement better error handling?
			default: return null;
		}
	}

}

class Sdk_response_parser {
	var $cursor;
	var $response;
	var $isok;
	var $errcode;
	var $errmsg;
	
	function Sdk_response_parser($response) {
		$this->response = $response;
		$this->cursor = 0;
		if (strlen($response) >= 2) {
			$code = $this->next_string();
			if ('OK' == $code) {
				$this->isok = true;
			}
			if ('KO' == $code) {
				$this->isok = false;
				$this->errcode = $this->next_int();
				$this->errmsg = $this->next_string();
			}
		}
	}

	function next_string() {
		$nstr = '';
//		echo 'cursor:|'.$this->cursor.'|';
//		echo 'nstr:|'.$nstr.'|';
		while (($this->response[$this->cursor] != SDK_SEPARATOR) &&
			($this->response[$this->cursor] != SDK_NEWLINE)) {
//		echo 'Cnstr:|'.$nstr.'|';
			$nstr = $nstr.$this->response[$this->cursor++];
			if ($this->cursor >= strlen($this->response))
				break;
		}
//		echo 'Enstr:|'.$nstr.'|';
		if ($this->cursor < strlen($this->response) && $this->response[$this->cursor] != SDK_NEWLINE) {
			$this->cursor++;
		}
		return urldecode($nstr);
	}
	function next_int() {
		return (int)$this->next_string();
	}
	function next_long() {
		return (float)$this->next_string();
	}

	function go_next_line() {
		while ($this->response[$this->cursor++] != SDK_NEWLINE) {
			if ($this->cursor > strlen($this->response)) {
				return false;
			}
		}
		return strlen($this->response) != $this->cursor;
	}

	function get_result_array() {
		return array('ok' => $this->isok, 'errcode' => $this->errcode, 'errmsg' => $this->errmsg);
	}
}

function sdk_sms_type_valid($smstype) {
	return $smstype === SMSTYPE_NOTIFICA ||
			$smstype === SMSTYPE_BASSA ||
			$smstype === SMSTYPE_MEDIA;
}

function sdk_sms_type_has_custom_tpoa($smstype) {
	return $smstype === SMSTYPE_NOTIFICA ||
			$smstype === SMSTYPE_MEDIA;
}
	
function sdk_is_valid_tpoa($tpoa) {
	return 
		preg_match('/^00[0-9]{7,16}$/',$tpoa) ||		// phone number in local format, or
		preg_match('/^\\+[0-9]{7,16}$/',$tpoa) ||	// phone number in international format, or
		strlen($tpoa) < 12;			// < 12 chars alphanumeric string
}

function sdk_is_valid_international($phone) {
  return preg_match('/^\\+[0-9]{7,16}$/',$phone);
}

function sdk_date_to_unix_timestamp($sdk_date) {
  $res = strptime($sdk_date,SDK_DATE_TIME_FORMAT);
  if ($res != false) {
    return mktime($res['tm_hour'],$res['tm_min'],$res['tm_sec'],$res['tm_mon'],$res['tm_mday'],$res['tm_year']+1900);
  } else {
    return null;
  }
}

function sdk_removeScheduledSend($order_id) {
	$post = new Sdk_POST();
	$post->add_param('order_id',$order_id);
	$post->do_post(SDK_REMOVE_DELAYED_REQUEST);
	return true;
}

function sdk_get_credits() {
	$post = new Sdk_POST();
	$rp = $post->do_post(SDK_CREDITS_REQUEST);
	$res = $rp->get_result_array();
	$count = 0;
	if ($rp->isok) {
		while ($rp->go_next_line()) {
			$res[] = new Sdk_CREDIT($rp->next_string(), $rp->next_string(), $rp->next_int());
			$count++;
		}
	}
	$res['count'] = $count;
	return $res;
}

$SDK_NATIONS = array(
'AF' => 'AFGHANISTAN',
'AL' => 'ALBANIA',
'DZ' => 'ALGERIA',
'AS' => 'AMERICAN SAMOA',
'AD' => 'ANDORRA',
'AO' => 'ANGOLA',
'AI' => 'ANGUILLA',
'AQ' => 'ANTARCTICA',
'AG' => 'ANTIGUA AND BARBUDA',
'AR' => 'ARGENTINA',
'AM' => 'ARMENIA',
'AW' => 'ARUBA',
'AU' => 'AUSTRALIA',
'AT' => 'AUSTRIA',
'AZ' => 'AZERBAIJAN',
'BS' => 'BAHAMAS',
'BH' => 'BAHRAIN',
'BD' => 'BANGLADESH',
'BB' => 'BARBADOS',
'BY' => 'BELARUS',
'BE' => 'BELGIUM',
'BZ' => 'BELIZE',
'BJ' => 'BENIN',
'BM' => 'BERMUDA',
'BT' => 'BHUTAN',
'BO' => 'BOLIVIA',
'BA' => 'BOSNIA AND HERZEGOVINA',
'BW' => 'BOTSWANA',
'BV' => 'BOUVET ISLAND',
'BR' => 'BRAZIL',
'IO' => 'BRITISH INDIAN OCEAN TERRITORY',
'BN' => 'BRUNEI DARUSSALAM',
'BG' => 'BULGARIA',
'BF' => 'BURKINA FASO',
'BI' => 'BURUNDI',
'KH' => 'CAMBODIA',
'CM' => 'CAMEROON',
'CA' => 'CANADA',
'CV' => 'CAPE VERDE',
'KY' => 'CAYMAN ISLANDS',
'CF' => 'CENTRAL AFRICAN REPUBLIC',
'TD' => 'CHAD',
'CL' => 'CHILE',
'CN' => 'CHINA',
'CX' => 'CHRISTMAS ISLAND',
'CC' => 'COCOS (KEELING) ISLANDS',
'CO' => 'COLOMBIA',
'KM' => 'COMOROS',
'CG' => 'CONGO',
'CD' => 'CONGO, THE DEMOCRATIC REPUBLIC OF THE',
'CK' => 'COOK ISLANDS',
'CR' => 'COSTA RICA',
'CI' => 'COTE D\'IVOIRE',
'HR' => 'CROATIA',
'CU' => 'CUBA',
'CY' => 'CYPRUS',
'CZ' => 'CZECH REPUBLIC',
'DK' => 'DENMARK',
'DJ' => 'DJIBOUTI',
'DM' => 'DOMINICA',
'DO' => 'DOMINICAN REPUBLIC',
'EC' => 'ECUADOR',
'EG' => 'EGYPT',
'SV' => 'EL SALVADOR',
'GQ' => 'EQUATORIAL GUINEA',
'ER' => 'ERITREA',
'EE' => 'ESTONIA',
'ET' => 'ETHIOPIA',
'FK' => 'FALKLAND ISLANDS (MALVINAS)',
'FO' => 'FAROE ISLANDS',
'FJ' => 'FIJI',
'FI' => 'FINLAND',
'FR' => 'FRANCE',
'GF' => 'FRENCH GUIANA',
'PF' => 'FRENCH POLYNESIA',
'TF' => 'FRENCH SOUTHERN TERRITORIES',
'GA' => 'GABON',
'GM' => 'GAMBIA',
'GE' => 'GEORGIA',
'DE' => 'GERMANY',
'GH' => 'GHANA',
'GI' => 'GIBRALTAR',
'GR' => 'GREECE',
'GL' => 'GREENLAND',
'GD' => 'GRENADA',
'GP' => 'GUADELOUPE',
'GU' => 'GUAM',
'GT' => 'GUATEMALA',
'GN' => 'GUINEA',
'GW' => 'GUINEA-BISSAU',
'GY' => 'GUYANA',
'HT' => 'HAITI',
'HM' => 'HEARD ISLAND AND MCDONALD ISLANDS',
'VA' => 'HOLY SEE (VATICAN CITY STATE)',
'HN' => 'HONDURAS',
'HK' => 'HONG KONG',
'HU' => 'HUNGARY',
'IS' => 'ICELAND',
'IN' => 'INDIA',
'ID' => 'INDONESIA',
'IR' => 'IRAN, ISLAMIC REPUBLIC OF',
'IQ' => 'IRAQ',
'IE' => 'IRELAND',
'IL' => 'ISRAEL',
'IT' => 'ITALY',
'JM' => 'JAMAICA',
'JP' => 'JAPAN',
'JO' => 'JORDAN',
'KZ' => 'KAZAKHSTAN',
'KE' => 'KENYA',
'KI' => 'KIRIBATI',
'KP' => 'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF',
'KR' => 'KOREA, REPUBLIC OF',
'KW' => 'KUWAIT',
'KG' => 'KYRGYZSTAN',
'LA' => 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC',
'LV' => 'LATVIA',
'LB' => 'LEBANON',
'LS' => 'LESOTHO',
'LR' => 'LIBERIA',
'LY' => 'LIBYAN ARAB JAMAHIRIYA',
'LI' => 'LIECHTENSTEIN',
'LT' => 'LITHUANIA',
'LU' => 'LUXEMBOURG',
'MO' => 'MACAO',
'MK' => 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF',
'MG' => 'MADAGASCAR',
'MW' => 'MALAWI',
'MY' => 'MALAYSIA',
'MV' => 'MALDIVES',
'ML' => 'MALI',
'MT' => 'MALTA',
'MH' => 'MARSHALL ISLANDS',
'MQ' => 'MARTINIQUE',
'MR' => 'MAURITANIA',
'MU' => 'MAURITIUS',
'YT' => 'MAYOTTE',
'MX' => 'MEXICO',
'FM' => 'MICRONESIA, FEDERATED STATES OF',
'MD' => 'MOLDOVA, REPUBLIC OF',
'MC' => 'MONACO',
'MN' => 'MONGOLIA',
'MS' => 'MONTSERRAT',
'MA' => 'MOROCCO',
'MZ' => 'MOZAMBIQUE',
'MM' => 'MYANMAR',
'NA' => 'NAMIBIA',
'NR' => 'NAURU',
'NP' => 'NEPAL',
'NL' => 'NETHERLANDS',
'AN' => 'NETHERLANDS ANTILLES',
'NC' => 'NEW CALEDONIA',
'NZ' => 'NEW ZEALAND',
'NI' => 'NICARAGUA',
'NE' => 'NIGER',
'NG' => 'NIGERIA',
'NU' => 'NIUE',
'NF' => 'NORFOLK ISLAND',
'MP' => 'NORTHERN MARIANA ISLANDS',
'NO' => 'NORWAY',
'OM' => 'OMAN',
'PK' => 'PAKISTAN',
'PW' => 'PALAU',
'PS' => 'PALESTINIAN TERRITORY, OCCUPIED',
'PA' => 'PANAMA',
'PG' => 'PAPUA NEW GUINEA',
'PY' => 'PARAGUAY',
'PE' => 'PERU',
'PH' => 'PHILIPPINES',
'PN' => 'PITCAIRN',
'PL' => 'POLAND',
'PT' => 'PORTUGAL',
'PR' => 'PUERTO RICO',
'QA' => 'QATAR',
'RE' => 'REUNION',
'RO' => 'ROMANIA',
'RU' => 'RUSSIAN FEDERATION',
'RW' => 'RWANDA',
'SH' => 'SAINT HELENA',
'KN' => 'SAINT KITTS AND NEVIS',
'LC' => 'SAINT LUCIA',
'PM' => 'SAINT PIERRE AND MIQUELON',
'VC' => 'SAINT VINCENT AND THE GRENADINES',
'WS' => 'SAMOA',
'SM' => 'SAN MARINO',
'ST' => 'SAO TOME AND PRINCIPE',
'SA' => 'SAUDI ARABIA',
'SN' => 'SENEGAL',
'CS' => 'SERBIA AND MONTENEGRO',
'SC' => 'SEYCHELLES',
'SL' => 'SIERRA LEONE',
'SG' => 'SINGAPORE',
'SK' => 'SLOVAKIA',
'SI' => 'SLOVENIA',
'SB' => 'SOLOMON ISLANDS',
'SO' => 'SOMALIA',
'ZA' => 'SOUTH AFRICA',
'GS' => 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
'ES' => 'SPAIN',
'LK' => 'SRI LANKA',
'SD' => 'SUDAN',
'SR' => 'SURINAME',
'SJ' => 'SVALBARD AND JAN MAYEN',
'SZ' => 'SWAZILAND',
'SE' => 'SWEDEN',
'CH' => 'SWITZERLAND',
'SY' => 'SYRIAN ARAB REPUBLIC',
'TW' => 'TAIWAN, PROVINCE OF CHINA',
'TJ' => 'TAJIKISTAN',
'TZ' => 'TANZANIA, UNITED REPUBLIC OF',
'TH' => 'THAILAND',
'TL' => 'TIMOR-LESTE',
'TG' => 'TOGO',
'TK' => 'TOKELAU',
'TO' => 'TONGA',
'TT' => 'TRINIDAD AND TOBAGO',
'TN' => 'TUNISIA',
'TR' => 'TURKEY',
'TM' => 'TURKMENISTAN',
'TC' => 'TURKS AND CAICOS ISLANDS',
'TV' => 'TUVALU',
'UG' => 'UGANDA',
'UA' => 'UKRAINE',
'AE' => 'UNITED ARAB EMIRATES',
'GB' => 'UNITED KINGDOM',
'US' => 'UNITED STATES',
'UM' => 'UNITED STATES MINOR OUTLYING ISLANDS',
'UY' => 'URUGUAY',
'UZ' => 'UZBEKISTAN',
'VU' => 'VANUATU',
'VE' => 'VENEZUELA',
'VN' => 'VIET NAM',
'VG' => 'VIRGIN ISLANDS, BRITISH',
'VI' => 'VIRGIN ISLANDS, U.S.',
'WF' => 'WALLIS AND FUTUNA',
'EH' => 'WESTERN SAHARA',
'YE' => 'YEMEN',
'ZM' => 'ZAMBIA',
'ZW' => 'ZIMBABWE');

function sdk_get_nation_name($iso3166) {
  global $SDK_NATIONS;
  return $SDK_NATIONS[$iso3166];
}

class Sdk_SMS {
	var $order_id;
	var $sms_type;
	var $message;
	var $recipients;
	var $sender;
	var $scheduled_delivery;

	var $problem;

	function Sdk_SMS() {
		$this->sms_type = SMSTYPE_NOTIFICA;
		$this->scheduled_delivery = null;
		$this->order_id = null;
	}

	function validate() {
		$this->problem = null;
		if ($this->sms_type == null) {
			$this->problem = 'SMS type cannot be null';
			return false;
		}
		if (strlen($this->message) == 0) {
			$this->problem = 'SMS text cannot be empty';
			return false;
		}
		if (count($this->recipients) == 0) {
			$this->problem = 'empty recipients list';
			return false;
		} else {
			foreach ($this->recipients as $recipient) {
				if (!sdk_is_valid_international($recipient)) {
					$this->problem = 'invalid recipient: '.$recipient;
					return false;
				}
			}
		}
		if (!sdk_sms_type_valid($this->sms_type)) {
			$this->problem = 'invalid SMS type: '.$this->sms_type;
			return false;
		}
		if (sdk_sms_type_has_custom_tpoa($this->sms_type)) {
			if (!sdk_is_valid_tpoa($this->sender)) {
				$this->problem = 'invalid sender: '.$this->sender ;
				return false;
			}
		}
		return true;
	}

	function problem() {
		return $this->problem;
	}

	function length() {
		$count = 0;
		$rawlen = strlen($this->message);
		for ($i=0;$i<$rawlen;$i++) {
			switch ($this->message[$i]) {
				case '|':
				case '^':
				case '€':
				case '}':
				case '{':
				case '[':
				case '~':
				case ']':
				case '\\':
					$count = $count + 2;
					break;
				default: $count++;
			}
		}
		return $count;
	}

	function count_smss() {
		$length = $this->length();
		return $length <= 160 ? 1 : (int)(($length-1)/153)+1;
	}
	function count_recipients() {
		return count($this->recipients);
	}

	function add_recipient($recipient) {
		$this->recipients[] = $recipient;
	}

	function set_scheduled_delivery($timestamp) {
		$this->scheduled_delivery = strftime(SDK_DATE_TIME_FORMAT,$timestamp);
	}
	function set_immediate() {
		$this->scheduled_delivery = null;
	}

	function send() {
		if (!$this->validate()) {
			return false;
		}
		$post = new Sdk_POST();
		$post->add_param('message',$this->message);
		$post->add_param('message_type',$this->sms_type);
		if ($this->scheduled_delivery != null) {
			$post->add_param('scheduled_delivery_time',$this->scheduled_delivery);
		}
		if ($this->order_id != null) {
			$post->add_param('order_id',$this->order_id);
		}
		if (sdk_sms_type_has_custom_tpoa($this->sms_type)) {
			$post->add_param('sender',$this->sender);
		}
		$isfirst = true;
		$recipient_list = '';
		foreach ($this->recipients as $recipient) { 
			if ($isfirst) {
				$recipient_list = $recipient;
				$isfirst = false;
			} else {
				$recipient_list = $recipient_list.','.$recipient;
			}
		}
		$post->add_param('recipient',$recipient_list);
		$rp = $post->do_post(SDK_SEND_SMS_REQUEST);
		$res = $rp->get_result_array();
		$this->problem = null;
		if (!$rp->isok) {
			$this->problem = $res['errmsg'];
		}
		if ($rp->isok) {
			$res['order_id'] = $rp->next_string();
			$res['sentsmss'] = $rp->next_int();
		}
		return $res;
	}

}

class Sdk_CREDIT {
	var $credit_type;
	var $nation;
	var $availability;
	
	function Sdk_CREDIT($credit_type, $nation, $availability) {
		$this->credit_type = $credit_type;
		$this->nation = $nation;
		$this->availability = $availability;
	}

	function is_international() {
		return strlen($this->nation) != 2;
	}

	function get_nation_name() {
		if (strlen($this->nation) == 2) {
			return sdk_get_nation_name($this->nation);
		} else {
			return null;
		}
	}
}


?>

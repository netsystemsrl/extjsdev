<?php

	$auth->setBranchId('your-branch-id');
    $auth->setClientId('your-client-id');
    $auth->setContractId('your-contract-id');
    $auth->setPassword('your-password');


    setName('John Smith');
    $parcel->setAddress('Via su vrangone, 191');
    $parcel->setCity('SOS ALINOS');
    $parcel->setPostcode('08028');
    $parcel->setProvince('NU');
    $parcel->setWeight('2,7');
    $parcel->setEmail('email@client.com');
    $parcel->setOrderId(12345);
    $parcels[] = $parcel;

class gls {

    //connection
    const WEB_SERVICE_URL = 'https://labelservice.gls-italy.com/ilswebservice.asmx';
    public $contractId;
    public $branchId;
    public $clientId;
    public $password;
    private $auth;

    //parcel
    private $parcel;
    /* The current status of the parcel.*/
    public $status;
    /* id parcel provided by GLS Italy */
    public $parcelId;
    /*  RagioneSociale - Ragione sociale destinatario */
    public $name;
    /*  Indirizzo - Indirizzo destinatario. */
    public $address;
    /*  Località - Località destinatario */
    public $city;
    /* Cap destinatario */
    public $postcode;
    /* Provincia */
    public $province;
    /* N° documento */
    public $orderId;
    /* Colli - Numero */
    public $numOfPackages = 1;
    /* Incoterm - Solo se internazionale */
    public $incoterm;
    /* Peso Kg */
    public $weight;
    /* Importocontrassegno */
    public $paymentAmount;
    /* Note visualizza sull'etichetta. */
    public $noteOnLabel;
    /* TipoPorto - F=Franco A=Assegnato */
    public $portType;
    /* Assicurazione */
    public $insuranceAmount;
    /* PesoVolume Kg */
    public $volumeWeight;
    /* RiferimentoCliente */
    public $customerReference;
    /* NoteAggiuntive */
    public $pdcNote;
    /* CodiceClienteDestinatario - Eventuale codice del cliente */
    public $customerId;
    /* TipoCollo - 0 = Normale, 4 = Plus */
    public $packageType = 0;
    /**  Email - Indirizzi mail separati da virgola per invio di notifica  */
    public $email;
    /* Cellulare1  x invio SMS di notifica*/
    public $primaryMobilePhoneNumber;
    /* Cellulare2 -  x invio SMS di notifica */
    public $secondaryMobilePhoneNumber;
    /*ServiziAccessori - Codici di 2 caratteri separati da virgola */
    public $additionalServices;
    /* ModalitaIncasso
     * code | description
     * CONT | Cash
     * AC   | Cashier's check
     * AB   | Bank check
     * AP   | Postal check
     * ASS  | Postal / bank / circular post (?)
     * ABP  | Bank / post office
     * ASR  | (?)
     * ARM  | (?) Ass. As released int. Sender
     * ABC  | (?) Bank account / circular - no postal
     * ASRP | (?) Ass. As issued - no post
     * ARMP | (?) Ass. As released int. Sender - no postal */
    public $paymentMethod;
    /* DataPrenotazioneGDO - Data Prenotazione GDO (AAMMGG) */
    public $deliveryDate;
    /* OrarioNoteGDO - Note e/orario prenotazione GDO */
    public $deliveryDateNote;
    /* Label PDF  A5 = A5 format A6 = Format A6 (Default) */
    public $labelFormat;
    /* IdentPIN - Codice Pin per il servizio IdentPIN */
    public $identPin;
    /* AssicurazioneIntegrativa - A=ALL-IN, F=10/10, Vuoto= Nessuna assicurazione integrativa*/
    public $insuranceType;
    /* Additional privacy text */
    public $additionalPrivacyText = 'Per info sul trattamento dati personali www.gls-italy.com/privacydest';
    /* Se S  allora attiva il calcolo del Fermo Deposito usando l’indirizzo   */
    public $pickUpDelivery;
    /* I valori ammessi sono le sigle sedi GLS che fanno fermo deposito   metodo CheckDepotPickUp()*/
    public $pickUpPoint;
    /* type  P = Parcel  N = National (default) */
    public $shipmentType = 'N';
    /* Reference person name (used for international shipments) */
    public $referencePersonName = null;
    /* Reference person phone number (used for international shipments) */
    public $referencePersonPhoneNumber = null;

    const PARCEL_STATUS_MAPPING = [
        'IN ATTESA DI CHIUSURA.' => 'waiting',
        'CHIUSA.' => 'closed'
    ];

    const PARCEL_MAPPING = [
        'auth' => [
            [
                'getter' => 'getContractId',
                'xmlElement' => 'CodiceContrattoGls',
                'required' => true,
                'errorMessage' => 'Missing contract id.'
            ]
        ],
        'parcel' => [
            [
                'getter' => 'getName',
                'xmlElement' => 'RagioneSociale',
                'maxLength' => 35,
                'required' => true,
                'errorMessage' => 'Missing name.'
            ],[
                'getter' => 'getAddress',
                'xmlElement' => 'Indirizzo',
                'maxLength' => 35,
                'required' => true,
                'errorMessage' => 'Missing address.'
            ],[
                'getter' => 'getCity',
                'xmlElement' => 'Localita',
                'maxLength' => 30,
                'required' => true,
                'errorMessage' => 'Missing city.'
            ],[
                'getter' => 'getPostcode',
                'xmlElement' => 'Zipcode',
                'maxLength' => 5,
                'required' => true,
                'errorMessage' => 'Missing postcode.'
            ],[
                'getter' => 'getProvince',
                'xmlElement' => 'Provincia',
                'maxLength' => 2,
                'required' => true,
                'errorMessage' => 'Missing province.'
            ],[
                'getter' => 'getOrderId',
                'xmlElement' => 'Bda',
                'maxLength' => 11
            ],[
                'getter' => 'getOrderId',
                'xmlElement' => 'ContatoreProgressivo',
                'maxLength' => 11
            ],[
                'getter' => 'getNumOfPackages',
                'xmlElement' => 'Colli',
                'maxLength' => 5,
                'required' => true,
                'errorMessage' => 'Missing number of packages.'
            ],[
                'getter' => 'getIncoterm',
                'xmlElement' => 'Incoterm',
                'maxLength' => 2
            ],[
                'getter' => 'getPortType',
                'xmlElement' => 'TipoPorto',
                'maxLength' => 1
            ],[
                'getter' => 'getInsuranceAmount',
                'xmlElement' => 'Assicurazione',
                'maxLength' => 11
            ],[
                'getter' => 'getVolumeWeight',
                'xmlElement' => 'PesoVolume',
                'maxLength' => 11
            ],[
                'getter' => 'getCustomerReference',
                'xmlElement' => 'RiferimentoCliente',
                'maxLength' => 600
            ],[
                'getter' => 'getWeight',
                'xmlElement' => 'PesoReale',
                'maxLength' => 6,
                'required' => true,
                'errorMessage' => 'Missing weight.'
            ],[
                'getter' => 'getPaymentAmount',
                'xmlElement' => 'ImportoContrassegno',
                'maxLength' => 10
            ],[
                'getter' => 'getNoteOnLabel',
                'xmlElement' => 'NoteSpedizione',
                'maxLength' => 40
            ],[
                'getter' => 'getPdcNote',
                'xmlElement' => 'NoteAggiuntive',
                'maxLength' => 40
            ],[
                'getter' => 'getCustomerId',
                'xmlElement' => 'CodiceClienteDestinatario',
                'maxLength' => 30
            ],[
                'getter' => 'getPackageType',
                'xmlElement' => 'TipoCollo',
                'maxLength' => 1,
                'required' => true,
                'errorMessage' => 'Missing package type.'
            ],[
                'getter' => 'getEmail',
                'xmlElement' => 'Email',
                'maxLength' => 70
            ],[
                'getter' => 'getPrimaryMobilePhoneNumber',
                'xmlElement' => 'Cellulare1',
                'maxLength' => 10
            ],[
                'getter' => 'getSecondaryMobilePhoneNumber',
                'xmlElement' => 'Cellulare2',
                'maxLength' => 10
            ],[
                'getter' => 'getAdditionalServices',
                'xmlElement' => 'ServiziAccessori',
                'maxLength' => 50
            ],[
                'getter' => 'getPaymentMethod',
                'xmlElement' => 'ModalitaIncasso',
                'maxLength' => 4
            ],[
                'getter' => 'getDeliveryDate',
                'xmlElement' => 'DataPrenotazioneGDO',
                'maxLength' => 6
            ],[
                'getter' => 'getLabelFormat',
                'xmlElement' => 'FormatoPdf',
                'maxLength' => 2
            ],[
                'getter' => 'getIdentPin',
                'xmlElement' => 'IdentPIN',
                'maxLength' => 12
            ],[
                'getter' => 'getInsuranceType',
                'xmlElement' => 'AssicurazioneIntegrativa',
                'maxLength' => 1
            ],[
                'getter' => 'getAdditionalPrivacyText',
                'xmlElement' => 'InfoPrivacy',
                'maxLength' => 50
            ],[
                'getter' => 'getPickUpDelivery',
                'xmlElement' => 'FermoDeposito',
                'maxLength' => 1
            ],[
                'getter' => 'getPickUpPoint',
                'xmlElement' => 'SiglaSedeFermoDeposito',
                'maxLength' => 4
            ],[
                'getter' => 'getShipmentType',
                'xmlElement' => 'TipoSpedizione',
                'maxLength' => 1
            ],[
                'getter' => 'getReferencePersonName',
                'xmlElement' => 'PersonaRiferimento',
                'maxLength' => 50
            ],[
                'getter' => 'getReferencePersonPhoneNumber',
                'xmlElement' => 'TelefonoDestinatario',
                'maxLength' => 16
            ]
        ]
    ];

    //general func
    protected static function get(string $action, array $requestData): string{
        $postData = http_build_query($requestData);

        $cr = curl_init();

        curl_setopt($cr, CURLOPT_URL, $this->WEB_SERVICE_URL . '/' . $action);

        curl_setopt($cr, CURLOPT_POST, 1);
        curl_setopt($cr, CURLOPT_POSTFIELDS, $postData);

        curl_setopt($cr, CURLOPT_TIMEOUT, 300);
        curl_setopt($cr, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($cr, CURLOPT_RETURNTRANSFER, true);

        $headers = ['Content-Type: application/x-www-form-urlencoded', 'Content-Length: ' . strlen($postData)];

        curl_setopt($cr, CURLOPT_HEADER, false);
        curl_setopt($cr, CURLOPT_HTTPHEADER, $headers);

        return curl_exec($cr);
    }

    public function get(): RequestData{
        $requestData = new RequestData();

        foreach (static::PARCEL_MAPPING as $object => $data) {
            foreach ($data as $properties) {
                $value = $this->{$object}->{$properties['getter']}();

                if ($value !== null) {
                    if (isset($properties['maxLength'])) {
                        $requestData->{$properties['xmlElement']} = $this->formatStringForXml($value, $properties['maxLength']);
                    } else {
                        $requestData->{$properties['xmlElement']} = $value;
                    }
                } elseif (isset($properties['required']) && $properties['required'] === true) {
                    throw new ValidationException($properties['errorMessage']);
                }
            }
        }

        // automatically generate the PDF label upon request
        $requestData->GeneraPdf = 4;

        return $requestData;
    }

    protected static function toXml(\SimpleXMLElement $object, array $data): void{
        foreach ($data as $key => $value) {
            if (is_array($value)) {

                // enable adding children with the same key via:
                // child_0, child_1, etc. => <child></child><child></child>
                $ex = explode("__", $key);
                $newObject = $object->addChild($ex[0]);
                static::toXml($newObject, $value);
            } else {
                // if the key is an integer, it needs text with it to actually work.
                if ($key === (int)$key) {
                    $key = "key_$key";
                }

                $object->addChild($key, $value);
            }
        }
    }

    protected function formatStringForXml(string $string, int $maxLength = null): string{
        $string = str_replace(
            ['&', '"', "'", '<', '>'],
            ['&amp;', '&quot;', '&#39;', '&lt;', '&gt;'],
            $string
        );

        // replace special characters (this was instruced by GLS)
        $string = $this->convertAccentsAndSpecialToNormal($string);

        if (!empty($maxLength) && strlen($string) > $maxLength) {
            return substr($string, 0, $maxLength);
        }

        return $string;
    }

    private function convertAccentsAndSpecialToNormal($string): string{
        $table = array(
            'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A', 'Å'=>'A', 'Ă'=>'A', 'Ā'=>'A', 'Ą'=>'A', 'Æ'=>'A', 'Ǽ'=>'A',
            'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a', 'ă'=>'a', 'ā'=>'a', 'ą'=>'a', 'æ'=>'a', 'ǽ'=>'a',

            'Þ'=>'B', 'þ'=>'b', 'ß'=>'Ss',

            'Ç'=>'C', 'Č'=>'C', 'Ć'=>'C', 'Ĉ'=>'C', 'Ċ'=>'C',
            'ç'=>'c', 'č'=>'c', 'ć'=>'c', 'ĉ'=>'c', 'ċ'=>'c',

            'Đ'=>'Dj', 'Ď'=>'D',
            'đ'=>'dj', 'ď'=>'d',

            'È'=>'E', 'É'=>'E', 'Ê'=>'E', 'Ë'=>'E', 'Ĕ'=>'E', 'Ē'=>'E', 'Ę'=>'E', 'Ė'=>'E',
            'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ĕ'=>'e', 'ē'=>'e', 'ę'=>'e', 'ė'=>'e',

            'Ĝ'=>'G', 'Ğ'=>'G', 'Ġ'=>'G', 'Ģ'=>'G',
            'ĝ'=>'g', 'ğ'=>'g', 'ġ'=>'g', 'ģ'=>'g',

            'Ĥ'=>'H', 'Ħ'=>'H',
            'ĥ'=>'h', 'ħ'=>'h',

            'Ì'=>'I', 'Í'=>'I', 'Î'=>'I', 'Ï'=>'I', 'İ'=>'I', 'Ĩ'=>'I', 'Ī'=>'I', 'Ĭ'=>'I', 'Į'=>'I',
            'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i', 'į'=>'i', 'ĩ'=>'i', 'ī'=>'i', 'ĭ'=>'i', 'ı'=>'i',

            'Ĵ'=>'J',
            'ĵ'=>'j',

            'Ķ'=>'K',
            'ķ'=>'k', 'ĸ'=>'k',

            'Ĺ'=>'L', 'Ļ'=>'L', 'Ľ'=>'L', 'Ŀ'=>'L', 'Ł'=>'L',
            'ĺ'=>'l', 'ļ'=>'l', 'ľ'=>'l', 'ŀ'=>'l', 'ł'=>'l',

            'Ñ'=>'N', 'Ń'=>'N', 'Ň'=>'N', 'Ņ'=>'N', 'Ŋ'=>'N',
            'ñ'=>'n', 'ń'=>'n', 'ň'=>'n', 'ņ'=>'n', 'ŋ'=>'n', 'ŉ'=>'n',

            'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ō'=>'O', 'Ŏ'=>'O', 'Ő'=>'O', 'Œ'=>'O',
            'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o', 'ø'=>'o', 'ō'=>'o', 'ŏ'=>'o', 'ő'=>'o', 'œ'=>'o', 'ð'=>'o',

            'Ŕ'=>'R', 'Ř'=>'R',
            'ŕ'=>'r', 'ř'=>'r', 'ŗ'=>'r',

            'Š'=>'S', 'Ŝ'=>'S', 'Ś'=>'S', 'Ş'=>'S',
            'š'=>'s', 'ŝ'=>'s', 'ś'=>'s', 'ş'=>'s',

            'Ŧ'=>'T', 'Ţ'=>'T', 'Ť'=>'T',
            'ŧ'=>'t', 'ţ'=>'t', 'ť'=>'t',

            'Ù'=>'U', 'Ú'=>'U', 'Û'=>'U', 'Ü'=>'U', 'Ũ'=>'U', 'Ū'=>'U', 'Ŭ'=>'U', 'Ů'=>'U', 'Ű'=>'U', 'Ų'=>'U',
            'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ü'=>'u', 'ũ'=>'u', 'ū'=>'u', 'ŭ'=>'u', 'ů'=>'u', 'ű'=>'u', 'ų'=>'u',

            'Ŵ'=>'W', 'Ẁ'=>'W', 'Ẃ'=>'W', 'Ẅ'=>'W',
            'ŵ'=>'w', 'ẁ'=>'w', 'ẃ'=>'w', 'ẅ'=>'w',

            'Ý'=>'Y', 'Ÿ'=>'Y', 'Ŷ'=>'Y',
            'ý'=>'y', 'ÿ'=>'y', 'ŷ'=>'y',

            'Ž'=>'Z', 'Ź'=>'Z', 'Ż'=>'Z',
            'ž'=>'z', 'ź'=>'z', 'ż'=>'z'
        );

        return strtr($string, $table);
    }

    public function login(): RequestData{
        if (empty($this->branchId)) {
            throw new AuthException('branchId is missing.');
        } elseif (empty($this->clientId)) {
            throw new AuthException('clientId  is missing.');
        } elseif (empty($this->password)) {
            throw new AuthException('Passwordis missing.');
        }

        $requestData = new RequestData();
        $requestData->SedeGls = $this->formatStringForXml($this->branchId, 2);
        $requestData->CodiceClienteGls = $this->formatStringForXml($this->clientId, 6);
        $requestData->PasswordClienteGls = $this->formatStringForXml($this->password, 10);

        return $requestData;
    }

    public static function list(Auth $auth): array{
        $authAdapter = new AuthAdapter($auth);
        $result = static::get('ListSped', (array)$authAdapter->get());
        return ParcelAdapter::parseListResponse($result);
    }
    public static function listByStatus(Auth $auth, String $status = ""): array{
        $authAdapter = new AuthAdapter($auth);
        $params = (array)$authAdapter->get();
        $params['Stato'] = $status;
        $result = static::get('ListSpedByStato', $params);
        return ParcelAdapter::parseListResponse($result);
    }
    public static function listByPeriod(Auth $auth, String $dateFrom = "", String $dateTo = ""): array{
        $authAdapter = new AuthAdapter($auth);
        $params = (array)$authAdapter->get();
        $params['DataInizio'] = $dateFrom;
        $params['DataFine'] = $dateTo;
        $result = static::get('ListSpedPeriod', $params);
        return ParcelAdapter::parseListResponse($result);
    }
    public static function add(Auth $auth, array $parcels): array{
        $authAdapter = new AuthAdapter($auth);
        $preparedParcels = [];
        $xmlData = [];
        $i = 0;

        foreach ($parcels as $parcel) {
            $parcelAdapter = new ParcelAdapter($auth, $parcel);
            $xmlData['Parcel__'.$i] = (array)$parcelAdapter->get();
            $i++;
        }

        $xmlData = array_merge((array)$authAdapter->get(), $xmlData);
        $xml = new \SimpleXMLElement('<Info/>');
        static::toXml($xml, $xmlData);
        $result = static::get('AddParcel', ['XMLInfoParcel' => $xml->asXML()]);

        return ParcelAdapter::parseAddResponse($result);
    }
    public static function close(Auth $auth, array $parcels): bool{
        $preparedParcels = [];
        $xmlData = [];
        $i = 0;

        foreach ($parcels as $parcel) {
            $parcelAdapter = new ParcelAdapter($auth, $parcel);
            $xmlData['Parcel__'.$i] = (array)$parcelAdapter->get();
            $i++;
        }

        $authAdapter = new AuthAdapter($auth);

        $xmlData = array_merge((array)$authAdapter->get(), $xmlData);
        $xml = new \SimpleXMLElement('<Info/>');

        static::toXml($xml, $xmlData);
        $result = static::get('CloseWorkDay', ['XMLCloseInfoParcel' => $xml->asXML()]);

        return ParcelAdapter::parseCloseResponse($result);
    }
    public static function delete(Auth $auth, int $parcelId): bool{
        $authAdapter = new AuthAdapter($auth);
        $data = array_merge((array)$authAdapter->get(), ['NumSpedizione' => $parcelId]);
        $result = static::get('DeleteSped', $data);

        return ParcelAdapter::parseDeleteResponse($result, $parcelId);
    }

    public static function convertStatus(string $string): string {
        if (isset(static::PARCEL_STATUS_MAPPING[$string])) {
            return static::PARCEL_STATUS_MAPPING[$string];
        }

        return $string;
    }

    public static function parseDeleteResponse(string $response, int $parcelId): bool{
        $response = new \SimpleXMLElement($response);
        $response = (string)$response[0];

        switch ($response) {

            case 'Spedizione ' . $parcelId . ' non presente.':
                $error = 'Can\'t find parcel ' . $parcelId;
        }

        if (isset($error)) {
            throw new DeleteParcelException($error);
        }

        return true;
    }

    public static function parseListResponse(string $result): array {
        $result = new \SimpleXMLElement($result);

        if (!isset($result->Parcel)) {
            return [];
        }

        $parcels = [];

        foreach ($result->Parcel as $pr) {
            $parcels[] = static::parseListParcel($pr);
        }

        return $parcels;
    }

    public static function parseListParcel(\SimpleXMLElement $pr): Parcel {
        $parcel = new Parcel();
        $parcel->setStatus(static::convertStatus((string)$pr->StatoSpedizione));
        $parcel->setParcelId((string)$pr->NumSpedizione);
        $parcel->setOrderId((int)$pr->Ddt);
        $parcel->setName((string)$pr->DenominazioneDestinatario);
        $parcel->setCity((string)$pr->CittaDestinatario);
        $parcel->setProvince((string)$pr->ProvinciaDestinatario);
        $parcel->setAddress((string)$pr->IndirizzoDestinatario);
        $parcel->setNumOfPackages((int)$pr->TotaleColli);

        return $parcel;
    }

    public static function parseAddResponse(string $response): array{
        try {
            $xmlResponse = new \SimpleXMLElement($response);
        } catch (Exception $e) {
            $exception = new AddParcelException('GLS IT returned non-xml response.');
            $exception->setResponse($response);
            throw $exception;
        }

        $responseObjects = [];

        foreach ($xmlResponse->Parcel as $parcel) {
            $response = new AddParcelResponse();

            if (!isset($parcel->NumeroSpedizione)) {
                $response->setError('Unknown error. The parcel id was not returned.');
            } elseif ($parcel->NumeroSpedizione == '999999999') {
                $response->setError('Please make sure you defined all the parcel parameters correctly.');
            } else {
                $response->setParcelId((int)$parcel->NumeroSpedizione);
            }

            $response->setPdfLabel((string)$parcel->PdfLabel);
            $response->setZplLabel((string)$parcel->Zpl);
            $response->setSenderName((string)$parcel->DenominazioneMittente);
            $response->setVolumeWeight((string)$parcel->RapportoPesoVolume);
            $response->setShippingDate((string)$parcel->DataSpedizione);
            $response->setGlsDestination((string)$parcel->DescrizioneSedeDestino);
            $response->setCSM((string)$parcel->SiglaCSM);
            $response->setAreaCode((string)$parcel->CodiceZona);
            $response->setInfoPrivacy((string)$parcel->InfoPrivacy);
            $response->setReceiverName((string)$parcel->DenominazioneDestinatario);
            $response->setAddress((string)$parcel->IndirizzoDestinatario);
            $response->setCity((string)$parcel->CittaDestinatario);
            $response->setProvince((string)$parcel->ProvinciaDestinatario);
            $response->setDescription1((string)$parcel->DescrizioneCSM1);
            $response->setDescription2((string)$parcel->DescrizioneCSM2);
            $response->setShippingWeight((string)$parcel->PesoSpedizione);
            $response->setShippingNotes((string)$parcel->NoteSpedizione);
            $response->setTransportType((string)$parcel->DescrizioneTipoPorto);
            $response->setSenderInitials((string)$parcel->SiglaMittente);
            $response->setProgressiveParcel((string)$parcel->ProgressivoCollo);
            $response->setParcelType((string)$parcel->TipoCollo);
            $response->setGlsDestinationAbbr((string)$parcel->SiglaSedeDestino);
            $response->setPrinter((string)$parcel->Sprinter);
            $response->setBda((string)$parcel->Bda);
            $response->setTotalPackages((int)$parcel->TotaleColli);
            $responseObjects[] = $response;
        }

        return $responseObjects;
    }

    public static function parseCloseResponse(string $response): bool{
        try {
            $xmlResponse = new \SimpleXMLElement($response);
        } catch (Exception $e) {
            $exception = new CloseParcelException('GLS IT returned non-xml response.');
            $exception->setResponse($response);
            throw $exception;
        }

        if ((string)$xmlResponse[0] == 'OK') {
            return true;
        }

        $exception = new CloseParcelException('Please make sure you defined all the parcel parameters correctly. To get the response xml, please call the method getXmlResponse() on the exception object.');
        $exception->setResponse($response);
        $exception->setXmlResponse($xmlResponse);

        throw $exception;
    }

}

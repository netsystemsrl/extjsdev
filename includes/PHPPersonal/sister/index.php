<?php
  // Se si vuole far partire il crawler da terminale in modalità headless:
  // PANTHER_NO_HEADLESS=1; php index.php
  
  use Facebook\WebDriver\Exception\NoSuchElementException;
  use Facebook\WebDriver\Exception\TimeoutException;
  use Symfony\Component\Panther\Client;
  use Symfony\Component;
  
  
  require __DIR__ . "/vendor/autoload.php"; // Composer's autoloader
  
  const USERNAME = "TRRLSN81P19F463R";
  const PASSWORD = "\$aDM1N10";
  
  /*
   * Documentazione:
   * Funzione da chiamare:
   *  search() -> ritorna un array con i risultati
   *    - se il parametro è "indirizzo" cercherà l'indirizzo
   *    - se il parametro è "planimetrico" cercherà l'elaborato planimetrico
   *
   * Indirizzo:
   *  comune -> sigla lunga con denominazione comune (Es: 'H223#REGGIO NELL'EMILIA#0#0')
   *  numeroIndirizzo -> 0 based
   *  numRisultatoIndirizzo -> 1 based
   *  ParolaIntera -> se true cerca l'indirizzo come parola intera
   *  tipoRicerca -> default è "intestati"; enum {"partita", "intestati", "visura"}
   *  risultatiIndirizzo ->
   *    - intestati -> intestatari dell'indirizzo
   *    - comuni -> possibili comuni
   *    - toponimi -> possibili toponimi
   *    - indirizzi -> possibili indirizzi
   *
   * Elaborato planimetrico:
   *  comune -> sigla corta (Es: H223)
   *  formatoFogli -> enum: {"A3", "A4"}
   *  formatoStampa -> enum: {"DAT", "PDF"}
   *  numeroElaboratoPlanimetrico -> 1 based
   *  elencoSubalterni -> nel risultato include elenco subalterni
   *  elaborato -> nel risultato include l'elaborato planimetrico
   *  risultatiElaborato ->
   *    - elaborato -> elaborato planimetrico
   *
   * Generale:
   *  debug -> se true stampa a schermo informazioni aggiuntive
   *  setProvincia -> serve per scegliere la provincia
   *  getProvincia -> serve per recuperare la provincia scelta
   *  getProvincie -> serve per recuperare le provincie
   *  searchIndirizzo -> serve per cercare un indirizzo
   *  searchElaboratoPlanimetrico -> serve per cercare un elaborato planimetrico
   * */
  
  class Crawler {
    
    /**
     * Variabile che denota la stampa in modalità verbosa delle azioni
     * eseguite
     *
     * @var bool
     */
    public $debug = false;
    
    /**
     * Varibile che setta un limite per i retry delle ricerche nel caso in cui
     * esse producano errori
     *
     * @var integer
     */
    public $maxRetry = 3;
    
    /**
     * Variabile ad uso interno che conta il numero di retry effettuati
     *
     * @var integer
     */
    private $retryCount = 0;
    
    /**
     * Array contente tutti i possibili comuni di appartenenza italiani,
     * ordinati sia per valore che per testo
     *
     * @var array[]
     */
    private $Provincie = [
      "value" => [
        " NAZIONALE-IT" => "NAZIONALE",
        "AGRIGENTO Territorio-AG" => "AGRIGENTO Territorio",
        "ALESSANDRIA Territorio-AL" => "ALESSANDRIA Territorio",
        "ANCONA Territorio-AN" => "ANCONA Territorio",
        "AOSTA Territorio-AO" => "AOSTA Territorio",
        "AREZZO Territorio-AR" => "AREZZO Territorio",
        "ASCOLI PICENO Territorio-AP" => "ASCOLI PICENO Territorio",
        "ASTI Territorio-AT" => "ASTI Territorio",
        "AVELLINO Territorio-AV" => "AVELLINO Territorio",
        "BARI Territorio-BA" => "BARI Territorio",
        "BELLUNO Territorio-BL" => "BELLUNO Territorio",
        "BENEVENTO Territorio-BN" => "BENEVENTO Territorio",
        "BERGAMO Territorio-BG" => "BERGAMO Territorio",
        "BIELLA Territorio-BI" => "BIELLA Territorio",
        "BOLOGNA Territorio-BO" => "BOLOGNA Territorio",
        "BRESCIA Territorio-BS" => "BRESCIA Territorio",
        "BRINDISI Territorio-BR" => "BRINDISI Territorio",
        "CAGLIARI Territorio-CA" => "CAGLIARI Territorio",
        "CALTANISSETTA Territorio-CL" => "CALTANISSETTA Territorio",
        "CAMPOBASSO Territorio-CB" => "CAMPOBASSO Territorio",
        "CASERTA Territorio-CE" => "CASERTA Territorio",
        "CATANIA Territorio-CT" => "CATANIA Territorio",
        "CATANZARO Territorio-CZ" => "CATANZARO Territorio",
        "CHIETI Territorio-CH" => "CHIETI Territorio",
        "COMO Territorio-CO" => "COMO Territorio",
        "COSENZA Territorio-CS" => "COSENZA Territorio",
        "CREMONA Territorio-CR" => "CREMONA Territorio",
        "CROTONE Territorio-KR" => "CROTONE Territorio",
        "CUNEO Territorio-CN" => "CUNEO Territorio",
        "ENNA Territorio-EN" => "ENNA Territorio",
        "FERRARA Territorio-FE" => "FERRARA Territorio",
        "FIRENZE Territorio-FI" => "FIRENZE Territorio",
        "FOGGIA Territorio-FG" => "FOGGIA Territorio",
        "FORLI Territorio-FO" => "FORLI Territorio",
        "FROSINONE Territorio-FR" => "FROSINONE Territorio",
        "GENOVA Territorio-GE" => "GENOVA Territorio",
        "GORIZIA Territorio-GO" => "GORIZIA Territorio",
        "GROSSETO Territorio-GR" => "GROSSETO Territorio",
        "IMPERIA Territorio-IM" => "IMPERIA Territorio",
        "ISERNIA Territorio-IS" => "ISERNIA Territorio",
        "LA SPEZIA Territorio-SP" => "LA SPEZIA Territorio",
        "LATINA Territorio-LT" => "LATINA Territorio",
        "LECCE Territorio-LE" => "LECCE Territorio",
        "LECCO Territorio-LC" => "LECCO Territorio",
        "LIVORNO Territorio-LI" => "LIVORNO Territorio",
        "LODI Territorio-LO" => "LODI Territorio",
        "LUCCA Territorio-LU" => "LUCCA Territorio",
        "L`AQUILA Territorio-AQ" => "L`AQUILA Territorio",
        "MACERATA Territorio-MC" => "MACERATA Territorio",
        "MANTOVA Territorio-MN" => "MANTOVA Territorio",
        "MASSA Territorio-MS" => "MASSA Territorio",
        "MATERA Territorio-MT" => "MATERA Territorio",
        "MESSINA Territorio-ME" => "MESSINA Territorio",
        "MILANO Territorio-MI" => "MILANO Territorio",
        "MODENA Territorio-MO" => "MODENA Territorio",
        "NAPOLI Territorio-NA" => "NAPOLI Territorio",
        "NOVARA Territorio-NO" => "NOVARA Territorio",
        "NUORO Territorio-NU" => "NUORO Territorio",
        "ORISTANO Territorio-OR" => "ORISTANO Territorio",
        "PADOVA Territorio-PD" => "PADOVA Territorio",
        "PALERMO Territorio-PA" => "PALERMO Territorio",
        "PARMA Territorio-PR" => "PARMA Territorio",
        "PAVIA Territorio-PV" => "PAVIA Territorio",
        "PERUGIA Territorio-PG" => "PERUGIA Territorio",
        "PESARO Territorio-PS" => "PESARO Territorio",
        "PESCARA Territorio-PE" => "PESCARA Territorio",
        "PIACENZA Territorio-PC" => "PIACENZA Territorio",
        "PISA Territorio-PI" => "PISA Territorio",
        "PISTOIA Territorio-PT" => "PISTOIA Territorio",
        "PORDENONE Territorio-PN" => "PORDENONE Territorio",
        "POTENZA Territorio-PZ" => "POTENZA Territorio",
        "PRATO Territorio-PO" => "PRATO Territorio",
        "RAGUSA Territorio-RG" => "RAGUSA Territorio",
        "RAVENNA Territorio-RA" => "RAVENNA Territorio",
        "REGGIO CALABRIA Territorio-RC" => "REGGIO CALABRIA Territorio",
        "REGGIO EMILIA Territorio-RE" => "REGGIO EMILIA Territorio",
        "RIETI Territorio-RI" => "RIETI Territorio",
        "RIMINI Territorio-RN" => "RIMINI Territorio",
        "ROMA Territorio-RM" => "ROMA Territorio",
        "ROVIGO Territorio-RO" => "ROVIGO Territorio",
        "SALERNO Territorio-SA" => "SALERNO Territorio",
        "SASSARI Territorio-SS" => "SASSARI Territorio",
        "SAVONA Territorio-SV" => "SAVONA Territorio",
        "SIENA Territorio-SI" => "SIENA Territorio",
        "SIRACUSA Territorio-SR" => "SIRACUSA Territorio",
        "SONDRIO Territorio-SO" => "SONDRIO Territorio",
        "TARANTO Territorio-TA" => "TARANTO Territorio",
        "TERAMO Territorio-TE" => "TERAMO Territorio",
        "TERNI Territorio-TR" => "TERNI Territorio",
        "TORINO Territorio-TO" => "TORINO Territorio",
        "TRAPANI Territorio-TP" => "TRAPANI Territorio",
        "TREVISO Territorio-TV" => "TREVISO Territorio",
        "TRIESTE Territorio-TS" => "TRIESTE Territorio",
        "UDINE Territorio-UD" => "UDINE Territorio",
        "VARESE Territorio-VA" => "VARESE Territorio",
        "VENEZIA Territorio-VE" => "VENEZIA Territorio",
        "VERBANIA Territorio-VB" => "VERBANIA Territorio",
        "VERCELLI Territorio-VC" => "VERCELLI Territorio",
        "VERONA Territorio-VR" => "VERONA Territorio",
        "VIBO VALENTIA Territorio-VV" => "VIBO VALENTIA Territorio",
        "VICENZA Territorio-VI" => "VICENZA Territorio",
        "VITERBO Territorio-VT" => "VITERBO Territorio",
      ],
      "text" => [
        "NAZIONALE" => " NAZIONALE-IT",
        "AGRIGENTO Territorio" => "AGRIGENTO Territorio-AG",
        "ALESSANDRIA Territorio" => "ALESSANDRIA Territorio-AL",
        "ANCONA Territorio" => "ANCONA Territorio-AN",
        "AOSTA Territorio" => "AOSTA Territorio-AO",
        "AREZZO Territorio" => "AREZZO Territorio-AR",
        "ASCOLI PICENO Territorio" => "ASCOLI PICENO Territorio-AP",
        "ASTI Territorio" => "ASTI Territorio-AT",
        "AVELLINO Territorio" => "AVELLINO Territorio-AV",
        "BARI Territorio" => "BARI Territorio-BA",
        "BELLUNO Territorio" => "BELLUNO Territorio-BL",
        "BENEVENTO Territorio" => "BENEVENTO Territorio-BN",
        "BERGAMO Territorio" => "BERGAMO Territorio-BG",
        "BIELLA Territorio" => "BIELLA Territorio-BI",
        "BOLOGNA Territorio" => "BOLOGNA Territorio-BO",
        "BRESCIA Territorio" => "BRESCIA Territorio-BS",
        "BRINDISI Territorio" => "BRINDISI Territorio-BR",
        "CAGLIARI Territorio" => "CAGLIARI Territorio-CA",
        "CALTANISSETTA Territorio" => "CALTANISSETTA Territorio-CL",
        "CAMPOBASSO Territorio" => "CAMPOBASSO Territorio-CB",
        "CASERTA Territorio" => "CASERTA Territorio-CE",
        "CATANIA Territorio" => "CATANIA Territorio-CT",
        "CATANZARO Territorio" => "CATANZARO Territorio-CZ",
        "CHIETI Territorio" => "CHIETI Territorio-CH",
        "COMO Territorio" => "COMO Territorio-CO",
        "COSENZA Territorio" => "COSENZA Territorio-CS",
        "CREMONA Territorio" => "CREMONA Territorio-CR",
        "CROTONE Territorio" => "CROTONE Territorio-KR",
        "CUNEO Territorio" => "CUNEO Territorio-CN",
        "ENNA Territorio" => "ENNA Territorio-EN",
        "FERRARA Territorio" => "FERRARA Territorio-FE",
        "FIRENZE Territorio" => "FIRENZE Territorio-FI",
        "FOGGIA Territorio" => "FOGGIA Territorio-FG",
        "FORLI Territorio" => "FORLI Territorio-FO",
        "FROSINONE Territorio" => "FROSINONE Territorio-FR",
        "GENOVA Territorio" => "GENOVA Territorio-GE",
        "GORIZIA Territorio" => "GORIZIA Territorio-GO",
        "GROSSETO Territorio" => "GROSSETO Territorio-GR",
        "IMPERIA Territorio" => "IMPERIA Territorio-IM",
        "ISERNIA Territorio" => "ISERNIA Territorio-IS",
        "LA SPEZIA Territorio" => "LA SPEZIA Territorio-SP",
        "LATINA Territorio" => "LATINA Territorio-LT",
        "LECCE Territorio" => "LECCE Territorio-LE",
        "LECCO Territorio" => "LECCO Territorio-LC",
        "LIVORNO Territorio" => "LIVORNO Territorio-LI",
        "LODI Territorio" => "LODI Territorio-LO",
        "LUCCA Territorio" => "LUCCA Territorio-LU",
        "L`AQUILA Territorio" => "L`AQUILA Territorio-AQ",
        "MACERATA Territorio" => "MACERATA Territorio-MC",
        "MANTOVA Territorio" => "MANTOVA Territorio-MN",
        "MASSA Territorio" => "MASSA Territorio-MS",
        "MATERA Territorio" => "MATERA Territorio-MT",
        "MESSINA Territorio" => "MESSINA Territorio-ME",
        "MILANO Territorio" => "MILANO Territorio-MI",
        "MODENA Territorio" => "MODENA Territorio-MO",
        "NAPOLI Territorio" => "NAPOLI Territorio-NA",
        "NOVARA Territorio" => "NOVARA Territorio-NO",
        "NUORO Territorio" => "NUORO Territorio-NU",
        "ORISTANO Territorio" => "ORISTANO Territorio-OR",
        "PADOVA Territorio" => "PADOVA Territorio-PD",
        "PALERMO Territorio" => "PALERMO Territorio-PA",
        "PARMA Territorio" => "PARMA Territorio-PR",
        "PAVIA Territorio" => "PAVIA Territorio-PV",
        "PERUGIA Territorio" => "PERUGIA Territorio-PG",
        "PESARO Territorio" => "PESARO Territorio-PS",
        "PESCARA Territorio" => "PESCARA Territorio-PE",
        "PIACENZA Territorio" => "PIACENZA Territorio-PC",
        "PISA Territorio" => "PISA Territorio-PI",
        "PISTOIA Territorio" => "PISTOIA Territorio-PT",
        "PORDENONE Territorio" => "PORDENONE Territorio-PN",
        "POTENZA Territorio" => "POTENZA Territorio-PZ",
        "PRATO Territorio" => "PRATO Territorio-PO",
        "RAGUSA Territorio" => "RAGUSA Territorio-RG",
        "RAVENNA Territorio" => "RAVENNA Territorio-RA",
        "REGGIO CALABRIA Territorio" => "REGGIO CALABRIA Territorio-RC",
        "REGGIO EMILIA Territorio" => "REGGIO EMILIA Territorio-RE",
        "RIETI Territorio" => "RIETI Territorio-RI",
        "RIMINI Territorio" => "RIMINI Territorio-RN",
        "ROMA Territorio" => "ROMA Territorio-RM",
        "ROVIGO Territorio" => "ROVIGO Territorio-RO",
        "SALERNO Territorio" => "SALERNO Territorio-SA",
        "SASSARI Territorio" => "SASSARI Territorio-SS",
        "SAVONA Territorio" => "SAVONA Territorio-SV",
        "SIENA Territorio" => "SIENA Territorio-SI",
        "SIRACUSA Territorio" => "SIRACUSA Territorio-SR",
        "SONDRIO Territorio" => "SONDRIO Territorio-SO",
        "TARANTO Territorio" => "TARANTO Territorio-TA",
        "TERAMO Territorio" => "TERAMO Territorio-TE",
        "TERNI Territorio" => "TERNI Territorio-TR",
        "TORINO Territorio" => "TORINO Territorio-TO",
        "TRAPANI Territorio" => "TRAPANI Territorio-TP",
        "TREVISO Territorio" => "TREVISO Territorio-TV",
        "TRIESTE Territorio" => "TRIESTE Territorio-TS",
        "UDINE Territorio" => "UDINE Territorio-UD",
        "VARESE Territorio" => "VARESE Territorio-VA",
        "VENEZIA Territorio" => "VENEZIA Territorio-VE",
        "VERBANIA Territorio" => "VERBANIA Territorio-VB",
        "VERCELLI Territorio" => "VERCELLI Territorio-VC",
        "VERONA Territorio" => "VERONA Territorio-VR",
        "VIBO VALENTIA Territorio" => "VIBO VALENTIA Territorio-VV",
        "VITERBO Territorio" => "VITERBO Territorio-VT"
      ]
    ];
    
    /**
     * Provincia di riferimento (sul sito è comunque indicato come comune)
     *
     * @var string
     */
    public $Provincia;
    
    /**
     * Comune in cui effetturare la ricerca
     *
     * @var string
     */
    public $comuneIndirizzo;
    
    /**
     * Sezione urbana
     *
     * @var string
     */
    public $sezioneUrbana; //
    
    /**
     * Foglio del catasto, utile per la ricerca di un elaborato
     * @var
     */
    public $foglio;
    
    /**
     * Particella catastale, utile per la ricerca di un elaborato
     *
     * @var null[]
     */
    public $particella = [
      "particella1" => null,
      "particella2" => null
    ];
    
    /**
     * Indirizzo della via da cercare, utile per la ricerca di un indirizzo
     *
     * @var string
     */
    public $viaIndirizzo;
    
    /**
     * Numero dei possibili indirizzi che hanno lo stesso nome (se nullo viene selezionato quello attivo nella pagina)
     *
     * @var integer
     */
    public $numIndirizzo = 0;
    
    /**
     * Numero del risultato della ricerca per indirizzo, da selezionare
     *
     * @var integer
     */
    public $numRisultatoIndirizzo;
    
    /**
     * Numero del risultato della ricerca per elaboratoto, da selezionare
     * @var integer
     */
    public $numeroElaboratoPlanimetrico;
    
    /**
     * Varibaile che denota se nel file dell'eleborato planimetrico
     * bisogna includere l'elenco dei subalterni
     *
     * @var bool
     */
    public $elencoSubalterni = false;
    
    /**
     * Varibaile che denota se nel file dell'eleborato planimetrico
     * bisogna includere l'elaborato planimetrico
     *
     * @var bool
     */
    public $elaborato = false;
    
    /**
     * Variabile che denota il formato di stampa dell'elaborato planimetrico
     * NB: Può assumere solo i valori {"DAT", "PDF"}
     *
     * @var string
     */
    public $formatoStampa;
    
    /**
     * Varibaile che denota il formato del file dell'eleborato planimetrico
     * NB: Può assumere solo i valori {"A3", "A4"}
     *
     * @var string
     */
    public $formatoFogli;
    
    /**
     * Codice del toponimo dell'indirizzo
     *
     * @var string
     */
    public $toponimo;
    
    /**
     * Variabile che se impostata a true, permette di visualizzare tutti i possibili toponimi
     *
     * @var bool
     */
    public $viewToponimoIndirizzo = false;
    
    /**
     * Varibile che se impostata a true, cerca la via come "parola intera" altrimenti cerca la via come "parola parziale"
     * @var bool
     */
    public $ParolaIntera = false;
    
    /**
     * Nella ricerca per indirizzo denota il civico di partenza da cui cercare
     *
     * @var null
     */
    public $dalCivico = null;
    
    /**
     * Nella ricerca per indirizzo denota il civico di arrivo fino a cui cercare
     *
     * @var null
     */
    public $alCivico = null;
    
    /**
     * Possibili valori di ricerca quando si cerca per indirizzo:
     * - "partita"
     * - "intestati"
     * - "visura"
     * @var string
     */
    public $tipoRicerca = "intestati";
    
    // Varibili contententi i risultati della ricerca
    /**
     * @var array
     */
    public $risultatiIndirizzo = [
      "toponimi" => [],
      // "indirizzi" => [],
      "comuni" => [],
      "intestati" => [],
      "vie" => [],
      "immobili" => []
    ];
    
    /**
     * @var array
     */
    public $risultatiElaborato = [];
    
    // Variabili utili al crawler
    /**
     * @var Client
     */
    private $client;
    
    /**
     * @var Crawler
     */
    private $crawler;
    
    /**
     * @var bool
     */
    public $isLogged = false;
    
    /**
     * @var bool
     */
    private $isComuneChosen = false;
    
    /**
     * Questa funzione crea un nuovo oggetto Client e lo usa per interagire con il sito web del catasto italiano.
     */
    function __construct() {
      try {
        $this->client = Client::createChromeClient();
        
        $this->client->manage()->window()->maximize();
        $this->client->followRedirects();
        
      } catch (Exception $e) {
        if ($this->debug) {
          echo "Chrome not found\n";
          exit(1);
        }
      }
    }
    
    /**
     * Questa funzione setta il comune di appartenenza
     * per la ricerca delle visure catastali
     *
     * @throws Exception
     */
    public function setProvincia($provincia) {
      if (isset($this->Provincie["value"][$provincia])) {
        $this->Provincia = $provincia;
      } else if (isset($this->Provincie["text"][$provincia])) {
        $this->Provincia = $this->Provincie["text"][$provincia];
      } else {
        throw new Exception("Comune non trovato");
      }
    }
    
    /**
     * Questa funzione ritorna il comune di appartenenza,
     * scelto, per la ricerca delle visure catastali
     *
     * @return string
     */
    public function getProvincia(): string {
      return $this->Provincia;
    }
    
    /**
     * Questa funzione ritorna la lista di tutti i possibili
     * comuni di appartenenza per la ricerca delle visure catastali
     * @return array[]
     */
    public function getProvincie(): array {
      return $this->Provincie;
    }
    
    /**
     * Questa funzione viene utilizzata per cliccare degli elementi HTML
     *
     * @param $linkSelector
     * @return void
     * @throws NoSuchElementException
     * @throws TimeoutException
     * @throws Exception
     */
    private function clickLink($linkSelector) {
      $this->client->waitForVisibility($linkSelector);
      $this->client->executeScript("document.querySelector('$linkSelector').click()");
    }
    
    /**
     * Questa funzione permette di effettuare il login al portale dell'agenzia
     * delle entrate
     *
     * @throws NoSuchElementException
     * @throws TimeoutException
     */
    function login() {
      $this->crawler = $this->client->request("GET", "https://iampe.agenziaentrate.gov.it/sam/UI/Login?realm=/agenziaentrate");
      
      $this->client->waitForVisibility("#login-form > ul > li:nth-child(4) > a");
      $this->client->clickLink("Credenziali");
      
      $this->client->waitForVisibility("#tab-form > ul > li:nth-child(2) > a");
      $this->client->clickLink("SISTER");
      
      $this->crawler = $this->client->waitForVisibility("#tab-form");
      
      $this->client->waitForVisibility("#username-sister");
      $usernameInput = $this->crawler->filter("#username-sister");
      $usernameInput->sendKeys(USERNAME);
      
      $passwordInput = $this->crawler->filter("#password-sister");
      $passwordInput->sendKeys(PASSWORD);
      
      $this->clickLink("#tab-sister > form > div:nth-child(10) > button");
      $this->client->followRedirects();
      $this->client->forward();
      
      $this->client->waitForVisibility("body");
      $this->client->forward();
      
      if ($this->debug) {
        echo "Post login URL: " . $this->client->getCurrentURL() . "\n";
      }
      
      if ($this->client->getCurrentURL() === "https://sister.agenziaentrate.gov.it/Servizi/error_locked.jsp") {
        $crawler = $this->client->waitForVisibility("body");
        echo "Login failed: " . ($crawler->filter("#bloccoContenutiAll > div > h1 > b")->text()) . "\n";
        $this->client->waitForVisibility("body");
        try {
          $this->logOut();
        } catch (Exception $e) {
        }
      } else {
        $this->client->waitFor("body");
        
        $this->crawler = $this->client->waitForVisibility("#menu-left > li");
        
        if ($this->client->getCurrentURL() === "https://sister.agenziaentrate.gov.it/Visure/login.jsp") {
          if ($this->debug) {
            echo "Post login url:" . $this->client->getCurrentURL() . "\n";
          }
          
          $this->login();
        }
        
        if ($this->debug) {
          echo "Logged in\n";
        }
        
        $this->isLogged = true;
      }
    }
    
    /**
     * Questa funzione permette di effettuare il log-out al portale dell'agenzia
     * delle entrate
     *
     * @return void
     * @throws Exception
     */
    function logOut() {
      try {
        $this->client->executeScript("document.querySelector('#user-collapse > div > a').click()");
        $this->isLogged = false;
        $this->isComuneChosen = false;
        $this->client->reload();
      } catch (Exception $e) {
        $this->crawler = $this->client->request("GET", "https://sister.agenziaentrate.gov.it/Visure/SceltaServizio.do?tipo=/T/TM/VCVC_");
        $this->client->executeScript("document.querySelector('#user-collapse > div > a').click()");
        $this->isLogged = false;
      }
    }
    
    /**
     * Questa funzione permette di navigare fino al menu delle visure catastali e di
     * effettuare la scelta del comune di appartenenza
     *
     * @throws NoSuchElementException
     * @throws TimeoutException
     */
    private function gotoVisureCatastali() {
      if (!$this->isLogged) {
        if ($this->debug) {
          echo "Not logged in. Logging in... \n";
        }
        
        $this->login();
        $this->client->forward();
      }
      
      if (!$this->isLogged) {
        throw new Error("Login failed\n");
      }
      
      if (
        !$this->Provincia ||
        (!isset($this->Provincie["value"][$this->Provincia]) && !isset($this->Provincie["text"][$this->Provincia]))
      ) {
        if ($this->debug) {
          echo "Provincia non specificata\n";
        }
        
        return;
      }
      
      if ($this->debug) {
        echo "Redirecting to virure\n";
      }
      
      $this->crawler = $this->client->request("GET", "https://sister.agenziaentrate.gov.it/Visure/SceltaServizio.do?tipo=/T/TM/VCVC_");
      $this->client->followRedirects();
      $this->client->forward();
      $this->client->waitForVisibility("#colonna1 > div.pagina > form");
      
      $parsedOptions = [
        "value" => [],
        "text" => [],
      ];
      
      $this->crawler
        ->filter("#colonna1 > div.pagina > form > fieldset > table > tbody > tr > td:nth-child(2) > select > option")
        ->each(function ($node) use (&$parsedOptions) {
          $parsedOptions["value"][$node->attr("value")] = $node->text();
          $parsedOptions["text"][$node->text()] = $node->attr("value");
        });
      
      if (
        empty(array_diff_assoc($parsedOptions["value"], $this->Provincie["value"])) && empty(array_diff_assoc($this->Provincie["value"], $parsedOptions["value"])) &&
        empty(array_diff_assoc($parsedOptions["text"], $this->Provincie["text"])) && empty(array_diff_assoc($this->Provincie["text"], $parsedOptions["text"]))
      ) {
        if ($this->debug) {
          echo "Lista dei 'Provincie' cambiata, aggiornamento...\n";
        }
        
        $this->Provincie = $parsedOptions;
      }
      
      $script = "const select = document.querySelector(\"#colonna1 > div.pagina > form > fieldset > table > tbody > tr > td:nth-child(2) > select\");" .
        "select.value = `" . $this->Provincia . "`";
      
      try {
        $this->client->executeScript($script);
      } catch (Exception $e) {
        echo "Errore nel selezionare il comune:\n" . $e . "\n";
        return;
      }
      
      $this->clickLink("input[value=Applica][type=submit]");
      
      $this->client->waitForVisibility("body");
      $this->client->wait(2);
      $this->isComuneChosen = true;
    }
    
    /**
     * Questa funzione, quando si è nella pagina della ricerca per indirizzo
     * permette di visionare gli intestatari
     *
     * @return array
     * @throws NoSuchElementException
     * @throws TimeoutException
     * @throws Exception
     */
    private function getIntestatarioHelper(): ?array {
      $this->client->forward();
      $this->crawler = $this->client->waitFor("body");
      
      
      if ($this->debug) {
        echo "Ricerca per intestati in corso...\n";
      }
      
      $this->clickLink("input[name=intestati]");
      $this->client->forward();
      try {
        $error = $this->crawler->filter("#colonna1 > div.pagina > form > fieldset > strong");
        
        if ($error->text()) {
          if ($this->debug) {
            echo "Errore nella ricerca degli intestati: " . $error->text() . "\n";
          }
          return null;
        }
        
      } catch (Exception $e) {
      }
      
      if ($this->debug) {
        echo "Risultati: \n";
      }
      
      $this->crawler = $this->client->waitFor("#colonna1 > div.pagina > form > fieldset > table");
      
      $dataIntestati = [];
      $this->crawler
        ->filter("#colonna1 > div.pagina > form > fieldset > table")
        ->each(function ($body) use (&$dataIntestati) {
          if (!$body) {
            return;
          }
          
          $body->filter("tr")->each(function ($row, $rowIndex) use (&$dataIntestati) {
            if (!$rowIndex) {
              return;
            }
            
            $rowData = [];
            
            $row->filter("td")->each(function ($cell) use (&$rowData) {
              if (!$cell->text()) {
                return;
              }
              
              $rowData[$cell->attr("headers")] = $cell->text();
            });
            
            $dataIntestati[] = $rowData;
          });
        });
      
      // $this->risultatiIndirizzo["intestati"] = $dataIntestati;
      
      return $dataIntestati;
    }
    
    /**
     * Questa funzione permette di effettuare la ricerca per indirizzo all'interno del catasto
     *
     * @return array
     * @throws NoSuchElementException
     * @throws TimeoutException
     * @throws Exception
     */
    private function searchIndirizzo(): ?array {
      if (!$this->isLogged) {
        if ($this->debug) {
          echo "Utente non loggato. Accedendo... \n";
        }
        
        $this->login();
        $this->client->forward();
      }
      
      if (!$this->isLogged) {
        throw new Error("Login failed\n");
        // return null;
      }
      
      if (!$this->isComuneChosen) {
        if ($this->debug) {
          echo "Comune non scelto. Scegliendo... \n";
        }
        
        if ($this->debug) {
          echo "GOTO Visure\n";
        }
        
        $this->gotoVisureCatastali();
      }
      
      $this->crawler = $this->client->clickLink("Indirizzo");
      $this->client->waitFor("#colonna1 > div.pagina > form");
      
      $possibiliComuni = [];
      $this->crawler
        ->filter("select[name=comuneCat] > option")
        ->each(function ($node) use (&$possibiliComuni) {
          // $possibiliComuni[$node->attr("value")] = $node->text();
          $possibiliComuni[$node->text()] = $node->attr("value");
        });
      
      if (!$this->comuneIndirizzo) {
        if ($this->debug) {
          echo "Comune dell'indirizzo non dato\n";
          echo "I possibili comuni sono: \n";
          foreach ($possibiliComuni as $key => $value) {
            echo "  - Comune:  '$value'   => Valore da specificare nel campo 'comuneIndirizzo': '$key' \n";
          }
        }
        
        $this->risultatiIndirizzo["comuni"] = $possibiliComuni;
        
        return null;
      }
      
      
      if (array_search($this->comuneIndirizzo, $possibiliComuni) === null) {
        if ($this->debug) {
          echo "Comune(" . $this->comuneIndirizzo . ") dell'indirizzo non valido\n";
        }
        return null;
      }
      
      
      try {
        $script = "document.querySelector(\"select[name=comuneCat]\").value = `" . $this->comuneIndirizzo . "`";
        $this->client->executeScript($script);
      } catch (Exception $e) {
        if ($this->debug) {
          echo "Errore nell'assegnazione del comune dell'indirizzo:\n" . $e . "\n";
        }
        return null;
      }
      
      $possibiliToponimi = [];
      $this->crawler
        ->filter("select[name=toponimo] > option")
        ->each(function (Symfony\Component\DomCrawler\Crawler $node) use (&$possibiliToponimi) {
          $possibiliToponimi[$node->attr("value")] = $node->text();
        });
      
      if ($this->viewToponimoIndirizzo) {
        if ($this->debug) {
          echo "I possibili toponomi sono: \n";
          
          foreach ($possibiliToponimi as $key => $value) {
            echo "  - Comune:  '$value'   => Valore da specificare nel campo 'comuneIndirizzo': '$key' \n";
          }
        }
        
        $this->risultatiIndirizzo["toponimi"] = $possibiliToponimi;
        
        return null;
      }
      
      if (!$this->toponimo || !isset($possibiliToponimi[$this->toponimo])) {
        if ($this->debug) {
          echo "Toponimo dell'indirizzo non dato (SELEZIONATO 'TUTTI')\n";
        }
      } else if ($this->toponimo !== "0#TUTTI") {
        try {
          $script = "document.querySelector(\"select[name=toponimo]\").value = `" . $this->toponimo . "`";
          $this->client->executeScript($script);
        } catch (Exception $e) {
          
          if ($this->debug) {
            echo "Errore nell'assegnazione del toponimo(" . $this->toponimo . ") dell'indirizzo:\n " . $e . "\n";
          }
          return null;
        }
      }
      
      
      $viaInput = $this->crawler->filter("input[name=indirizzo]");
      $viaInput->sendKeys($this->viaIndirizzo);
      
      try {
        $this->client->executeScript(
          "document.querySelectorAll(\"input[name=parIntera]\")[" . (!$this->ParolaIntera ? 0 : 1) . "].click()"
        );
      } catch (Exception $e) {
        echo "Errore nell'assegnazione della ricerca parola intera(" . $this->ParolaIntera . ") dell'indirizzo:\n " . $e . "\n";
        return null;
      }
      
      $this->clickLink("input[value=Ricerca]");
      
      // POST PRIMA RICERCA
      if ($this->debug) {
        echo "Ricerca in corso...\n";
      }
      
      $this->crawler = $this->client->waitForVisibility("body");
      $this->client->waitFor("input[name=numCivicoDal]");
      
      if ($this->dalCivico) {
        $this->crawler->filter("input[name=numCivicoDal]")->sendKeys($this->dalCivico);
      }
      
      if ($this->alCivico) {
        $this->crawler->filter("input[name=numCivicoAl]")->sendKeys($this->alCivico);
      }
      
      if ($this->numIndirizzo) {
        try {
          $this->client->executeScript(
            "document.querySelector(\"[name=indirizzoSel]\").value = document.querySelector(\"[name=indirizzoSel]\").children[" . ($this->numIndirizzo) . "].value"
          );
        } catch (Exception $e) {
          echo "Errore nell'assegnazione dell'indirizzo selezionato(" . $this->numIndirizzo . ") dell'indirizzo:\n " . $e . "\n";
          return null;
        }
      } else if ($this->numIndirizzo !== 0) {
        if ($this->debug) {
          echo "Nessun indirizzo selezionato\n";
        }
        
        $possibiliVie = [];
        $index = 0;
        $this->crawler->filter("select[name=indirizzoSel] > option")->each(function ($node) use (&$possibiliVie, &$index) {
          $possibiliVie[$node->text()] = $index;
          $index++;
        });
        
        $this->risultatiIndirizzo["vie"] = $possibiliVie;
        return null;
      }
      
      $this->clickLink("input[value=Ricerca][name=ricerca]");
      
      if ($this->debug) {
        echo "Seconda ricerca in corso...\n";
      }
      
      $data = [
        "headers" => [],
        "rows" => []
      ];
      
      $this->crawler = $this->client->waitFor("#colonna1 > div.pagina > form > fieldset > table");
      
      $table = $this->crawler->filter("#colonna1 > div.pagina > form > fieldset > table");
      
      $table->filter("tbody")->each(function ($body, $bodyIndex) use (&$data) {
        if (!$bodyIndex) {
          return;
        }
        
        $body->filter("tr")->each(function ($row, $rowIndex) use (&$bodyIndex, &$data) {
          $rowData = [];
          
          $row->filter("td")->each(function ($cell, $cellIndex) use (&$bodyIndex, &$rowIndex, &$rowData, &$data) {
            if (!$cellIndex) {
              return;
            }
            
            if (!$rowIndex && $cell->attr("headers")) {
              $data["headers"][] = $cell->attr("headers");
            }
            
            $rowData[$cell->attr("headers")] = $cell->text();
          });
          
          $data["rows"][] = $rowData;
        });
      });
      
      $this->risultatiIndirizzo["immobili"] = $data["rows"];
      
      if ($this->debug) {
        echo "Risultati ricerca: \n";
        var_dump($data);
      }
      
      try {
        if ($this->numRisultatoIndirizzo || $this->numRisultatoIndirizzo === 0) {
          if ($this->debug) {
            echo "Scelta del risultato numero " . $this->numRisultatoIndirizzo . "\n";
          }
          
          $this->client->executeScript("document.querySelector(\"#colonna1 > div.pagina > form > fieldset > table > tbody:nth-child(2) > tr:nth-child(" . $this->numRisultatoIndirizzo . ") > td:nth-child(1) > input[type=radio]\").click()");
          
          $this->risultatiIndirizzo["intestati"] = $this->getIntestatarioHelper();
          $this->risultatiIndirizzo["immobili"][$this->numRisultatoIndirizzo]["intestati"] = $this->risultatiIndirizzo["intestati"];
          
          return $this->risultatiIndirizzo["intestati"];
        }
        
        if ($this->debug) {
          echo "Nessun numero di risultato specificato, seleziono TUTTI\n";
        }
        
        $intestati = [];
        $numImmobili = count($this->risultatiIndirizzo["immobili"]);
        
        for ($i = 0; $i < $numImmobili; $i++) {
          if ($this->debug) {
            echo "Scelta del risultato numero " . ($i + 1) . "\n";
          }
          
          $this->client->executeScript("document.querySelector(\"#colonna1 > div.pagina > form > fieldset > table > tbody:nth-child(2) > tr:nth-child(" . ($i + 1) . ") > td:nth-child(1) > input[type=radio]\").click()");
          $intestati[] = $this->getIntestatarioHelper();
          $this->risultatiIndirizzo["immobili"][$i]["intestati"] = $intestati[$i];
          $this->clickLink("input[name=indietro]");
        }
        
        $this->risultatiIndirizzo["intestati"] = $intestati;
        return $this->risultatiIndirizzo["intestati"];
        
      } catch (Exception $e) {
        
        if ($this->debug) {
          echo "Errore nella ricerca dell'indirizzo:\n " . $e . "\n";
        }
        return null;
      }
    }
    
    /**
     * @throws Exception
     */
    public function getImmobili(): ?array {
      $tmp = $this->numRisultatoIndirizzo;
      $this->numRisultatoIndirizzo = null; // Ferma l'esecuzione della ricerca quando trova gli immobili
      $this->search("indirizzo");
      $this->numRisultatoIndirizzo = $tmp;
      
      if ($this->debug) {
        var_dump($this->risultatiIndirizzo["immobili"]);
      }
      
      return $this->risultatiIndirizzo["immobili"];
    }
    
    /**
     * @throws Exception
     */
    public function getIntestatari(): ?array {
      $this->search("indirizzo");
      
      if ($this->debug) {
        var_dump($this->risultatiIndirizzo["intestati"]);
      }
      
      return $this->risultatiIndirizzo["intestati"];
    }
    
    /**
     * Elenco vie dato nome
     *
     * @throws Exception
     */
    public function getIndirizzi(): ?array {
      $tmp = $this->numIndirizzo;
      $this->numIndirizzo = null; // Ferma l'esecuzione della ricerca quando trova gli indirizzi
      $this->search("indirizzo");
      $this->numIndirizzo = $tmp;
      
      if ($this->debug) {
        var_dump($this->risultatiIndirizzo["vie"]);
      }
      
      return $this->risultatiIndirizzo["vie"];
    }
    
    /**
     * @throws Exception
     */
    public function getComuni(): ?array {
      $tmp = $this->comuneIndirizzo;
      $this->comuneIndirizzo = null; // Ferma l'esecuzione della ricerca quando trova i comuni
      $this->search("indirizzo");
      $this->comuneIndirizzo = $tmp;
      
      if ($this->debug) {
        var_dump($this->risultatiIndirizzo["comuni"]);
      }
      
      return $this->risultatiIndirizzo["comuni"];
    }
    
    /**
     * Questa funzione cerca un elaborato planimetrico (un piano catastale) sul sito web del catasto italiano.
     *
     * @throws NoSuchElementException
     * @throws TimeoutException
     */
    private function searchElaboratoPlanimetrico(): ?bool {
      if (!$this->isLogged) {
      
        if($this->debug) {
          echo "Utente non loggato. Accedendo... \n";
        }
        
        $this->login();
      }
      
      if (!$this->isLogged) {
        throw new Error("Login failed");
        return null;
      }
      
      if (!$this->isComuneChosen) {
        if($this->debug) {
          echo "Comune non scelto. Scegliendo... \n";
        }
        $this->gotoVisureCatastali();
      }
      
      $this->crawler = $this->client->clickLink("Elaborato Planimetrico");
      $this->client->waitForVisibility("#colonna1 > div.pagina > form");
      
      $possibiliComuni = [];
      $this->crawler
        ->filter("select[name=denomComune] > option")
        ->each(function (Symfony\Component\DomCrawler\Crawler $node) use (&$possibiliComuni) {
          $possibiliComuni[$node->attr("value")] = $node->text();
        });
      
      if (!$this->comuneIndirizzo) {
        if ($this->debug) {
          echo "Comune dell'indirizzo non dato\n";
          echo "I possibili comuni sono: \n";
          
          foreach ($possibiliComuni as $key => $value) {
            echo "  - Comune:  '$value'   => Valore da specificare nel campo 'comuneIndirizzo': '$key' \n";
          }
        }
        
        $this->risultatiElaborato["comuni"] = $possibiliComuni;
        
        return false;
      }
      
      if (!isset($possibiliComuni[$this->comuneIndirizzo])) {
        if ($this->debug) {
          echo "Comune dell'indirizzo non valido\n";
        }
        
        return false;
      }
      
      
      try {
        if ($this->debug) {
          echo "Seleziono comune " . $this->comuneIndirizzo . "\n";
        }
        
        $script = "const select = document.querySelector(\"select[name=denomComune]\");" .
          "select.value = `" . $this->comuneIndirizzo . "`";
        $this->client->executeScript($script);
      } catch (Exception $e) {
        if ($this->debug) {
          echo "Errore nell'assegnazione del comune dell'indirizzo:\n" . $e . "\n";
        }
        
        return false;
      }
      
      if ($this->sezioneUrbana) {
        $sezioneUrbanaInput = $this->crawler->filter("input[name=sezUrb]");
        $sezioneUrbanaInput->sendKeys($this->sezioneUrbana);
      }
      
      if ($this->foglio) {
        $foglioInput = $this->crawler->filter("input[name=foglio]");
        $foglioInput->sendKeys($this->foglio);
      }
      
      if ($this->particella["particella1"]) {
        $particellaInput1 = $this->crawler->filter("input[name=particella1]");
        $particellaInput1->sendKeys($this->particella["particella1"]);
      }
      
      if ($this->particella["particella2"]) {
        $particellaInput2 = $this->crawler->filter("input[name=particella2]");
        $particellaInput2->sendKeys($this->particella["particella2"]);
      }
      
      $this->clickLink("input[value=Inoltra]");
      
      try {
        if ($this->debug) {
          echo "Controllo se ci sono errori... \n";
        }
        
        $this->crawler = $this->client->waitFor("form[name=RispPlanFB] > .errore_txt", 3);
        $errore = $this->crawler->filter("form[name=RispPlanFB] > .errore_txt");
        
        if ($errore->text()) {
          if ($this->debug) {
            echo "Errore nella ricerca: " . $errore->text() . "\n";
          }
          return false;
        }
        
      } catch (Exception $e) {
      }
      
      try {
        $script =
          ($this->formatoFogli ?
            'document.querySelector("[name=formatoStampa][value=' . $this->formatoFogli . ']").click();' :
            ''
          ) .
          ($this->formatoStampa ?
            'document.querySelector(`[name=tipoDoc][value=' . $this->formatoStampa . ']`).click();' :
            ''
          );
        
        if (!$this->elaborato && !$this->elencoSubalterni) {
          if ($this->debug) {
            echo "Settare 'elaborato' o 'elencoSubalterni'\n";
          }
          return false;
        }
        
        $script .=
          ($this->elaborato ?
            'document.querySelector("[name=elaboratoPlanimetrico]").checked = true;' :
            ""
          ) .
          ($this->elencoSubalterni ?
            'document.querySelector("[name=elencoSubalterni]").checked = true;' :
            ''
          );
        
        $this->client->executeScript($script);
        
      } catch (Exception $e) {
        if ($this->debug) {
          echo "Errore nella selezione dell'elaborato planimetrico:\n" . $e . "\n";
        }
        return false;
      }
      
      $tableCrawler = $this->client->waitForVisibility("#colonna1 > div.pagina > form > fieldset:nth-child(4) > table");
      
      $data = [
        "headers" => [],
        "rows" => []
      ];
      
      
      $tableCrawler->filter("tr")->slice(9)->each(function ($row, $rowIndex) use (&$data) {
        $rowData = [];
        
        $row->filter('td')->each(function ($cell, $index) use (&$data, &$rowData, &$rowIndex) {
          if (!$cell || !$cell->text()) {
            return;
          }
          
          if (!$rowIndex) {
            $data["headers"][] = $cell->text();
            return;
          }
          
          $rowData[$data["headers"][$index]] = $cell->text();
        });
        
        if (empty($rowData)) {
          return;
        }
        
        $data["rows"][] = $rowData;
      });
      
      array_pop($data["rows"]);
      
      $this->client->forward();
      
      
      if (!$this->numeroElaboratoPlanimetrico || !isset($data["rows"][$this->numeroElaboratoPlanimetrico])) {
        if ($this->debug) {
          echo "Numero elaborato planimetrico non valido o non settato, ecco i possibili: \n";
          
          foreach ($data["rows"] as $key => $row) {
            echo "  - [$key]:\n";
            foreach ($row as $key2 => $value) {
              echo "    - $key2: $value \n";
            }
            echo "\n";
          }
        }
        
        
        $this->risultatiElaborato["elaborati"] = $data["rows"];
        
        return false;
      }
      
      if ($this->debug) {
        echo "Seleziono elaborato numero " . $this->numeroElaboratoPlanimetrico . "\n";
      }
      
      $this->clickLink("#colonna1 > div.pagina > form > fieldset:nth-child(4) > table > tbody > tr:nth-child(" . ($this->numeroElaboratoPlanimetrico + 1) . ") > td:nth-child(1) > input[type=radio]");
      
      $this->clickLink("input[value=Inoltra]");
      
      return true;
    }
    
    /**
     * Questa funzione funge da wrapper per le ricerche e implementa
     * un certo numero di retry e il logout automatico in caso di errore
     * o di riuscita dell'operazione
     *
     * @return bool
     * @throws Exception
     */
    function search($tipologiaRicerca) {
      $tmpComune = $this->comuneIndirizzo;
      
      try {
        if ($tipologiaRicerca == "indirizzo") {
          $result = $this->searchIndirizzo();
        } else if ($tipologiaRicerca == "planimetrico") {
          if (str_contains($this->comuneIndirizzo, "#")) {
            preg_match('/(.*)#.*/mU', $this->comuneIndirizzo, $matches);
            $this->comuneIndirizzo = $matches[1];
          }
          
          $result = $this->searchElaboratoPlanimetrico();
          $this->comuneIndirizzo = $tmpComune;
        } else {
          echo "Tipologia di ricerca($tipologiaRicerca) non valida";
          return false;
        }
        
        if ($this->isLogged) {
          $this->logOut();
        }
        
        if ($this->debug) {
          echo "Risultato ricerca: \n";
          var_dump($result);
        }
        
      } catch (Exception $e) {
        $this->comuneIndirizzo = $tmpComune;
        
        if ($this->debug) {
          echo "Errore nella ricerca '$tipologiaRicerca':\n $e \n";
        }
        
        $this->client->takeScreenshot("main-$tipologiaRicerca-error.png");
        
        if ($this->isLogged) {
          $this->logOut();
        }
        
        $this->retryCount++;
        
        if ($this->retryCount >= $this->maxRetry) {
          // if ($this->debug) {
          //   echo "Errore nella ricerca '$tipologiaRicerca':\n $e \n";
          // }
          
          return false;
        }
        
        return $this->search($tipologiaRicerca);
      }
      
      return $result;
    }
    
    /**
     * Questa funzione permette il download di tutti gli elaborati precedentemente
     * richiesti. La funzione inoltre si occupa di spostare tutti i file scaricati nella directory
     * "./Downloads" ed effettua il logout al termine della procedura
     *
     * @return array
     * @throws Exception
     */
    function getElaborati(): ?array {
      try {
        if (!$this->isLogged) {
          if ($this->debug) {
            echo "Non sei loggato, accedendo...\n";
          }
          
          $this->login();
        }
        
        if (!$this->isLogged) {
          return false;
        }
        
        $this->crawler = $this->client->request("GET", "https://sister.agenziaentrate.gov.it/Visure/SceltaServizio.do?tipo=/T/TM/VCVC_");
        $this->client->forward();
        $this->client->waitFor("#menu-left");
        
        $this->client->executeScript("window.location.replace(document.querySelector(\"#menu-left > li:nth-child(7) > a\").href)");
        
        $this->crawler = $this->client->waitFor("#bloccoContenutiAll");
        $this->client->waitForVisibility("#bloccoContenutiAll");
        
        $count = [
          "espletate" => 0,
          "non evadibili" => 0,
          "da trattare" => 0,
          "prelevate" => 0
        ];
        
        $this->crawler
          ->filter("#bloccoContenutiAll > div.pagina > form > div:nth-child(1) > table > tbody")
          ->filter("tr")
          ->each(function ($node) use (&$count) {
            $node->filter("td")->each(function ($node) use (&$count) {
              $parsed = explode(":", $node->text());
              $count[trim($parsed[0])] = trim($parsed[1]);
            });
          });
        
        if ($this->debug) {
          echo "Elaborati: \n";
          var_dump($count);
        }
        
        if (!$count["espletate"]) {
          return false;
        }
        
        // Click radio "prelevate"
        // $this->clickLink("#bloccoContenutiAll > div.pagina > form > div:nth-child(1) > table > tbody > tr > td:nth-child(4) > input[type=radio]");
        
        // Click radio "espletate"
        $this->clickLink("#bloccoContenutiAll > div.pagina > form > div:nth-child(1) > table > tbody > tr > td:nth-child(1) > input[type=radio]");
        
        // Aggiorna il select delle date
        $this->client->executeScript('document.querySelector("select[name=comboGiorni]").value = "-"');
        
        
        // Click sumbit
        $this->clickLink("input[value=Aggiorna]");
        
        if ($this->debug) {
          echo "Ricerca di tutti gli elaborati\n";
        }
        
        $this->client->waitFor("#bloccoContenutiAll");
        
        $this->crawler = $this->client->waitForVisibility("#bloccoContenutiAll > div.pagina > form > div:nth-child(3) > table:nth-child(3) > tbody");
        
        $links = [];
        
        $this->crawler
          ->filter("#bloccoContenutiAll > div.pagina > form > div:nth-child(3) > table:nth-child(3) > tbody > tr")
          ->each(function ($node, $index) use (&$links) {
            try {
              if ($this->debug) {
                echo "Row [$index]:\n";
              }
              
              $obj = null;
              
              $node->filter("td")->each(function ($node, $index) use (&$links, &$obj) {
                if ($index === 5) {
                  $link = $node->filter("a")->link();
                  if ($this->debug) {
                    echo "  $obj: " . ($link->getUri()) . "\n";
                  }
                  
                  $links[] = [
                    "object" => $obj,
                    "uri" => $link->getUri(),
                    "link" => $link
                  ];
                }
                
                if ($index === 1) {
                  $obj = $node->text();
                }
              });
            } catch (Exception $e) {
              echo "Table loop Error: \n $e\n";
            }
          });
        
        if ($this->debug) {
          var_dump($links);
        }
        
        $index = 0;
        foreach ($links as $key => $value) {
          if ($this->numeroElaboratoPlanimetrico && $index !== ($this->numeroElaboratoPlanimetrico - 1)) {
            if ($this->debug) {
              echo "Stop download at index[$index] for numeroElaborato[" . $this->numeroElaboratoPlanimetrico . "]\n";
            }
            
            break;
          }
          
          if ($this->debug) {
            echo "Click: " . $value["object"] . "\n";
          }
          
          $this->client->click($value["link"]);
          
          $index++;
        }
        
        $this->client->wait(1);
        
        $foundedFiles = shell_exec('find . -maxdepth 1 -type f -regex ".*\(pdf\|dat\)$"');
        $ouput = shell_exec('echo \'' . $foundedFiles . '\' | cut -d "/" -f 2 | xargs -I{} cp -p {} "downloads/$(date \'+%d-%m-%d-%H:%M:%S\')-{}" 2>&1');
        if ($this->debug) {
          echo "Files: \n$foundedFiles\n";
          echo "Copy: \n$ouput\n";
        }
        
        $ouput = shell_exec("echo '$foundedFiles'| grep -v '^[[:space:]]*$' | xargs -rd \"\\n\" -I{} rm ./{}");
        if ($this->debug) {
          echo "Removing files: \n$ouput\n";
        }
        
        $this->logOut();
        
        $files = shell_exec("ls -At downloads");
        $files = array_filter(explode("\n", $files), function ($file) {
          return !!$file;
        });
        
        $uri = explode("/", $_SERVER['REQUEST_URI'])[1];
        $files = array_map(function ($file) use(&$uri) {
          return ($_SERVER["REQUEST_SCHEME"]."://". $_SERVER['SERVER_NAME']. "/".$uri."/downloads/$file");
        }, $files);
        
        if ($this->debug) {
          echo "Files prima dello slice:\n";
          var_dump($files);
        }
        
        if ($this->numeroElaboratoPlanimetrico) {
          $files = array_slice($files, 0, $this->numeroElaboratoPlanimetrico);
        }
        
        if ($this->debug) {
          echo "Files dopo lo slice:\n";
          var_dump($files);
        }
        
        $this->risultatiElaborato["files"] = $files;

        return ($this->risultatiElaborato["files"]);
        
      } catch (Exception $e) {
        
        if ($this->debug) {
          echo "Errore nel download degli elaborati:\n " . $e . "\n";
        }
        
        $this->client->takeScreenshot("elaborati-error.png");
        
        $this->logOut();
        return false;
      }
      
    }
    
  }
  
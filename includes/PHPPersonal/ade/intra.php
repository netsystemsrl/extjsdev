<?php
/* 
*****************************************************************************************
$intestazione = array monodimensionale con i seguenti index:
1 Campo fisso: “EUROX” Vengono accettati anche i record con “EUROA” per gli elenchi intra contenenti i soli dati di sezione 1 e/o 2 X(5)
2 6 Partita IVA del presentatore (soggetto obbligato o soggetto delegato) 9(11)
3 17 Numero di riferimento dell’elenco 9(6)
4 23 Tipo record: 0 = frontespizio 1 = righe dettaglio sezione 1 2 = righe dettaglio sezione 2 3 = righe dettaglio sezione 3 4 = righe dettaglio sezione 4 9(1)
5 24 Numero progressivo di riga dettaglio all’interno delle sezioni 1, 2, 3 e 4, viene impostato a zero solo nel record frontespizio 9(5)
6 29 Dati relativi ai singoli tipi record

6 29 Tipo riepilogo: A = acquisti e/o servizi ricevuti C = cessioni e/o servizi resi X(1)
7 30 Anno 9(2)
8 32 Periodicità: M = mensile - T = trimestrale X(1)
9 33 Periodo Per periodicità (campo 8) = “M” i valori ammessi sono : da 01 a 12 Per periodicità (campo 8) = “T” i valori ammessi sono : da 01 a 04 9(2)
10 35 Partita IVA del soggetto obbligato 9(11)
11 46 Contenuto degli elenchi Valori ammessi 0 = le operazioni sono riferite al mensile o trimestre completo 8 = cambio di periodicità - le operazioni riepilogate nell’elenco trimestrale sono riferite solo al primo mese 9 = cambio di periodicità - le operazioni riepilogate nell’elenco trimestrale sono riferite al primo e al secondo mese 9(1)
12 47 Casi particolari riferiti al soggetto obbligato 7 = Primo elenco presentato 8 = Cessazione di attività o variazione della partita IVA 9 = Primo elenco presentato da un soggetto che, nel periodo di riferimento ha, contestualmente, cessato l’attività oppure ha variato la propria partita IVA 0 = nessuno dei casi sopra riportati 9(1)
13 48 Partita IVA del soggetto delegato 9(11)
14 59 Numero di righe dettaglio della sezione 1 9(5)
15 64 Ammontare complessivo delle operazioni riportate nella sezione 1 (in euro) 9(13)
16 77 Numero di righe dettaglio della sezione 2 9(5)
17 82 Ammontare complessivo delle operazioni riportate nella sezione 2 (in euro) (Vedi nota) X(13)
18 95 Numero di righe dettaglio della sezione 3 9(5)
19 100 Ammontare complessivo delle operazioni riportate nella sezione 3 (in euro) 9(13)
20 113 Numero di righe dettaglio della sezione 4 9(5)
21 118 Ammontare complessivo delle operazioni riportate nella sezione 4 (in euro) 9(13)
*/
class DoganeIntra {
	var $PresentatorePiva = "";
	var $RiferimentoNum = "";

	var $AziendaPiva = "";
	var $AziendaProvicia = "RE";
	var $AziendaNazione = "IT";

	var $PeriodicitaTipo = "M";
	var $Anno = "9999";
	var $Mese = "12";
	var $Tempo = "02";
	var $progressivoFile = "0001";
	var $ProgressivoInterno =0;
	
	//return " 14".str_pad($this->progressivo,7,'0',STR_PAD_LEFT).str_repeat(" ",12).$scadenza."30000".str_pad($importo,13,'0',STR_PAD_LEFT)."-".str_pad($abi_assuntrice,5,'0',STR_PAD_LEFT).str_pad($cab_assuntrice,5,'0',STR_PAD_LEFT).str_pad($conto,12).str_pad($abi_domiciliataria,5,'0',STR_PAD_LEFT).str_pad($cab_domiciliataria,5,'0',STR_PAD_LEFT).str_repeat(" ",12).str_repeat(" ",5)."4".str_pad($codice_cliente,16).str_repeat(" ",6).$this->valuta;
		
	var $VenBeniRighe = 0;
	var $VenBeniTotale = 0;
	var $VenServiziRighe = 0;
	var $VenServiziTotale = 0;
	
	var $VenBeniRettificaRighe = 0;
	var $VenBeniRettificaTotale = 0;
	var $VenServiziRettificaRighe = 0;
	var $VenServiziRettificaTotale = 0;
	
	
	var $AcqBeniRighe = 0;
	var $AcqBeniTotale = 0;
	var $AcqServiziRighe = 0;
	var $AcqServiziTotale = 0;
			
	/*******************/
	/*		VENDITA    */
	/*******************/
	function RecordVenFronte() { 
		return 
			"EUROY" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"0" . //TipoRECORD
			str_pad('0',5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			
			"C" . //Vendita Servizi Beni
			str_pad(substr($this->Anno,2,2),2,'0',STR_PAD_LEFT) . 
			$this->PeriodicitaTipo . 
			str_pad($this->Mese,2,'0',STR_PAD_LEFT) .
			$this->AziendaPiva . 
			str_pad($this->Tempo,2,'0',STR_PAD_LEFT) . 
			
			str_pad('0',11,'0',STR_PAD_LEFT) .  
			
			str_pad($this->VenBeniRighe,5,'0',STR_PAD_LEFT) . 
			str_pad($this->VenBeniTotale,13,'0',STR_PAD_LEFT) . 
			
			
			str_pad($this->VenBeniRettificaRighe,5,'0',STR_PAD_LEFT) . 		//RETTIFICA VenBeniRighe
			str_pad($this->NumeroNegativo($this->VenBeniRettificaTotale),13,'0',STR_PAD_LEFT) .	//RETTIFICA VenBeniTotale da fare con le lettere
			
			str_pad($this->VenServiziRighe,5,'0',STR_PAD_LEFT) . 
			str_pad($this->VenServiziTotale,13,'0',STR_PAD_LEFT) . 
			
			str_pad($this->VenServiziRettificaRighe,5,'0',STR_PAD_LEFT) .		//RETTIFICA VenServiziRighe
			str_pad($this->NumeroNegativo($this->VenServiziRettificaTotale),13,'0',STR_PAD_LEFT) .		//RETTIFICA VenServiziTotale
			str_pad('0',5,'0',STR_PAD_LEFT);//Normalizzazione 2022
	}
	/*		SEZ1		*/
	function RecordVenBeni            ($Nazione, $Piva, $Valore, $NaturaTransazione, $DoganaNomeclatura, $MassaKg, $NrPezzi, $ValoreEuroStat, $ConsegnaCond, $ModoTrasporto, $ConsegnaNazione, $AziendaProvicia, $MadeIn) { 
		$this->ProgressivoInterno = $this->ProgressivoInterno +1;
		$this->VenBeniRighe = $this->VenBeniRighe +1;
		$this->VenBeniTotale = $this->VenBeniTotale + Cint( round(ABS($Valore)) );
		$CodiceTrans = '1';
		$this->AziendaNazione  = 'IT';
		$MassaKg = round($MassaKg);
		if (IsNullOrEmptyString($MassaKg)) $MassaKg = 1;
		if ($MassaKg == 0) $MassaKg = 1;
		
		//GESTIONE MENSILE
		return 
			"EUROY" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"1" . //TipoRECORD
			str_pad($this->VenBeniRighe,5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			
			str_pad($Nazione,2,' ') .
			str_pad($Piva,12, ' ') .
			
			str_pad(Cint( round($Valore) ),13,'0',STR_PAD_LEFT) . 
			$NaturaTransazione .  //1CHR
			str_pad($DoganaNomeclatura,8,'0',STR_PAD_LEFT) . 
			
			str_pad(Cint($MassaKg),10,'0',STR_PAD_LEFT) . 
			
			str_pad(Cint($NrPezzi),10,'0',STR_PAD_LEFT) . 
			str_pad(Cint($ValoreEuroStat),13,'0',STR_PAD_LEFT) . 
			str_pad($ConsegnaCond,1,'0',STR_PAD_LEFT)  . //1CHR
			str_pad($ModoTrasporto,1,' ',STR_PAD_LEFT)  . //1CHR
			str_pad($ConsegnaNazione,2,' ',STR_PAD_LEFT)  . //2CHR
			str_pad($this->AziendaProvicia,2,' ',STR_PAD_LEFT) . //2CHR
			str_pad($CodiceTrans,1,' ',STR_PAD_LEFT) . //1CHR
			str_pad($MadeIn,2,' ',STR_PAD_LEFT); //2CHR
	}
	/*		SEZ2	DAFARE	*/
	function RecordVenBeniRettifica   ($Nazione,$Piva,$Valore,$NaturaTransazione, $DoganaNomeclatura, $MassaKg, $NrPezzi, $ValoreEuroStat, $ConsegnaCond, $ModoTrasporto, $ConsegnaNazione, $AziendaProvicia, $MadeIn) { 
		$this->ProgressivoInterno = $this->ProgressivoInterno +1;
		$this->VenBeniRettificaRighe = $this->VenBeniRettificaRighe +1;
		$this->VenBeniRettificaTotale = $this->VenBeniRettificaTotale + Cint( round(ABS($Valore)));
	
		
		//GESTIONE MENSILE
		return 
			"EUROY" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"2" . //TipoRECORD
			str_pad($this->VenBeniRettificaRighe,5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			//xxx
			'03018' .
			
			str_pad($Nazione,2,' ') .
			str_pad($Piva,12, ' ') .
			
			'-' . str_pad(Cint( round(ABS($Valore))),13,'0',STR_PAD_LEFT) . 
			
			$NaturaTransazione .  //1CHR
			str_pad($DoganaNomeclatura,8,'0',STR_PAD_LEFT) .
			str_pad('0',13,'0',STR_PAD_LEFT) ;
			
	}
	/*		SEZ3		*/
	function RecordVenServizi         ($Nazione,$Piva,$Valore,$FatturaNumero, $FatturaData, $CodiceServizio, $ModoErogazione, $ModoIncasso, $PagamentoNazione) { 
		$this->ProgressivoInterno = $this->ProgressivoInterno +1;
		$this->VenServiziRighe = $this->VenServiziRighe +1;
		$this->VenServiziTotale = $this->VenServiziTotale + Cint( round(ABS($Valore)));
		
		$date = new DateTime($FatturaData);
		$FatturaDataStr = '' . $date->format('dmy');

		//GESTIONE MENSILE
		return 
			"EUROY" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"3" . //TipoRECORD
			str_pad($this->VenServiziRighe,5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			
			str_pad($Nazione,2,' ') .
			str_pad($Piva,12, ' ') .
			
			str_pad(Cint( round(ABS($Valore))),13,'0',STR_PAD_LEFT) . 
			str_pad($FatturaNumero,15,' ',STR_PAD_LEFT)  .  //1CHR
			$FatturaDataStr .
			
			str_pad($CodiceServizio,4,'0',STR_PAD_LEFT) . 
			'0' .
			str_pad($ModoErogazione ,'0',STR_PAD_LEFT) . //1CHR,
			str_pad($ModoIncasso ,'0',STR_PAD_LEFT) . //1CHR,
			str_pad($PagamentoNazione ,'0',STR_PAD_LEFT) ; //2CHR,
	}
	/*		SEZ4	DAFARE	*/
	function RecordVenServiziRettifica($Nazione,$Piva,$Valore,$FatturaNumero, $FatturaData, $CodiceServizio, $ModoErogazione, $ModoIncasso, $PagamentoNazione) { 
		$this->ProgressivoInterno = $this->ProgressivoInterno +1;
		$this->VenServiziRettificaRighe = $this->VenServiziRettificaRighe +1;
		$this->VenServiziRettificaTotale = $this->VenServiziRettificaTotale + Cint( round(ABS($Valore)));
		
		$date = new DateTime($FatturaData);
		$FatturaDataStr = '' . $date->format('dmy');

		//GESTIONE MENSILE
		return 
			"EUROY" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"3" . //TipoRECORD
			str_pad($this->VenServiziRettificaRighe,5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			
			str_pad($Nazione,2,' ') .
			str_pad($Piva,12, ' ') .
			
			str_pad(Cint($Valore),13,'0',STR_PAD_LEFT) . 
			str_pad($FatturaNumero,15,' ',STR_PAD_LEFT)  .  //1CHR
			$FatturaDataStr .
			
			str_pad($CodiceServizio,4,'0',STR_PAD_LEFT) . 
			'0' .
			str_pad($ModoErogazione ,'0',STR_PAD_LEFT) . //1CHR,
			str_pad($ModoIncasso ,'0',STR_PAD_LEFT) . //1CHR,
			str_pad($PagamentoNazione ,'0',STR_PAD_LEFT) ; //2CHR,
	}

	/********************/
	/*     ACQUISTI  DAFARE 	*/
	/********************/
	function RecordAcqFronte() { 
		$this->ProgressivoInterno = $this->ProgressivoInterno +1;
		
		return 
			"EUROX" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"0" . //TipoRECORD
			str_pad('0',5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			
			"C" . //Vendita Servizi Beni
			str_pad(substr($this->Anno,2,2),2,'0',STR_PAD_LEFT) . 
			$this->PeriodicitaTipo . 
			str_pad($this->Mese,2,'0',STR_PAD_LEFT) .
			$this->AziendaPiva . 
			str_pad($this->Tempo,2,'0',STR_PAD_LEFT) . 
			
			str_pad('0',11,'0',STR_PAD_LEFT) .  
			
			str_pad($this->AcqBeniRighe,5,'0',STR_PAD_LEFT) . 
			str_pad($this->AcqBeniTotale,13,'0',STR_PAD_LEFT) . 
			
			
			str_pad($this->AcqBeniRettificaRighe,5,'0',STR_PAD_LEFT) . 		//RETTIFICA VenBeniRighe
			str_pad($this->NumeroNegativo($this->AcqBeniRettificaTotale),13,'0',STR_PAD_LEFT) .	//RETTIFICA VenBeniTotale da fare con le lettere
			
			str_pad($this->AcqServiziRighe,5,'0',STR_PAD_LEFT) . 
			str_pad($this->AcqServiziTotale,13,'0',STR_PAD_LEFT) . 
			
			str_pad($this->AcqServiziRettificaRighe,5,'0',STR_PAD_LEFT) .		//RETTIFICA VenServiziRighe
			str_pad($this->NumeroNegativo($this->AcqServiziRettificaTotale),13,'0',STR_PAD_LEFT) .		//RETTIFICA VenServiziTotale
			str_pad('0',5,'0',STR_PAD_LEFT);//Normalizzazione 2022
	}
	/*		SEZ1b		*/
	function RecordAcqBeni            ($FatturazioneNazione,$FatturazionePIVA,$RigaValore,$NaturaTransazione, $RigaDoganaCodice, $RigaPESO, $RigaQTA, $ValoreEuroStat, $ConsegnaCond, $ModoTrasporto, $SpedizioneNazione, $AziendaProvicia, $MadeIn) { 
		$this->ProgressivoInterno = $this->ProgressivoInterno +1;
		$this->AcqBeniRighe = $this->AcqBeniRighe +1;
		$this->AcqBeniTotale = $this->AcqBeniTotale + (Cint( round($ValoreEuroStat) ));
		$CodiceTrans = '1';
		$this->AziendaNazione  = 'IT';
	
		$MassaKg = round($RigaPESO);
		if (IsNullOrEmptyString($MassaKg)) $MassaKg = 1;
		
		//GESTIONE MENSILE
		return 
			"EUROX" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"1" . //TipoRECORD
			str_pad($this->ProgressivoInterno,5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			
			str_pad($FatturazioneNazione,2,' ') .
			str_pad($FatturazionePIVA,12, ' ') .
			
			str_pad(Cint( round($ValoreEuroStat) ),13,'0',STR_PAD_LEFT) . 
			$NaturaTransazione .  //1CHR
			str_pad($RigaDoganaCodice,8,'0',STR_PAD_LEFT) . 
			
			str_pad(Cint($MassaKg),10,'0',STR_PAD_LEFT) . 
			
			str_pad(Cint($RigaQTA),10,'0',STR_PAD_LEFT) . 
			str_pad(Cint($ValoreEuroStat),13,'0',STR_PAD_LEFT) . 
			str_pad($ConsegnaCond,1,'0',STR_PAD_LEFT)  . //1CHR
			str_pad($ModoTrasporto,1,' ',STR_PAD_LEFT)  . //1CHR
			str_pad($SpedizioneNazione,2,' ',STR_PAD_LEFT)  . //2CHR
			str_pad($this->AziendaProvicia,2,' ',STR_PAD_LEFT) . //2CHR
			str_pad($CodiceTrans,1,' ',STR_PAD_LEFT) . //1CHR
			str_pad($MadeIn,2,' ',STR_PAD_LEFT); //2CHR
	}
	/*		SEZ2b		*/
	function RecordAcqBeniRettifica   ($FatturazioneNazione,$FatturazionePIVA,$RigaValore,$NaturaTransazione, $RigaDoganaCodice, $RigaPESO, $RigaQTA, $ValoreEuroStat, $ConsegnaCond, $ModoTrasporto, $SpedizioneNazione, $AziendaProvicia, $MadeIn ) {
		//NN IMPLEMENTATO
	}
	/*		SEZ3b		*/
	function RecordAcqServizi         ($Nazione,$Piva,$Valore,$FatturaNumero, $FatturaData, $RigaDoganaCodice, $ModoErogazione, $ModoIncasso, $PagamentoNazione) { 
		$this->ProgressivoInterno = $this->ProgressivoInterno +1;
		$this->AcqServiziRighe = $this->AcqServiziRighe +1;
		$this->AcqServiziTotale = $this->AcqServiziTotale + Cint($Valore);
		
		$date = new DateTime($FatturaData);
		$FatturaDataStr = '' . $date->format('dmy');

		//GESTIONE MENSILE
		return 
			"EUROX" . 
			$this->PresentatorePiva . 
			str_pad($this->RiferimentoNum,6,'0',STR_PAD_LEFT) .
			"3" . //TipoRECORD
			str_pad($this->ProgressivoInterno,5,'0',STR_PAD_LEFT) . //ProgressivoRECORD
			
			str_pad($Nazione,2,' ') .
			str_pad($Piva,12, ' ') .
			
			str_pad(Cint($Valore),13,'0',STR_PAD_LEFT) . 
			str_pad($FatturaNumero,15,' ',STR_PAD_LEFT)  .  //1CHR
			$FatturaDataStr .
			
			str_pad($RigaDoganaCodice,4,'0',STR_PAD_LEFT) . 
			'0' .
			str_pad($ModoErogazione ,'0',STR_PAD_LEFT) . //1CHR,
			str_pad($ModoIncasso ,'0',STR_PAD_LEFT) . //1CHR,
			str_pad($PagamentoNazione ,'0',STR_PAD_LEFT) ; //2CHR,
	}
	/*		SEZ4b		*/
	function RecordAcqServiziRettifica($Nazione,$Piva,$Valore,$FatturaNumero, $FatturaData, $RigaDoganaCodice, $ModoErogazione, $ModoIncasso, $PagamentoNazione){
		//NN IMPLEMENTATO
	}
	
	function NumeroNegativo($numero){
		if ($numero!= 0){
			$UltimaCifra = substr($numero, -1);
			if ($UltimaCifra == 0) $UltimaCifra = "p";
			elseif ($UltimaCifra == 1) $UltimaCifra = "q";
			elseif ($UltimaCifra == 2) $UltimaCifra = "r";
			elseif ($UltimaCifra == 3) $UltimaCifra = "s";
			elseif ($UltimaCifra == 4) $UltimaCifra = "t";
			elseif ($UltimaCifra == 5) $UltimaCifra = "u";
			elseif ($UltimaCifra == 6) $UltimaCifra = "v";
			elseif ($UltimaCifra == 7) $UltimaCifra = "w";
			elseif ($UltimaCifra == 8) $UltimaCifra = "x";
			elseif ($UltimaCifra == 9) $UltimaCifra = "y";
			
			return substr($numero, 0, -1) . $UltimaCifra;
		}else{
			return $numero;
		}
	}
	function creaFile($documenti) {
		
		$accumulatoreVen = "";
		$accumulatoreAcq = "";
		foreach ($documenti as $documento) {
			
			if ($documento['segno'] == '-'){
				//VENDITA
				if ($documento['tipologia'] == "BENE"){
					$accumulatoreVen .= $this->RecordVenBeni($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['NaturaTransazione'], $documento['RigaDoganaCodice'], $documento['RigaPESO'], $documento['RigaQTA'], $documento['ValoreEuroStat'], $documento['ConsegnaCond'], $documento['ModoTrasporto'], $documento['SpedizioneNazione'], $documento['AziendaProvicia'], $documento['MadeIn']). CRLF;
				}
				elseif ($documento['tipologia'] == "BENER"){
					$accumulatoreVen .= $this->RecordVenBeniRettifica($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['NaturaTransazione'], $documento['RigaDoganaCodice'], $documento['RigaPESO'], $documento['RigaQTA'], $documento['ValoreEuroStat'], $documento['ConsegnaCond'], $documento['ModoTrasporto'], $documento['SpedizioneNazione'], $documento['AziendaProvicia'], $documento['MadeIn']). CRLF;
				}
				elseif ($documento['tipologia'] == "SERVIZIO"){
					$accumulatoreVen .= $this->RecordVenServizi($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['FatturaNumero'],$documento['FatturaData'], $documento['RigaDoganaCodice'], $documento['ModoErogazione'], $documento['ModoIncasso'], $documento['PagamentoNazione']). CRLF;
				}
				elseif ($documento['tipologia'] == "SERVIZIOR"){
					$accumulatoreVen .= $this->RecordVenServiziRettifica($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['FatturaNumero'],$documento['FatturaData'], $documento['RigaDoganaCodice'], $documento['ModoErogazione'], $documento['ModoIncasso'], $documento['PagamentoNazione']). CRLF;
				}
			}else{
				//ACQUISTI
				if ($documento['tipologia'] == "BENE"){
					$accumulatoreAcq .= $this->RecordAcqBeni($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['NaturaTransazione'], $documento['RigaDoganaCodice'], $documento['RigaPESO'], $documento['RigaQTA'], $documento['ValoreEuroStat'], $documento['ConsegnaCond'], $documento['ModoTrasporto'], $documento['SpedizioneNazione'],$documento['AziendaProvicia'], $documento['MadeIn'] ). CRLF;
				}
				elseif ($documento['tipologia'] == "BENER"){
					$accumulatoreVen .= $this->RecordAcqBeniRettifica($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['NaturaTransazione'], $documento['RigaDoganaCodice'], $documento['RigaPESO'], $documento['RigaQTA'], $documento['ValoreEuroStat'], $documento['ConsegnaCond'], $documento['ModoTrasporto'], $documento['SpedizioneNazione'], $documento['AziendaProvicia'], $documento['MadeIn']). CRLF;
				}
				elseif ($documento['tipologia'] == "SERVIZIO"){
					$accumulatoreAcq .= $this->RecordAcqServizi($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['RigaValoreValuta'],$documento['FatturaNumero'], $documento['FatturaData'], $documento['CodiceServizio'], $documento['ModoErogazione'], $documento['ModoIncasso'], $documento['PagamentoNazione']). CRLF;
				}
				elseif ($documento['tipologia'] == "SERVIZIOR"){
					$accumulatoreVen .= $this->RecordAcqServiziRettifica($documento['FatturazioneNazione'],$documento['FatturazionePIVA'],$documento['RigaValore'],$documento['FatturaNumero'],$documento['FatturaData'], $documento['RigaDoganaCodice'], $documento['ModoErogazione'], $documento['ModoIncasso'], $documento['PagamentoNazione']). CRLF;
				}
			}
		}
		
		$accumultore = ""; //"0G06            " . $this->getNameFile() . "            276100    " . $this->AziendaPiva . "     001W" . str_pad($this->VenBeniRighe + $this->VenServiziRighe + $this->AcqBeniRighe + $this->AcqServiziRighe,5,'0',STR_PAD_LEFT) .  "" . CRLF ;
		if ($this->AcqBeniRighe > 0){
			$accumultore = $accumultore . $this->RecordAcqFronte() . CRLF ;
			$accumultore = $accumultore . $accumulatoreAcq ;
		}
		if ($this->VenBeniRighe > 0){
			$accumultore = $accumultore . $this->RecordVenFronte() . CRLF ;
			$accumultore = $accumultore . $accumulatoreVen ;
		}
		return $accumultore;
	}
	
	function getNameFile(){
		return "scambi.cee";
	}
}
?>
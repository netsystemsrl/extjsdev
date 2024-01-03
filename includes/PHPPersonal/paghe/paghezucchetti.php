<?php
	/*******************/
	/*	 RIPA00 TESTA  */
	/*******************/
	function PagheZucchettiRecordTesta00(int $DipendenteId, $DipendenteCod = '', int $NumRapp = 0, int $VFGenrAutmTeor = 1) { 
		return 
			"RIPA00" . 
			str_pad($DipendenteId,21,' ') .		//Codice soc+anagr.del dip Rilev
			str_pad($DipendenteCod,8,' ') .		//Codice soggetto dipendente
			str_pad($NumRapp,3,'0') .			//Numero rapporto
			$VFGenrAutmTeor .					//Generazione automatica del teorico 0 o 1 (se false = legge il RIPA1)
			str_pad('',65,' ') ;
	}
	/*		RIPA1 giornalieri		*/
	function PagheZucchettiRecordGiorno01(int $CausaleId, $CausaleCod = '',$DataMovmn, int $NumMin = 0, $VFGioRip = ' ', $VFGioChisStrrr = ' ', int $CodTurno = 0) { 
		$NumOreMovmn = floor($NumMin / 60);
		$NumMinMovmn = $NumMin - ($NumOreMovmn * 60);
		return 
			"RIPA01" . 
			str_pad($CausaleId,5,' ') .			//Codice giustificativo rilevazione presenze
			str_pad($CausaleCod,2,' ') .		//Codice giustificativo Paghe
			WFVALUEDATELOCAL($DataMovmn,'Ymd' ) . 	//DATA MOV
			str_pad($NumOreMovmn,2,'0') .		//Numero ore movimentazione
			str_pad($NumMinMovmn,2,'0') .		//Numero minuti movimentazione
			str_pad($NumMin,2,'0') .			//Numero centesimi movimentazione
			str_pad($VFGioRip,1,' ') .			//Giorno di ripos 0 o 1
			str_pad($VFGioChisStrrr,1,' ') .	//Giorno di chiusura straordinari 0 o 1
			$CodTurno .							//Codice turno 0-9
			str_pad('',74,' ') ;
	}
	/*		RIPA2	mensili	*/
	function PagheZucchettiRecordMese02(string $CodVoceRP, string $CodSeznVocePA = 'R' ,int $CodVocePA,date $DataPerdElabn,int $CodTipoCedl, string $CodTipoVoce = 'R', int $NumQuan, int $ImpTarf, date $DataIniPerdComp, date $DataFinePerdComp, int $NumMesiDm10Prev, int $NumSettPrev, int $CodTipoTitEsoAIES, int $AAArrtFisc) { 
		return 
			"RIPA02" . 
			str_pad($CodVoceRP,5,' ') .			//Codice voce rilevazione presenze Facoltativo: si può non compilare (tutto il campo blank) se viene compilato il "Codice voce Paghe"
			$CodSeznVocePA .					//Codice sezione voce Paghe  "R" = Voci retributive; "S" = Voci statistiche; blk = Il codice voce paghe non viene comunicato
			str_pad($CodVocePA,4,'0') .			//Codice voce Paghe Codice voce in Paghe.La lista dei codici usati dalla procedura Paghe si trova nella "Tabella voci".
			WFVALUEDATELOCAL($DataPerdElabn,'Ymd') . 	//DATA periodo di elaborazione
			$CodTipoCedl .						//Codice tipo cedolino Valori ammessi: "0" = Cedolino normale; da "1" a "9" = Cedolini aggiuntivi (tipi cedolini senza presenze)
			$CodTipoVoce .						//Codice tipo voce Campo obbligatorio per tipo sezione voce "R". Campo da non compilare per tipo sezione voce "S" Valori ammessi: "H" = Ore; "G" = Giorni; "M" = Mese; "I" = Importo; blk (valido nel caso di voce statistica)
			str_pad($NumQuan,2,' ') .		//Numero quantita della voce
			str_pad($ImpTarf,2,' ') .		//Importo tariffa base della voce
			str_pad($ImpVoce,2,' ') .		//Importo della voce
			str_pad(WFVALUEDATELOCAL( $DataIniPerdComp,'Ymd'),8,' ') . 	//DATA inizio periodo di competenza Facoltativo.
			str_pad(WFVALUEDATELOCAL( $DataFinePerdComp,'Ymd'),8,' ') . 	//DATA fine periodo di competenza Facoltativo.
			str_pad($NumMesiDm10Prev,2,' ') .		//Numero mesi per DM10 per preavviso
			str_pad($NumSettPrev,2,' ') .		//Numero settimane per preavviso
			str_pad($CodTipoTitEsoAIES,1,' ') .		//Codice tipo titolo esodo/altre inden.e somme
			str_pad($AAArrtFisc,2,' ') .		//Anno di arretrati fiscali
			str_pad('',1,' ') ;
	}
	
?>
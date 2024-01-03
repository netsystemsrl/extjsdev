<?php

class AbiSepaRid {
      var $progressivo = 0;
      var $assuntrice;
	  var $code_sia = '';
      var $data;
      var $valuta;
      var $supporto;
      var $totale;
      var $creditore;
      function RecordIB() { 
		  return " IB" .  $this->code_sia . $this->abi_assuntrice . $this->data . str_pad($this->supporto,4,' ',STR_PAD_LEFT)  . str_repeat(" ",69) . $this->valuta;
	  }
      function Record14($scadenza, $importo, $abi_domiciliataria, $cab_domiciliataria, $codice_cliente){
		  $this->totale += $importo;
		  return " 14" . str_pad($this->progressivo,7,'0',STR_PAD_LEFT). $this->data . str_repeat(" ",6) . 
						$scadenza . "300" . str_pad($importo,15,'0',STR_PAD_LEFT) .
						"-" . 
						$this->abi_assuntrice . $this->cab_assuntrice . $this->conto . 
						$abi_domiciliataria. $cab_domiciliataria . str_repeat(" ",12) . 
						$this->code_sia. 
						"4" . str_pad($codice_cliente,16) . str_repeat(" ",6) . $this->valuta;
	  }
      function Record20() {
		  return " 20" . str_pad($this->progressivo,7,'0',STR_PAD_LEFT) . 
						$this->creditore . 
						$this->creditore_indirizzo . $this->creditore_citta . $this->creditore_cap . $this->creditore_provincia . 
						$this->creditore_codice_fiscale;
	  }
      function Record30($nome_debitore,$codice_fiscale_debitore) {
		  return " 30". str_pad($this->progressivo,7,'0',STR_PAD_LEFT) . 
						substr(str_pad($nome_debitore,60),0,60) . 
						str_pad($codice_fiscale_debitore,16,' ') . 
						str_repeat(" ",34);
						str_repeat(" ",27);
	  }
      function Record40($indirizzo_debitore,$cap_debitore,$comune_debitore,$provincia_debitore=""){
		  return " 40". str_pad($this->progressivo,7,'0',STR_PAD_LEFT).
						substr(str_pad($indirizzo_debitore,30),0,30) . str_pad(intval($cap_debitore),5,'0',STR_PAD_LEFT) . 
						substr(str_pad($comune_debitore,23),0,23) . substr(str_pad($provincia_debitore,52,' ',STR_PAD_RIGHT),0,52);
	  }
      function Record50($fattnum, $descrizione_debito,$codice_fiscale_creditore) {
		  return " 50". str_pad($this->progressivo,7,'0',STR_PAD_LEFT).
						substr(str_pad($fattnum,40),0,40).
						substr(str_pad($descrizione_debito,40),0,40).
						str_repeat(" ",10).
						str_pad($codice_fiscale_creditore,16,' ').
						str_repeat(" ",4);
	  }
      function Record51($numero_ricevuta_creditore){
		  return " 51". str_pad($this->progressivo,7,'0',STR_PAD_LEFT).
						str_pad($numero_ricevuta_creditore,10,'0',STR_PAD_LEFT) .
						$this->creditore .
						str_repeat(" ",11) .
						"0000000000000000" .
						str_repeat(" ",45);
						                                             
	  }
      function Record70() {
		  return " 70". str_pad($this->progressivo,7,'0',STR_PAD_LEFT) .
						str_repeat(" ",90) .
						'000' .
						str_repeat(" ",17);                                                                                        ;
	  }
      function RecordEF() {
		  //record di coda
		  return " EF" .  $this->code_sia . $this->abi_assuntrice . $this->data . str_pad($this->supporto,4,' ',STR_PAD_LEFT) . 
		  str_pad($this->progressivo,8,'0',STR_PAD_LEFT) . 
		  str_pad($this->totale,15,'0',STR_PAD_LEFT) .
		  str_repeat("0",15) . 
		  str_pad($this->progressivo*7+2,7,'0',STR_PAD_LEFT).str_repeat(" ",24) . 
		  $this->valuta.str_repeat(" ",6);
	  }
      function creaFile($intestazione, $ricevute_bancarie) {
		$writer = new XMLWriter();  
		$writer->openMemory();
		$writer->startDocument('1.0','UTF-8');  
		$writer->setIndent(4); 
		
		$writer->startElement('iv:Fornitura'); 
		$writer->writeAttribute('xmlns:cm','urn:www.agenziaentrate.gov.it:specificheTecniche:sco:common');
		$writer->writeAttribute('xmlns:sc','urn:www.agenziaentrate.gov.it:specificheTecniche:sco:common');
		$writer->writeAttribute('xmlns:iv','urn:www.agenziaentrate.gov.it:specificheTecniche:sco:ivp');
		
		/* 	INTESTAZIONE DATI ANAGRAFICI AZIENDA  */
		$writer->startElement('iv:Intestazione');
			$writer->writeElement('iv:CodiceFornitura', 'IVP17'); 
			$writer->writeElement('iv:CodiceFiscaleDichiarante', $intestazione['code_sia']); 
			$writer->writeElement('iv:CodiceCarica', 1);
		$writer->endElement();  

		
		$writer->startElement('iv:DatiContabili');
		foreach ($ricevute_bancarie as $value) { 
			$writer->startElement('iv:Modulo');
				$writer->writeElement('iv:TotaleOperazioniAttive', $value['importo']); 
			$writer->endElement(); 
		}
		$writer->endElement(); 
		
		$writer->endDocument(); 
		if ($FileName == '') $FileName = 'IT' . $AnagraficaAzienda['PIVA'] . '_LI_' . $SdiProgressivo . '.xml';
		file_put_contents($ExtJSDevExportRAW . 'cbi/' . $FileName, $writer->flush(true), LOCK_EX);
		
		return $ExtJSDevExportRAW . 'sdi/' . $FileName;
	  }
}

?>
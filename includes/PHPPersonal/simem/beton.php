<?php
function fix_latin1_mangled_with_utf8_maybe_hopefully_most_of_the_time($str){
    return preg_replace_callback('#[\\xA1-\\xFF](?![\\x80-\\xBF]{2,})#', 'utf8_encode_callback', $str);
}

function utf8_encode_callback($m){
    return utf8_encode($m[0]);
}

function BetonDecodeMixerXML($FileName = '', $mescolaID = null) {
	global $conn;
	global $output;
	global $ExtJSDevImportRAW;
	global $ExtJSDevTMP;
	$AppoMescola = array();
	$notaCredito = false;
	$notaCreditoSegno= false;
	
	$result = file_get_contents($FileName);
	//$result = iconv( 'UTF-16LE' ,  'UTF-8' , $result);
	
	$xml = simplexml_load_string($result);
	if (!$xml) {
		$output['message'] = $output['message'] . 'XML Errore NOXML ' . WFFileName($FileName) . BRCRLF ;
		$output['failure'] = true;
		$output['success'] = false;
		goto fine;
	}
	
	$conn->StartTrans(); 
	
	if (property_exists ( $xml->children() , 'DC8_BatchProtocol' )){
		$DC8_BatchProtocol = $xml->children()->DC8_BatchProtocol;
		$DC8_BatchProtocolAttribute = $DC8_BatchProtocol->attributes();
		$AppoMescola['PROGRESSIVO'] = '';
		if (property_exists ( $DC8_BatchProtocolAttribute , 'ProductionOrderNo' )){
			$AppoMescola['PROGRESSIVO'] = $DC8_BatchProtocolAttribute->ProductionOrderNo->__toString();
		}
		if (property_exists ( $DC8_BatchProtocolAttribute , 'MixerNo' )){
			$AppoMescola['MIXERNAME'] = $DC8_BatchProtocolAttribute->MixerNo->__toString();
		}
		if (property_exists ( $DC8_BatchProtocolAttribute , 'MixerName' )){
			$AppoMescola['MIXERNAME'] = $DC8_BatchProtocolAttribute->MixerName->__toString();
		}
		$AppoMescola['DATAORA'] = DateTime::createFromFormat("Y-m-d\TH:i:s.uP"  , $DC8_BatchProtocolAttribute->ProductionDateTime->__toString());
		$AppoMescola['DATA'] = DateTime::createFromFormat("Y-m-d\TH:i:s.uP"  , $DC8_BatchProtocolAttribute->ProductionDateTime->__toString());
		$AppoMescola['SR'] = $AppoMescola['DATA'];
		$AppoMescola['LOTTO'] = $DC8_BatchProtocolAttribute->No->__toString();
		if (property_exists ( $DC8_BatchProtocolAttribute , 'RecipeName' )){
			$AppoMescola['RICETTA'] = $DC8_BatchProtocolAttribute->RecipeName->__toString();
			$AppoMescola['CT_RICETTA'] = $DC8_BatchProtocolAttribute->RecipeNo->__toString();
		}
		if (property_exists ( $DC8_BatchProtocolAttribute , 'VehicleNo' )){
			$AppoMescola['VEICOLO'] = $DC8_BatchProtocolAttribute->VehicleNo->__toString();
		}
		if (property_exists ( $DC8_BatchProtocolAttribute , 'TotalWeight' )){
			$AppoMescola['PESOTOT'] = $DC8_BatchProtocolAttribute->TotalWeight->__toString();
		}
		
		//$AnagraficaAzienda = WFVALUEDLOOKUP('*','anagrafiche','ID = ' . WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA'));
		//$AppoMescola['CT_VEICOLO'] = WFVALUEGLOBAL('SDI_CAUSALEATTIVANC');	
		
		if ($AppoMescola['PROGRESSIVO'] == ''){
			$output['message'] = $output['message'] . 'XML ' . $AppoMescola['PROGRESSIVO'] . $FileName . ' VUOTO Errore ' .BRCRLF ;
			$output['failure'] = true;
			$output['success'] = false;
			$conn->completeTrans(); 
			return null;
		}
		$mescolaID = WFVALUEDLOOKUP('ID','mescole',"PROGRESSIVO = '" . $AppoMescola['PROGRESSIVO'] . "'");
		if ($mescolaID == ''){
			try {   
				$conn->AutoExecute("mescole", $AppoMescola, 'INSERT');
			} catch (exception $e){
				$output['message'] = $output['message'] . 'XML ' . $AppoMescola['PROGRESSIVO'] . $FileName . ' DUPLICATA Errore ' .BRCRLF ;
				$output['failure'] = true;
				$output['success'] = false;
				$conn->completeTrans(); 
				return null;
			}
			$mescolaID = $conn->Insert_ID();
			$AppoMescola['ID'] = $mescolaID;
		}else{
			$conn->AutoExecute("mescole", $AppoMescola, 'UPDATE', 'ID =' . $mescolaID);
		}
		
		$BatchProtocolSetValueRow = $DC8_BatchProtocol->children()->BatchProtocolSetValueRow;
		foreach ($BatchProtocolSetValueRow as $RiferimentoNumeroLineaRiga){
			$RiferimentoNumeroLineaRigaAttribute = $RiferimentoNumeroLineaRiga->attributes();
			//var_dump ($RiferimentoNumeroLineaRigaAttribute);
			$AppoMescolaComponente = array();
			$AppoMescolaComponente['CT_MESCOLE'] = $mescolaID;
			$AppoMescolaComponente['MATERIALECODICE'] = $RiferimentoNumeroLineaRigaAttribute->MaterialNo->__toString();
			$AppoMescolaComponente['MATERIALE'] = $RiferimentoNumeroLineaRigaAttribute->MaterialName->__toString();
			$AppoMescolaComponente['SILO'] = $RiferimentoNumeroLineaRigaAttribute->CertSiloNo->__toString();
			$AppoMescolaComponente['ORIGINE'] = $RiferimentoNumeroLineaRigaAttribute->SiloName->__toString();
			$AppoMescolaComponente['QTA'] = $RiferimentoNumeroLineaRigaAttribute->ActualValueWeight->__toString();
			$AppoMescolaComponente['QTASETPOINT'] = $RiferimentoNumeroLineaRigaAttribute->SetValueWeight->__toString();
			$conn->AutoExecute("mescolecomponenti", $AppoMescolaComponente, 'INSERT');
		}
	}elseif (property_exists ( $xml->children() , 'DC8_TotalBatchProtocol' )){
		$DC8_TotalBatchProtocol = $xml->children()->DC8_TotalBatchProtocol;
		$DC8_TotalBatchProtocolAttribute = $DC8_TotalBatchProtocol->attributes();
		if (property_exists ( $DC8_TotalBatchProtocolAttribute , 'ProductionOrderNo' )){
			$AppoMescola['PROGRESSIVO'] = $DC8_TotalBatchProtocolAttribute->ProductionOrderNo->__toString();
		}
		if (property_exists ( $DC8_TotalBatchProtocolAttribute , 'MixerName' )){
			$AppoMescola['MIXERNAME'] = $DC8_TotalBatchProtocolAttribute->MixerName->__toString();
		}
		if (property_exists ( $DC8_TotalBatchProtocolAttribute , 'RecipeName' )){
			$AppoMescola['RICETTA'] = $DC8_TotalBatchProtocolAttribute->RecipeName->__toString();
		}
		if (property_exists ( $DC8_TotalBatchProtocolAttribute , 'RecipeNo' )){
			$AppoMescola['CT_RICETTA'] = $DC8_TotalBatchProtocolAttribute->RecipeNo->__toString();
		}
		if (property_exists ( $DC8_TotalBatchProtocolAttribute , 'VehicleNo' )){
			$AppoMescola['VEICOLO'] = $DC8_TotalBatchProtocolAttribute->VehicleNo->__toString();
		}
		$AppoMescola['PESOTOT'] = $DC8_TotalBatchProtocolAttribute->SumTotalWeight->__toString();
		
		$TotalBatchProtocolItemRow = $DC8_TotalBatchProtocol->children()->TotalBatchProtocolItemRow;
		$AppoMescola['LOTTO'] = '';
		foreach ($TotalBatchProtocolItemRow as $RiferimentoNumeroLineaRiga){
			$RiferimentoNumeroLineaRigaAttribute = $RiferimentoNumeroLineaRiga->attributes();
			$AppoMescola['DATAORA'] = DateTime::createFromFormat("Y-m-d\TH:i:s.uP"  , $RiferimentoNumeroLineaRigaAttribute->ProductionDateTime->__toString());
			$AppoMescola['DATA'] = DateTime::createFromFormat("Y-m-d\TH:i:s.uP"  , $RiferimentoNumeroLineaRigaAttribute->ProductionDateTime->__toString());
			$AppoMescola['SR'] = $AppoMescola['DATA'];
			$AppoMescola['LOTTO'] = $AppoMescola['LOTTO'] . $RiferimentoNumeroLineaRigaAttribute->BatchProtocolNo->__toString() . ";";
		}
		
		$mescolaID = WFVALUEDLOOKUP('ID','mescole',"PROGRESSIVO = '" . $AppoMescola['PROGRESSIVO'] . "'");
		if ($mescolaID == ''){
			try {   
				$conn->AutoExecute("mescole", $AppoMescola, 'INSERT');
			} catch (exception $e){
				$output['message'] = $output['message'] . 'XML ' . $AppoMescola['PROGRESSIVO'] . $FileName . ' DUPLICATA Errore ' .BRCRLF ;
				$output['failure'] = true;
				$output['success'] = false;
				$conn->completeTrans(); 
			}
			$mescolaID = $conn->Insert_ID();
			$AppoMescola['ID'] = $mescolaID;
		}else{
			$conn->AutoExecute("mescole", $AppoMescola, 'UPDATE', 'ID =' . $mescolaID);
		}
		
		$TotalBatchProtocolSetValueRow = $DC8_TotalBatchProtocol->children()->TotalBatchProtocolSetValueRow;
		foreach ($TotalBatchProtocolSetValueRow as $RiferimentoNumeroLineaRiga){
			$RiferimentoNumeroLineaRigaAttribute = $RiferimentoNumeroLineaRiga->attributes();
			//var_dump ($RiferimentoNumeroLineaRigaAttribute);
			$AppoMescolaComponente = array();
			$AppoMescolaComponente['CT_MESCOLE'] = $mescolaID;
			$AppoMescolaComponente['MATERIALECODICE'] = $RiferimentoNumeroLineaRigaAttribute->MaterialNo->__toString();
			$AppoMescolaComponente['MATERIALE'] = $RiferimentoNumeroLineaRigaAttribute->MaterialName->__toString();
			$AppoMescolaComponente['SILO'] = $RiferimentoNumeroLineaRigaAttribute->CertSiloNo->__toString();
			$AppoMescolaComponente['ORIGINE'] = $RiferimentoNumeroLineaRigaAttribute->SiloName->__toString();
			$AppoMescolaComponente['QTA'] = $RiferimentoNumeroLineaRigaAttribute->SumActualValueWeight->__toString();
			$AppoMescolaComponente['QTASETPOINT'] = $RiferimentoNumeroLineaRigaAttribute->SumSetValueWeight->__toString();
			$conn->AutoExecute("mescolecomponenti", $AppoMescolaComponente, 'INSERT');
		}
		
	}
	
	
	
	if ($conn->HasFailedTrans()) {
		$output['message'] = $output['message'] . 'Errore '  . WFFileName($FileName) . ' ' . $AppoMescola['PROGRESSIVO'] .BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		$conn->completeTrans(); 
		return null;
	}else{
		$output['message'] = $output['message'] . 'Registrata ' . $AppoMescola['PROGRESSIVO'] .BRCRLF;
		$output['failure'] = false;
		$output['success'] = true;
		$conn->completeTrans(); 
		return $mescolaID;
	}
	fine:
		$output['message'] = $output['message'] . 'Errore ' .BRCRLF;
		$output['failure'] = true;
		$output['success'] = false;
		$conn->completeTrans(); 
}

?>
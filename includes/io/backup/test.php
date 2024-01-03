<?php
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
	WFSetDebug(false);
	$output = array();
	$output["metaData"]["idProperty"] = "ID";
	$output["metaData"]["totalProperty"] = "total";
	$output["metaData"]["successProperty"] = "success";
	$output["metaData"]["rootProperty"] = "data";
	$output["metaData"]["root"]="data";
	$output["message"] = "";
	$output["messagedebug"] = "";
	$debugmessage = 0;
	$readeddataArray = array();

	$AnagraficaAziendaID = WFVALUEGLOBAL('CG_ANAGRAFICAAZIENDA');
	$CausaleAutoProduzione = WFVALUEDLOOKUP('*','causali','ID = ' . WFVALUEGLOBAL('MRP_CAUSALEAUTOPRODUZIONE'));
	$CausalePrenotazione = WFVALUEDLOOKUP('*','causali','ID = ' . WFVALUEGLOBAL('MRP_CAUSALEPRENOTAZIONE'));
	$CausaleVendita = WFVALUEDLOOKUP('*','causali','ID = ' . 1);
	$recordEsercizio  = WFVALUEDLOOKUP('*', 'cg_contabileesercizi', "DATAFINE >= " . WFSQLTODATE(WFVALUENOW('Y-m-d') ) . " AND DATAINIZIO <= " . WFSQLTODATE(WFVALUENOW('Y-m-d') ) );
	$MagazzinoID  = WFVALUEGLOBAL('MAGAZZINO');

	$cnVMT = ADONewConnection('mssqlnative');
	$cnVMT->debug=$conn->debug;
	$cnVMT->SetFetchMode(ADODB_FETCH_ASSOC);
	$cnVMT->setConnectionParameter('characterSet','UTF-8');
	$cnVMT->connect('172.16.10.5','View','ExternalVIEW','SDS31_DB');
	
	
	$sqlSegmentiVMT = "SELECT * 
						FROM [SDS31_DB].[View].[CustomExport01] 
						WHERE 1 = 1
							AND MOULDED_DATE >= '2021-06-01'
							
";
//AND MOULDED_DATE >= '2021-06-01'    
//AND BARCODE = 'S152126'
	$rsSegmentiVMT = $cnVMT->Execute($sqlSegmentiVMT);
	while (!$rsSegmentiVMT->EOF) {
		
		var_dump($rsSegmentiVMT->fields['BARCODE']);
		var_dump($rsSegmentiVMT->fields['SEGMENT']);
		
		$ConcioProgressivo = $rsSegmentiVMT->fields['SEGMENT']; //PEZZO PROGRESSIVO    $rfid
		$ConcioArticoloCodice = $rsSegmentiVMT->fields['SEGMENT_TYPE']; //PEZZO ARTICOLO
		$ConcioArticolo = WFVALUEDLOOKUP('*','articoli',"CODICE = '" . $ConcioArticoloCodice . "'");

		$ConcioDataOraStart = $rsSegmentiVMT->fields['MOULDED_DATE']; //PEZZO INIZIO
		$ConcioDataOraEnd = $rsSegmentiVMT->fields['FINISHED_DATE']; //PEZZO FINE
		
		$ConcioDDTDocData= $rsSegmentiVMT->fields['DELIVERED_DATE']; //DDT DATA
		$ConcioDDTDocNum = $rsSegmentiVMT->fields['DELIVERY_NOTE']; //DDT NUM
		$ConcioDDTNote = $rsSegmentiVMT->fields['NOTE_COMMENT']; //DDT DESCRIZIONE
		
		$sqlSegmenti = "SELECT * 
						FROM wms_udc
						WHERE SSCC = '" . $rsSegmentiVMT->fields['SEGMENT'] . "'";
							
		$rsSegmenti = $conn->Execute($sqlSegmenti);
		if ($rsSegmenti->RecordCount()==0) {
			//NASCITA UDC DA FERRO
			$wms_udc = array();
			$wms_udc['SSCC'] = $rsSegmentiVMT->fields['SEGMENT'];
			$wms_udc['SERIALBATCH'] = $rsSegmentiVMT->fields['SEGMENT'];
			$wms_udc['CT_ARTICOLI'] = $ConcioArticolo['ID'];
			$wms_udc['DATA'] = $ConcioDataOraStart;
			$conn->AutoExecute("wms_udc", $wms_udc, 'INSERT');
			$wms_udc['ID'] = $conn->Insert_ID();
		}
		
		$rsSegmentiVMT->MoveNext();
	}
					
?>
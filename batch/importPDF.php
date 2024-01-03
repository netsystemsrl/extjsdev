<?php	
	include('../includes/var.php');	
	//WFSetDebug(true);
	$debugmessage = 0;
	$output = array();
	$CollectObjList = array();
	$result = array(); 
	
	ini_set('memory_limit', '-1'); set_time_limit(0); 
	ini_set("zlib.output_compression", 0);  // off
	ini_set("implicit_flush", 1);  // on 
	// ini_set("output_buffering", 0);  // off 
	
	echo('IMPORT DA PDM DOCUMENTS PDF	'. BRCRLF);
	
	$ExtJSDevBatch	= $_SERVER['DOCUMENT_ROOT'].'/batch/';
	$ExtJSDevImportShare = 'ImportShare/';
	chdir($ExtJSDevBatch);
		
	//$dirIN = array_diff( scandir($ExtJSDevBatch . $ExtJSDevImportShare), array(".", "..") );
	$dirIN = glob($ExtJSDevBatch . $ExtJSDevImportShare . '*.{pdf}', GLOB_BRACE);
	foreach ($dirIN as $key => $FileINName){
		$fileFound = false;
		$fileLink = false;
		
		$infoINName = pathinfo($FileINName);
		echo(BRCRLF);
		echo('FOUND PDF	' . $FileINName . BRCRLF);	
		
		//convert OCR
		//$OCRCommand = $ExtJSDevBatch . 'PSASCMD.EXE BARCODE "./' . $ExtJSDevImportShare . $infoINName['basename'] .'" -B3 -O.\tmp\ -P{barcode}-' . $infoINName['filename'] ."";
		$OCRCommand = $ExtJSDevBatch . 'convert -density 300  test.pdf[0] test.jpeg';
		$OCRCommand = $ExtJSDevBatch . 'bardecode -t any -f test.jpeg';
		
		$logExec = shell_exec($OCRCommand);
		echo('OCR PDF	' . $logExec . BRCRLF);
		
		//test file converted 
		$dirOCR = glob($ExtJSDevBatch . 'tmp/' . '*.{pdf}', GLOB_BRACE);
		foreach ($dirOCR as $key => $FileName){
			echo('BARCODE PDF	' . $FileName . BRCRLF);		
			$fileFound = true;
			$fileLink = true;	
			$infoName = pathinfo($FileName);
			
			//barcode is compatibility with ExtJSDev
			if ($ExtJSDevCodeSWEAN == substr($infoName['filename'], 0, strlen($ExtJSDevCodeSWEAN))){
				
				$AppoRecord = array();
				$AppoRecord['DESCNAME'] = 'FILE DA SCANNER IMPORT';		
				$AppoRecord['FILENAME'] = $infoName['basename'] ;
				$AppoRecord['FILEEXT'] = '.' . $infoName['extension'];
				$AppoRecord['CT_TABLE'] = WFVALUEDLOOKUP('TABLENAME', $ExtJSDevDB . 'sequence', "BARCODEPRECODE = '" . substr($infoName['filename'], strlen($ExtJSDevCodeSWEAN), 2) . "'");
				$AppoRecord['CT_ID'] = WFVALUEDLOOKUP('ID', $AppoRecord['CT_TABLE'], "DOCBARCODE = '" . substr($infoName['filename'], 0, 13) . "'");
						
				//import in DB	
				$sql = "SELECT * FROM " . $ExtJSDevDB . "documents WHERE FILENAME = '" . $infoName['basename'] . "'";
				$RsDocuments = $conn->Execute($sql);
				if ($RsDocuments->RecordCount() == 0){
					$sqlC = $conn->GetInsertSQL($RsDocuments, $AppoRecord);
					if ($sqlC != '') {
						$conn->Execute($sqlC); 
						copy($ExtJSDevBatch . 'tmp/' . $infoName['basename'], $ExtJSDevDOC  . $infoName['basename']);
						$fileLink = true;
						echo('LINKED PDF '. $infoName['basename'].  '-' . $AppoRecord['CT_ID'] . BRCRLF);
					}else{
						$fileLink = false;
						echo('ORPHAN PDF '. $infoName['basename']. BRCRLF);
					}
				}else{
					$fileLink = true;
					copy($ExtJSDevBatch . 'tmp/' . $infoName['basename'], $ExtJSDevDOC  . $infoName['basename']);
					echo('OVERWRITE PDF '. $infoName['basename'] . BRCRLF);
				}
				$RsDocuments->close();
			}
			//cancello file ocr
			unlink($ExtJSDevBatch . 'tmp/' . $infoName['basename']);
		}
		
		//cancello file pdf
		if ($fileLink  && $fileFound) {
			echo('DELETE PDF	' . $FileINName . BRCRLF);
			unlink($ExtJSDevBatch . $ExtJSDevImportShare . $FileINName);	
		}
	}
?>
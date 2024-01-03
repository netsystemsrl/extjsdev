<?php

/*
93 15 00 00 00 06 01 03 10 00 00 02
92 f8 00 00 00 06 01 02 00 01 00 06

00 5B 00 00 00 06 01 03 00 00 00 0A
                             qta
                        db
                     funzione
		  nodo
               06 NL fisso
            00 NHf isso
         00 tipoL fisso
      00 tipoH fisso
   01 progressivoL 
00 progressivoH
	 
000100000006010310000002

*/
require_once dirname(__FILE__) . 'ModbusMaster.php';

// Create Modbus object
$modbus = new ModbusMaster("172.16.10.221", "TCP");
$moduleId = 2;

function readWord($address = 339){
	global $modbus, $moduleId;
	try {
		$recData = $modbus->readMultipleRegisters($moduleId, $address, 2);
		
		//return unpack("L",pack("C*",$recData[1],$recData[0]));
		
		$values = array_chunk($recData, 2);
		foreach ($values as $bytes) {
			return (float) PhpType::bytes2unsignedInt($bytes);
		}
		
	}
	catch (Exception $e) {
		// Print error information if any
		echo $modbus;
		echo $e;
		exit;
	}
}

function readLong($address= 301){
	global $modbus, $moduleId;
	try {
		$recData = $modbus->readMultipleRegisters($moduleId, $address, 4);
		$result = (unpack("L",pack("C*",$recData[3],$recData[2],$recData[1],$recData[0])));
		return (intval(strval($result[1])));
	}
	catch (Exception $e) {
		// Print error information if any
		echo $modbus;
		echo $e;
		exit;
	}
}
?>
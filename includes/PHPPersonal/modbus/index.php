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
echo('FREQUENZA') ;
var_dump(readWord(hexdec("339"))/10);
echo('<BR>') ;

echo('TENSIONE') ;
var_dump(readLong(hexdec("301"))/1000);
echo('<BR>') ;

echo('TENSIONE') ;
var_dump(readLong(hexdec("305"))/1000);
echo('<BR>') ;

echo('TENSIONE') ;
var_dump(readLong(hexdec("309"))/1000);
echo('<BR>') ;


echo('CORRENTE') ;
var_dump(readLong(hexdec("30d"))/1000);
echo('<BR>') ;

echo('CORRENTE') ;
var_dump(readLong(hexdec("311"))/1000);
echo('<BR>') ;

echo('CORRENTE') ;
var_dump(readLong(hexdec("315"))/1000);
echo('<BR>') ;


/*
try {
	$moduleId = 2;
	$recData = $modbus->readMultipleRegisters($moduleId, hexdec("301"), 4);
}
catch (Exception $e) {
	// Print error information if any
	echo $modbus;
	echo $e;
	exit;
}



var_dump($recDat);
echo('<BR>');
echo PhpType::bytes2string($recData);
echo('<BR>');
var_dump($modbus->RxUINT($recData, 0));


$values = array_chunk($recData, 4);
$energymeter_param = array();
$count = 1;
foreach($values as $bytes){   
    $temp = PhpType::bytes2unsignedint($bytes);
	//$temp = PhpType::bytes2float($recData, 0);  
    $energymeter_param[$count] = $temp;
    $count++;
}
var_dump($energymeter_param);

/*
PhpType::bytes2float($recData, $endianness)
PhpType::bytes2float(array_reverse($recData), $endianness)
*/

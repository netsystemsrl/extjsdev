<?php

require_once dirname(__FILE__) . '/../Phpmodbus/ModbusMaster.php';

// Create Modbus object
$modbus = new ModbusMaster("192.192.15.51", "UDP");

try {
    // FC 2
    // read 2 input bits from address 0x0 (Wago input image)
	
    $moduleId = 255;
    $reference = 12288;
    $mw0address = 12288;
    $quantity = 6;
	
    $recData = $modbus->readInputDiscretes($moduleId, 0, $quantity);
	
	
    $recData = $modbus->readMultipleRegisters($moduleId, $reference, $quantity);
	
}
catch (Exception $e) {
    // Print error information if any
    echo $modbus;
    echo $e;
    exit;
}

// Print status information
echo "</br>Status:</br>" . $modbus;

// Print read data
echo "</br>Data:</br>";
var_dump($recData); 
echo "</br>";
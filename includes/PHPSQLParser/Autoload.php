<?php
/**
 * This file is part of the SetaPDF package
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @package    SetaPDF
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Autoload.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

spl_autoload_register(function($class)
{
    static $path = null;

    if (strpos($class, 'PHPSQLParser') === 0) {
        if (null === $path) {
            $path =  $_SERVER['DOCUMENT_ROOT'] .'/includes';
        }

        $filename = str_replace('_', '/', $class) . '.php';
        $filename = str_replace('\\', '/', $class) . '.php';
        $fullpath = $path . '/' . $filename;

        if (file_exists($fullpath)) {
            require_once $fullpath;
        }else{
			echo("<BR>\n" . 'ERRORE ' .$fullpath . "<BR>\n");
		}
    }
});
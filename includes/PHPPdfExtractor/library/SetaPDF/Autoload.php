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

    if (strpos($class, 'SetaPDF_') === 0) {
        if (null === $path) {
            $path = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..');
        }

        $filename = str_replace('_', DIRECTORY_SEPARATOR, $class) . '.php';
        $fullpath = $path . DIRECTORY_SEPARATOR . $filename;

        if (file_exists($fullpath)) {
            /** @noinspection PhpIncludeInspection */
            require_once $fullpath;
        }
    }
});
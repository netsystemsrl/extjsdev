<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FileInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * An interface for file writer classes.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Writer_FileInterface
{
    /**
     * Get the path of the file.
     *
     * @return string
     */
    public function getPath();
}
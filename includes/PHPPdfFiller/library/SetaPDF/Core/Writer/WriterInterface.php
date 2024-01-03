<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: WriterInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * The writer interface
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Writer_WriterInterface
    extends SetaPDF_Core_WriteInterface
{
    /**
     * Method called when the writing process starts.
     *
     * This method could send for example headers.
     */
    public function start();

    /**
     * This method is called when the writing process is finished.
     *
     * It could close a file handle for example or send headers and flush a buffer.
     */
    public function finish();

    /**
     * Get the current writer status.
     *
     * @see SetaPDF_Core_Writer
     * @return integer
     */
    public function getStatus();

    /**
     * Gets the current position/offset.
     *
     * @return integer
     */
    public function getPos();

    /**
     * Method called if a documents cleanUp-method is called.
     */
    public function cleanUp();
}
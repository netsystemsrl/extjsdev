<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id$
 */

/**
 * Class representing an application extension inside of a GIF.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Block_Extension_Application extends SetaPDF_Core_Image_Gif_Block_Extension_AbstractExtension
{
    /**
     * The application name.
     *
     * @var string
     */
    public $applicationName;

    /**
     * The application authentication code.
     *
     * @var string
     */
    public $applicationAuthenticationCode;

    /**
     * The given application data.
     *
     * @var string
     */
    public $applicationData;

    /**
     * @inheritdoc
     */
    protected function _readBody(SetaPDF_Core_Image_Gif_Reader_Sequence $reader)
    {
        $this->applicationName = $reader->readBytes(8);
        $this->applicationAuthenticationCode = $reader->readBytes(3);

        if ($this->applicationName === false || $this->applicationAuthenticationCode === false) {
            throw new SetaPDF_Core_Image_Exception('Cannot read application block.');
        }

        $reader->readUntilEndOfStream();
        $this->applicationData = $reader->readBytes($reader->getBufferLength());
    }
}
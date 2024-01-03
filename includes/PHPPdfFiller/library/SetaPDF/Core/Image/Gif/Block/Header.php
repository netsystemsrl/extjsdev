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
 * Class representing a header inside of a GIF.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Block_Header extends SetaPDF_Core_Image_Gif_Block_AbstractBlock
{
    /**
     * The GIF signature.
     *
     * @var string
     */
    public $signature;

    /**
     * The GIF version.
     *
     * @var string
     */
    public $version;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     * @throws SetaPDF_Core_Image_Exception
     */
    public function __construct(SetaPDF_Core_Reader_Binary $reader)
    {
        $pos = 0;
        do {
            $this->signature = $reader->readBytes(3, $pos++);
        } while ($this->signature !== 'GIF' && $this->signature !== false);

        if ($this->signature === false) {
            throw new SetaPDF_Core_Image_Exception('No GIF header found.');
        }

        $this->version = $reader->readBytes(3);
        if ($this->version !== '89a' && $this->version !== '87a') {
            throw new SetaPDF_Core_Image_Exception(sprintf('Unsupported GIF version (%s).', $this->version));
        }
    }
}
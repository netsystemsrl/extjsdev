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
 * Class representing any extension inside of a GIF.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Image_Gif_Block_Extension_AbstractExtension extends SetaPDF_Core_Image_Gif_Block_AbstractBlock
{
    /**
     * Creates an extension block instance.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     * @return SetaPDF_Core_Image_Gif_Block_Extension_PlainText|SetaPDF_Core_Image_Gif_Block_Extension_Application|SetaPDF_Core_Image_Gif_Block_Extension_Comment|SetaPDF_Core_Image_Gif_Block_Extension_GraphicControl
     * @throws SetaPDF_Core_Image_Exception
     */
    public static function createExtension(SetaPDF_Core_Reader_Binary $reader)
    {
        $extensionType = $reader->readUInt8();

        switch ($extensionType) {
            case 0x01:
                return new SetaPDF_Core_Image_Gif_Block_Extension_PlainText($reader);
            case 0xFF:
                return new SetaPDF_Core_Image_Gif_Block_Extension_Application($reader);
            case 0xFE:
                return new SetaPDF_Core_Image_Gif_Block_Extension_Comment($reader);
            case 0xF9:
                return new SetaPDF_Core_Image_Gif_Block_Extension_GraphicControl($reader);
            default:
                throw new SetaPDF_Core_Image_Exception(sprintf('Unknown GIF extension type: %02x', $extensionType));
        }
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     * @throws SetaPDF_Core_Image_Exception
     */
    public function __construct(SetaPDF_Core_Reader_Binary $reader)
    {
        $sequence = new SetaPDF_Core_Image_Gif_Reader_Sequence($reader);

        $this->_readBody($sequence);
        $sequence->readUntilEndOfStream();
    }

    /**
     * Reads the content of the extension.
     *
     * @param SetaPDF_Core_Image_Gif_Reader_Sequence $reader
     */
    abstract protected function _readBody(SetaPDF_Core_Image_Gif_Reader_Sequence $reader);
}
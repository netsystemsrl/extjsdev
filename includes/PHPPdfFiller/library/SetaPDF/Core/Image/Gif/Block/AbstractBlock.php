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
 * Class representing any block inside of a GIF.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Image_Gif_Block_AbstractBlock
{
    /**
     * Creates a new block instance (extension or image descriptor).
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     * @return bool|SetaPDF_Core_Image_Gif_Block_Extension_Application|SetaPDF_Core_Image_Gif_Block_Extension_Comment|SetaPDF_Core_Image_Gif_Block_Extension_GraphicControl|SetaPDF_Core_Image_Gif_Block_Extension_PlainText|SetaPDF_Core_Image_Gif_Block_ImageDescriptor
     * @throws SetaPDF_Core_Image_Exception
     */
    public static function createExtensionOrImageDescriptor(SetaPDF_Core_Reader_Binary $reader)
    {
        $introducer = $reader->readUInt8();

        switch ($introducer) {
            case 0x21:
                return SetaPDF_Core_Image_Gif_Block_Extension_AbstractExtension::createExtension($reader);
            case 0x2C:
                return new SetaPDF_Core_Image_Gif_Block_ImageDescriptor($reader);
        }

        return $introducer === 0x3B;
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     */
    abstract public function __construct(SetaPDF_Core_Reader_Binary $reader);
}
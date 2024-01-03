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
 * Class representing an image descriptor inside of a GIF.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Block_ImageDescriptor extends SetaPDF_Core_Image_Gif_Block_AbstractBlock
{
    /**
     * The frame x position from the left.
     *
     * @var int
     */
    public $left;

    /**
     * The frame y position from the top.
     *
     * @var int
     */
    public $top;

    /**
     * The frame width.
     *
     * @var int
     */
    public $width;

    /**
     * The frame height.
     *
     * @var int
     */
    public $height;

    /**
     * The local color table.
     *
     * If null, the global color table shall be used.
     *
     * @var null|array
     */
    public $colorTable;

    /**
     * Flag for interlacing.
     *
     * @var bool
     */
    public $interlace;

    /**
     * The min code size.
     *
     * Used for the LZW-Encoding.
     *
     * @var int
     */
    public $minCodeSize;

    /**
     * The LZW compressed data.
     *
     * @var SetaPDF_Core_Image_Gif_Reader_Sequence
     */
    public $data;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     */
    public function __construct(SetaPDF_Core_Reader_Binary $reader)
    {
        $this->left = $reader->readUInt16(null, SetaPDF_Core_Reader_Binary::BYTE_ORDER_LITTLE_ENDIAN);
        $this->top = $reader->readUInt16(null, SetaPDF_Core_Reader_Binary::BYTE_ORDER_LITTLE_ENDIAN);
        $this->width = $reader->readUInt16(null, SetaPDF_Core_Reader_Binary::BYTE_ORDER_LITTLE_ENDIAN);
        $this->height = $reader->readUInt16(null, SetaPDF_Core_Reader_Binary::BYTE_ORDER_LITTLE_ENDIAN);

        $packedField = $reader->readUInt8();

        $colorTableSize = $packedField & 0x7;
        $reserved = ($packedField & 0x18) >> 3;
        $sortFlag = ($packedField & 0x20) >> 5;
        $this->interlace = ($packedField & 0x40) >> 6 === 1;
        $colorTablePresent = ($packedField & 0x80) >> 7 === 1;

        if ($colorTablePresent) {
            $bytes = $reader->readBytes((1 << ( $colorTableSize + 1)) * 3);

            if ($bytes === false) {
                throw new SetaPDF_Core_Image_Exception('Cannot read color table.');
            }

            $this->colorTable = str_split($bytes, 3);
        } else {
            $this->colorTable = null;
        }

        $this->minCodeSize = $reader->readUInt8();

        $this->data = new SetaPDF_Core_Image_Gif_Reader_Sequence($reader);
        $this->data->readUntilEndOfStream();
    }
}
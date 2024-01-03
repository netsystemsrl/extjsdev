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
 * Class representing a logical screen descriptor inside of a GIF.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Block_LogicalScreenDescriptor extends SetaPDF_Core_Image_Gif_Block_AbstractBlock
{
    /**
     * The image width.
     *
     * @var int
     */
    public $width;

    /**
     * The image height.
     *
     * @var int
     */
    public $height;

    /**
     * The global color table.
     *
     * @var null|array
     */
    public $colorTable;

    /**
     * The background color index.
     *
     * @var int
     */
    public $backgroundColor;

    /**
     * The pixel aspect ratio.
     *
     * Factor used to compute an approximation.
     *
     * @var string
     */
    public $pixelAspectRatio;

    /**
     * The color resolution.
     *
     * Value used to hint the richness of the color table, even if entries are missing.
     *
     * @var int
     */
    public $colorResolution;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     * @throws SetaPDF_Core_Image_Exception
     */
    public function __construct(SetaPDF_Core_Reader_Binary $reader)
    {
        $this->width = $reader->readUInt16(null, SetaPDF_Core_Reader_Binary::BYTE_ORDER_LITTLE_ENDIAN);
        $this->height = $reader->readUInt16(null, SetaPDF_Core_Reader_Binary::BYTE_ORDER_LITTLE_ENDIAN);

        $packedField = $reader->readUInt8();

        $colorTableSize = $packedField & 0x7;
        $sortFlag = ($packedField & 0x8) >> 3;
        $this->colorResolution = ($packedField & 0x70) >> 4;
        $colorTablePresent = ($packedField & 0x80) >> 7 === 1;

        $this->backgroundColor = $reader->readUInt8();
        $this->pixelAspectRatio = $reader->readByte();

        if ($this->pixelAspectRatio === false) {
            throw new SetaPDF_Core_Image_Exception('Cannot read pixel aspect ratio.');
        }

        if ($colorTablePresent) {
            $bytes = $reader->readBytes((1 << ($colorTableSize + 1)) * 3);

            if ($bytes === false) {
                throw new SetaPDF_Core_Image_Exception('Cannot read color table.');
            }

            $this->colorTable = str_split($bytes, 3);
        } else {
            $this->colorTable = null;
        }
    }
}
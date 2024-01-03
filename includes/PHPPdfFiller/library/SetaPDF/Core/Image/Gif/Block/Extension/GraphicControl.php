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
 * Class representing a graphic control extension inside of a GIF.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Block_Extension_GraphicControl extends SetaPDF_Core_Image_Gif_Block_Extension_AbstractExtension
{
    /**
     * A flag that determines if this block contains a transparent color.
     *
     * @var bool
     */
    public $transparentColorFlag;

    /**
     * A flag that tells the reader to wait for user input before rendering the next frame.
     *
     * @var bool
     */
    public $userInputFlag;

    /**
     * The disposal method.
     *
     * @var int
     */
    public $disposalMethodFlag;

    /**
     * Flag reserved for future specification.
     *
     * @var int
     */
    public $reservedFlag;

    /**
     * The time that the frame shall be displayed.
     *
     * @var int
     */
    public $delayTime;

    /**
     * An index for the color table that shall be transparent for the next rendering run.
     *
     * @var int
     */
    public $transparentColorIndex;

    /**
     * @inheritdoc
     *
     * @throws SetaPDF_Core_Image_Exception
     */
    protected function _readBody(SetaPDF_Core_Image_Gif_Reader_Sequence $reader)
    {
        $packed = $reader->readByte();

        if ($packed === false) {
            throw new SetaPDF_Core_Image_Exception('Cannot read packed field.');
        }

        $packed = SetaPDF_Core_BitConverter::formatFromUInt8($packed);

        $this->transparentColorFlag = $packed & 0x1 === 1;
        $this->userInputFlag = ($packed & 0x2) >> 1 === 1;
        $this->disposalMethodFlag = ($packed & 0x1C) >> 2;
        $this->reservedFlag = ($packed & 0xE0) >> 4;

        $this->delayTime = $reader->readBytes(2);
        if ($this->delayTime === false) {
            throw new SetaPDF_Core_Image_Exception('Cannot read delay time.');
        }

        $this->delayTime = SetaPDF_Core_BitConverter::formatFromUInt16($this->delayTime);

        $this->transparentColorIndex = $reader->readByte();
        if ($this->transparentColorIndex === false) {
            throw new SetaPDF_Core_Image_Exception('Cannot read transparent color index.');
        }

        $this->transparentColorIndex = SetaPDF_Core_BitConverter::formatFromUInt8($this->transparentColorIndex);
    }
}
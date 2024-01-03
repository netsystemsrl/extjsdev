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
 * Class representing a GIF frame.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Frame
{
    /**
     * A static flag to enable or disable the caching of frames.
     *
     * @var bool
     */
    public static $cache = true;

    /**
     * The associated image descriptors.
     *
     * @var SetaPDF_Core_Image_Gif_Block_ImageDescriptor[]
     */
    private $_imageDescriptor;

    /**
     * The transparent indices.
     *
     * @var array
     */
    private $_transparentIndices;

    /**
     * The previous frame that shall be rendered underneath the current one.
     *
     * @var SetaPDF_Core_Image_Gif_Frame
     */
    private $_previousFrame;

    /**
     * The GIF reader.
     *
     * @var SetaPDF_Core_Image_Gif_Reader
     */
    private $_reader;

    /**
     * The cached image stream.
     *
     * @var string|null
     */
    private $_stream;

    /**
     * The cached transparent pixels, if there are no pixels left, the value will change to null.
     *
     * @var string|null
     */
    private $_transparencyMask;

    /**
     * The cached number of transparent pixels, if there are no pixels left, the value will change to null.
     *
     * @var int|null
     */
    private $_transparencyPixelCount;

    /**
     * The time to wait before drawing the next frame.
     *
     * @var int
     */
    private $_delayTime;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Image_Gif_Reader $reader
     * @param SetaPDF_Core_Image_Gif_Block_ImageDescriptor $image
     * @param array $transparentIndices
     * @param SetaPDF_Core_Image_Gif_Frame|null $previousFrame
     * @param int $delayTime
     */
    public function __construct(
        SetaPDF_Core_Image_Gif_Reader $reader,
        SetaPDF_Core_Image_Gif_Block_ImageDescriptor $image,
        $transparentIndices,
        SetaPDF_Core_Image_Gif_Frame $previousFrame = null,
        $delayTime = 0
    ) {
        $this->_reader = $reader;
        // TODO: remove empty frame caching ? (resolve last changed frame)
        $this->_previousFrame = $previousFrame;

        $this->_imageDescriptor = $image;
        $this->_transparentIndices = $transparentIndices;
        $this->_delayTime = $delayTime;
    }

    /**
     * Gets the color table.
     *
     * @return array|null
     * @throws SetaPDF_Core_Image_Exception
     */
    private function _getColorTable()
    {
        $colorTable = null;

        // get local color table.
        if ($this->_imageDescriptor->colorTable !== null) {
            $colorTable = $this->_imageDescriptor->colorTable;
        }

        // get global color table.
        if ($colorTable === null && $this->_reader->screenDescriptor->colorTable !== null) {
            $colorTable = $this->_reader->screenDescriptor->colorTable;
        }

        if ($colorTable === null) {
            throw new SetaPDF_Core_Image_Exception('No color table given.');
        }

        // set the transparent indices to false.
        foreach ($this->_transparentIndices as $transparentIndex) {
            $colorTable[$transparentIndex] = false;
        }

        return $colorTable;
    }

    /**
     * Ensures that the stream is the read stream.
     *
     * @param string|null $stream
     * @param string|null $transparencyMask
     * @param int|null $transparencyPixelCount
     * @throws SetaPDF_Core_Image_Exception
     */
    private function _ensureStream(&$stream, &$transparencyMask, &$transparencyPixelCount = null)
    {
        if ($this->_stream === null) {
            $this->_readStream($stream, $transparencyMask, $transparencyPixelCount);
            if (self::$cache) {
                /** @noinspection ReferenceMismatchInspection */
                $this->_stream = $stream;
                /** @noinspection ReferenceMismatchInspection */
                $this->_transparencyMask = $transparencyMask;
                /** @noinspection ReferenceMismatchInspection */
                $this->_transparencyPixelCount = $transparencyPixelCount;
            }
            return;
        }

        $stream = $this->_stream;
        $transparencyMask = $this->_transparencyMask;
        $transparencyPixelCount = $this->_transparencyPixelCount;
    }

    /**
     * Reads the current stream and renders it onto the image stream.
     *
     * @param string|null $stream
     * @param string|null $transparencyMask
     * @param int|null $transparencyPixelCount
     * @throws SetaPDF_Core_Image_Exception
     */
    private function _readStream(&$stream, &$transparencyMask, &$transparencyPixelCount)
    {
        if ($this->_previousFrame !== null) {
            $this->_previousFrame->_ensureStream($stream, $transparencyMask, $transparencyPixelCount);
        }


        $colorTable = $this->_getColorTable();
        if ($stream === null) {
            $backgroundColorIndex = $this->_reader->screenDescriptor->backgroundColor;
            if (isset($this->_reader->screenDescriptor->colorTable[$backgroundColorIndex]) && count($this->_transparentIndices) === 0) {
                $backgroundColor = $this->_reader->screenDescriptor->colorTable[$backgroundColorIndex];
            } else {
                $backgroundColor = false;
            }

            $pixelCount = $this->_reader->screenDescriptor->width * $this->_reader->screenDescriptor->height;
            if ($backgroundColor !== false) {
                $stream = str_repeat($backgroundColor, $pixelCount);
            } else {
                $stream = str_repeat("\x00\x00\x00", $pixelCount);
                $transparencyMask = str_repeat("\x00", $pixelCount);
                $transparencyPixelCount = $pixelCount;
            }
        }

        $filter = new SetaPDF_Core_Image_Gif_Filter_Lzw(
            new SetaPDF_Core_Image_Gif_Reader_Bit($this->_imageDescriptor->data),
            $this->_imageDescriptor->minCodeSize,
            array_keys($colorTable)
        );
        $pixels = $filter->uncompress();

        if ($this->_imageDescriptor->interlace) {
            $filter = new SetaPDF_Core_Image_Gif_Filter_Interlace(
                $pixels,
                $this->_imageDescriptor->width,
                $this->_imageDescriptor->height
            );
            $pixels = $filter->uncompress();
            unset($filter);
        }

        $this->_applyPixels($stream, $transparencyMask, $transparencyPixelCount, $pixels, $colorTable);
        if ($transparencyPixelCount <= 0) {
            $transparencyMask = null;
        }
    }

    /**
     * Applies all the pixel changes onto the stream.
     *
     * @param string $stream
     * @param string|null $transparencyMask
     * @param int|null $transparencyPixelCount
     * @param int[] $pixels
     * @param string[] $colorTable
     */
    private function _applyPixels(&$stream, &$transparencyMask, &$transparencyPixelCount, $pixels, $colorTable)
    {
        $noComponents = 3;
        $startPos = 0;
        $startPos += $this->_imageDescriptor->top * $this->_reader->screenDescriptor->width;
        $startPos += $this->_imageDescriptor->left;
        $startPos *= $noComponents;

        $lineWidth = $this->_reader->screenDescriptor->width * $noComponents;
        $x = 0;

        $pos = $startPos;
        foreach ($pixels as $pixel) {
            $pixel = $colorTable[$pixel];

            // the pixel is not transparent.
            if ($pixel !== false) {
                $stream[$pos] = $pixel[0];
                $stream[$pos + 1] = $pixel[1];
                $stream[$pos + 2] = $pixel[2];

                if ($transparencyMask !== null) {
                    $_strPos = $pos / $noComponents;
                    if ($transparencyMask[$_strPos] === "\x00") {
                        $transparencyMask[$_strPos] = "\xFF";
                        $transparencyPixelCount--;
                    }
                }
            }

            $pos += $noComponents;

            if (++$x === $this->_imageDescriptor->width) {
                $x = 0;
                $startPos += $lineWidth;
                $pos = $startPos;
            }
        }
    }

    /**
     * Creates a SMask for the current image.
     *
     * @param string $transparencyMask
     * @return SetaPDF_Core_Type_Stream
     */
    private function _createMaskStream($transparencyMask)
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('XObject', true));
        $dictionary->offsetSet('Subtype', new SetaPDF_Core_Type_Name('Image', true));
        $dictionary->offsetSet('Width', new SetaPDF_Core_Type_Numeric($this->_reader->screenDescriptor->width));
        $dictionary->offsetSet('Height', new SetaPDF_Core_Type_Numeric($this->_reader->screenDescriptor->height));
        $dictionary->offsetSet('ImageMask', new SetaPDF_Core_Type_Boolean(true));
        $dictionary->offsetSet('Filter', new SetaPDF_Core_Type_Name('FlateDecode', true));

        $sMaskStream = '';
        $bit = 0;
        $x = 0;
        $bitCounter = 0;

        $width = $this->_reader->screenDescriptor->width;

        for ($i = 0, $iMax = strlen($transparencyMask); $i < $iMax; $i++) {
            $byte = $transparencyMask[$i];

            $bit = ($bit << 1) | ($byte !== "\x00" ? 0b0 : 0b1);
            $x++;
            $bitCounter++;

            // end of line reached
            if ($x >= $width) {
                if ($bitCounter > 0 && $bitCounter < 8) {
                    $bit <<= 8 - $bitCounter;
                    $bitCounter = 8;
                }
                $x = 0;
            }

            // end of byte reached
            if ($bitCounter >= 8) {
                $sMaskStream .= chr($bit);
                $bit = 0;
                $bitCounter = 0;
            }
        }

        return new SetaPDF_Core_Type_Stream($dictionary, gzcompress($sMaskStream));
    }

    /**
     * Get the time to wait before drawing the next frame.
     *
     * @return int
     */
    public function getDelayTime()
    {
        return $this->_delayTime;
    }

    /**
     * Creates a XObject using the stored frame data.
     *
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_XObject_Image
     * @throws SetaPDF_Core_Image_Exception
     */
    public function toXObject(SetaPDF_Core_Document $document)
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('XObject', true));
        $dictionary->offsetSet('Subtype', new SetaPDF_Core_Type_Name('Image', true));
        $dictionary->offsetSet('Width', new SetaPDF_Core_Type_Numeric($this->_reader->screenDescriptor->width));
        $dictionary->offsetSet('Height', new SetaPDF_Core_Type_Numeric($this->_reader->screenDescriptor->height));
        $dictionary->offsetSet('BitsPerComponent', new SetaPDF_Core_Type_Numeric(8));
        $dictionary->offsetSet('ColorSpace', new SetaPDF_Core_Type_Name('DeviceRGB'));
        $dictionary->offsetSet('Filter', new SetaPDF_Core_Type_Name('FlateDecode', true));

        $this->_ensureStream($stream, $transparencyMask);

        if ($stream === null) {
            throw new SetaPDF_Core_Image_Exception('Image could not be rendered.');
        }

        if ($transparencyMask !== null) {
            $maskStream = $this->_createMaskStream($transparencyMask);
            $image = new SetaPDF_Core_XObject_Image($document->createNewObject($maskStream));
            $dictionary->offsetSet('Mask', $image->getIndirectObject());
        }

        $stream = new SetaPDF_Core_Type_Stream($dictionary, gzcompress($stream));
        return new SetaPDF_Core_XObject_Image($document->createNewObject($stream));
    }
}
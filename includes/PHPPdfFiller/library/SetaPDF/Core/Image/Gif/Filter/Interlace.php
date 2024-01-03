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
 * Class to apply interlacing.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Filter_Interlace
{
    /**
     * The input pixels
     *
     * @var array
     */
    private $_pixels;

    /**
     * Frame width.
     *
     * @var int
     */
    private $_width;

    /**
     * Frame height.
     *
     * @var int
     */
    private $_height;

    /**
     * The constructor.
     *
     * @param array $pixels
     * @param int $width
     * @param int $height
     */
    public function __construct(array $pixels, $width, $height)
    {
        $this->_pixels = $pixels;
        $this->_width = $width;
        $this->_height = $height;
    }

    /**
     * Uncompresses the LZW data of a GIF image and applies interlacing.
     *
     * @return array
     * @throws SetaPDF_Core_Image_Exception
     */
    public function uncompress()
    {
        $newPixels = [];

        $pixelLines = [];
        $pixelLines[] = $_set = ceil($this->_height / 8);
        $pixelLines[] = $_set += ceil(($this->_height - 4) / 8);
        $pixelLines[] = $_set + ceil(($this->_height - 2) / 4);

        $w = [];
        $_w = $this->_width;
        for ($i = 0; $i <= 2; $i++) {
            $w[] = $_w *= 2;
        }

        $from = $to = 0;

        $value = $pixelLines[0] * $this->_width;
        for (; $from < $value; $from += $this->_width, $to += $w[2]) {
            for ($i = 0; $i < $this->_width; $i++) {
                $newPixels[$to + $i] = $this->_pixels[$from + $i];
            }
        }

        $value = $pixelLines[1] * $this->_width;
        for ($to = $w[1]; $from < $value; $from += $this->_width, $to += $w[2]) {
            for ($i = 0; $i < $this->_width; $i++) {
                $newPixels[$to + $i] = $this->_pixels[$from + $i];
            }
        }

        $value = $pixelLines[2] * $this->_width;
        for ($to = $w[0]; $from < $value; $from += $this->_width, $to += $w[1]) {
            for ($i = 0; $i < $this->_width; $i++) {
                $newPixels[$to + $i] = $this->_pixels[$from + $i];
            }
        }

        $value = $this->_width * $this->_height;
        for ($to = $this->_width; $from < $value; $from += $this->_width, $to += $w[0]) {
            for ($i = 0; $i < $this->_width; $i++) {
                $newPixels[$to + $i] = $this->_pixels[$from + $i];
            }
        }

        ksort($newPixels);
        return $newPixels;
    }
}
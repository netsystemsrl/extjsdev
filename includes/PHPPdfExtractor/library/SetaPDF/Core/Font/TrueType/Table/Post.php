<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Post.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing the PostScript Table (post) in a TrueType file.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_Post extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::POST;

    /**
     * We only implement getters for default entries (for all versions, explicitly 1.0 and 3.0).
     *
     * @var array
     */
    protected $_entries = [
        'version' => [0, SetaPDF_Core_BitConverter::FIXED],
        'italicAngle' => [4, SetaPDF_Core_BitConverter::FIXED],
        'underlinePosition' => [8, SetaPDF_Core_BitConverter::SHORT],
        'underlineThickness' => [10, SetaPDF_Core_BitConverter::SHORT],
        'isFixedPitch' => [12, SetaPDF_Core_BitConverter::ULONG],
        'minMemType42' => [16, SetaPDF_Core_BitConverter::ULONG],
        'maxMemType42' => [20, SetaPDF_Core_BitConverter::ULONG],
        'minMemType1' => [24, SetaPDF_Core_BitConverter::ULONG],
        'maxMemType1' => [28, SetaPDF_Core_BitConverter::ULONG],
    ];

    /**
     * Get the version.
     *
     * @return float
     */
    public function getVersion()
    {
        return $this->_get('version');
    }

    /**
     * Get the italic angle.
     *
     * Italic angle in counter-clockwise degrees from the vertical. Zero for upright text, negative for text that leans
     * to the right (forward).
     *
     * @param boolean $round
     * @return float|mixed|null
     */
    public function getItalicAngle($round = true)
    {
        if ($round) {
            return round($this->_get('italicAngle'), 1);
        }

        return $this->_getRaw('italicAngle');
    }

    /**
     * Get the suggested distance of the top of the underline from the baseline.
     *
     * @return integer
     */
    public function getUnderlinePosition()
    {
        return $this->_get('underlinePosition');
    }

    /**
     * Get the suggested values for the underline thickness.
     *
     * @return integer
     */
    public function getUnderlineThickness()
    {
        return $this->_get('underlineThickness');
    }

    /**
     * Checks whether the font is proportionally or not proportionally spaced.
     *
     * @return integer 0 = proportionally, non-zeor = not proportionally
     */
    public function isFixedPitch()
    {
        return $this->_get('isFixedPitch');
    }

    /**
     * Get the minimum memory usage when an OpenType font is downloaded.
     *
     * @return integer
     */
    public function getMinMemType42()
    {
        return $this->_get('minMemType42');
    }

    /**
     * Get the maximum memory usage when an OpenType font is downloaded.
     *
     * @return integer
     */
    public function getMaxMemType42()
    {
        return $this->_get('maxMemType42');
    }

    /**
     * Get the minimum memory usage when an OpenType font is downloaded as a Type 1 font.
     *
     * @return integer
     */
    public function getMinMemType1()
    {
        return $this->_get('minMemType1');
    }

    /**
     * Get the maximum memory usage when an OpenType font is downloaded as a Type 1 font.
     *
     * @return integer
     */
    public function getMaxMemType1()
    {
        return $this->_get('maxMemType1');
    }
}
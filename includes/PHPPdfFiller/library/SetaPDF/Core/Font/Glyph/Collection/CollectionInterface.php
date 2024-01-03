<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CollectionInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * An interface for glyph collections
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Font_Glyph_Collection_CollectionInterface
{
    /**
     * Get the glyph width of a single character.
     *
     * @param string $char The character
     * @param string $encoding The encoding of the character
     * @return float|bool
     */
    public function getGlyphWidth($char, $encoding = 'UTF-16BE');

    /**
     * Get the glyphs width of a string.
     *
     * @param string $chars The string
     * @param string $encoding The encoding of the characters
     * @return float|bool
     */
    public function getGlyphsWidth($chars, $encoding = 'UTF-16BE');
}
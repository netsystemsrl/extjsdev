<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: SubTable.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A class representing a subtable of a Character To Glyph Index Mapping Table.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SubTable extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The entries in this subtable
     *
     * @var array
     */
    protected $_entries = [
        'format' => [0, SetaPDF_Core_BitConverter::USHORT],
        'length' => [2, SetaPDF_Core_BitConverter::USHORT],
        'language' => [4, SetaPDF_Core_BitConverter::USHORT],
    ];

    /**
     * Get the format of this subtable.
     *
     * @return integer
     */
    public function getFormat()
    {
        return $this->_get('format');
    }

    /**
     * Get the length of this subtable.
     *
     * @return integer
     */
    public function getLength()
    {
        return $this->_get('length');
    }

    /**
     * Get the language of this subtable.
     *
     * @return integer
     */
    public function getLanguage()
    {
        return $this->_get('language');
    }

    /** @noinspection PhpUnusedParameterInspection */
    /**
     * Get the glyph index by a character code.
     *
     * @param integer $charCode
     * @return integer
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getGlyphIndex($charCode)
    {
        throw new SetaPDF_Exception_NotImplemented(
            'The mapping table (format ' . $this->getFormat() . ') is not implemented yet.'
        );
    }
}
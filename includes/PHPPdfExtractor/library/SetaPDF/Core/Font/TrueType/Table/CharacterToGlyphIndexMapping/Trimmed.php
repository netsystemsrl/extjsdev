<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Trimmed.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A class representing a subtable "Format 6: Trimmed table mapping".
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_Trimmed extends
    SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SubTable
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
        'firstCode' => [6, SetaPDF_Core_BitConverter::USHORT],
        'entryCount' => [8, SetaPDF_Core_BitConverter::USHORT]
    ];

    /**
     * Get the first character code of subrange.
     *
     * @return integer
     */
    public function getFirstCode()
    {
        return $this->_get('firstCode');
    }

    /**
     * Get the number of character codes in subrange.
     *
     * @return integer
     */
    public function getEntryCount()
    {
        return $this->_get('entryCount');
    }

    /**
     * Get the glyph index by a character code.
     *
     * @param integer $charCode
     * @return integer
     */
    public function getGlyphIndex($charCode)
    {
        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        $firstCode = $this->getFirstCode();
        $entryCount = $this->getEntryCount();

        if ($charCode < $firstCode || $charCode > ($firstCode + $entryCount)) {
            return 0;
        }

        $offset = $record->getOffset() + 10 + ($charCode - $firstCode) * 2;

        return $reader->readUInt16($offset);
    }
}
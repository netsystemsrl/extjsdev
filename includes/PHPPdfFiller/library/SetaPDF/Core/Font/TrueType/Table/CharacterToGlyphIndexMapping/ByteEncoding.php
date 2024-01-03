<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ByteEncoding.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing a subtable "Format 0: Byte encoding table".
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_ByteEncoding extends
    SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SubTable
{
    /**
     * Flag specifying that the table data were read
     *
     * @var bool
     */
    protected $_tableRead = false;

    /**
     * Chars to glyph array
     *
     * @var array
     */
    protected $_charsToGlyphs = [];

    /**
     * Release memory
     */
    public function cleanUp()
    {
        $this->_charsToGlyphs = null;

        parent::cleanUp();
    }

    /**
     * Get the glyph index by a character code.
     *
     * @param integer $charCode
     * @return integer
     */
    public function getGlyphIndex($charCode)
    {
        if (false === $this->_tableRead) {
            $this->_readTable();
        }

        if (isset($this->_charsToGlyphs[$charCode])) {
            return $this->_charsToGlyphs[$charCode];
        }

        return 0;
    }

    /**
     * Read the subtable data.
     */
    protected function _readTable()
    {
        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        $offset = $record->getOffset() + 6;
        $reader->reset($offset, $record->getLength() - 6);

        for ($char = 0; $char < 256; $char++) {
            $this->_charsToGlyphs[$char] = $reader->readUInt8();
        }

        $this->_tableRead = true;
    }
}
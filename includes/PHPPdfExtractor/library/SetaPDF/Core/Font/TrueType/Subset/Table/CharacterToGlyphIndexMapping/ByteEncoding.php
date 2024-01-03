<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ByteEncoding.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * This class represents the format byte encoding (format0) subtable in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/cmap.htm#format0} for more details.
 *
 * @see SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping::setSubTable()
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_ByteEncoding
    extends SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_SubTable
{
    /**
     * @inheritdoc
     */
    public function getFormat()
    {
        return 0;
    }

    /**
     * @inheritdoc
     */
    public function setGlyphIndex($charCode, $index)
    {
        if ($charCode < 0 || $charCode > 255) {
            throw new InvalidArgumentException(
                sprintf('Char code (%s) is out of range (0-255).', $charCode)
            );
        }

        parent::setGlyphIndex($charCode, $index);
    }

    /**
     * @inheritdoc
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        // format
        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16(0));

        // length
        $writer->write("\x01\x06"); // 262

        // language
        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($this->_language));

        // glyphIdArray[256]
        for ($charCode = 0; $charCode < 256; $charCode++) {
            if (isset($this->_mapping[$charCode])) {
                // we have a mapping for this char code.
                $writer->write(SetaPDF_Core_BitConverter::formatToUInt8($this->_mapping[$charCode]));
            } else {
                // otherwise map to missing/empty glyf (which always is glyf 0).
                $writer->write("\0");
            }
        }
    }
}

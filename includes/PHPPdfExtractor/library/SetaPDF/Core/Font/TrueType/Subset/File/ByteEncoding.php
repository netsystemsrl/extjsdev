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
 * Font subsetting class used for single byte encoding.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_File_ByteEncoding extends SetaPDF_Core_Font_TrueType_Subset_File
{
    /**
     * The glyf table.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData
     */
    private $_glyf;

    /**
     * The origin cmap subtable.
     *
     * @var SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SubTable
     */
    private $_cmapOriginSubTable;

    /**
     * The resulting cmap subtable.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_ByteEncoding
     */
    private $_cmapTargetSubTable;

    /**
     * The char code to glyph id mapping.
     *
     * @var array
     */
    private $_mapping = [];

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_File $font
     * @throws SetaPDF_Core_Font_Exception
     */
    public function __construct(SetaPDF_Core_Font_TrueType_File $font)
    {
        parent::__construct($font);

        $this->_glyf = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::GLYF);
        /**
         * @var SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping $cmap
         */
        $cmap = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::CMAP);

        if ($cmap->getOriginalTable()->hasSubTable(3, 10)) {
            $this->_cmapOriginSubTable = $cmap->getOriginalTable()->getSubTable(3, 10);
        } else {
            $this->_cmapOriginSubTable = $cmap->getOriginalTable()->getSubTable(3, 1);
        }

        if ($this->_cmapOriginSubTable === null || $this->_cmapOriginSubTable === false) {
            throw new SetaPDF_Core_Font_Exception(
                'Encoding table (3, 1 or 3, 10) is required but not available in this font.'
            );
        }

        $this->_cmapTargetSubTable =
            new SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_ByteEncoding(
                $this->_cmapOriginSubTable->getLanguage()
            );

        $cmap->setSubTable(
            1, 0,
            $this->_cmapTargetSubTable
        );
    }

    /**
     * @inheritdoc
     */
    public function cleanUp()
    {
        parent::cleanUp();
        $this->_cmapTargetSubTable->cleanUp();
        $this->_cmapTargetSubTable = null;
        $this->_glyf = null;
        $this->_cmapOriginSubTable = null;
        $this->_mapping = null;
    }

    /**
     * @inheritdoc
     */
    public function addCharCode($charCode)
    {
        if (!isset($this->_mapping[$charCode])) {
            $glyphId = $this->_glyf->registerGlyph(
                // get the origin glyph
                $this->_cmapOriginSubTable->getGlyphIndex($charCode)
            );

            // not a 1 to 1 mapping, because multiple chars can map to the same glyf.
            $newCharCode = count($this->_mapping) + 1;

            // register the updated glyph-location and register the glyph
            $this->_cmapTargetSubTable->setGlyphIndex($newCharCode, $glyphId);
            $this->_mapping[$charCode] = $newCharCode;
        }

        return $this->_mapping[$charCode];
    }

    /**
     * @inheritdoc
     */
    public function addChar($char)
    {
        $newCharCode = $this->addCharCode(SetaPDF_Core_Encoding::utf16BeToUnicodePoint($char));
        return chr($newCharCode);
    }
}

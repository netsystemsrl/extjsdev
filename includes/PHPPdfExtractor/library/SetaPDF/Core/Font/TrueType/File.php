<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: File.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * Parser class for TTF/OTF files
 *
 * Based on the OpenType specification: {@link http://www.microsoft.com/typography/otspec/}
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_File
{
    /**
     * The reader instance
     *
     * @var SetaPDF_Core_Reader_Binary
     */
    protected $_reader;

    protected $_sfntVersion;

    protected $_numTables;

    protected $_searchRange;

    protected $_entrySelector;

    protected $_rangeShift;

    /**
     * Data of tables in the TTF file
     *
     * @var array
     */
    protected $_tableRecords = array();

    /**
     * The constructor.
     *
     * @param string|SetaPDF_Core_Reader_Binary $reader
     * @throws SetaPDF_Core_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function __construct($reader)
    {
        if (!$reader instanceof SetaPDF_Core_Reader_Binary) {
            $fileReader = new SetaPDF_Core_Reader_File($reader);
            $reader = new SetaPDF_Core_Reader_Binary($fileReader);
        }

        $this->_reader = $reader;

        $this->_sfntVersion = $this->_reader->readInt32();
        // TODO MOVE TO PDF CLASS
        if (0x4F54544F === $this->_sfntVersion) { // OTTO
            throw new SetaPDF_Exception_NotImplemented('OpenType fonts with PostScript outlines are not supported');
        } else if (0x00010000 !== $this->_sfntVersion && 0x74727565 !== $this->_sfntVersion) {
            throw new SetaPDF_Core_Exception('Unsupported file format');
        }

        $this->_numTables = $this->_reader->readUInt16();
        $this->_searchRange = $this->_reader->readUInt16();
        $this->_entrySelector = $this->_reader->readUInt16();
        $this->_rangeShift = $this->_reader->readUInt16();

        for ($i = 0; $i < $this->_numTables; $i++) {
            $tag = $this->_reader->readBytes(4);
            $this->_reader->skip(4); // skip check sum
            // $checkSum = $this->_reader->readUInt32();
            $offset = $this->_reader->readUInt32();
            $length = $this->_reader->readUInt32();
            try {
                $className = SetaPDF_Core_Font_TrueType_Table::getClassName($tag);
            } catch (InvalidArgumentException $e) {
                $className = null;
            }

            $this->_tableRecords[$tag] = new SetaPDF_Core_Font_TrueType_Table_Record(
                $this, $offset, $length, $className
            );
        }
    }

    /**
     * Get the reader instance.
     *
     * @return SetaPDF_Core_Reader_Binary
     */
    public function getReader()
    {
        return $this->_reader;
    }

    /**
     * Release resources.
     */
    public function cleanUp()
    {
        foreach ($this->_tableRecords AS $table) {
            $table->cleanUp();
        }
        $this->_reader->cleanUp();
        $this->_reader = null;
    }

    /**
     * Get the sfnt version.
     *
     * @return integer
     */
    public function getSfntVersion()
    {
        return $this->_sfntVersion;
    }

    /**
     * Get the number of tables.
     *
     * @return integer
     */
    public function getNumTables()
    {
        return $this->_numTables;
    }

    /**
     * Get the search range value.
     *
     * @return integer
     */
    public function getSearchRange()
    {
        return $this->_searchRange;
    }

    /**
     * Get the entry selector value.
     *
     * @return integer
     */
    public function getEntrySelector()
    {
        return $this->_entrySelector;
    }

    /**
     * Get the range shift value.
     *
     * @return integer
     */
    public function getRangeShift()
    {
        return $this->_rangeShift;
    }

    /**
     * Check if a specific table exists.
     *
     * @param string $tag
     * @return boolean
     */
    public function tableExists($tag)
    {
        return isset($this->_tableRecords[$tag]);
    }

    /**
     * Get a tag specific table.
     *
     * @param string $tag
     * @return bool|SetaPDF_Core_Font_TrueType_Table
     */
    public function getTable($tag)
    {
        if (!$this->tableExists($tag)) {
            return false;
        }

        return $this->_tableRecords[$tag]->getTable();
    }

    /**
     * Get the units per em.
     *
     * @return float
     */
    protected function _getUnitsPerEm()
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Header $table
         */
        $table = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);
        return $table->getUnitsPerEm();
    }

    /**
     * Get character/glyph width values.
     *
     * @param array $chars The chars in UTF-16BE encoding
     * @return array
     * @throws SetaPDF_Core_Font_Exception|SetaPDF_Exception_NotImplemented
     */
    public function getWidths(array $chars)
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_HorizontalMetrics $hmtxTable
         */
        $hmtxTable = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_METRICS);

        /**
         * @var SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping $cmapTable
         */
        $cmapTable = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::CMAP);

        if ($cmapTable->hasSubTable(3, 10)) {
            $encodingTable = $cmapTable->getSubTable(3, 10);
        } else {
            $encodingTable = $cmapTable->getSubTable(3, 1);
        }

        if ($encodingTable === false) {
            throw new SetaPDF_Core_Font_Exception(
                'Encoding table (3, 1 or 3, 10) is required but not available in this font.'
            );
        }

        $widths = [];

        foreach ($chars AS $char) {
            $unicode = SetaPDF_Core_Encoding::utf16BeToUnicodePoint($char);
            if ($unicode === false) {
                throw new InvalidArgumentException('Invalid UTF-16BE character.');
            }

            $glyphId = $encodingTable->getGlyphIndex($unicode);
            $widths[$char] = $hmtxTable->getAdvanceWidth($glyphId);
        }

        return $widths;
    }

    /**
     * Get the width of a single character/glyph.
     *
     * @param string $char
     * @return float
     * @throws SetaPDF_Core_Font_Exception|SetaPDF_Exception_NotImplemented
     */
    public function getWidth($char)
    {
        $widths = $this->getWidths([$char]);
        return $widths[$char];
    }

    /**
     * Checks if characters are covered by this font.
     *
     * @param array $chars The chars in UTF-16BE encoding
     * @return boolean
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function areCharsCovered($chars)
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping $cmapTable
         */
        $cmapTable = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::CMAP);
        $encodingTable = $cmapTable->getSubTable(3, 10);

        if ($encodingTable === false) {
            $encodingTable = $cmapTable->getSubTable(3, 1);
        }

        foreach ($chars AS $char) {
            $unicode = SetaPDF_Core_Encoding::utf16BeToUnicodePoint($char);
            if ($unicode === false || $encodingTable->getGlyphIndex($unicode) === 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Checks if a character is covered by this font.
     *
     * @param string $char The character in the specified encoding
     * @param string $encoding The encoding - default is UTF-16BE
     * @return boolean
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function isCharCovered($char, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE') {
            $char = SetaPDF_Core_Encoding::convert($char, $encoding, 'UTF-16BE');
        }

        $unicode = SetaPDF_Core_Encoding::utf16BeToUnicodePoint($char);
        if ($unicode === false) {
            return false;
        }

        /**
         * @var SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping $cmapTable
         */
        $cmapTable = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::CMAP);
        $encodingTable = $cmapTable->getSubTable(3, 10);

        if ($encodingTable === false) {
            $encodingTable = $cmapTable->getSubTable(3, 1);
        }

        return $encodingTable->getGlyphIndex($unicode) !== 0;
    }

    /**
     * Checks if a font is embeddable.
     *
     * @return boolean
     * @throws SetaPDF_Core_Font_TrueType_Subset_Exception
     */
    public function isEmbeddable()
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Os2 $os2Table
         */
        $os2Table = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::OS2);
        if (!$os2Table) {
            throw new SetaPDF_Core_Font_TrueType_Subset_Exception(
                'TrueType does not contain mandatory OS/2 table.'
            );
        }
        $fsType = $os2Table->getFsType();
        return (
            ($fsType == 0) // installable embedding
            ||
            (
                ($fsType & 0x0002) === 0 // restriced license embedding
                &&
                ($fsType & 0x0200) === 0 // bitmap embedding
            )
        );
    }

    /**
     * Checks if a font is subsettable and embeddable.
     *
     * @return boolean
     * @throws SetaPDF_Core_Font_TrueType_Subset_Exception
     */
    public function isSubsettable()
    {
        /**
         * @var $os2 SetaPDF_Core_Font_TrueType_Table_Os2
         */
        $os2 = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Os2::TAG);
        return (
            $this->isEmbeddable() // Restricted license embedding, ...
            &&
            ($os2->getFsType() & 0x0100) === 0 // No Subetting
        );
    }

    /**
     * Set the file pointer to the start byte offset position of table.
     *
     * @param string $tag
     * @throws SetaPDF_Core_Exception
     */
    protected function _seekTable($tag)
    {
        if (!isset($this->_tableRecords[$tag])) {
            throw new SetaPDF_Core_Exception(sprintf('Could not find table "%s".', $tag));
        }

        $this->_reader->seek($this->_tableRecords[$tag]->getOffset());
    }
}
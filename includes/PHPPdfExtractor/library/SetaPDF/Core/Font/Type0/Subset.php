<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Subset.php 1196 2018-01-29 13:34:07Z jan.slabon $
 */

/**
 * Class that represents a PDF Type0 (Composite) font subset.
 *
 * This class will embedded a subset of the original TrueType font programm with only glyphs,
 * that were requested by calling the getCharCodes() method.
 *
 * This font allows you to use several thousands of glyphs (there's a limit of 65000 glyphs).
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Type0_Subset
    extends SetaPDF_Core_Font_TrueType_Subset
{
    /**
     * Mapping from UTF-16BE characters to glyph ids.
     *
     * @var array
     */
    protected $_charCodes = [
        "\x00\x00" => "\x00\x00"
    ];

    /**
     * Mapping from glyph ids to UTF-16BE charcater codes.
     *
     * @var array
     */
    protected $_chars = [
        "\x00\x00" => "\x00\x00"
    ];

    /**
     * Mapping array from character ids to glyph ids
     *
     * @var array
     */
    protected $_cidToGlyphId = [];

    /**
     * Flag saying whether we can use Identity mapping or not.
     *
     * @var bool
     */
    protected $_isCidToGlyphMapIdentity = true;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_Font_TrueType_File|string|SetaPDF_Core_Reader_Binary $fontFile
     * @param bool $throwExceptionWhenMissingGlyphIsUsed Whether an exception should be thrown if the registered
     *                                                   character cannot be found or not.
     * @param bool $ignoreLicenseRestrictions Can be used to disable the font license check
     * @throws SetaPDF_Core_Font_Exception
     */
    public function __construct(
        SetaPDF_Core_Document $document,
        $fontFile,
        $throwExceptionWhenMissingGlyphIsUsed = false,
        $ignoreLicenseRestrictions = false)
    {
        parent::__construct($document, $fontFile, $throwExceptionWhenMissingGlyphIsUsed, $ignoreLicenseRestrictions);

        $this->maxCharLimit = 65000;
    }

    /**
     * @inheritdoc
     */
    public function _registerChar($char, $charCode)
    {
        $newCharCode = SetaPDF_Core_BitConverter::formatToUInt16(count($this->_chars));
        $this->_cidToGlyphId[$newCharCode] = $charCode;

        if ($this->_isCidToGlyphMapIdentity && $charCode === "\x00\x00") {
            $this->_isCidToGlyphMapIdentity = false;
        }

        parent::_registerChar($char, $newCharCode);
    }

    /**
     * @inheritdoc
     */
    protected function _getToUnicode()
    {
        $chars = $this->getRegisteredChars();
        unset($chars["\x00\x00"]);

        return (new SetaPDF_Core_Font_ToUnicode($chars))->create();
    }

    /**
     * @inheritdoc
     */
    protected function _getSubsetFile()
    {
        if ($this->_subsetFile === null) {
            $this->_subsetFile = new SetaPDF_Core_Font_TrueType_Subset_File_Identity($this->_fontFile);
        }

        return $this->_subsetFile;
    }

    /**
     * Create the width array.
     *
     * @return array|SetaPDF_Core_Type_Array
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    protected function _getWidthArray()
    {
        $widths = new SetaPDF_Core_Type_Array();

        $index = -1;
        $values = [];
        foreach ($this->_chars as $char) {
            $width = $this->getGlyphWidth($char);
            if ($index === -1 || $values[$index][0] !== $width) {
                $values[++$index] = [$width, 0];
            }

            $values[$index][1]++;
        }

        $cid = 0;
        $currentArray = null;
        foreach ($values as $value) {
            if ($value[1] <= 2) {
                for ($i = 0; $i < $value[1]; $i++) {
                    if ($currentArray === null) {
                        $currentArray = new SetaPDF_Core_Type_Array();
                    }
                    $currentArray[] = new SetaPDF_Core_Type_Numeric($value[0]);
                }
            } else {
                if ($currentArray !== null) {
                    $widths[] = new SetaPDF_Core_Type_Numeric($cid - count($currentArray));
                    $widths[] = $currentArray;
                    $currentArray = null;
                }
                $widths[] = new SetaPDF_Core_Type_Numeric($cid);
                $widths[] = new SetaPDF_Core_Type_Numeric($cid + $value[1] - 1);
                $widths[] = new SetaPDF_Core_Type_Numeric($value[0]);
            }

            $cid += $value[1];
        }

        if ($currentArray !== null) {
            $widths[] = new SetaPDF_Core_Type_Numeric($cid - count($currentArray));
            $widths[] = $currentArray;
            $currentArray = null;
        }

        return $widths;
    }

    /**
     * Create the CIDSet stream.
     *
     * @return SetaPDF_Core_Type_Stream
     */
    protected function _createCidSet()
    {
        /* The stream’s data shall be organised as a table of bits indexed by CID. The bits shall be stored in bytes
         * with the high-order bit first. Each bit shall correspond to a CID. The most significant bit of the first
         * byte shall correspond to CID 0, the next bit to CID 1, and so on.
         */
        $stream = new SetaPDF_Core_Type_Stream(new SetaPDF_Core_Type_Dictionary([
            'Filter' => new SetaPDF_Core_Type_Name('FlateDecode')
        ]));

        $count = count($this->_chars) - 1;
        $result = [];
        for ($cid = 1; $cid <= $count; $cid++) {
            $currentByte = (int)($cid / 8);
            $currentBit = 7 - ($cid - ($currentByte * 8));

            if (!isset($result[$currentByte])) {
                $result[$currentByte] = "\0";
            }

            $result[$currentByte] |= chr(1 << $currentBit);
        }

        $stream->setStream(implode('', $result));

        return $stream;
    }

    /**
     * Create the CIDtoGIDMap entry.
     *
     * @return SetaPDF_Core_Type_Name|SetaPDF_Core_Type_IndirectObject
     */
    protected function _createCidToGidMap()
    {
        if (
            $this->_isCidToGlyphMapIdentity && count($this->_cidToGlyphId) == count(array_unique($this->_cidToGlyphId))
        ) {
            return new SetaPDF_Core_Type_Name('Identity', true);
        }

        $streamData = "\x00\x00";
        foreach ($this->_cidToGlyphId as $gid) {
            $streamData .= $gid;
        }

        $stream = new SetaPDF_Core_Type_Stream(new SetaPDF_Core_Type_Dictionary([
            'Filter' => new SetaPDF_Core_Type_Name('FlateDecode', true)
        ]), gzcompress($streamData));

        return $this->_document->createNewObject($stream);
    }

    /**
     * @inheritdoc
     */
    protected function _createSubset()
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Post $postTable
         * @var SetaPDF_Core_Font_TrueType_Table_Os2 $os2Table
         */
        $postTable = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::POST);
        $os2Table = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::OS2);

        $fontName = $this->getFontName();
        $flags = $this->getFontDescriptorFlags();
        $missingWidth = $this->getGlyphWidth("\x00\x00");

        $widths = $this->_getWidthArray();

        $fontOut = new SetaPDF_Core_Writer_String();
        $fontOut->start();
        $this->_getSubsetFile()->subset($fontOut);
        $fontOut->finish();

        $fontFile = $this->_document->createNewObject(
            new SetaPDF_Core_Type_Stream(
                new SetaPDF_Core_Type_Dictionary([
                    'Filter' => new SetaPDF_Core_Type_Name('FlateDecode'),
                    'Length1' => new SetaPDF_Core_Type_Numeric(strlen($fontOut))
                ]),
                gzcompress($fontOut)
            )
        );

        $fontDescriptor = new SetaPDF_Core_Type_Dictionary([
            'Type' => new SetaPDF_Core_Type_Name('FontDescriptor'),
            'FontName' => new SetaPDF_Core_Type_Name($fontName),
            'Flags' => new SetaPDF_Core_Type_Numeric($flags), //  Symbol flag needs to be set
            'FontBBox' => SetaPDF_Core_DataStructure_Rectangle::byArray($this->getFontBBox(), true),
            'ItalicAngle' => new SetaPDF_Core_Type_Numeric(
                $postTable->getItalicAngle() * $this->_factor
            ),
            'Ascent' => new SetaPDF_Core_Type_Numeric($this->getAscent()),
            'Descent' => new SetaPDF_Core_Type_Numeric($this->getDescent()),
            'CapHeight' => new SetaPDF_Core_Type_Numeric(
                round($os2Table->getCapHeight() * $this->_factor)
            ),
            'StemV' => new SetaPDF_Core_Type_Numeric(
                50 + (int)(pow($os2Table->getWeightClass() / 65, 2))
            ),
            'MissingWidth' => new SetaPDF_Core_Type_Numeric($missingWidth),
            'FontFile2' => $fontFile,
            'CIDSet' => $this->_document->createNewObject($this->_createCidSet()),
        ]);

        $descendantFont = new SetaPDF_Core_Type_Dictionary([
            'Type' => new SetaPDF_Core_Type_Name('Font'),
            'Subtype' => new SetaPDF_Core_Type_Name('CIDFontType2'),
            'BaseFont' => new SetaPDF_Core_Type_Name($fontName),
            'CIDToGIDMap' => $this->_createCidToGidMap(),
            'DW' => new SetAPDF_core_Type_numeric($missingWidth),
            'CIDSystemInfo' => new SetaPDF_Core_Type_Dictionary([
                'Ordering' => new SetaPDF_Core_Type_String('Identity'),
                'Registry' => new SetaPDF_Core_Type_String('Adobe'),
                'Supplement' => new SetaPDF_Core_Type_Numeric(0),
            ]),
            'FontDescriptor' => $this->_document->createNewObject($fontDescriptor),
            'W' => $this->_document->createNewObject($widths)
        ]);

        $this->_dictionary['Subtype'] = new SetaPDF_Core_Type_Name('Type0');
        $this->_dictionary['BaseFont'] = new SetaPDF_Core_Type_Name($fontName);
        $this->_dictionary['Encoding'] = new SetaPDF_Core_Type_Name('Identity-H');
        $this->_dictionary['DescendantFonts'] = new SetaPDF_Core_Type_Array([
            $this->_document->createNewObject($descendantFont)
        ]);

        if (count($this->_chars) > 1) {
            $toUnicodeStream = new SetaPDF_Core_Type_Stream(new SetaPDF_Core_Type_Dictionary([
                'Filter' => new SetaPDF_Core_Type_Name('FlateDecode')
            ]), gzcompress($this->_getToUnicode()));

            $toUnicodeObject = $this->_document->createNewObject($toUnicodeStream);
            $this->_dictionary['ToUnicode'] = $toUnicodeObject;
        }
    }
}
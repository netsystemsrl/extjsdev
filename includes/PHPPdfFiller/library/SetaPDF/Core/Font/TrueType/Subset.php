<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Subset.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class that represents a PDF TrueType font subset.
 *
 * This class will embedded a subset of the original TrueType font programm with only glyphs,
 * that were requested by calling the getCharCodes() method.
 *
 * The subset can represent up to 255 glyphs.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset
    implements SetaPDF_Core_Font_FontInterface
{
    /**
     * The document instance.
     *
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * The source font file instance.
     *
     * @var SetaPDF_Core_Font_TrueType_File
     */
    protected $_fontFile;

    /**
     * Flag saying whether an exception should be thrown if a character is not available or not.
     *
     * @var bool
     */
    protected $_throwExceptionWhenMissingGlyphIsUsed = false;

    /**
     * The instance of the subset class.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_File_ByteEncoding
     */
    protected $_subsetFile;

    /**
     * The indirect object for the PDF font object.
     *
     * @var null|SetaPDF_Core_Type_IndirectObject
     */
    protected $_indirectObject;

    /**
     * The main font dictionary.
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;

    /**
     * The scaling factor from TrueType units to glyph coordinate system.
     *
     * @var float
     */
    protected $_factor;

    /**
     * The widths of the used glyphs.
     *
     * @var int[]
     */
    protected $_widths = [];

    /**
     * Mapping from UTF-16BE characters to glyph ids.
     *
     * @var array
     */
    protected $_charCodes = [
        "\x00\x00" => "\x00"
    ];

    /**
     * Mapping from glyph ids to UTF-16BE charcater codes.
     *
     * @var array
     */
    protected $_chars = [
        "\x00" => "\x00\x00"
    ];

    /**
     * The font bounding box.
     *
     * @var int[]
     */
    protected $_fontBBox;

    /**
     * The ascent value.
     *
     * @var int
     */
    protected $_ascent;

    /**
     * The descent value.
     *
     * @var int
     */
    protected $_descent;

    /**
     * The font name.
     *
     * @var string
     */
    protected $_fontName;

    /**
     * The char count limit.
     *
     * @var int
     */
    public $maxCharLimit = 256;

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
        $ignoreLicenseRestrictions = false
    )
    {
        if (!($fontFile instanceof SetaPDF_Core_Font_TrueType_File)) {
            $fontFile = new SetaPDF_Core_Font_TrueType_File($fontFile);
        }

        if (false === $ignoreLicenseRestrictions && false === $fontFile->isSubsettable()) {
            throw new SetaPDF_Core_Font_Exception(
                'Due to license restrictions it is not allowed to subset this font file.'
            );
        }

        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Header $head
         */
        $head = $fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);
        $this->_factor = 1000 / $head->getUnitsPerEm();

        $this->_document = $document;
        $this->_fontFile = $fontFile;
        $this->_throwExceptionWhenMissingGlyphIsUsed = $throwExceptionWhenMissingGlyphIsUsed;

        $this->_dictionary = new SetaPDF_Core_Type_Dictionary([
            'Type' => new SetaPDF_Core_Type_Name('Font', true)
        ]);

        $this->_getSubsetFile();

        $this->_dictionary->registerPdfStringCallback(function() {
            $this->_createSubset();
        }, '_createSubset');
    }

    /**
     * Gets the subset file instance.
     *
     * @return SetaPDF_Core_Font_TrueType_Subset_File
     * @throws SetaPDF_Core_Font_Exception
     */
    protected function _getSubsetFile()
    {
        if ($this->_subsetFile === null) {
            $this->_subsetFile = new SetaPDF_Core_Font_TrueType_Subset_File_ByteEncoding($this->_fontFile);
        }

        return $this->_subsetFile;
    }

    /**
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument()
    {
        return $this->_document;
    }

    /**
     * Get the source true type file.
     *
     * @return SetaPDF_Core_Font_TrueType_File
     */
    public function getFontFile()
    {
        return $this->_fontFile;
    }

    /**
     * Release cycled references and memory.
     */
    public function cleanUp()
    {
        if ($this->_subsetFile !== null) {
            $this->_subsetFile->cleanUp();
            $this->_subsetFile = null;
        }
        $this->_fontFile = null;

        $this->_dictionary->unRegisterPdfStringCallback('_createSubset');
        $this->_dictionary->cleanUp();
        $this->_dictionary = null;
    }

    /**
     * Get all registered characters (UTF-16BE encoded) indexed by their glyph ids.
     *
     * @return array
     */
    public function getRegisteredChars()
    {
        return $this->_chars;
    }

    /**
     * Get the glyph width of a single character.
     *
     * @param string $char The character
     * @param string $encoding The encoding of the character
     * @return int
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getGlyphWidth($char, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE') {
            $char = SetaPDF_Core_Encoding::convert($char, $encoding, 'UTF-16BE');
        }

        if (!isset($this->_widths[$char])) {
            try {
                $this->_widths[$char] = (int)round($this->_fontFile->getWidth($char) * $this->_factor);
            } catch (InvalidArgumentException $e) {
                throw new InvalidArgumentException('Invalid character length.', 0, $e);
            }
        }

        return $this->_widths[$char];
    }

    /**
     * Get the glyphs width of a string.
     *
     * @param string $chars The string
     * @param string $encoding The encoding of the characters
     * @return int|bool
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getGlyphsWidth($chars, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE') {
            $chars = SetaPDF_Core_Encoding::convert($chars, $encoding, 'UTF-16BE');
        }

        $width = 0;
        $len = SetaPDF_Core_Encoding::strlen($chars, 'UTF-16BE');
        $leftChars = [];

        for ($i = 0; $i < $len; $i++) {
            $char = SetaPDF_Core_Encoding::substr($chars, $i, 1, 'UTF-16BE');
            if (isset($this->_widths[$char])) {
                $width += $this->_widths[$char];
            } else {
                $leftChars[] = $char;
            }
        }

        if (count($leftChars)) {
            foreach ($this->_fontFile->getWidths($leftChars) as $char => $_width) {
                $_width = (int)round($_width * $this->_factor);
                $this->_widths[$char] = $_width;
            }

            foreach ($leftChars as $char) {
                $width += $this->_widths[$char];
            }
        }

        return $width;
    }

    /**
     * Get the final character codes of a character string.
     *
     * @param string $chars The character string
     * @param string $encoding The output encoding
     * @return array
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getCharCodes($chars, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE') {
            $chars = SetaPDF_Core_Encoding::convert($chars, $encoding, 'UTF-16BE');
        }

        $charCodes = [];
        $len = SetaPDF_Core_Encoding::strlen($chars, 'UTF-16BE');

        for ($i = 0; $i < $len; $i++) {
            $char = SetaPDF_Core_Encoding::substr($chars, $i, 1, 'UTF-16BE');

            if (!isset($this->_charCodes[$char])) {
                if (count($this->_charCodes) === $this->maxCharLimit) {
                    throw new SetaPDF_Core_Font_Exception(
                        'This font subset can only handle up to ' . $this->maxCharLimit . ' glyphs.'
                    );
                }

                if ($this->_throwExceptionWhenMissingGlyphIsUsed && !$this->_fontFile->isCharCovered($char)) {
                    throw new SetaPDF_Core_Font_TrueType_Subset_Exception(
                        sprintf(
                            'The font does not cover the character "%s".',
                            SetaPDF_Core_Encoding::convert($char, 'UTF-16BE', 'UTF-8')
                        )
                    );
                }

                $this->_registerChar($char, $this->_getSubsetFile()->addChar($char));
            }

            $charCodes[] = $this->_charCodes[$char];
        }

        return $charCodes;
    }

    /**
     * Registers a glyph that got registered in the font subsetter.
     *
     * @param string $char
     * @param string $charCode
     */
    protected function _registerChar($char, $charCode)
    {
        $this->_charCodes[$char] = $charCode;
        $this->_chars[$charCode] = $char;
    }

    /**
     * Get the glyph width by a char code.
     *
     * @param string $charCode
     * @return int
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getGlyphWidthByCharCode($charCode)
    {
        if (!isset($this->_chars[$charCode])) {
            return $this->getGlyphWidth("\x00\x00"); // missing width/glyph
        }

        return $this->getGlyphWidth($this->_chars[$charCode]);
    }

    /**
     * Get the font bounding box array.
     *
     * @return int[]
     */
    public function getFontBBox()
    {
        if ($this->_fontBBox === null) {
            /**
             * @var SetaPDF_Core_Font_TrueType_Table_Header $head
             */
            $head = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);
            $fontBBox = $head->getBoundingBox();

            $this->_fontBBox = [
                (int)round($fontBBox[0] * $this->_factor),
                (int)round($fontBBox[1] * $this->_factor),
                (int)round($fontBBox[2] * $this->_factor),
                (int)round($fontBBox[3] * $this->_factor)
            ];
        }

        return $this->_fontBBox;
    }

    /**
     * @inheritdoc
     */
    public function splitCharCodes($charCodes)
    {
        return str_split($charCodes);
    }

    /**
     * @inheritdoc
     */
    public function getIndirectObject(SetaPDF_Core_Document $document = null)
    {
        if (null === $this->_indirectObject) {
            if (null === $document) {
                $document = $this->getDocument();
            }

            $this->_indirectObject = $document->createNewObject($this->_dictionary);
        }

        return $this->_indirectObject;
    }

    /**
     * @inheritdoc
     */
    public function getResourceType()
    {
        return SetaPDF_Core_Resource::TYPE_FONT;
    }

    /**
     * @inheritdoc
     */
    public function getAscent()
    {
        if ($this->_ascent === null) {
            /**
             * @var SetaPDF_Core_Font_TrueType_Table_HorizontalHeader $hhea
             */
            $hhea = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_HEADER);
            $this->_ascent = round($hhea->getAscender() * $this->_factor);
        }

        return $this->_ascent;
    }

    /**
     * @inheritdoc
     */
    public function getDescent()
    {
        if ($this->_descent === null) {
            /**
             * @var SetaPDF_Core_Font_TrueType_Table_HorizontalHeader $hhea
             */
            $hhea = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_HEADER);
            $this->_descent = round($hhea->getDescender() * $this->_factor);
        }

        return $this->_descent;
    }

    /**
     * Get the font name.
     *
     * @return string
     * @throws SetaPDF_Core_Font_Exception
     */
    public function getFontName()
    {
        if ($this->_fontName === null) {
            /**
             * @var SetaPDF_Core_Font_TrueType_Table_Name $nameTable
             */
            $nameTable = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::NAME);

            // Windows platform
            $postScriptName = $nameTable->getName(3, 10, 0x0409, SetaPDF_Core_Font_TrueType_Table_Name::POSTSCRIPT_NAME);
            if ($postScriptName === false) {
                $postScriptName = $nameTable->getName(3, 1, 0x0409, SetaPDF_Core_Font_TrueType_Table_Name::POSTSCRIPT_NAME);
                if (false === $postScriptName) {
                    throw new SetaPDF_Core_Font_Exception(
                        'Missing name record for postscript name (platformId = 3, encodingId = 1 or 10)'
                    );
                }
            }

            $baseFont = SetaPDF_Core_Encoding::convert($postScriptName, 'UTF-16BE', 'ASCII');
            $baseFont = str_replace(' ', '', $baseFont);

            /* The tag shall consist of exactly six uppercase letters; the choice of letters is arbitrary, but different
             * subsets of the same font in the same PDF file shall have different tags.
             */
            $prefix = join('', array_map(function() {
                return chr(rand(65, 90));
            }, array_fill(0, 6, null)));

            $this->_fontName = $prefix . '+' . $baseFont;
        }

        return $this->_fontName;
    }

    /**
     * Returns the ToUnicode cmap.
     *
     * @return string
     */
    protected function _getToUnicode()
    {
        $chars = $this->getRegisteredChars();
        unset($chars["\x00"]);

        return (new SetaPDF_Core_Font_ToUnicode($chars))->create();
    }

    /**
     * Create the final subset file and embed it into the PDF document.
     *
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Exception_NotImplemented
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

        $this->_dictionary['Subtype'] = new SetaPDF_Core_Type_Name('TrueType', true);
        $this->_dictionary['BaseFont'] = new SetaPDF_Core_Type_Name($fontName);
        $this->_dictionary['FirstChar'] = new SetaPDF_Core_Type_Numeric(0);
        $this->_dictionary['LastChar'] = new SetaPDF_Core_Type_Numeric(count($this->_chars) - 1);

        $widths = new SetaPDF_Core_Type_Array();
        foreach ($this->_chars as $char) {
            $widths[] = new SetaPDF_Core_Type_Numeric($this->getGlyphWidth($char));
        }

        $this->_dictionary['Widths'] = $widths;

        if (count($this->_chars) > 1) {
            $toUnicodeStream = new SetaPDF_Core_Type_Stream(new SetaPDF_Core_Type_Dictionary([
                'Filter' => new SetaPDF_Core_Type_Name('FlateDecode')
            ]), gzcompress($this->_getToUnicode()));

            $toUnicodeObject = $this->_document->createNewObject($toUnicodeStream);
            $this->_dictionary['ToUnicode'] = $toUnicodeObject;
        }

        $flags = $this->getFontDescriptorFlags();

        $descriptor = new SetaPDF_Core_Type_Dictionary([
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
            'StemV' => new SetaPDF_Core_Type_Numeric(50 + (int)(pow($os2Table->getWeightClass() / 65, 2))),
            'MissingWidth' => new SetaPDF_Core_Type_Numeric($this->getGlyphWidth("\x00\x00"))
        ]);

        $descriptorObject = $this->_document->createNewObject($descriptor);
        $this->_dictionary['FontDescriptor'] = $descriptorObject;

        $fontOut = new SetaPDF_Core_Writer_String();
        $fontOut->start();
        $this->_getSubsetFile()->subset($fontOut);
        $fontOut->finish();

        $fontProgramm = new SetaPDF_Core_Type_Stream(new SetaPDF_Core_Type_Dictionary([
            'Filter' => new SetaPDF_Core_Type_Name('FlateDecode'),
            'Length1' => new SetaPDF_Core_Type_Numeric(strlen($fontOut))
        ]), gzcompress($fontOut));

        $fontProgrammObject = $this->_document->createNewObject($fontProgramm);
        $descriptor['FontFile2'] = $fontProgrammObject;
    }

    /**
     * Get flags defining various characteristics of the font.
     *
     * @see PDF 32000-1:2008 - 9.8.2 Font Descriptor Flags
     * @return int
     */
    public function getFontDescriptorFlags()
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Post $postTable
         * @var SetaPDF_Core_Font_TrueType_Table_Os2 $os2Table
         * @var SetaPDF_Core_Font_TrueType_Table_Header $headTable
         */
        $postTable = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::POST);
        $os2Table = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::OS2);
        $headTable = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);

        $flags = 1 << 2; // 3 = Symbolic
        if ($postTable->isFixedPitch() !== 0)
            $flags |= 1 << 0; // 1 = FixedPitch

        if ($headTable->hasMacStyle(SetaPDF_Core_Font_TrueType_Table_Header::MAC_STYLE_ITALIC)) {
            $flags |= 1 << 6; // 7 = Italic
        }

        $panose = $os2Table->getPanose();
        // Latin Text: http://monotype.de/services/pan2#Sec2SerifStyle
        if (ord($panose[0]) === 2) {
            $serifClassification = ord($panose[1]);
            if ($serifClassification >= 2 && $serifClassification <= 10) {
                $flags |= 1 << 1; // 2 = Serif
            }
        // Latin Hand Written
        } elseif (ord($panose[0]) === 3) {
            $flags |= 1 << 3; // 4 = Script
        }

        return $flags;
    }

    /**
     * @inheritdoc
     */
    public function getUnderlinePosition()
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Post $table
         */
        $table = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Post::TAG);
        return round($table->getUnderlinePosition() * $this->_factor);
    }

    /**
     * @inheritdoc
     */
    public function getUnderlineThickness()
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Post $table
         */
        $table = $this->_fontFile->getTable(SetaPDF_Core_Font_TrueType_Table_Post::TAG);
        return round($table->getUnderlineThickness() * $this->_factor);
    }
}
<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: File.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * An abstract class for sub-setting TrueType fonts.
 *
 * This class is marked as abstract to allow custom control of character codes to glyph ids mapping in extending
 * classes.
 *
 * Based on the OpenType specification: {@link https://www.microsoft.com/typography/otspec/otff.htm}
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_TrueType_Subset_File
{
    /**
     * The table instances.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table[]
     */
    protected $_tables = [];

    /**
     * The original true type font instance.
     *
     * @var SetaPDF_Core_Font_TrueType_File
     */
    private $_font;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_File $font
     * @throws SetaPDF_Core_Font_Exception
     */
    public function __construct(SetaPDF_Core_Font_TrueType_File $font)
    {
        $this->_font = $font;

        /**
         * @var $glyf SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData
         */
        $glyf = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::GLYF);

        // register the missing glyf.
        $glyf->registerGlyph(0);
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        foreach ($this->_tables as $table) {
            $table->cleanUp();
        }

        $this->_tables = null;
        $this->_font = null;
    }

    /**
     * Gets a table.
     *
     * @param string $tag
     * @return SetaPDF_Core_Font_TrueType_Subset_Table
     * @throws SetaPDF_Core_Font_Exception
     */
    public function getTable($tag)
    {
        if (!isset($this->_tables[$tag])) {
            if (!$this->_font->tableExists($tag)) {
                throw new SetaPDF_Core_Font_Exception(
                    sprintf('Table "%s" is missing.', $tag)
                );
            }

            $classname = SetaPDF_Core_Font_TrueType_Subset_Table::getClassName($tag);
            $this->_tables[$tag] = new $classname($this->_font->getTable($tag), $this);
        }

        return $this->_tables[$tag];
    }

    /**
     * Adds a char code to the subset.
     *
     * @param int $charCode The unicode point to add.
     * @return int The new point in the individual encoding.
     */
    public abstract function addCharCode($charCode);

    /**
     * Adds a character to the subset and returns the value to which it is registered.
     *
     * @param string $char The char in UTF16-BE encoding
     * @return string
     */
    public abstract function addChar($char);

    /**
     * Gets the original font.
     *
     * @return SetaPDF_Core_Font_TrueType_File
     */
    public function getFont()
    {
        return $this->_font;
    }

    /**
     * Prepares the data for sub-setting.
     * @throws SetaPDF_Core_Font_Exception
     */
    protected function _prepareSubset()
    {
        // load all required tables
        $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::CMAP);
        $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_HEADER);
        $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::LOCA);

        try {
            // optional Table(s)
            $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::PREP);
            $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::CVT);
            $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::FPGM);
        } catch (SetaPDF_Core_Font_Exception $e) {}

        /**
         * @var $glyf SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData
         * @var $maxp SetaPDF_Core_Font_TrueType_Subset_Table_MaximumProfile
         * @var $head SetaPDF_Core_Font_TrueType_Subset_Table_Header
         * @var $hmtx SetaPDF_Core_Font_TrueType_Subset_Table_HorizontalMetrics
         */
        $maxp = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE);
        $glyf = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::GLYF);
        $head = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);
        $hmtx = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_METRICS);

        // recalculate following data
        $data = [
//            'xMin' => null,
//            'yMin' => null,
//            'xMax' => null,
//            'yMax' => null,

            'advanceWidthMax' => null,
            'minLeftSideBearing' => null,
            'minRightSideBearing' => null,
            'xMaxExtent' => null,

            'maxPoints' => 0,
            'maxContours' => 0,
            'maxCompositePoints' => 0,
            'maxCompositeContours' => 0,

            'maxSizeOfInstructions' => 0,
            'maxComponentElements' => 0,
            'maxComponentDepth' => 0,
        ];

        $this->_resolveGlyphs(
            $glyf->getMapping(),
            $data
        );

        $update = in_array(null, $data, true) === false;

        /**
         * @var $hhea SetaPDF_Core_Font_TrueType_Subset_Table_HorizontalHeader
         */
        $hhea = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_HEADER);

        $optimizedMetrics = $hmtx->optimize();
        $hhea->setNumberOfHMetrics(count($optimizedMetrics[0]));
        if ($update) {
            $hhea->setAdvanceWidthMax($data['advanceWidthMax']);
            $hhea->setMinLeftSideBearing($data['minLeftSideBearing']);
            $hhea->setMinRightSideBearing($data['minRightSideBearing']);
            $hhea->setXMaxExtent($data['xMaxExtent']);
        }

        $head->setCheckSumAdjustment(0);
        /* we do not update the font bounding box, because we use the original box to calculate positioning
        if ($update) {
            $head->setXMin($data['xMin']);
            $head->setYMin($data['yMin']);
            $head->setXMax($data['xMax']);
            $head->setYMax($data['yMax']);
        }*/

        $maxp->setNumGlyphs($glyf->getNumGlyphs());
        if ($update) {
            $maxp->setMaxPoints($data['maxPoints']);
            $maxp->setMaxContours($data['maxContours']);
            $maxp->setMaxCompositePoints($data['maxCompositePoints']);
            $maxp->setMaxCompositeContours($data['maxCompositeContours']);
            $maxp->setMaxSizeOfInstructions($data['maxSizeOfInstructions']);
            $maxp->setMaxComponentDepth($data['maxComponentDepth']);
            $maxp->setMaxComponentElements($data['maxComponentElements']);
        }
    }

    /**
     * Resolves all the glyphs recursively and updates the data array accordingly.
     *
     * @param array $glyphs
     * @param array $data
     * @param int $depth
     * @return array
     * @throws SetaPDF_Core_Font_Exception
     */
    protected function _resolveGlyphs(
        array $glyphs,
        array &$data,
        $depth = 0
    )
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData $glyf
         * @var SetaPDF_Core_Font_TrueType_Subset_Table_HorizontalMetrics $hmtx
         * @var SetaPDF_Core_Font_TrueType_Subset_Table_MaximumProfile $maxp
         */
        $glyf = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::GLYF);
        $hmtx = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_METRICS);
        $maxp = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE);

        $data['maxComponentDepth'] = max($depth, $data['maxComponentDepth']);
        if ($depth > $maxp->getOriginalTable()->getMaxComponentDepth()) {
            throw new SetaPDF_Core_Font_Exception('Recursion limit reached!');
        }

        $allPoints = 0;
        $allContours = 0;

        foreach ($glyphs as $glyphId) {
            $glyph = $glyf->getGlyph($glyphId);

            if ($glyph === false) {
                continue;
            }

            $origin = $glyph->getOrigin();
            $originXMin = $origin->getXMin();
            // $originYMin = $origin->getYMin();
            $originXMax = $origin->getXMax();
            // $originYMax = $origin->getYMax();

            $hMetric = $hmtx->getHMetric($glyphId);

            $rightSideBearing = $hMetric[0] - $hMetric[1] - ($originXMax - $originXMin);
            $xExtent = $hMetric[1] + ($originXMax - $originXMin);

            if ($data['advanceWidthMax'] === null) {
                /*
                $data['xMin'] = $originXMin;
                $data['yMin'] = $originYMin;
                $data['xMax'] = $originXMax;
                $data['yMax'] = $originYMax;
                */
                $data['advanceWidthMax'] = $hMetric[0];
                $data['minLeftSideBearing'] = $hMetric[1];
                $data['minRightSideBearing'] = $rightSideBearing;
                $data['xMaxExtent'] = $xExtent;
            } else {
                /*
                $data['xMin'] = min($originXMin, $data['xMin']);
                $data['yMin'] = min($originYMin, $data['yMin']);
                $data['xMax'] = max($originXMax, $data['xMax']);
                $data['yMax'] = max($originYMax, $data['yMax']);
                */
                $data['advanceWidthMax'] = max($hMetric[0], $data['advanceWidthMax']);
                $data['minLeftSideBearing'] = min($hMetric[1], $data['minLeftSideBearing']);
                $data['minRightSideBearing'] = min($rightSideBearing, $data['minRightSideBearing']);
                $data['xMaxExtent'] = max($xExtent, $data['xMaxExtent']);
            }

            $description = $glyph->getDescription();

            $data['maxSizeOfInstructions'] = max(
                $data['maxSizeOfInstructions'],
                $description->getOrigin()->getInstructionSize()
            );

            if ($description instanceof SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description_Simple) {
                $pointCount = $description->getOrigin()->getPointCount();
                $contourCount = $glyph->getOrigin()->getNumberOfContours();

                $data['maxPoints'] = max($data['maxPoints'], $pointCount);
                $data['maxContours'] = max($data['maxContours'], $contourCount);
            } else {
                $topLevelGlyphs = $glyph->getDescription()->getOrigin()->getTopLevelGlyphs();
                $data['maxComponentElements'] = max(count($topLevelGlyphs), $data['maxComponentElements']);

                list($pointCount, $contourCount) = $this->_resolveGlyphs(
                    array_map(
                        function ($glyphId) use ($glyf) {
                            return $glyf->registerGlyph($glyphId);
                        }, $topLevelGlyphs),
                    $data,
                    $depth + 1
                );

                $data['maxCompositePoints'] = max($data['maxCompositePoints'], $pointCount);
                $data['maxCompositeContours'] = max($data['maxCompositeContours'], $contourCount);
            }

            $allPoints += $pointCount;
            $allContours += $contourCount;
        }

        return [
            $allPoints,
            $allContours
        ];
    }

    /**
     * Subsets the font.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     * @throws SetaPDF_Core_Font_Exception
     */
    public function subset(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $this->_prepareSubset();

        $fontWriter = new SetaPDF_Core_Writer_String();
        $fontWriter->start();
        $tableData = $this->_writeTables($fontWriter);
        $fontWriter->finish();

        $fontData = $fontWriter->getBuffer();

        if (isset($tableData[SetaPDF_Core_Font_TrueType_Table_Tags::HEADER])) {
            $offset = $tableData[SetaPDF_Core_Font_TrueType_Table_Tags::HEADER]['offset'];

            // replace the checkSumAdjustment
            $fontData = substr_replace(
                $fontData,
                SetaPDF_Core_Font_TrueType_Subset_File::calculateChecksumAdjustment(
                    $fontData,
                    array_map(
                        function ($value) {
                            return $value['checksum'];
                        },
                        $tableData
                    )
                ),
                $offset + 8,
                4
            );
        }

        // write font
        $writer->write($fontData);
    }

    /**
     * Writes the tables.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     * @return array
     */
    private function _writeTables(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $numTables = count($this->_tables);
        $offsetTableLength = 12 + ($numTables * 16);

        $tableData = [];

        $ofssetTableWriter = new SetaPDF_Core_Writer_String();
        $tableWriter = new SetaPDF_Core_Writer_String();

        $ofssetTableWriter->start();
        $tableWriter->start();

        ksort($this->_tables);

        // Table records
        foreach ($this->_tables as $tag => $table) {
            // tag
            $ofssetTableWriter->write($tag);

            $offset = $tableWriter->getPos() + $offsetTableLength;

            list($length, $checksum) = $this->_writeTable($tableWriter, $tag);

            // checksum
            $ofssetTableWriter->write($checksum);

            // offset
            $ofssetTableWriter->write(SetaPDF_Core_BitConverter::formatToUInt32($offset));

            // length
            $ofssetTableWriter->write(SetaPDF_Core_BitConverter::formatToUInt32($length));

            $tableData[$tag] = [
                'checksum' => $checksum,
                'offset' => $offset
            ];
        }

        $tableWriter->finish();
        $ofssetTableWriter->finish();

        // write the offset table
        $this->_writeOffsetTable($writer);
        $writer->write($ofssetTableWriter->getBuffer());

        // write all the other tables
        $writer->write($tableWriter->getBuffer());

        return $tableData;
    }

    /**
     * Writes the offset table.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     */
    public function _writeOffsetTable(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        // sfnt version
        $writer->write(SetaPDF_Core_BitConverter::formatToInt32($this->_font->getSfntVersion()));

        $numTables = count($this->_tables);

        // numTables
        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($numTables));

        $maximumPowerOfTwo = 0;
        while ((1 << $maximumPowerOfTwo) < $numTables) {
            $maximumPowerOfTwo++;
        }
        $maximumPowerOfTwo--;

        // (Maximum power of 2 <= numTables) x 16.
        $searchRange = (1 << $maximumPowerOfTwo) * 16;
        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($searchRange));

        // Log2(maximum power of 2 <= numTables).
        $entrySelector = log($maximumPowerOfTwo, 2);
        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($entrySelector));

        //  NumTables x 16-searchRange.
        $rangeShift = 16 * $numTables - $searchRange;
        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($rangeShift));
    }

    /**
     * Writes a single table and returns information about it.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     * @param string $tag
     * @return array
     */
    protected function _writeTable(SetaPDF_Core_Writer_WriterInterface $writer, $tag)
    {
        if (!isset($this->_tables[$tag])) {
            return null;
        }

        $tempWriter = new SetaPDF_Core_Writer_String();

        $tempWriter->start();
        $this->_tables[$tag]->write($tempWriter);
        $tempWriter->finish();

        $buffer = $tempWriter->getBuffer();

        /**
         * The TrueType rasterizer has a much easier time traversing tables if they are padded so that each table begins
         * on a 4-byte boundary. Also, the algorithm for calculating table checksums assumes that tables are 32-bit
         * aligned. For this reason, all tables must be 32-bit aligned and padded with zeroes.
         * The length of all tables should be recorded in the table record with their actual length (not their padded
         * length).
         */
        $length = strlen($buffer);
        if ($length % 4) {
            $buffer .= str_repeat("\0", 4 - strlen($buffer) % 4);
        }

        $writer->write($buffer);

        return [$length, $this->calculateTableChecksum($buffer)];
    }

    /**
     * Calculates a table checksum.
     *
     * @param string $data
     * @return string
     */
    public static function calculateTableChecksum($data)
    {
        if (strlen($data) % 4) {
            $data .= str_repeat("\0", 4 - (strlen($data) % 4));
        }

        $high = 0;
        $low = 0;
        for ($i = 0, $length = strlen($data); $i < $length; $i += 4) {
            $high += (ord($data[$i]) << 8) + ord($data[$i + 1]);
            $low += (ord($data[$i + 2]) << 8) + ord($data[$i + 3]);
        }

        return pack('nn', $high + ($low >> 16), $low);
    }

    /**
     * Calculates the checksum adjustment.
     *
     * @param string $offsetData
     * @param string[] $checksums
     * @return string
     */
    public static function calculateChecksumAdjustment($offsetData, $checksums)
    {
        list(, $high, $low) = unpack('n2', self::calculateTableChecksum(
            self::calculateTableChecksum($offsetData) . implode($checksums)
        ));
        $high = 0xB1B0 - $high;
        $low = 0xAFBA - $low;
        return pack('nn', $high + ($low >> 16), $low);
    }
}
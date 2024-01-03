<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Table.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * A generic representation of a table contained in the subsetter.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The original table.
     *
     * @var SetaPDF_Core_Font_TrueType_Table
     */
    protected $_originalTable;

    /**
     * The modified data.
     *
     * @var array
     */
    protected $_changedData = [];

    /**
     * Get a class name by tag name.
     *
     * @param $tag
     * @throws InvalidArgumentException
     * @return string
     */
    public static function getClassName($tag)
    {
        $prefix = 'SetaPDF_Core_Font_TrueType_Subset_Table_';
        switch ($tag) {
            case SetaPDF_Core_Font_TrueType_Table_Tags::CMAP:
                return $prefix . 'CharacterToGlyphIndexMapping';
            case SetaPDF_Core_Font_TrueType_Table_Tags::HEADER:
                return $prefix . 'Header';
            case SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_HEADER:
                return $prefix . 'HorizontalHeader';
            case SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_METRICS:
                return $prefix . 'HorizontalMetrics';
            case SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE:
                return $prefix . 'MaximumProfile';
            case SetaPDF_Core_Font_TrueType_Table_Tags::CVT:
                return $prefix . 'ControlValue';
            case SetaPDF_Core_Font_TrueType_Table_Tags::FPGM:
                return $prefix . 'FontProgram';
            case SetaPDF_Core_Font_TrueType_Table_Tags::GLYF:
                return $prefix . 'GlyphData';
            case SetaPDF_Core_Font_TrueType_Table_Tags::LOCA:
                return $prefix . 'IndexToLocation';
            case SetaPDF_Core_Font_TrueType_Table_Tags::PREP:
                return $prefix . 'ControlValueProgram';
        }

        throw new InvalidArgumentException(sprintf('Subsetting for the table "%s" is not implemented.', $tag));
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table $originalTable
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table $originalTable)
    {
        $this->_originalTable = $originalTable;
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        $this->_originalTable->cleanUp();
        $this->_originalTable = null;
        $this->_changedData = null;
    }

    /**
     * Gets the original table.
     *
     * @return SetaPDF_Core_Font_TrueType_Table
     */
    public function getOriginalTable()
    {
        return $this->_originalTable;
    }

    /**
     * Writes the table.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $record = $this->getOriginalTable()->getRecord();
        $data = $record->getFile()->getReader()->readBytes(
            $record->getLength(),
            $record->getOffset()
        );

        foreach ($this->_changedData as $name => $value) {
            list($offset, $type) = $this->getOriginalTable()->getEntry($name);
            switch ($type) {
                case SetaPDF_Core_BitConverter::BYTE:
                case SetaPDF_Core_BitConverter::SHORT:
                case SetaPDF_Core_BitConverter::USHORT:
                case SetaPDF_Core_BitConverter::LONG:
                case SetaPDF_Core_BitConverter::ULONG:
                case SetaPDF_Core_BitConverter::FIXED:
                    $method = 'formatTo' . $type;
                    $value = SetaPDF_Core_BitConverter::$method($value);
            }

            $data = substr_replace($data, $value, $offset, strlen($value));
        }

        $writer->write($data);
    }
}
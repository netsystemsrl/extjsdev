<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Table.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract class for true type tables.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_TrueType_Table
{
    /**
     * Get a class name for a specific table by its tag name.
     *
     * @param $tag
     * @return string
     */
    static public function getClassName($tag)
    {
        $prefix = 'SetaPDF_Core_Font_TrueType_Table_';
        switch ($tag) {
            case SetaPDF_Core_Font_TrueType_Table_Tags::HEADER:
                return $prefix . 'Header';
            case SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_HEADER:
                return $prefix . 'HorizontalHeader';
            case SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE:
                return $prefix . 'MaximumProfile';
            case SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_METRICS:
                return $prefix . 'HorizontalMetrics';
            case SetaPDF_Core_Font_TrueType_Table_Tags::CMAP:
                return $prefix . 'CharacterToGlyphIndexMapping';
            case SetaPDF_Core_Font_TrueType_Table_Tags::NAME:
                return $prefix . 'Name';
            case SetaPDF_Core_Font_TrueType_Table_Tags::OS2:
                return $prefix . 'Os2';
            case SetaPDF_Core_Font_TrueType_Table_Tags::POST:
                return $prefix . 'Post';
            case SetaPDF_Core_Font_TrueType_Table_Tags::LOCA:
                return $prefix . 'IndexToLocation';
            case SetaPDF_Core_Font_TrueType_Table_Tags::GLYF:
                return $prefix . 'GlyphData';
            case SetaPDF_Core_Font_TrueType_Table_Tags::CVT:
                return $prefix . 'ControlValue';
            case SetaPDF_Core_Font_TrueType_Table_Tags::PREP:
                return $prefix . 'ControlValueProgram';
            case SetaPDF_Core_Font_TrueType_Table_Tags::FPGM:
                return $prefix . 'FontProgram';
        }

        throw new InvalidArgumentException(sprintf('Access to the table "%s" is not implemented.', $tag));
    }

    /**
     * The main table record.
     *
     * @var SetaPDF_Core_Font_TrueType_Table_Record
     */
    protected $_record;

    /**
     * Data of the table
     *
     * @var array
     */
    protected $_data = [];

    /**
     * Raw binary data read from the file
     *
     * @var array
     */
    protected $_rawData = [];

    /**
     * Configuration about table entries
     *
     * @var array
     */
    protected $_entries = [];

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_Record $record
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_Record $record)
    {
        $this->_record = $record;
    }

    /**
     * Get the record object.
     *
     * @return SetaPDF_Core_Font_TrueType_Table_Record
     */
    public function getRecord()
    {
        return $this->_record;
    }

    public function getEntry($name)
    {
        if (!isset($this->_entries[$name])) {
            throw  new InvalidArgumentException('Unknown property "' . $name . '" in table.');
        }

        return $this->_entries[$name];
    }

    /**
     * Release memory.
     */
    public function cleanUp()
    {
        $this->_record = null;
        $this->_entries = null;
        $this->_data = null;
        $this->_rawData = null;
    }

    /**
     * Get raw data from a specific table.
     *
     * The properties are defined in the $_entries property of an implemented table.
     *
     * @param $name
     * @return mixed
     */
    protected function _getRaw($name)
    {
        if (!isset($this->_entries[$name])) {
            throw  new InvalidArgumentException('Unknown property "' . $name . '" in table.');
        }

        if (!isset($this->_rawData[$name])) {
            $tableOffset = $this->_entries[$name][0];
            if (is_array($tableOffset)) {
                foreach ($tableOffset AS $check) {
                    if (is_int($check)) {
                        $tableOffset = $check;
                        break;
                    } else {
                        $method = 'get' . ucfirst($check[0]);
                        if ($this->$method() === $check[1]) {
                            $tableOffset = $check[2];
                            break;
                        }
                    }
                }

                if ($tableOffset === null) {
                    return null;
                }
            }
            $position = $this->_record->getOffset() + $tableOffset;

            $size = is_int($this->_entries[$name][1])
                ? $this->_entries[$name][1]
                : SetaPDF_Core_BitConverter::getSize($this->_entries[$name][1]);
            $this->_rawData[$name] = $this->_record->getFile()->getReader()->readBytes($size, $position);
        }

        return $this->_rawData[$name];
    }

    /**
     * Get a value from the table.
     *
     * The properties are defined in the $_entries property of an implemented table.
     *
     * @param $name
     * @return mixed
     */
    protected function _get($name)
    {
        if (!isset($this->_entries[$name])) {
            throw  new InvalidArgumentException('Unknown property "' . $name . '" in table.');
        }

        $raw = $this->_getRaw($name);
        if (null === $raw) {
            return null;
        }

        $type = isset($this->_entries[$name][1]) ? $this->_entries[$name][1] : null;
        switch ($type) {
            case SetaPDF_Core_BitConverter::BYTE:
            case SetaPDF_Core_BitConverter::SHORT:
            case SetaPDF_Core_BitConverter::USHORT:
            case SetaPDF_Core_BitConverter::LONG:
            case SetaPDF_Core_BitConverter::ULONG:
            case SetaPDF_Core_BitConverter::FIXED:
                $method = 'formatFrom' . $type;
                return SetaPDF_Core_BitConverter::$method($raw);
        }

        return $raw;
    }
}

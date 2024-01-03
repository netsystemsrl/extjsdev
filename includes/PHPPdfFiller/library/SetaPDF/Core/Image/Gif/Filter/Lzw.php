<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id$
 */

/**
 * Class to apply LZW encoding.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Filter_Lzw
{
    /**
     * The clear code.
     *
     * This code marks a reset of the LZW stream.
     *
     * @var int
     */
    private $_clearCode;

    /**
     * The end code.
     *
     * This code marks the end of the LZW stream.
     *
     * @var int
     */
    private $_endCode;

    /**
     * The next code.
     * This code marks the next unassigned code.
     *
     * @var int
     */
    private $_nextCode;

    /**
     * The code size.
     *
     * This value marks the current size of codes.
     *
     * @var int
     */
    private $_codeSize;

    /**
     * The initial code size.
     *
     * The value marks the code size before running the LZW algorithm.
     *
     * @var int
     */
    private $_initialCodeSize;

    /**
     * A value that marks a limit to increase the bit size.
     *
     * @var int
     */
    private $_nextCodeLimit;

    /**
     * The currently used reader instance.
     *
     * @var SetaPDF_Core_Image_Gif_Reader_Bit
     */
    private  $_reader;

    /**
     * The code table.
     *
     * @var array
     */
    private $_table;

    /**
     * The output buffer.
     *
     * @var array
     */
    private $_outputBuffer;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Image_Gif_Reader_Bit $reader
     * @param int $minimumCodeSize
     * @param array $colorTable
     */
    public function __construct(SetaPDF_Core_Image_Gif_Reader_Bit $reader, $minimumCodeSize, $colorTable)
    {
        $this->_clearCode = 1 << $minimumCodeSize;
        $this->_endCode = $this->_clearCode + 1;
        $this->_codeSize = $minimumCodeSize + 1;

        $numColors = count($colorTable);

        $this->_table = [];
        for ($c = $numColors - 1; $c >= 0; $c--) {
            $this->_table[$c] = [$colorTable[$c]];
        }

        $this->_reader = $reader;

        $this->_table[$this->_clearCode] = [$this->_clearCode];
        $this->_table[$this->_endCode] = [$this->_endCode];

        $this->_initialCodeSize = $this->_codeSize;
    }

    /**
     * Resets the LZW code-table, reads away all the clear codes and outputs the first given code.
     *
     * @return int
     * @throws SetaPDF_Core_Image_Exception
     */
    protected function _clearAndOutput()
    {
        $this->_codeSize = $this->_initialCodeSize;
        $this->_reader->setNumBits($this->_codeSize);
        $this->_nextCodeLimit = (1 << $this->_initialCodeSize) - 1;
        $this->_nextCode = $this->_endCode + 1;

        $code = $this->_reader->readBits();
        while ($code === $this->_clearCode) {
            $code = $this->_reader->readBits();
        }

        $this->_output($this->_table[$code]);
        return $code;
    }

    /**
     * Adds the given data to the output.
     *
     * @param array $data
     */
    protected function _output($data)
    {
        foreach ($data as $value) {
            $this->_outputBuffer[] = $value;
        }
    }

    /**
     * Uncompresses the LZW data of a GIF image.
     *
     * @return array
     * @throws SetaPDF_Core_Image_Exception
     */
    public function uncompress()
    {
        $this->_outputBuffer = [];
        $code = $this->_clearAndOutput();

        while (true) {
            $previousCode = $code;
            $code = $this->_reader->readBits();

            if ($code === $this->_clearCode) {
                $code = $this->_clearAndOutput();
                continue;
            }

            if ($code === $this->_endCode) {
                break;
            }

            $previousValues = $this->_table[$previousCode];
            $previousValuesAndCurrent = $previousValues;

            if ($code < $this->_nextCode) {
                $values = $this->_table[$code];
                $this->_output($values);
                $previousValuesAndCurrent[] = $values[0];
            } else {
                $previousValuesAndCurrent[] = $previousValues[0];
                $this->_output($previousValuesAndCurrent);
            }

            if ($this->_nextCode < 4096) {
                if ($this->_nextCode >= $this->_nextCodeLimit && $this->_codeSize < 12) {
                    $this->_reader->setNumBits(++$this->_codeSize);
                    $this->_nextCodeLimit = (1 << $this->_codeSize) - 1;
                }
                $this->_table[$this->_nextCode++] = $previousValuesAndCurrent;
            }
        }

        return $this->_outputBuffer;
    }
}
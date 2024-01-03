<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Predictor.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class handling predictor functions
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Filter_Predictor implements SetaPDF_Core_Filter_FilterInterface
{
    /**
     * Whether or not to only write algorithm byte if predictor value is 15.
     *
     * If set to <b>true</b>, the algorithm byte is written at the beginning
     * of every line for all PNG predictors.
     *
     * If set to <b>false</b>, this byte is only written for optimum png compression,
     * which can vary the compression algorithm for each row.
     *
     * @var bool
     */
    public $alwaysWritePredictorByte = true;

    /**
     * @var int
     */
    protected $_predictor = 1;

    /**
     * @var int
     */
    protected $_colors = 1;

    /**
     * @var int
     */
    protected $_bitsPerComponent = 8;

    /**
     * @var int
     */
    protected $_columns = 1;

    /**
     * The constructor.
     *
     * @param integer $predictor
     * @param integer $colors
     * @param integer $bitsPerComponent
     * @param integer $columns
     */
    public function __construct
    (
        $predictor = null,
        $colors = null,
        $bitsPerComponent = null,
        $columns = null
    )
    {
        if (null !== $predictor && $predictor != 1) {
            $this->_predictor = (int)$predictor;

            if (null !== $colors)
                $this->_colors = (int)$colors;

            if (null !== $bitsPerComponent)
                $this->_bitsPerComponent = (int)$bitsPerComponent;

            if (null !== $columns)
                $this->_columns = (int)$columns;
        }
    }

    /**
     * Value prediction using the Alan W. Paeth algorithm.
     *
     * @param int|float $left The value to the left of the processed data entry.
     * @param int|float $above The value above the processed data entry.
     * @param int|float $upperLeft The value to the upper left of the processed data entry.
     * @return int|float Returns the prediction value according to the Peath algorithm
     */
    protected function _paethPredictor($left, $above, $upperLeft)
    {
        // initial estimate
        $p = $left + $above - $upperLeft;

        // distances to a, b, c
        $pLeft = abs($p - $left);
        $pAbove = abs($p - $above);
        $pUpperLeft = abs($p - $upperLeft);

        // return nearest of $left, $above, $upperLeft,
        // breaking ties in order $left, $above, $upperLeft.
        if ($pLeft <= $pAbove && $pLeft <= $pUpperLeft) {
            return $left;
        } else if ($pAbove <= $pUpperLeft) {
            return $above;
        } else {
            return $upperLeft;
        }
    }

    /**
     * Decodes a string using a predictor function.
     *
     * @param string $data The input string
     * @return string The decoded data
     * @throws SetaPDF_Core_Filter_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function decode($data)
    {
        // no predictor
        if ($this->_predictor == 1) {
            return $data;

        } else if ($this->_predictor == 2) { // TIFF
            // not supported
            throw new SetaPDF_Exception_NotImplemented(
                "TIFF predictor not yet supported"
            );

        } else if ($this->_predictor >= 10 && $this->_predictor <= 15) { // PNG predictors
            // compute bitmap parameters
            $bytesPerPixel = (int) ceil($this->_colors * $this->_bitsPerComponent / 8);
            $bytesPerRow = (int) ceil($this->_colors * $this->_columns * $this->_bitsPerComponent / 8);

            // the return (decoded) data
            $out = '';

            // some variables needed to process the data
            /** @noinspection PhpUnusedLocalVariableInspection */
            $currRowString = ''; // the currently read row as a string
            $offset = 0; // the offset in the source data ($data) while reading/decoding it
            /** @noinspection PhpUnusedLocalVariableInspection */
            $currRowData = array(); // the data of the current row
            $priorRowData = array_fill(0, $bytesPerRow, 0); // the data of the previous row

            // initialize the predictor for the current row
            $currPredictor = $this->_predictor;

            // read until EOF
            $eof = false;
            while (!$eof) {
                // read first algorithm byte for PNG predictor 15
                if ($this->alwaysWritePredictorByte || $this->_predictor == 15) {
                    $currPredictor = ord(substr($data, $offset++, 1));
                    if (!is_null($currPredictor)) {
                        $currPredictor += 10;
                    } else {
                        $eof = true;
                    }
                }

                // read row
                if (!$eof) {
                    $currRowString = substr($data, $offset, $bytesPerRow);
                    if (strlen($currRowString) != $bytesPerRow) {
                        $eof = true;
                    }

                    // process row
                    if (strlen($currRowString) != 0) {
                        // copy current row into an array
                        $currRowData = array();
                        $currRowLength = strlen($currRowString);
                        for ($i = 0; $i < $currRowLength; $i++) {
                            $currRowData[$i] = ord($currRowString[$i]);
                        }

                        // process row using the selected predictor
                        switch ($currPredictor) {
                            case 10: // PNG_FILTER_NONE
                                break;

                            case 11: // PNG_FILTER_SUB (left)
                                for ($i = $bytesPerPixel; $i < $currRowLength; $i++) {
                                    $currRowData[$i] = ($currRowData[$i] + $currRowData[$i - $bytesPerPixel]) & 0xff;
                                }
                                break;

                            case 12: // PNG_FILTER_UP (previous row)
                                for ($i = 0; $i < $currRowLength; $i++) {
                                    $currRowData[$i] = ($currRowData[$i] + $priorRowData[$i]) & 0xff;
                                }
                                break;

                            case 13: // PNG_FILTER_AVERAGE (to the left and previous row)
                                for ($i = 0; $i < $bytesPerPixel; $i++) {
                                    $currRowData[$i] = ($currRowData[$i] + floor($priorRowData[$i] / 2)) & 0xff;
                                }
                                for ($i = $bytesPerPixel; $i < $currRowLength; $i++) {
                                    $currRowData[$i] = ($currRowData[$i] + floor(($currRowData[$i - $bytesPerPixel] + $priorRowData[$i]) / 2)) & 0xff;
                                }
                                break;

                            case 14: // PNG_FILTER_PAETH
                                for ($i = 0; $i < $currRowLength; $i++) {
                                    // execute peath predictor
                                    $left = ($i < $bytesPerPixel) ? 0 : $currRowData[$i - $bytesPerPixel];
                                    $above = $priorRowData[$i];
                                    $upperLeft = ($i < $bytesPerPixel) ? 0 : $priorRowData[$i - $bytesPerPixel];
                                    $predicted = $this->_paethPredictor($left, $above, $upperLeft);

                                    // encode data
                                    $currRowData[$i] = ($currRowData[$i] + $predicted) & 0xff;
                                }
                                break;

                            default:
                                // error PNG filter unknown.
                                throw new SetaPDF_Core_Filter_Exception(
                                    'unrecognized png predictor (' . $currPredictor . ') while decoding data',
                                    SetaPDF_Core_Filter_Exception::UNRECOGNIZED_PNG_PREDICTOR
                                );

                        } // switch on current PNG predictor

                        // copy data to output
                        for ($i = 0; $i < $currRowLength; $i++) {
                            $out .= chr($currRowData[$i]);
                        }

                        // copy current row to previous row
                        $priorRowData = $currRowData;

                        // offset to next row
                        $offset += $bytesPerRow;
                    } // if not eof
                } // if not eof
            } // while reading data

            // return decoded data
            return $out;

        } else { // if PNG predictor
            throw new SetaPDF_Core_Filter_Exception(
                'unrecognized predictor: ' . $this->_predictor,
                SetaPDF_Core_Filter_Exception::UNRECOGNIZED_PREDICTOR
            );
        }
    }

    /**
     * Encodes a string using a predictor function.
     *
     * @param string $data The input string
     * @return string The encoded data
     * @throws SetaPDF_Core_Filter_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    function encode($data)
    {
        if ($this->_predictor == 1) { // no predictor
            return $data;

        } else if ($this->_predictor == 2) { // TIFF
            // not supported
            throw new SetaPDF_Exception_NotImplemented(
                'TIFF predictor not yet supported'
            );

        } else if ($this->_predictor >= 10 && $this->_predictor <= 15) { // PNG predictors
            // compute bitmap parameters
            $bytesPerPixel = (int) ceil($this->_colors * $this->_bitsPerComponent / 8);
            $bytesPerRow = (int) ceil($this->_colors * $this->_columns * $this->_bitsPerComponent / 8);

            // the return (encoded) data
            $out = '';

            // some variables needed to process the data				
            /** @noinspection PhpUnusedLocalVariableInspection */
            $currRowString = ''; // the currently read row as a string
            $offset = 0; // the offset in the source data ($data) while reading/decoding it
            /** @noinspection PhpUnusedLocalVariableInspection */
            $currRowData = array(); // the data of the current row
            $priorRowData = array_fill(0, $bytesPerRow, 0); // the data of the previous row

            // read the filter type byte and a whole row of data
            while (($currRowString = substr($data, $offset, $bytesPerRow)) &&
                strlen($currRowString) == $bytesPerRow) {
                // copy current row into an array
                $currRowData = array();
                $currRowLength = strlen($currRowString);
                for ($i = 0; $i < $currRowLength; $i++) {
                    $currRowData[$i] = ord($currRowString[$i]);
                }

                // select predictor
                $currPredictor = $this->_predictor;

                // find optimal predictor
                if ($this->_predictor == 15) {
                    // compute a value for the SUB predictor
                    $subPredictor = 0;
                    for ($i = $bytesPerRow - 1; $i >= $bytesPerPixel; $i--) {
                        $subPredictor += abs($currRowData[$i] - $currRowData[$i - $bytesPerPixel]);
                    }

                    // compute a value for the UP predictor
                    $upPredictor = 0;
                    for ($i = 0; $i < $bytesPerRow; $i++) {
                        $upPredictor += abs($currRowData[$i] - $priorRowData[$i]);
                    }

                    // compute a value for the AVERAGE predictor
                    $averagePredictor = 0;
                    for ($i = $bytesPerRow - 1; $i >= $bytesPerPixel; $i--) {
                        $averagePredictor += abs($currRowData[$i] - floor(($currRowData[$i - $bytesPerPixel] + $priorRowData[$i]) / 2));
                    }

                    for ($i = 0; $i < $bytesPerPixel; $i++) {
                        $averagePredictor += abs($currRowData[$i] - floor($priorRowData[$i] / 2));
                    }

                    // compute a value for the PEATH predictor
                    $peathPredictor = 0;
                    for ($i = $bytesPerRow - 1; $i >= 0; $i--) {
                        $left = ($i < $bytesPerPixel) ? 0 : $currRowData[$i - $bytesPerPixel];
                        $above = $priorRowData[$i];
                        $upperLeft = ($i < $bytesPerPixel) ? 0 : $priorRowData[$i - $bytesPerPixel];
                        $predicted = $this->_paethPredictor($left, $above, $upperLeft);
                        $peathPredictor += abs($currRowData[$i] - $predicted);
                    }

                    // select the best predictor
                    if ($subPredictor <= $upPredictor && $subPredictor <= $averagePredictor && $subPredictor <= $peathPredictor) {
                        $currPredictor = 11;
                    } else if ($upPredictor <= $subPredictor && $upPredictor <= $averagePredictor && $upPredictor <= $peathPredictor) {
                        $currPredictor = 12;
                    } else if ($averagePredictor <= $subPredictor && $averagePredictor <= $upPredictor && $averagePredictor <= $peathPredictor) {
                        $currPredictor = 13;
                    } else {
                        $currPredictor = 14;
                    }
                }

                // process row using the selected filter
                switch ($currPredictor) {
                    case 10: // PNG_FILTER_NONE
                        break;

                    case 11: // PNG_FILTER_SUB (left)
                        for ($i = $bytesPerRow - 1; $i >= $bytesPerPixel; $i--) {
                            $currRowData[$i] = ($currRowData[$i] - $currRowData[$i - $bytesPerPixel]) & 0xff;
                        }
                        break;

                    case 12: // PNG_FILTER_UP (previous row)
                        for ($i = 0; $i < $bytesPerRow; $i++) {
                            $currRowData[$i] = ($currRowData[$i] - $priorRowData[$i]) & 0xff;
                        }
                        break;

                    case 13: // PNG_FILTER_AVERAGE (to the left and previous row)
                        for ($i = $bytesPerRow - 1; $i >= $bytesPerPixel; $i--) {
                            $currRowData[$i] = ($currRowData[$i] - floor(($currRowData[$i - $bytesPerPixel] + $priorRowData[$i]) / 2) & 0xff);
                        }
                        for ($i = 0; $i < $bytesPerPixel; $i++) {
                            $currRowData[$i] = ($currRowData[$i] - floor($priorRowData[$i] / 2)) & 0xff;
                        }
                        break;

                    case 14: // PNG_FILTER_PAETH
                        for ($i = $bytesPerRow - 1; $i >= 0; $i--) {
                            // execute peath predictor
                            $left = ($i < $bytesPerPixel) ? 0 : $currRowData[$i - $bytesPerPixel];
                            $above = $priorRowData[$i];
                            $upperLeft = ($i < $bytesPerPixel) ? 0 : $priorRowData[$i - $bytesPerPixel];
                            $predicted = $this->_paethPredictor($left, $above, $upperLeft);

                            // encode data
                            $currRowData[$i] = ($currRowData[$i] - $predicted) & 0xff;
                        }
                        break;

                    default:
                        // error PNG filter unknown.
                        throw new SetaPDF_Core_Filter_Exception(
                            'unrecognized png predictor (' . $currPredictor . ') while encoding data',
                            SetaPDF_Core_Filter_Exception::UNRECOGNIZED_PNG_PREDICTOR
                        );

                } // switch on current PNG predictor						

                // copy data to output
                if ($this->alwaysWritePredictorByte || $this->_predictor == 15) {
                    $out .= chr($currPredictor - 10);
                }
                for ($i = 0; $i < $currRowLength; $i++) {
                    $out .= chr($currRowData[$i]);
                }

                // copy current row to previous row
                for ($i = 0; $i < $currRowLength; $i++) {
                    $priorRowData[$i] = ord($currRowString[$i]);
                }

                // offset to next row
                $offset += $bytesPerRow;

            } // while reading data

            // return encoded data
            return $out;

        } else { // if PNG predictor
            throw new SetaPDF_Core_Filter_Exception(
                'unrecognized predictor: ' . $this->_predictor,
                SetaPDF_Core_Filter_Exception::UNRECOGNIZED_PREDICTOR
            );
        }
    }
}
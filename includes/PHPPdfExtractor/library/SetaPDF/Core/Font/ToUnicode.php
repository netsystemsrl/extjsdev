<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ToUnicode.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * Helper class to create ToUnicode Mapping Files
 *
 * See 5099.CMapRessources.pdf and 5411.ToUnicode.pdf
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_ToUnicode
{
    /**
     * The given mapping.
     *
     * @var array
     */
    private $_mapping;

    /**
     * Whenever we create a single byte mapping or a multi(2) byte mapping.
     *
     * @var bool
     */
    private $_singleByteMapping;

    /**
     * The SetaPDF_Core_Font_ToUnicode constructor.
     *
     * @param array $mapping
     * @throws SetaPDF_Core_Font_Exception
     */
    public function __construct(array $mapping)
    {
        if (count($mapping) === 0) {
            throw new InvalidArgumentException('Emtpy ToUnicode maps are not supported.');
        }

        $this->_mapping = $mapping;

        reset($this->_mapping);
        $this->_singleByteMapping = strlen(key($this->_mapping)) == 1;
    }

    /**
     * Optimizes the mapping data, to make it writable.
     *
     * @return array
     */
    private function _optimize()
    {
        ksort($this->_mapping, SORT_STRING);

        $result = [];
        if (!$this->_singleByteMapping) {
            $previous = $start = $values = null;
            foreach ($this->_mapping as $key => $value) {
                if ($start === null || (ord($previous[1]) + 1) != ord($key[1]) || $key[0] !== $previous[0]) {
                    if ($start !== null) {
                        $result[] = [
                            'start' => sprintf("%04X", SetaPDF_Core_bitConverter::formatFromUInt16($start)),
                            'end' => sprintf("%04X", SetaPDF_Core_bitConverter::formatFromUInt16($previous)),
                            'values' => $values
                        ];
                    }

                    $start = $key;
                    $values = [];
                }

                $previous = $key;
                $values[] = $value;
            }

            if (count($values) > 0) {
                $result[] = [
                    'start' => sprintf("%04X", SetaPDF_Core_bitConverter::formatFromUInt16($start)),
                    'end' => sprintf("%04X", SetaPDF_Core_bitConverter::formatFromUInt16($previous)),
                    'values' => $values
                ];
            }
        } else {
            $previous = $start = $values = null;
            foreach ($this->_mapping as $key => $value) {
                if ($start === null || ord($previous) + 1 != ord($key)) {
                    if ($start !== null) {
                        $result[] = [
                            'start' => sprintf("%02X", ord($start)),
                            'end' => sprintf("%02X", ord($previous)),
                            'values' => $values
                        ];
                    }

                    $start = $key;
                    $values = [];
                }

                $previous = $key;
                $values[] = $value;
            }

            if (count($values) > 0) {
                $result[] = [
                    'start' => sprintf("%02X", ord($start)),
                    'end' => sprintf("%02X", ord($previous)),
                    'values' => $values
                ];
            }
        }

        $data = [];
        for ($i = 0; $i < count($result); $i += 100) {
            $i = min($i, count($result));
            $data[] = array_slice($result, $i, 100);
        }

        return $data;
    }

    /**
     * Creates the mapping steam using the given mapping data.
     *
     * @return string
     */
    public function create()
    {
        $stream = "/CIDInit /ProcSet findresource begin\n"
            . "10 dict begin\n" // 5014.CIDFont_Spec.pdf: Adobe advises, as was done here, that you define a dictionary
            // containing room for three or four additional entries.
            . "begincmap\n"
            . "/CIDSystemInfo\n"
            . "<<\n"
            . "/Registry (Adobe) def\n"
            . "/Ordering (UCS) def\n"
            . "/Supplement 0 def\n"
            . ">> def\n"
            . "/CMapName /Adobe-Identity-UCS def\n"
            . "/CMapType 2 def\n"
            . "1 begincodespacerange\n";

        if ($this->_singleByteMapping) {
            $stream .= "<00> <FF>\n";
        } else {
            $stream .= "<0000> <FFFF>\n";
        }
        $stream .= "endcodespacerange\n";

        foreach ($this->_optimize() as $range) {
            $stream .= count($range) . " beginbfrange\n";
            foreach ($range as $data) {
                $stream .= '<' . $data['start'] . '> <' . $data['end'] . '> [';
                foreach ($data['values'] as $value) {
                    $stream .= '<' . SetaPDF_Core_Type_HexString::str2hex($value) . '>';
                }
                $stream .= "]\n";
            }
            $stream .= "endbfrange\n";
        }

        $stream .= "endcmap\n"
            . "CMapName currentdict /CMap defineresource pop\n"
            . "end\n"
            . "end";

        return $stream;
    }
}
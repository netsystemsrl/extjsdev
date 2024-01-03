<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Composite.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing a composite glyph description.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_GlyphData_Description_Composite
    extends SetaPDF_Core_Font_TrueType_Table_GlyphData_Description
{
    /**
     * If this is set, the arguments are 16-bit (uint16 or int16); otherwise, they are bytes (uint8 or int8).
     *
     * @var int
     */
    const FLAG_ARG_1_AND_2_ARE_WORDS = 0x0001;

    /**
     * If this is set, the arguments are signed xy values; otherwise, they are unsigned point numbers.
     *
     * @var int
     */
    const FLAG_ARGS_ARE_XY_VALUES = 0x0002;

    /**
     * For the xy values if the preceding is true.
     *
     * @var int
     */
    const FLAG_ROUND_XY_TO_GRID = 0x0004;

    /**
     * This indicates that there is a simple scale for the component. Otherwise, scale = 1.0.
     *
     * @var int
     */
    const FLAG_WE_HAVE_A_SCALE = 0x0008;

    /**
     * Indicates at least one more glyph after this one.
     *
     * @var int
     */
    const FLAG_MORE_COMPONENTS = 0x0020;

    /**
     * The x direction will use a different scale from the y direction.
     *
     * @var int
     */
    const FLAG_WE_HAVE_AN_X_AND_Y_SCALE = 0x0040;

    /**
     * There is a 2 by 2 transformation that will be used to scale the component.
     *
     * @var int
     */
    const FLAG_WE_HAVE_A_TWO_BY_TWO = 0x0080;

    /**
     * Following the last component are instructions for the composite character.
     *
     * @var int
     */
    const FLAG_WE_HAVE_INSTRUCTIONS = 0x0100;

    /**
     * If set, this forces the aw and lsb (and rsb) for the composite to be equal to those from this original glyph.
     * This works for hinted and unhinted characters.
     *
     * @var int
     */
    const FLAG_USE_MY_METRICS = 0x0200;

    /**
     * If set, the components of the compound glyph overlap. Use of this flag is not required in OpenType— that is, it
     * is valid to have components overlap without having this flag set. It may affect behaviors in some platforms,
     * however.
     *
     * @var int
     */
    const FLAG_OVERLAP_COMPOUND = 0x0400;

    /**
     * The composite is designed to have the component offset scaled.
     *
     * @var int
     */
    const FLAG_SCALED_COMPONENT_OFFSET = 0x0800;

    /**
     * The composite is designed not to have the component offset scaled.
     *
     * @var int
     */
    const FLAG_UNSCALED_COMPONENT_OFFSET = 0x1000;

    /**
     * Offset of this description
     *
     * @var integer
     */
    protected $_offset;

    public function getTopLevelGlyhs()
    {
        $result = [];
        foreach ($this->getRawComponentsData()['components'] as $component) {
            $result[] = SetaPDF_Core_BitConverter::formatFromUInt16($component[1]);
        }

        return $result;
    }

    /**
     * The raw component data.
     *
     * @var array
     */
    public $_rawComponentsData;

    /**
     * @inheritdoc
     */
    public function getInstructionSize()
    {
        $instructions = $this->getRawComponentsData()['instructions'];
        if ($instructions === '') {
            return 0;
        }

        return strlen($instructions) - 2;
    }

    /**
     * Returns the components.
     *
     * @return array
     */
    public function getRawComponentsData()
    {
        if (!$this->_rawComponentsData) {
            $this->_rawComponentsData = $this->_getRawComponentsData();
        }

        return $this->_rawComponentsData;
    }

    /**
     * Returns the top level glyphs
     *
     * @return int[]
     */
    public function getTopLevelGlyphs()
    {
        $result = [];
        foreach ($this->getRawComponentsData()['components'] as $component) {
            $result[] = SetaPDF_Core_BitConverter::formatFromUInt16($component[1]);
        }

        return $result;
    }


    /**
     * Gets the components.
     *
     * @return array
     */
    private function _getRawComponentsData()
    {
        $result = [
            'components' => [],
            'instructions' => ''
        ];

        $offset = 0;

        $weHaveInstructions = false;

        do {
            $rawFlags = $this->_readBytes(2, $offset);
            $offset += 2;

            $rawGlyphId = $this->_readBytes(2, $offset);
            $offset += 2;

            $flags = SetaPDF_Core_BitConverter::formatFromUInt16($rawFlags);

            if ($weHaveInstructions === false && ($flags & self::FLAG_WE_HAVE_INSTRUCTIONS) === self::FLAG_WE_HAVE_INSTRUCTIONS) {
                $weHaveInstructions = true;
            }

            if (($flags & self::FLAG_ARG_1_AND_2_ARE_WORDS) !== self::FLAG_ARG_1_AND_2_ARE_WORDS) {
                $size = 2;
            } else {
                $size = 4;
            }

            if (($flags & self::FLAG_WE_HAVE_A_SCALE) === self::FLAG_WE_HAVE_A_SCALE) {
                $size += 2;
            } elseif (($flags & self::FLAG_WE_HAVE_AN_X_AND_Y_SCALE) === self::FLAG_WE_HAVE_AN_X_AND_Y_SCALE) {
                $size += 4;
            } elseif (($flags & self::FLAG_WE_HAVE_A_TWO_BY_TWO) === self::FLAG_WE_HAVE_A_TWO_BY_TWO) {
                $size += 8;
            }

            // read args and all the other stuff.
            $rawData = $this->_readBytes($size, $offset);
            $offset += $size;

            $result['components'][] = [
                $rawFlags,
                $rawGlyphId,
                $rawData
            ];
        } while (($flags & self::FLAG_MORE_COMPONENTS) === self::FLAG_MORE_COMPONENTS);

        if ($weHaveInstructions) {
            $length = SetaPDF_Core_BitConverter::formatFromUInt16(
                $this->_readBytes(2, $offset)
            );

            $result['instructions'] =
                $this->_readBytes(
                    $length + 2, // + 2 because we read the length value, too
                    $offset
                );
        }

        return $result;
    }
}
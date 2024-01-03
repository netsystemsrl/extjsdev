<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Rgb.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * RGB Color
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_DataStructure_Color_Rgb
    extends SetaPDF_Core_DataStructure_Color
    implements SetaPDF_Core_DataStructure_DataStructureInterface
{
    /**
     * Writes a color definition directly to a writer.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     * @param array|float $componentsOrR An array of 3 components or the value for the red component
     * @param boolean|float $strokingOrG Stroking flag or the value for the green component
     * @param float $b The value for the blue component
     * @param boolean $stroking Stroking flag
     * @throws InvalidArgumentException
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $componentsOrR, $strokingOrG = 0., $b = 0., $stroking = true)
    {
        if (is_array($componentsOrR)) {
            $stroking = $strokingOrG === 0. ? true : $strokingOrG;
        } else {
            $componentsOrR = array($componentsOrR, $strokingOrG, $b);
        }

        if (count($componentsOrR) !== 3) {
            throw new InvalidArgumentException(
                'Invalid parameter for a rgb color.'
            );
        }

        parent::writePdfString($writer, $componentsOrR, null);
        $writer->write($stroking ? ' RG' : ' rg');
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_Array|array|float $componentsOrR
     * @param float $g
     * @param float $b
     * @throws InvalidArgumentException
     */
    public function __construct($componentsOrR, $g = 0., $b = 0.)
    {
        if ($componentsOrR instanceof SetaPDF_Core_Type_Array) {
            parent::__construct($componentsOrR);
        } else {
            if (!is_array($componentsOrR)) {
                $componentsOrR = array($componentsOrR, $g, $b);
            }

            parent::__construct($componentsOrR);
        }

        if ($this->_components->count() !== 3) {
            throw new InvalidArgumentException(
                'Invalid parameter for a rgb color.'
            );
        }
    }

    /**
     * Draw the color on a writer.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     * @param boolean $stroking
     * @see writePdfString()
     */
    public function draw(SetaPDF_Core_WriteInterface $writer, $stroking = true)
    {
        self::writePdfString($writer, $this->toPhp(), $stroking);
    }
}
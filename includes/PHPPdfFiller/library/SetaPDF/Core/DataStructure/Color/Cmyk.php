<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Cmyk.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * CMYK Color
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_DataStructure_Color_Cmyk
    extends SetaPDF_Core_DataStructure_Color
    implements SetaPDF_Core_DataStructure_DataStructureInterface
{
    /**
     * Writes a color definition directly to a writer.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     * @param array|float $componentsOrC An array of 4 components or the value for the cyan component
     * @param boolean|float $strokingOrM Stroking flag or the value for the magenta component
     * @param float $y The value for the yellow component
     * @param float $k The value for the black component
     * @param boolean $stroking Stroking flag
     * @throws InvalidArgumentException
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $componentsOrC, $strokingOrM = 0., $y = 0., $k = 0., $stroking = true)
    {
        if (is_array($componentsOrC)) {
            $stroking = $strokingOrM === 0. ? true : $strokingOrM;
        } else {
            $componentsOrC = array($componentsOrC, $strokingOrM, $y, $k);
        }

        if (count($componentsOrC) !== 4) {
            throw new InvalidArgumentException(
                'Invalid parameter for a cmyk color.'
            );
        }

        parent::writePdfString($writer, $componentsOrC, null);
        $writer->write($stroking ? ' K' : ' k');
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_Array|array|float $componentsOrC
     * @param float $m
     * @param float $y
     * @param float $k
     * @throws InvalidArgumentException
     */
    public function __construct($componentsOrC, $m = 0., $y = 0., $k = 0.)
    {
        if ($componentsOrC instanceof SetaPDF_Core_Type_Array) {
            parent::__construct($componentsOrC);
        } else {
            if (!is_array($componentsOrC))
                $componentsOrC = array($componentsOrC, $m, $y, $k);

            parent::__construct($componentsOrC);
        }

        if ($this->_components->count() !== 4) {
            throw new InvalidArgumentException(
                'Invalid parameter for a cmyk color.'
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
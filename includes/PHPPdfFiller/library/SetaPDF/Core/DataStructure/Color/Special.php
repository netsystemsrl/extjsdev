<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Special.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Special Color
 *
 * Special colors are used in Pattern, Separation, DeviceN and ICCBased colour spaces.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_DataStructure_Color_Special
    extends SetaPDF_Core_DataStructure_Color
    implements SetaPDF_Core_DataStructure_DataStructureInterface
{
    /**
     * Writes a color definition directly to a writer.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     * @param array|float $components
     * @param boolean $stroking Stroking flag
     * @throws InvalidArgumentException
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $components, $stroking = true)
    {
        if (!is_array($components)) {
            $components = array($components);
        }

        foreach ($components AS $value) {
            if (is_numeric($value)) {
                SetaPDF_Core_Type_Numeric::writePdfString($writer, $value);
            } else {
                SetaPDF_Core_Type_Name::writePdfString($writer, $value);
            }
        }

        $writer->write($stroking ? ' SCN' : ' scn');
    }

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     *
     * @param float|SetaPDF_Core_Type_Array $components
     * @throws InvalidArgumentException
     */
    public function __construct($components)
    {
        if (!$components instanceof SetaPDF_Core_Type_Array) {
            $_components = new SetaPDF_Core_Type_Array();

            if (is_scalar($components)) {
                $components = func_get_args();
            }

            foreach ($components AS $component) {
                if ($component instanceof SetaPDF_Core_Type_Numeric || $component instanceof SetaPDF_Core_Type_Name) {
                    $_components->push($component);
                } else {
                    if (is_numeric($component)) {
                        $_components->push(new SetaPDF_Core_Type_Numeric($component));
                    } else {
                        $_components->push(new SetaPDF_Core_Type_Name($component));
                    }
                }
            }

            $components = $_components;
        }

        $this->_components = $components;
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
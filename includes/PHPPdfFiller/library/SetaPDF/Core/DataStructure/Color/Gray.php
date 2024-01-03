<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Gray.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Gray Color
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_DataStructure_Color_Gray
    extends SetaPDF_Core_DataStructure_Color
    implements SetaPDF_Core_DataStructure_DataStructureInterface
{
    /**
     * Writes a color definition directly to a writer.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     * @param array|float $components An array of 1 component or the value for the gray color
     * @param boolean $stroking Stroking flag
     * @throws InvalidArgumentException
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $components, $stroking = true)
    {
        if (!is_array($components)) {
            $components = array($components);
        }

        if (count($components) !== 1) {
            throw new InvalidArgumentException(
                'Invalid $components parameter for a gray color.'
            );
        }

        parent::writePdfString($writer, $components, null);
        $writer->write($stroking ? ' G' : ' g');
    }

    /**
     * The constructor.
     *
     * @param float|SetaPDF_Core_Type_Array $components
     * @throws InvalidArgumentException
     */
    public function __construct($components)
    {
        parent::__construct($components);

        if ($this->_components->count() !== 1) {
            throw new InvalidArgumentException(
                'Invalid $components parameter for a gray color.'
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
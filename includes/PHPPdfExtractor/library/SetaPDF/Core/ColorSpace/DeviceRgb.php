<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: DeviceRgb.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * DeviceRGB Color Space
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage ColorSpace
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_ColorSpace_DeviceRgb
    extends SetaPDF_Core_ColorSpace
{
    /**
     * Creates an instance of this color space.
     *
     * @return SetaPDF_Core_ColorSpace_DeviceRgb
     */
    static public function create()
    {
        return new self(new SetaPDF_Core_Type_Name('DeviceRGB'));
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_AbstractType $name
     * @throws InvalidArgumentException
     */
    public function __construct(SetaPDF_Core_Type_AbstractType $name)
    {
        parent::__construct($name);

        if ($this->getFamily() !== 'DeviceRGB') {
            throw new InvalidArgumentException('DeviceRgb color space has to be named "DeviceRGB".');
        }
    }

    /**
     * Get the color components of this color space.
     *
     * @return integer
     */
    public function getColorComponents()
    {
        return 3;
    }

    /**
     * Get the default decode array of this color space.
     *
     * @return array
     */
    public function getDefaultDecodeArray()
    {
        return [0., 1., 0., 1., 0., 1.];
    }
}
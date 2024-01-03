<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: DeviceCmyk.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * DeviceCMYK Color Space
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage ColorSpace
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_ColorSpace_DeviceCmyk
    extends SetaPDF_Core_ColorSpace
{
    /**
     * Creates an instance of this color space.
     *
     * @return SetaPDF_Core_ColorSpace_DeviceCmyk
     */
    static public function create()
    {
        return new self(new SetaPDF_Core_Type_Name('DeviceCMYK'));
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

        if ($this->getFamily() !== 'DeviceCMYK') {
            throw new InvalidArgumentException('DeviceCmyk color space has to be named "DeviceCMYK.');
        }
    }

    /**
     * Get the color components of this color space.
     *
     * @return integer
     */
    public function getColorComponents()
    {
        return 4;
    }

    /**
     * Get the default decode array of this color space.
     *
     * @return array
     */
    public function getDefaultDecodeArray()
    {
        return [0., 1., 0., 1., 0., 1., 0., 1.];
    }
}
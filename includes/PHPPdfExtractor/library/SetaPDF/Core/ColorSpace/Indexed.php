<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Indexed.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Indexed Color Space
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage ColorSpace
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_ColorSpace_Indexed
    extends SetaPDF_Core_ColorSpace
    implements SetaPDF_Core_Resource
{
    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_AbstractType $definition
     * @throws InvalidArgumentException
     */
    public function __construct(SetaPDF_Core_Type_AbstractType $definition)
    {
        parent::__construct($definition);

        if (!$this->_value instanceof SetaPDF_Core_Type_Array) {
            throw  new InvalidArgumentException('Indexed color space needs to be defined by an array of 4 values.');
        }

        if ($this->getFamily() !== 'Indexed') {
            throw new InvalidArgumentException('Indexed color space has to be named "Indexed".');
        }

        if ($this->getPdfValue()->count() !== 4) {
            throw new InvalidArgumentException('Indexed color spaces definition has to be defined by 4 values.');
        }
    }

    /**
     * Get the base color space.
     *
     * @return SetaPDF_Core_ColorSpace|SetaPDF_Core_ColorSpace_DeviceCmyk|SetaPDF_Core_ColorSpace_DeviceGray|SetaPDF_Core_ColorSpace_DeviceRgb|SetaPDF_Core_ColorSpace_IccBased|SetaPDF_Core_ColorSpace_Separation
     */
    public function getBase()
    {
        $base = $this->getPdfValue()->offsetGet(1)->getValue();

        return SetaPDF_Core_ColorSpace::createByDefinition($base);
    }

    /**
     * Get the maximum valid index value (hival).
     *
     * @return integer
     */
    public function getHival()
    {
        return $this->getPdfValue()->offsetGet(2)->ensure()->getValue();
    }

    /**
     * Get the lookup table.
     *
     * @return array
     */
    public function getLookupTable()
    {
        $lookup = $this->getPdfValue()->offsetGet(3)->ensure();
        if ($lookup instanceof SetaPDF_Core_Type_Stream) {
            $lookup = $lookup->getStream();
        } else {
            $lookup = $lookup->getValue();
        }

        $base = $this->getBase();

        $numOfComponents = $base->getColorComponents();
        $table = array();
        for ($i = 0, $a = 0, $len = strlen($lookup); $i < $len; $i += $numOfComponents, $a++) {
            $table[$a] = substr($lookup, $i, $numOfComponents);
            if (strlen($table[$a]) < $numOfComponents) {
                $table[$a] .= str_repeat("\0", $numOfComponents - strlen($table[$a]));
            }
        }

        return $table;
    }

    /**
     * Gets an indirect object for this color space dictionary.
     *
     * @see SetaPDF_Core_Resource::getIndirectObject()
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     * @throws InvalidArgumentException
     */
    public function getIndirectObject(SetaPDF_Core_Document $document = null)
    {
        if (null === $this->_indirectObject) {
            if (null === $document) {
                throw new InvalidArgumentException('To initialize a new object $document parameter is not optional!');
            }

            $this->_indirectObject = $document->createNewObject($this->getPdfValue());
        }

        return $this->_indirectObject;
    }

    /**
     * Get the resource type of an implementation.
     *
     * @return string
     */
    public function getResourceType()
    {
        return SetaPDF_Core_Resource::TYPE_COLOR_SPACE;
    }

    /**
     * Get the color components of this color space.
     *
     * @return integer
     */
    public function getColorComponents()
    {
        return 1;
    }

    /**
     * Get the default decode array of this color space.
     *
     * @param int $bitsPerComponent
     * @return array
     */
    public function getDefaultDecodeArray($bitsPerComponent = null)
    {
        if ($bitsPerComponent === null) {
            throw new InvalidArgumentException('Missing bitsPerComponent parameter.');
        }

        return [0, (pow(2, $bitsPerComponent) - 1)];
    }
}
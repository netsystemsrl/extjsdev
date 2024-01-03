<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: DeviceN.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * DeviceN Color Space
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage ColorSpace
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_ColorSpace_DeviceN
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
            throw  new InvalidArgumentException('DeviceN color space needs to be defined by an array of at least 4 values.');
        }

        if ($this->getFamily() !== 'DeviceN') {
            throw new InvalidArgumentException('DeviceN color space has to be named "DeviceN".');
        }

        if ($this->getPdfValue()->count() < 4) {
            throw new InvalidArgumentException('DeviceN color spaces definition has to be defined by at least 4 values.');
        }
    }

    /**
     * Get the names specifying the individual color components.
     *
     * @return array
     */
    public function getNames()
    {
        return $this->getPdfValue()->offsetGet(1)->getValue()->toPhp();
    }

    /**
     * Set the names specifying the individual color components.
     *
     * @param SetaPDF_Core_Type_Name|array $names
     */
    public function setNames($names)
    {
        $value = $this->getPdfValue()->offsetGet(1);

        if ($names instanceof SetaPDF_Core_Type_Name) {
            $value->setValue($names);
        } else {
            if (!is_array($names))
                $names = array($names);

            foreach ($names AS $name) {
                if (!$name instanceof SetaPDF_Core_Type_Name) {
                   $name = new SetaPDF_Core_Type_Name($name);
                }

                $value->push($name);
            }
        }
    }

    /**
     * Get the alternate color space.
     *
     * @return SetaPDF_Core_ColorSpace|SetaPDF_Core_ColorSpace_DeviceCmyk|SetaPDF_Core_ColorSpace_DeviceGray|SetaPDF_Core_ColorSpace_DeviceRgb|SetaPDF_Core_ColorSpace_IccBased|SetaPDF_Core_ColorSpace_Separation
     */
    public function getAlternateColorSpace()
    {
        $alternate = $this->getPdfValue()->offsetGet(2)->getValue();

        return SetaPDF_Core_ColorSpace::createByDefinition($alternate);
    }

    /**
     * Alias for getAlternateColorSpace()
     *
     * @return SetaPDF_Core_ColorSpace|SetaPDF_Core_ColorSpace_DeviceCmyk|SetaPDF_Core_ColorSpace_DeviceGray|SetaPDF_Core_ColorSpace_DeviceRgb|SetaPDF_Core_ColorSpace_IccBased|SetaPDF_Core_ColorSpace_Separation
     * @deprecated
     */
    public function getAlternateSpace()
    {
        return $this->getAlternateColorSpace();
    }

    /**
     * Set the alternate color space.
     *
     * @param SetaPDF_Core_ColorSpace $colorSpace
     */
    public function setAlternateColorSpace(SetaPDF_Core_ColorSpace $colorSpace)
    {
        $value = $this->getPdfValue();
        if ($colorSpace instanceof SetaPDF_Core_Resource) {
            $value->offsetSet(2, $colorSpace->getIndirectObject());
            return;
        }

        $value->offsetSet(2, $colorSpace->getPdfValue());
    }

    /**
     * Set the tint transformation function.
     *
     * @param SetaPDF_Core_Type_AbstractType $tintTransform
     * @throws InvalidArgumentException
     */
    public function setTintTransform(SetaPDF_Core_Type_AbstractType $tintTransform)
    {
        $dict = $tintTransform->ensure();
        if ($dict instanceof SetaPDF_Core_Type_Stream) {
            $dict = $dict->getValue();
        }

        if (!$dict->offsetExists('FunctionType')) {
            throw new InvalidArgumentException('$tintTransformation shall be a PDF function.');
        }

        $this->getPdfValue()->offsetSet(3, $tintTransform);
    }

    /**
     * Get the tint transformation function.
     *
     * @return SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_Stream
     */
    public function getTintTransform()
    {
        return $this->getPdfValue()->offsetGet(3)->ensure();
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
     * Get the default decode array of this color space.
     *
     * @return array
     */
    public function getDefaultDecodeArray()
    {
        $result = [];
        for ($i = 0; $i < $this->getColorComponents(); $i++) {
            $result[] = 0.;
            $result[] = 1.;
        }

        return $result;
    }
}
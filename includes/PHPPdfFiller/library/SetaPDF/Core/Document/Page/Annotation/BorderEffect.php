<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: BorderEffect.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing annotations border effect dictionary
 *
 * See PDF 32000-1:2008 - 12.5.4 Border Styles
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_BorderEffect
{
    /**
     * Border effect
     *
     * @var string
     */
    const NONE = 'S';

    /**
     * Border effect
     *
     * @var string
     */
    const CLOUDY = 'C';

    /**
     * The dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_Dictionary $dictionary
     */
    public function __construct(SetaPDF_Core_Type_Dictionary $dictionary)
    {
        $this->_dictionary = $dictionary;
    }

    /**
     * Get the dictionary of it.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }

    /**
     * Get the border effect name.
     *
     * @return string
     */
    public function getName()
    {
        if (!$this->_dictionary->offsetExists('S'))
            return self::NONE;

        return $this->_dictionary->getValue('S')->getValue();
    }

    /**
     * Set the border effect name.
     *
     * @param null|string $name
     * @return self
     */
    public function setName($name)
    {
        if (null === $name) {
            $this->_dictionary->offsetUnset('S');
            return null;
        }

        $this->_dictionary->offsetSet('S', new SetaPDF_Core_Type_Name($name));

        if ($name == self::NONE) {
            $this->_dictionary->offsetUnset('I');
        }

        return $this;
    }

    /**
     * Get the intensity of the effect.
     *
     * @return int|float
     */
    public function getIntensity()
    {
        if (!$this->_dictionary->offsetExists('I'))
            return 0;

        return $this->_dictionary->getValue('I')->getValue();
    }

    /**
     * Set the border width.
     *
     * @param null|int|float $intensity
     * @return self
     */
    public function setIntensity($intensity)
    {
        if (null === $intensity) {
            $this->_dictionary->offsetUnset('I');
            return null;
        }

        $this->_dictionary->offsetSet('I', new SetaPDF_Core_Type_Numeric($intensity));

        return $this;
    }
}
<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: BorderStyle.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing annotations border style dictionary
 *
 * See PDF 32000-1:2008 - 12.5.4 Border Styles
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_BorderStyle
{
    /**
     * Border style
     *
     * @var string
     */
    const SOLID = 'S';

    /**
     * Border style
     *
     * @var string
     */
    const DASHED = 'D';

    /**
     * Border style
     *
     * @var string
     */
    const BEVELED = 'B';

    /**
     * Border style
     *
     * @var string
     */
    const INSET = 'I';

    /**
     * Border style
     *
     * @var string
     */
    const UNDERLINE = 'U';

    /**
     * The dictionary
     *
     * @var SetaPDF_Core_Document_Page_Annotation
     */
    protected $_annotation;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document_Page_Annotation $annotation
     */
    public function __construct(SetaPDF_Core_Document_Page_Annotation $annotation)
    {
        $this->_annotation = $annotation;
    }

    /**
     * Release memory/cycled references.
     */
    public function cleanUp()
    {
        $this->_annotation = null;
    }

    /**
     * Get the dictionary of it.
     *
     * @param boolean $create Defines whether the dictionary should be created if it doesn't exists
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary($create = false)
    {
        $dictionary = $this->_annotation->getDictionary();
        if (null === $dictionary)
            return null;

        if (!$dictionary->offsetExists('BS')) {
            if (false === $create)
                return null;

            $dictionary->offsetSet('BS', new SetaPDF_Core_Type_Dictionary());
        }

        return $dictionary->offsetGet('BS')->ensure(true);
    }

    /**
     * Get the border width.
     *
     * @return int|float
     */
    public function getWidth()
    {
        $dictionary = $this->getDictionary();
        if (!$dictionary || !$dictionary->offsetExists('W'))
            return 0;

        return $dictionary->getValue('W')->getValue();
    }

    /**
     * Set the border width.
     *
     * @param null|int|float $width
     * @return self
     */
    public function setWidth($width)
    {
        $dictionary = $this->getDictionary(null !== $width);
        if (null === $width) {
            if ($dictionary) {
                $dictionary->offsetUnset('W');
            }
            return null;
        }

        $dictionary->offsetSet('W', new SetaPDF_Core_Type_Numeric($width));

        return $this;
    }

    /**
     * Get the border style.
     *
     * @return string
     */
    public function getStyle()
    {
        $dictionary = $this->getDictionary();
        if (!$dictionary || !$dictionary->offsetExists('S')) {
            return self::SOLID;
        }

        return $dictionary->getValue('S')->getValue();
    }

    /**
     * Set the border style.
     *
     * @param null|string $style
     * @return self
     */
    public function setStyle($style)
    {
        $dictionary = $this->getDictionary(null !== $style);
        if (null === $style) {
            if ($dictionary) {
                $dictionary->offsetUnset('S');
            }
            return null;
        }

        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name($style));

        return $this;
    }

    /**
     * Get the dash pattern.
     *
     * @return array|null
     */
    public function getDashPattern()
    {
        $dictionary = $this->getDictionary();
        if (!$dictionary || !$dictionary->offsetExists('D')) {
            if ($this->getStyle() === self::DASHED) {
                return array(3);
            }
            return null;
        }

        return $dictionary->getValue('D')->toPhp();
    }

    /**
     * Set the dash pattern.
     *
     * @param array|SetaPDF_Core_Type_Array $pattern
     * @return self
     */
    public function setDashPattern($pattern)
    {
        $dictionary = $this->getDictionary(null !== $pattern);
        if (null === $pattern) {
            if ($dictionary) {
                $dictionary->offsetUnset('D');
            }
            return null;
        }

        if (!$pattern instanceof SetaPDF_Core_Type_Array) {
            $_pattern = (array)$pattern;
            $pattern = new SetaPDF_Core_Type_Array();
            foreach ($_pattern AS $dash) {
                $pattern->offsetSet(null, new SetaPDF_Core_Type_Numeric($dash));
            }
        }

        $dictionary->offsetSet('D',$pattern);

        return $this;
    }
}
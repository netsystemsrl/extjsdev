<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Glyph.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * This class represnts a single glyph.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Result_Glyph implements
    SetaPDF_Extractor_Result_CompareableInterface,
    SetaPDF_Extractor_Result_HasBoundsInterface
{
    /**
     * The text item of the glyph.
     *
     * @var SetaPDF_Extractor_TextItem
     */
    protected $_textItem;

    /**
     * The constructor.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     */
    public function __construct(SetaPDF_Extractor_TextItem $textItem)
    {
        $this->_textItem = $textItem;
    }

    /**
     * Release memory and cycled references
     */
    public function cleanUp()
    {
        $this->_textItem->cleanUp();
        $this->_textItem = null;
    }

    /**
     * Get the string value of the glyph.
     *
     * @param string $encoding
     * @return string
     */
    public function getString($encoding = 'utf-8')
    {
        return $this->getTextItem()->getString($encoding);
    }

    /**
     * Implementation of the magic method __toString().
     *
     * @see http://php.net/manual/language.oop5.magic.php#object.tostring
     * @see getString()
     * @return string
     */
    public function __toString()
    {
        return $this->getString();
    }

    /**
     * Get the text item of this glyph.
     *
     * @return SetaPDF_Extractor_TextItem
     */
    public function getTextItem()
    {
        return $this->_textItem;
    }

    /**
     * Gets the bounds of this glyph.
     *
     * @return SetaPDF_Extractor_Result_Bounds[]
     */
    public function getBounds()
    {
        return array($this->getTextItem()->getBounds());
    }

    /**
     * Returns the base line start vector of this glyph.
     *
     * @return SetaPDF_Core_Geometry_Vector
     * @see SetaPDF_Extractor_Result_CompareableInterface
     */
    public function getBaseLineStart()
    {
        return $this->getTextItem()->getBaseLineStart();
    }

    /**
     * Returns the base line end vector of this glyph.
     *
     * @return SetaPDF_Core_Geometry_Vector
     * @see SetaPDF_Extractor_Result_CompareableInterface
     */
    public function getBaseLineEnd()
    {
        return $this->getTextItem()->getBaseLineEnd();
    }

    /**
     * Get the orientation value of this glyph.
     *
     * @return float
     * @see SetaPDF_Extractor_Result_CompareableInterface
     */
    public function getOrientation()
    {
        return $this->getTextItem()->getOrientation();
    }

    /**
     * Get the user space width value of the space sign of the font for this glyph.
     *
     * @return float
     * @see SetaPDF_Extractor_Result_CompareableInterface
     */
    public function getUserSpaceSpaceWidth()
    {
        return $this->getTextItem()->getUserSpaceSpaceWidth();
    }

    /**
     * Get the id of the filter instance that accepted this result.
     *
     * @return null|string
     */
    public function getFilterId()
    {
        return $this->getTextItem()->getFilterId();
    }
}
<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Cid.php 1119 2017-11-10 10:35:24Z jan.slabon $
 */

/**
 * Abstract class representing a CID font
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_Cid implements SetaPDF_Core_Font_DescriptorInterface
{
    /**
     * The indirect object of the CID font
     *
     * @var SetaPDF_Core_Type_IndirectObjectInterface
     */
    protected $_indirectObject;

    /**
     * The dictionary of the CID font
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;

    /**
     * The font descriptor object
     *
     * @var SetaPDF_Core_Font_Descriptor
     */
    protected $_fontDescriptor;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObjectOrDictionary
     */
    public function __construct($indirectObjectOrDictionary)
    {
        if ($indirectObjectOrDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            $this->_indirectObject = $indirectObjectOrDictionary;
        }

        $this->_dictionary = $indirectObjectOrDictionary->ensure();
    }

    /**
     * Gets an indirect object for this font.
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

            $this->_indirectObject = $document->createNewObject($this->_dictionary);
        }

        return $this->_indirectObject;
    }

    /**
     * Get the font dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }

    /**
     * Get the Subtype entry of the font dictionary.
     *
     * @return mixed
     */
    public function getType()
    {
        return $this->_dictionary->getValue('Subtype')->getValue();
    }

    /**
     * Get the font name.
     *
     * @return string
     */
    public function getFontName()
    {
        return $this->_dictionary->offsetGet('BaseFont')->ensure()->getValue();
    }

    /**
     * Get an array with entries that define the character collection of the CIDFont.
     *
     * @return array
     */
    public function getCidSystemInfo()
    {
        $cidSystemInfo = $this->_dictionary->offsetGet('CIDSystemInfo')->ensure();
        $result = [];
        foreach ($cidSystemInfo as $key => $value) {
            $result[$key] = $value->ensure()->getValue();
        }

        return $result;
    }

    /**
     * Get the default width for glyphs in the CIDFont.
     *
     * @return string
     */
    public function getDefaultWidth()
    {
        if (!$this->_dictionary->offsetExists('DW')) {
            return 1000;
        }

        return (int)$this->_dictionary->offsetGet('DW')->ensure()->getValue();
    }

    /**
     * Get the vertical metrics in the CIDFont.
     *
     * @return int[]
     */
    public function getVerticalMetrics()
    {
        if (!$this->_dictionary->offsetExists('DW2')) {
            return [880, -1000];
        }

        return $this->_dictionary->offsetGet('DW2')->ensure()->toPhp();
    }

    /**
     * Get the font descriptor object.
     *
     * @return SetaPDF_Core_Font_Descriptor
     */
    public function getFontDescriptor()
    {
        if (null === $this->_fontDescriptor) {
            $this->_fontDescriptor = new SetaPDF_Core_Font_Descriptor(
                $this->_dictionary->offsetGet('FontDescriptor')->getValue()
            );
        }

        return $this->_fontDescriptor;
    }

    /**
     * Get the width of a glyph/character.
     *
     * @param integer $cid
     * @return float|int
     */
    public function getGlyphWidth($cid)
    {
        /* Note: This method does not use any caching but is that fast (or faster) than with caching.
         */
        $w = $this->_dictionary->getValue('W');
        if (null !== $w) {
            $w = $w->ensure();
            if (!($w instanceof SetaPDF_Core_Type_Array)) {
                return $this->getDefaultWidth();
            }

            for ($i = 0, $c = count($w); $i < $c;) {
                if ($w[$i + 1]->ensure() instanceof SetaPDF_Core_Type_Array) {
                    $start  = $w[$i++]->ensure()->getValue();
                    $widths = $w[$i++]->ensure();

                    if ($cid >= $start && $cid < $start + count($widths)) {
                        return $widths[$cid - $start]->ensure()->getValue();
                    }
                } else {
                    $start = $w[$i++]->ensure()->getValue();
                    $end   = $w[$i++]->ensure()->getValue();
                    $width = $w[$i++]->ensure()->getValue();
                    if ($cid >= $start && $cid <= $end) {
                        return $width;
                    }
                }
            }
        }

        return $this->getDefaultWidth();
    }
}
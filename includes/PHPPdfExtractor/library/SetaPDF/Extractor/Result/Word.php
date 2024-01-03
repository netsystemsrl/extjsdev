<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Word.php 1079 2017-08-14 15:00:15Z timo.scholz $
 */

/**
 * This class represents a single word
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Result_Word implements
    SetaPDF_Extractor_Result_HasBoundsInterface
{
    /**
     * Defines if the constructor logic will be ignored or not.
     *
     * @var bool
     */
    private static $_ignoreConstructor = false;

    /**
     * The resulting word in a specific encoding.
     *
     * @var array
     */
    protected $_word = [];

    /**
     * The bounds of this word.
     *
     * @var SetaPDF_Extractor_Result_Bounds[]
     */
    protected $_bounds = [];

    /**
     * The initial words that were used to create this word.
     *
     * @var self[]
     */
    protected $_parts = [];

    /**
     * The filter id of the first text item in.
     *
     * @var null|string
     */
    protected $_filterId;

    /**
     * Merges two SetaPDF_Extractor_Result_Word instances into a new one.
     *
     * The words text-content will be $resultingString.
     *
     * @param self $a
     * @param self $b
     * @param string $resultingString In UTF-8 encoding.
     * @return self
     */
    public static function merge(self $a, self $b, $resultingString)
    {
        if ($a->getFilterId() !== $b->getFilterId()) {
            throw new \LogicException("Filter ids of both words doesn't match.");
        }

        self::$_ignoreConstructor = true;
        $instance = new self([]);
        self::$_ignoreConstructor = false;

        foreach ($a->getParts() as $part) {
            $instance->_parts[] = $part;
        }

        foreach ($b->getParts() as $part) {
            $instance->_parts[] = $part;
        }

        foreach ($a->getBounds() as $bound) {
            $instance->_bounds[] = $bound;
        }

        foreach ($b->getBounds() as $bound) {
            $instance->_bounds[] = $bound;
        }

        $instance->_word = ['utf-8' => $resultingString];
        $instance->_filterId = $a->getFilterId();

        return $instance;
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Extractor_Result_Glyph[] $glyphs
     */
    public function __construct(array $glyphs)
    {
        if (self::$_ignoreConstructor)
            return;

        if (count($glyphs) === 0) {
            throw new InvalidArgumentException('No glyphs passed. A word needs to be created by at least one glyph.');
        }

        $this->_word['utf-8'] = '';

        foreach ($glyphs AS $glyph) {
            if (!$glyph instanceof SetaPDF_Extractor_Result_Glyph) {
                throw new InvalidArgumentException('Only instances of SetaPDF_Extractor_Result_Glyph allowed.');
            }

            $this->_word['utf-8'] .= $glyph->getString();
        }

        $first = $glyphs[0];
        $ll = $first->getTextItem()->getLl();
        $ul = $first->getTextItem()->getUl();

        $last = $glyphs[count($glyphs) - 1];
        $ur = $last->getTextItem()->getUr();
        $lr = $last->getTextItem()->getLr();

        $this->_bounds = array(new SetaPDF_Extractor_Result_Bounds($ll->toPoint(), $ul->toPoint(), $ur->toPoint(), $lr->toPoint()));

        $this->_filterId = $first->getFilterId();
    }

    /**
     * Get all parts of this word.
     *
     * If the word is not created by several words, this method will return itself.
     *
     * @return self[]
     */
    public function getParts()
    {
        if (count($this->_parts) === 0) {
            return [$this];
        }

        return $this->_parts;
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        $this->_bounds = null;
    }

    /**
     * Get the bounds of this word.
     *
     * @return SetaPDF_Extractor_Result_Bounds[]
     */
    public function getBounds()
    {
        return $this->_bounds;
    }

    /**
     * Get the words string value in a specific encoding.
     *
     * @param string $encoding
     * @return string
     */
    public function getString($encoding = 'utf-8')
    {
        if (!isset($this->_word[$encoding])) {
            $this->_word[$encoding] = SetaPDF_Core_Encoding::convert($this->_word['utf-8'], 'utf-8', $encoding);
        }

        return $this->_word[$encoding];
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
     * Get the id of the filter instance that accepted this result.
     *
     * @return null|string
     */
    public function getFilterId()
    {
        return $this->_filterId;
    }
}
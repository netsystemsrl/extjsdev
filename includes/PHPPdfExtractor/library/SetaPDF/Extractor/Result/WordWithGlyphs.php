<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: WordWithGlyphs.php 1079 2017-08-14 15:00:15Z timo.scholz $
 */

/**
 * This class represnts a single word including its glyphs
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Result_WordWithGlyphs implements
    SetaPDF_Extractor_Result_HasBoundsInterface
{
    /**
     * Defines if the constructor logic will be ignored or not.
     *
     * @var bool
     */
    private static $_ignoreConstructor = false;

    /**
     * The glyphs of this word.
     *
     * @var SetaPDF_Extractor_Result_Glyph[]
     */
    protected $_glyphs;

    /**
     * The bounds of this word.
     *
     * @var null|SetaPDF_Extractor_Result_Bounds[]
     */
    protected $_bounds;

    /**
     * The initial words that were used to create this word.
     *
     * @var self[]
     */
    protected $_parts = [];

    /**
     * The resulting word in a specific encoding.
     *
     * @var array
     */
    protected $_word = [];

    /**
     * Merges two SetaPDF_Extractor_Result_WordWithGlyphs instances into a new one.
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

        foreach ($a->getBounds() as $bounds) {
            $instance->_bounds[] = $bounds;
        }

        foreach ($b->getBounds() as $bounds) {
            $instance->_bounds[] = $bounds;
        }

        foreach ($a->getGlyphs() as $glyph) {
            $instance->_glyphs[] = $glyph;
        }

        foreach ($b->getGlyphs() as $glyph) {
            $instance->_glyphs[] = $glyph;
        }

        $instance->_word = ['utf-8' => $resultingString];

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

        foreach ($glyphs AS $glyph) {
            if (!$glyph instanceof SetaPDF_Extractor_Result_Glyph) {
                throw new InvalidArgumentException('Only instances of SetaPDF_Extractor_Result_Glyph allowed.');
            }
        }

        $this->_glyphs = $glyphs;
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
     * Release memory and cycled references
     */
    public function cleanUp()
    {
        foreach ($this->_glyphs AS $glyph) {
            $glyph->cleanUp();
        }

        $this->_glyphs = null;
    }

    /**
     * Get the glyphs of this word.
     *
     * @return SetaPDF_Extractor_Result_Glyph[]
     */
    public function getGlyphs()
    {
        return $this->_glyphs;
    }

    /**
     * Get the bounds of this word.
     *
     * @return SetaPDF_Extractor_Result_Bounds[]
     */
    public function getBounds()
    {
        if (!$this->_bounds) {
            $first = $this->_glyphs[0];
            $ll = $first->getTextItem()->getLl();
            $ul = $first->getTextItem()->getUl();

            $last = $this->_glyphs[count($this->_glyphs) - 1];
            $ur = $last->getTextItem()->getUr();
            $lr = $last->getTextItem()->getLr();

            $this->_bounds = array(new SetaPDF_Extractor_Result_Bounds($ll->toPoint(), $ul->toPoint(), $ur->toPoint(), $lr->toPoint()));
        }

        return $this->_bounds;
    }

    /**
     * Get the words sting value in a specific encoding.
     *
     * @param string $encoding
     * @return string
     */
    public function getString($encoding = 'utf-8')
    {
        if (!isset($this->_word['utf-8'])) {
            $this->_word['utf-8'] = '';
            foreach ($this->_glyphs AS $glyph) {
                $this->_word['utf-8'] .= $glyph->getString('utf-8');
            }
        }

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
        return $this->_glyphs[0]->getFilterId();
    }
}
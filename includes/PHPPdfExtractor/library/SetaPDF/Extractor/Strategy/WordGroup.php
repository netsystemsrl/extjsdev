<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: WordGroup.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * Extraction strategy for word groups
 *
 * The result of this strategy is sorted from top-left to bottom-right.
 *
 * Each group is represented by an instance of SetaPDF_Extractor_Result_Words.
 *
 * This class allows you to receive a groups boundary through the
 * {@link SetaPDF_Extractor_Result_Words::getBounds() getBounds()} method.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Strategy
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Strategy_WordGroup extends SetaPDF_Extractor_Strategy_Word
{
    /**
     * The storage.
     *
     * @var SetaPDF_Extractor_Storage_StorageInterface
     */
    protected $_storage;

    /**
     * The allowed height difference.
     *
     * @var float|int
     */
    protected $_allowedFontSizeDifference = 3;

    /**
     * The value that is used to scale the word-bounding-box on the abscissa.
     *
     * @var float|int
     */
    protected $_rectScaleFactorX = .2707;

    /**
     * The value that is used to scale the word-bounding-box on the ordinate.
     *
     * @var float
     */
    protected $_rectScaleFactorY = .2707;

    /**
     * Defines whether the dehyphen logic should be executed or not.
     *
     * @var bool
     */
    protected $_useDehyphen = true;

    /**
     * These characters are used as hyphens in the dehyphen logic.
     *
     * "\x2D" 'HYPHEN-MINUS' (U+002D)
     *
     * @var string
     */
    protected $_hyphens = "\x2D";

    /**
     * The constructor.
     *
     * @param SetaPDF_Extractor_Storage_StorageInterface|null $storage
     */
    public function __construct(SetaPDF_Extractor_Storage_StorageInterface $storage = null)
    {
        parent::__construct();

        if ($storage === null) {
            $storage = new SetaPDF_Extractor_Storage_SpatialStorage(60);
        }

        $this->_storage = $storage;
    }

    /**
     * Prepares and fills the storage for resolving word groups.
     *
     * @param $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     */
    protected function _insertIntoStorage($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        $this->_storage->clear();

        $items = $this->process($stream, $resources);
        $lines = $this->getSorter()->groupByLines($items);

        $preparedLines = [];
        foreach ($lines as $lineNo => $items) {
            foreach ($this->_processLine($items) as $textItems) {
                $preparedLines[$lineNo][] = $textItems;
            }
        }

        $order = 0;
        foreach ($preparedLines as $lineNo => $line) {
            foreach ($line as $textItems) {
                $fontSize = 0;
                /** @var SetaPDF_Extractor_TextItem[] $textItems $first */
                foreach ($textItems as $textItem) {
                    $fontSize += $this->_calculateFontSize($textItem);
                }
                $fontSize /= count($textItems);

                $first = $textItems[0];
                $last = $textItems[count($textItems) - 1];
                $bounds = new SetaPDF_Extractor_Result_Bounds(
                    $first->getLl()->toPoint(),
                    $first->getUl()->toPoint(),
                    $last->getUr()->toPoint(),
                    $last->getLr()->toPoint()
                );

                $this->_storage->insert(
                    $bounds->getRectangle()
                        ->scaleX($fontSize * $this->_rectScaleFactorX)
                        ->scaleY($fontSize * $this->_rectScaleFactorY),
                    ['order' => $order, 'fontSize' => $fontSize, 'textItems' => $textItems, 'lineNo' => $lineNo]
                );
                $order++;
            }
        }
    }

    /**
     * Calculates the font size of a text item in user space.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     * @return float
     */
    protected function _calculateFontSize(SetaPDF_Extractor_TextItem $textItem)
    {
        $vector = new SetaPDF_Core_Geometry_Vector(0, $textItem->getFontSize());
        $vector = $vector
            ->multiply($textItem->getStartMatrix())
            ->subtract($textItem->getBaseLineStart());
        return $vector->getY();
    }

    /**
     * Get all resolved words groups.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return SetaPDF_Extractor_Result_WordGroups
     */
    public function getResult($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        $this->_insertIntoStorage($stream, $resources);

        $groups = [];
        while (($storageEntry = $this->_storage->getFirstAvailable()) !== false) {
            $group = [];
            foreach ($this->_resolveGroup($storageEntry) as $currentEntry) {
                $data = $currentEntry->getData();
                $group[$data['order']] = $data;
            }

            ksort($group);
            $resultingGroup = [];
            if ($this->_useDehyphen) {
                $resultingGroup = $this->_dehyphen($group);
            } else {
                foreach ($group as $words) {
                    $glyphs = [];
                    foreach ($words['textItems'] as $currentWord) {
                        $glyphs[] = new SetaPDF_Extractor_Result_Glyph($currentWord);
                    }
                    $resultingGroup[] = $this->_createWord($glyphs);
                }
                // ensure behavior below php 7
                reset($group);
            }

            $groups[key($group)] = new SetaPDF_Extractor_Result_Words($resultingGroup);
        }

        $this->_storage->clear();

        ksort($groups);
        // no array_values() needed, because we iterate the groups in the result word groups constructor
        return new SetaPDF_Extractor_Result_WordGroups($groups);
    }

    /**
     * Executes the dehyphen logic.
     *
     * @param array $group
     * @return array
     */
    protected function _dehyphen($group)
    {
        $group = array_values($group);

        $resultingGroup = [];
        $currentWord = null;
        for ($i = 0; $i < count($group); $i++) {
            $current = $group[$i];
            $currentTextItems = $current['textItems'];

            $glyphs = [];
            foreach ($currentTextItems as $glyph) {
                $glyphs[] = new SetaPDF_Extractor_Result_Glyph($glyph);
            }

            $word = $this->_createWord($glyphs);
            if ($currentWord === null) {
                $currentWord = $word;
            } else {
                /** @var SetaPDF_Extractor_Result_Word|SetaPDF_Extractor_Result_WordWithGlyphs $currentWord */
                $currentWordString = $currentWord->getString();
                $currentWord = $currentWord::merge(
                    $currentWord,
                    $word,
                    SetaPDF_Core_Encoding::substr($currentWordString, 0,  -1) . $word->getString()
                );
            }

            if (isset($group[$i + 1])) {
                $next = $group[$i + 1];
                /** @var SetaPDF_Extractor_TextItem[] $nextTextItems */
                $nextTextItems = $next['textItems'];

                if (
                    count($glyphs) > 1
                    &&
                    $current['lineNo'] < $next['lineNo']
                    &&
                    strpos($this->_hyphens, $glyphs[count($glyphs) - 1]->getString()) !== false
                    &&
                    preg_match('/\p{Ll}/u', $nextTextItems[0]->getString())
                ) {
                    continue;
                }
            }

            $resultingGroup[] = $currentWord;
            $currentWord = null;
        }

        return $resultingGroup;
    }

    /**
     * Resolves all intersecting entries of the storage, starting by a single entry.
     *
     * @param SetaPDF_Extractor_Storage_StorageEntry $storageEntry
     * @return SetaPDF_Extractor_Storage_StorageEntry[]
     */
    protected function _resolveGroup(SetaPDF_Extractor_Storage_StorageEntry $storageEntry)
    {
        $result = [];
        $id = $storageEntry->getData()['textItems'][0]->getFilterId();
        $fontSize = $storageEntry->getData()['fontSize'];
        foreach ($this->_storage->getIntersecting($storageEntry) as $possibleSegmentPart) {
            $data = $possibleSegmentPart->getData();
            if (
                $id === $data['textItems'][0]->getFilterId()
                &&
                abs(
                    $fontSize - $data['fontSize']
                ) < $this->_allowedFontSizeDifference
            ) {
                // remove to avoid duplicates later.
                $result[] = $this->_storage->removeEntry($possibleSegmentPart);
            }
        }

        foreach ($result as $segmentPart) {
            foreach ($this->_resolveGroup($segmentPart) as $newSegmentPart) {
                $result[] = $newSegmentPart;
            }
        }

        return $result;
    }

    /**
     * Gets the currently allowed font-size difference.
     *
     * @return int|float
     */
    public function getAllowedFontSizeDifference()
    {
        return $this->_allowedFontSizeDifference;
    }

    /**
     * Sets the current allowed font-size difference.
     *
     * @param int|float $value
     */
    public function setAllowedFontSizeDifference($value)
    {
        $this->_allowedFontSizeDifference = $value;
    }

    /**
     * Gets the rect scale-factor for the abscissa.
     *
     * @return int|float
     */
    public function getRectScaleFactorX()
    {
        return $this->_rectScaleFactorX;
    }

    /**
     * Gets the rect scale-factor for the ordinate.
     *
     * @return int|float
     */
    public function getRectScaleFactorY()
    {
        return $this->_rectScaleFactorY;
    }

    /**
     * Sets the rect scale-factor on the abscissa.
     *
     * The boundaries of the words are scaled using the product of the font-size and the given scale-factor.
     *
     * @param int|float $value
     */
    public function setRectScaleFactorX($value)
    {
        $this->_rectScaleFactorX = $value;
    }

    /**
     * Sets the rect scale-factor on the ordinate.
     *
     * The boundaries of the words are scaled using the product of the font-size and the given scale-factor.
     *
     * @param int|float $value
     */
    public function setRectScaleFactorY($value)
    {
        $this->_rectScaleFactorY = $value;
    }

    /**
     * Sets whether the dehyphen logic should be executed or not.
     *
     * @param bool $dehyphen
     * @param string|null $hyphens
     */
    public function setDehyphen($dehyphen, $hyphens = null)
    {
        $this->_useDehyphen = $dehyphen;
        if ($hyphens !== null && strlen($hyphens) > 0) {
            $this->_hyphens = $hyphens;
        }
    }

    /**
     * Gets whether the dehyphen logic should be executed or not.
     *
     * @return bool
     */
    public function getDehyphen()
    {
        return $this->_useDehyphen;
    }

    /**
     * @inheritdoc
     */
    public function _getSubInstance(SetaPDF_Core_Canvas_GraphicState $gs)
    {
        $strategy = new static($this->_storage);

        $strategy->setBoundary($this->getBoundary());

        $strategy->setFilter($this->_filter);
        $strategy->setGraphicState($gs);

        $strategy->_useDehyphen = $this->_useDehyphen;
        $strategy->_hyphens = $this->_hyphens;

        $strategy->_rectScaleFactorX = $this->_rectScaleFactorX;
        $strategy->_rectScaleFactorY = $this->_rectScaleFactorY;

        $strategy->_allowedFontSizeDifference = $this->_allowedFontSizeDifference;
        $strategy->_textCount = $this->_textCount;

        return $strategy;
    }
}
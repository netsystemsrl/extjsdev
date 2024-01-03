<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: AbstractStrategy.php 1110 2017-10-12 10:18:42Z timo.scholz $
 */

/**
 * Abstract class representing an extraction strategy.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Strategy
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Extractor_Strategy_AbstractStrategy
{
    /**
     * A filter.
     *
     * @var null|SetaPDF_Extractor_Filter_FilterInterface
     */
    protected $_filter = null;

    /**
     * The boundary filter.
     *
     * @var null|SetaPDF_Extractor_Filter_Rectangle
     */
    protected $_boundaryFilter;

    /**
     * A callback that is called before processing a stream.
     *
     * @var callable
     */
    protected $_cleanStreamCallback;

    /**
     * The constructor.
     */
    public function __construct()
    {
        $this->setCleanStreamCallback(function($stream) {
            if (strlen($stream) < 10000) {
                return $stream;
            }

            return SetaPDF_Extractor_ContentStreamCleaner::clean(
                $stream,
                [
                    SetaPDF_Extractor_ContentStreamCleaner::REGEX_COLORS,
                    SetaPDF_Extractor_ContentStreamCleaner::REGEX_PATHOPERATORS,
                ]
            );
        });
    }

    /**
     * Processes a stream through this strategy.
     *
     * The result is an array of SetaPDF_Extractor_TextItem instances.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return SetaPDF_Extractor_TextItem[]
     */
    abstract public function process($stream, SetaPDF_Core_Type_Dictionary $resources);

    /**
     * Get the strategy specific result.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return mixed
     */
    abstract public function getResult($stream, SetaPDF_Core_Type_Dictionary $resources);

    /**
     * Set a filter.
     *
     * @param SetaPDF_Extractor_Filter_FilterInterface|null $filter
     */
    public function setFilter(SetaPDF_Extractor_Filter_FilterInterface $filter = null)
    {
        $this->_filter = $filter;
    }

    /**
     * Get the filter.
     *
     * @return null|SetaPDF_Extractor_Filter_FilterInterface
     */
    public function getFilter()
    {
        return $this->_filter;
    }

    /**
     * Sets the boundary for the current strategy.
     *
     * @param SetaPDF_Core_Geometry_Rectangle|null $boundary
     */
    public function setBoundary(SetaPDF_Core_Geometry_Rectangle $boundary = null)
    {
        if ($boundary !== null) {
            $this->_boundaryFilter = new SetaPDF_Extractor_Filter_Rectangle($boundary);
        } else {
            $this->_boundaryFilter = null;
        }
    }

    /**
     * @return SetaPDF_Core_Geometry_Rectangle|null
     */
    public function getBoundary()
    {
        if ($this->_boundaryFilter !== null) {
            return $this->_boundaryFilter->getRectangle();
        }

        return null;
    }

    /**
     * Proxy method that forwards the call to a {@link SetaPDF_Extractor_Filter_FilterInterface filter} instance if available.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     * @see setFilter()
     * @return bool|string
     */
    protected function _accept(SetaPDF_Extractor_TextItem $textItem)
    {
        if ($this->_boundaryFilter !== null && $this->_boundaryFilter->accept($textItem) === false)
            return false;

        if (null === $this->_filter)
            return true;

        return $this->_filter->accept($textItem);
    }

    /**
     * Set a callback that is called before processing a stream.
     *
     * @param callable|null $callback
     */
    public function setCleanStreamCallback(callable $callback = null)
    {
        $this->_cleanStreamCallback = $callback;
    }

    /**
     * Get the callback that is called before a stream is processed.
     *
     * @return callable|null
     */
    public function getCleanStreamCallback()
    {
        return $this->_cleanStreamCallback;
    }

    /**
     * Get an instance of the same strategy for processing an other stream (e.g. a Form XObject stream).
     *
     * @param SetaPDF_Core_Canvas_GraphicState $gs
     * @return static
     */
    protected function _getSubInstance(SetaPDF_Core_Canvas_GraphicState $gs)
    {
        $strategy = new static();
        $strategy->setFilter($this->_filter);
        $strategy->setBoundary($this->getBoundary());

        $strategy->setGraphicState($gs);
        $strategy->_textCount = $this->_textCount;
        return $strategy;
    }
}
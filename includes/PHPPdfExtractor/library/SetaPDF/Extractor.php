<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Extractor.php 1110 2017-10-12 10:18:42Z timo.scholz $
 */

/**
 * The main class of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor
{
    /**
     * The version
     *
     * @var string
     */
    const VERSION = SetaPDF_Core::VERSION;

    /**
     * The document instance
     *
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * The extraction strategy
     *
     * @var SetaPDF_Extractor_Strategy_AbstractStrategy
     */
    protected $_strategy;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Extractor_Strategy_AbstractStrategy|null $strategy
     */
    public function __construct(
        SetaPDF_Core_Document $document,
        SetaPDF_Extractor_Strategy_AbstractStrategy $strategy = null
    )
    {
        $this->_document = $document;

        if (null !== $strategy) {
            $this->setStrategy($strategy);
        }
    }

    /**
     * Release cycled references.
     */
    public function cleanUp()
    {
        $this->_document = null;
        $this->_strategy = null;
    }

    /**
     * Set the extraction strategy.
     *
     * @param SetaPDF_Extractor_Strategy_AbstractStrategy $strategy
     */
    public function setStrategy(SetaPDF_Extractor_Strategy_AbstractStrategy $strategy)
    {
        $this->_strategy = $strategy;
    }

    /**
     * Get the extraction strategy.
     *
     * @return SetaPDF_Extractor_Strategy_AbstractStrategy|SetaPDF_Extractor_Strategy_Plain
     */
    public function getStrategy()
    {
        if (null === $this->_strategy) {
            $this->_strategy = new SetaPDF_Extractor_Strategy_Plain();
        }

        return $this->_strategy;
    }

    /**
     * Get the result by the default or individual strategy of a specific page.
     *
     * @see setStrategy()
     *
     * @param integer $pageNumber
     * @param string $boundaryBox If set the page boundary is used to limit the result to the rectangle of the given
     *                            boundary. See SetaPDF_Core_PageBoundaries::XXX_BOX constants for possible values.
     * @return SetaPDF_Extractor_Result_Collection|SetaPDF_Extractor_Result_Words|SetaPDF_Extractor_Result_WordGroups|string|string[]
     */
    public function getResultByPageNumber($pageNumber, $boundaryBox = null)
    {
        $page = $this->_document->getCatalog()->getPages()->getPage($pageNumber);

        $strategy = $this->getStrategy();

        if ($boundaryBox !== null) {
            $strategy->setBoundary($page->getBoundary($boundaryBox)->getRectangle());
        }

        $filter = $strategy->getFilter();
        if ($filter instanceof SetaPDF_Extractor_Filter_PageFilterInterface) {
            $filter->setPage($page);
        }

        $strategy->setGraphicState(new SetaPDF_Core_Canvas_GraphicState());
        $stream = $page->getStreamProxy()->getStream();
        $resources = $page->getCanvas()->getResources(true, true);

        return $strategy->getResult($stream, $resources);
    }
}
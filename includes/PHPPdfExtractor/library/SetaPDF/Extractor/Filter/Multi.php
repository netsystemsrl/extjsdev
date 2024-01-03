<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Multi.php 1080 2017-08-15 08:45:12Z timo.scholz $
 */

/**
 * The multi filter allows you to create a filter by several filter instances.
 *
 * The filters are evaluated by an OR logic by default. If one of the filters match, the item will be accepted.
 * It is also possible to use the filter with an AND logic by passing the mode constant to its snd parameter
 * of the constructor.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Filter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Filter_Multi
    implements SetaPDF_Extractor_Filter_PageFilterInterface
{
    /**
     * A mode constant.
     *
     * Defines that the filter should work in "and"-mode: All filters have to accept the text item.
     *
     * @var string
     */
    const MODE_AND = 'and';

    /**
     * A mode constant.
     *
     * Defines that the filter should work in "or"-mode: At least one filter have to accept the text item.
     *
     * @var string
     */
    const MODE_OR = 'or';

    /**
     * The filter instances.e
     *
     * @var SetaPDF_Extractor_Filter_FilterInterface[]
     */
    protected $_filters = array();

    /**
     * The id of this filter.
     *
     * @var string|null
     */
    protected $_id;

    /**
     * The mode to work with.
     *
     * @var string
     */
    protected $_mode = self::MODE_OR;

    /**
     * The constructor.
     *
     * @param SetaPDF_Extractor_Filter_FilterInterface|SetaPDF_Extractor_Filter_FilterInterface[] $filters,...
     * @param string $mode
     * @param string|null The id for this filter.
     */
    public function __construct($filters = array(), $mode = self::MODE_OR, $id = null)
    {
        if (!is_array($filters)) {
            $filters = array($filters);
        }

        foreach ($filters as $filter) {
            $this->addFilter($filter);
        }

        if ($mode !== self::MODE_OR && $mode !== self::MODE_AND) {
            throw new InvalidArgumentException('Invalid mode.');
        }
        $this->_mode = $mode;

        if ($id !== null && $id == false) {
            throw new InvalidArgumentException(
                'The filter id needs to be a string which will not evaluate to false in a boolean comparison.'
            );
        }
        $this->_id = $id;
    }

    /**
     * Get the filter id.
     *
     * @return null|string
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * Get the mode.
     *
     * @return string
     */
    public function getMode()
    {
        return $this->_mode;
    }

    /**
     * Adds an individual filter.
     *
     * @param SetaPDF_Extractor_Filter_FilterInterface $filter
     */
    public function addFilter(SetaPDF_Extractor_Filter_FilterInterface $filter)
    {
        $this->_filters[] = $filter;
    }

    /**
     * Get all filters.
     *
     * @return SetaPDF_Extractor_Filter_FilterInterface[]
     */
    public function getFilters()
    {
        return $this->_filters;
    }

    /**
     * Reset all filters.
     */
    public function resetFilters()
    {
        $this->_filters = array();
    }

    /**
     * Set the current page object for the specific filter.
     *
     * @param SetaPDF_Core_Document_Page $page
     * @return void
     */
    public function setPage(SetaPDF_Core_Document_Page $page = null)
    {
        foreach ($this->_filters AS $filter) {
            if ($filter instanceof SetaPDF_Extractor_Filter_PageFilterInterface) {
                $filter->setPage($page);
            }
        }
    }

    /**
     * Checks if this filter accepts the text item.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     * @return boolean True or false whether the item is accepted or not.
     */
    public function accept(SetaPDF_Extractor_TextItem $textItem)
    {
        if (self::MODE_OR === $this->_mode) {
            foreach ($this->_filters AS $filter) {
                if ($result = $filter->accept($textItem)) {
                    return $result;
                }
            }
        } elseif (self::MODE_AND === $this->_mode) {
            foreach ($this->_filters AS $filter) {
                if (!$filter->accept($textItem)) {
                    return false;
                }
            }

            return ($this->_id !== null ? $this->_id : true);
        }

        return false;
    }
}
<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: AdditionalActions.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a pages additional-actions dictionary
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_AdditionalActions
{
    /**
     * The catalog instance
     *
     * @var SetaPDF_Core_Document_Page
     */
    protected $_page;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document_Page $page
     */
    public function __construct(SetaPDF_Core_Document_Page $page)
    {
        $this->_page = $page;
    }

    /**
     * Release memory/cycled references.
     */
    public function cleanUp()
    {
        $this->_page = null;
    }

    /**
     * Get the additional actions dictionary.
     *
     * @param bool $create Pass true to automatically create the dictionary
     * @return null|SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary($create = false)
    {
        $pageDictionary = $this->_page->getPageObject(true)->ensure();
        if (null === $pageDictionary)
            return null;

        if (!$pageDictionary->offsetExists('AA')) {
            if (false === $create)
                return null;

            $pageDictionary->offsetSet('AA', new SetaPDF_Core_Type_Dictionary());
        }

        return $pageDictionary->offsetGet('AA')->ensure(true);
    }

    /**
     * Get the action that shall be performed when the page is opened.
     *
     * @return null|SetaPDF_Core_Document_Action
     */
    public function getOpen()
    {
        return $this->_getAction('O');
    }

    /**
     * Set the action that shall be performed when the page is opened.
     *
     * @param SetaPDF_Core_Document_Action $action
     * @return SetaPDF_Core_Document_Page_AdditionalActions Returns the SetaPDF_Core_Document_Page_AdditionalActions
     *                                                      object for method chaining.
     */
    public function setOpen(SetaPDF_Core_Document_Action $action)
    {
        $this->_setAction('O', $action);

        return $this;
    }

    /**
     * Get the action that shall be performed when the page is closed.
     *
     * @return null|SetaPDF_Core_Document_Action
     */
    public function getClose()
    {
        return $this->_getAction('C');
    }

    /**
     * Set the action that shall be performed when the page is closed.
     *
     * @param SetaPDF_Core_Document_Action $action
     * @return SetaPDF_Core_Document_Page_AdditionalActions Returns the SetaPDF_Core_Document_Page_AdditionalActions
     *                                                      object for method chaining.
     */
    public function setClose(SetaPDF_Core_Document_Action $action)
    {
        $this->_setAction('C', $action);

        return $this;
    }

    /**
     * Get the action.
     *
     * @param string $name
     * @return null|SetaPDF_Core_Document_Action
     */
    protected function _getAction($name)
    {
        $dictionary = $this->getDictionary();
        if (null === $dictionary)
            return null;


        $action = SetaPDF_Core_Type_Dictionary_Helper::getValue($dictionary, $name);
        if (null === $action)
            return null;

        return SetaPDF_Core_Document_Action::byObjectOrDictionary($action);
    }

    /**
     * Set the action.
     *
     * @param string $name
     * @param SetaPDF_Core_Document_Action $action
     */
    protected function _setAction($name, SetaPDF_Core_Document_Action $action)
    {
        $dictionary = $this->getDictionary(true);
        $dictionary->offsetSet($name, $action->getPdfValue());
    }
}
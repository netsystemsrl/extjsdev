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
 * Class representing the document catalog’s additional-actions dictionary
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_AdditionalActions
{
    /**
     * The catalog instance
     *
     * @var SetaPDF_Core_Document_Catalog
     */
    protected $_catalog;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document_Catalog $catalog
     */
    public function __construct(SetaPDF_Core_Document_Catalog $catalog)
    {
        $this->_catalog = $catalog;
    }

    /**
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument()
    {
        return $this->_catalog->getDocument();
    }

    /**
     * Release memory/cycled references.
     */
    public function cleanUp()
    {
        $this->_catalog = null;
    }

    /**
     * Get the additional actions dictionary.
     *
     * @param bool $create Pass true to automatically create the dictionary
     * @return null|SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary($create = false)
    {
        $catalogDictionary = $this->_catalog->getDictionary($create);
        if (null === $catalogDictionary)
            return null;

        if (!$catalogDictionary->offsetExists('AA')) {
            if (false === $create)
                return null;

            $object = $this->getDocument()->createNewObject(new SetaPDF_Core_Type_Dictionary());
            $catalogDictionary->offsetSet('AA', $object);
        }

        return $catalogDictionary->offsetGet('AA')->ensure(true);
    }

    /**
     * Get the JavaScript action that shall be performed before closing the document.
     *
     * @return null|SetaPDF_Core_Document_Action_JavaScript
     */
    public function getWillClose()
    {
        return $this->_getAction('WC');
    }

    /**
     * Set the JavaScript action that shall be performed before closing the document.
     *
     * @param string|SetaPDF_Core_Document_Action_JavaScript|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $javaScriptAction
     * @return SetaPDF_Core_Document_Catalog_AdditionalActions Returns the
     *                                                         SetaPDF_Core_Document_Catalog_AdditionalActions
     *                                                         object for method chaining.
     */
    public function setWillClose($javaScriptAction)
    {
        $this->_setAction('WC', $javaScriptAction);

        return $this;
    }

    /**
     * Get the JavaScript action that shall be performed before saving the document.
     *
     * @return null|SetaPDF_Core_Document_Action_JavaScript
     */
    public function getWillSave()
    {
        return $this->_getAction('WS');
    }

    /**
     * Set the JavaScript action that shall be performed before saving the document.
     *
     * @param string|SetaPDF_Core_Document_Action_JavaScript|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $javaScriptAction
     * @return SetaPDF_Core_Document_Catalog_AdditionalActions Returns the
     *                                                         SetaPDF_Core_Document_Catalog_AdditionalActions
     *                                                         object for method chaining.
     */
    public function setWillSave($javaScriptAction)
    {
        $this->_setAction('WS', $javaScriptAction);

        return $this;
    }

    /**
     * Get the JavaScript action that shall be performed after saving the document.
     *
     * @return null|SetaPDF_Core_Document_Action_JavaScript
     */
    public function getDidSave()
    {
        return $this->_getAction('DS');
    }

    /**
     * Set the JavaScript action that shall be performed after saving the document.
     *
     * @param string|SetaPDF_Core_Document_Action_JavaScript|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $javaScriptAction
     * @return SetaPDF_Core_Document_Catalog_AdditionalActions Returns the
     *                                                         SetaPDF_Core_Document_Catalog_AdditionalActions
     *                                                         object for method chaining.
     */
    public function setDidSave($javaScriptAction)
    {
        $this->_setAction('DS', $javaScriptAction);

        return $this;
    }

    /**
     * Get the JavaScript action that shall be performed before printing the document.
     *
     * @return null|SetaPDF_Core_Document_Action_JavaScript
     */
    public function getWillPrint()
    {
        return $this->_getAction('WP');
    }

    /**
     * Set the JavaScript action that shall be performed before printing the document.
     *
     * @param string|SetaPDF_Core_Document_Action_JavaScript|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $javaScriptAction
     * @return SetaPDF_Core_Document_Catalog_AdditionalActions Returns the
     *                                                         SetaPDF_Core_Document_Catalog_AdditionalActions
     *                                                         object for method chaining.
     */
    public function setWillPrint($javaScriptAction)
    {
        $this->_setAction('WP', $javaScriptAction);

        return $this;
    }

    /**
     * Get the JavaScript action that shall be performed after printing the document.
     *
     * @return null|SetaPDF_Core_Document_Action_JavaScript
     */
    public function getDidPrint()
    {
        return $this->_getAction('DP');
    }

    /**
     * Set the JavaScript action that shall be performed after printing the document.
     *
     * @param string|SetaPDF_Core_Document_Action_JavaScript|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $javaScriptAction
     * @return SetaPDF_Core_Document_Catalog_AdditionalActions Returns the
     *                                                         SetaPDF_Core_Document_Catalog_AdditionalActions
     *                                                         object for method chaining.
     */
    public function setDidPrint($javaScriptAction)
    {
        $this->_setAction('DP', $javaScriptAction);

        return $this;
    }

    /**
     * Get the action.
     *
     * @param string $name
     * @param boolean $instance
     * @return null|SetaPDF_Core_Document_Action_JavaScript
     */
    protected function _getAction($name, $instance = true)
    {
        $dictionary = $this->getDictionary();
        if (null === $dictionary)
            return null;

        $action = SetaPDF_Core_Type_Dictionary_Helper::getValue($dictionary, $name);
        if (null === $action)
            return null;

        if ($instance) {
            return new SetaPDF_Core_Document_Action_JavaScript($action);
        } else {
            return $action;
        }
    }

    /**
     * Set the action.
     *
     * @param string $name
     * @param string|SetaPDF_Core_Document_Action_JavaScript|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $javaScriptAction
     */
    protected function _setAction($name, $javaScriptAction)
    {
        if ($javaScriptAction !== null) {
            if (!($javaScriptAction instanceof SetaPDF_Core_Document_Action_JavaScript))
                $javaScriptAction = new SetaPDF_Core_Document_Action_JavaScript($javaScriptAction);

            $dictionary = $this->getDictionary(true);
            $dictionary->offsetSet($name, $javaScriptAction->getIndirectObject($this->getDocument()));
        } else {
            $action = $this->_getAction($name, false);
            if (null === $action) {
                return;
            }

            $dictionary = $this->getDictionary();
            $dictionary->offsetUnset($name);
        }
    }
}
<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Ink.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing an ink annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.13
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Ink
    extends SetaPDF_Core_Document_Page_Annotation_Markup
{
    /**
     * @var SetaPDF_Core_Document_Page_Annotation_BorderStyle
     */
    protected $_borderStyle;

    /**
     * Creates an ink annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createAnnotationDictionary($rect)
    {
        $dictionary = parent::_createAnnotationDictionary($rect, SetaPDF_Core_Document_Page_Annotation_Link::TYPE_INK);
        $dictionary->offsetSet('InkList', new SetaPDF_Core_Type_Array());

        return $dictionary;
    }

    /**
     * The constructor.
     *
     * @param array|SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $objectOrDictionary
     * @throws InvalidArgumentException
     */
    public function __construct($objectOrDictionary)
    {
        $dictionary = $objectOrDictionary instanceof SetaPDF_Core_Type_AbstractType
            ? $objectOrDictionary->ensure(true)
            : $objectOrDictionary;

        if (!($dictionary instanceof SetaPDF_Core_Type_Dictionary)) {
            $args = func_get_args();
            $objectOrDictionary = $dictionary = call_user_func_array(
                array('SetaPDF_Core_Document_Page_Annotation_Ink', 'createAnnotationDictionary'),
                $args
            );
            unset($args);
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'Subtype', 'Ink')) {
            throw new InvalidArgumentException('The Subtype entry in an ink annotation shall be "Ink".');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Release memory/cycled references.
     */
    public function cleanUp()
    {
        parent::cleanUp();

        if (null !== $this->_borderStyle) {
            $this->_borderStyle->cleanUp();
            $this->_borderStyle = null;
        }
    }

    /**
     * Add an ink list.
     *
     * @param float[] $inkList
     */
    public function addInkList(array $inkList)
    {
        $_inkList = new SetaPDF_Core_Type_Array();

        foreach ($inkList AS $value) {
            $_inkList->offsetSet(null, new SetaPDF_Core_Type_Numeric($value));
        }

        $inkLists = $this->_annotationDictionary->getValue('InkList')->ensure(true);
        $inkLists[] = $_inkList;
    }

    /**
     * Get an ink list at a specific index.
     *
     * @param $index
     * @return null|float[]
     */
    public function getInkList($index)
    {
        /**
         * @var SetaPDF_Core_Type_Array $inkLists
         */
        $inkLists = $this->_annotationDictionary->getValue('InkList')->ensure();

        $inkList = $inkLists->offsetGet($index);

        return $inkList === null
            ? null
            : $inkList->ensure()->toPhp();
    }

    /**
     * Set ink lists.
     *
     * @param array[] $inkLists
     */
    public function setInkLists(array $inkLists)
    {
        /**
         * @var SetaPDF_Core_Type_Array $_inkLists
         */
        $_inkLists = $this->_annotationDictionary->getValue('InkList')->ensure(true);
        $_inkLists->clear();

        foreach ($inkLists as $inkList) {
            if (!is_array($inkList)) {
                throw new InvalidArgumentException('Parameter needs to be an array of float/numeric arrays.');
            }

            $this->addInkList($inkList);
        }
    }

    /**
     * Get all ink lists.
     *
     * @return array[]
     */
    public function getInkLists()
    {
        if (!$this->_annotationDictionary->offsetExists('InkList'))
            return array();

        return $this->_annotationDictionary->getValue('InkList')->ensure()->toPhp();
    }

    /**
     * Get the border style object.
     *
     * @return null|SetaPDF_Core_Document_Page_Annotation_BorderStyle
     */
    public function getBorderStyle()
    {
        if (null === $this->_borderStyle) {
            $this->_borderStyle = new SetaPDF_Core_Document_Page_Annotation_BorderStyle($this);
        }

        return $this->_borderStyle;
    }
}

<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Polygon.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a polygon annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.13
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Polygon
    extends SetaPDF_Core_Document_Page_Annotation_Markup
{
    /**
     * @var SetaPDF_Core_Document_Page_Annotation_BorderStyle
     */
    protected $_borderStyle;

    /**
     * Creates a polygon annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createAnnotationDictionary($rect)
    {
        $dictionary = parent::_createAnnotationDictionary($rect, SetaPDF_Core_Document_Page_Annotation_Link::TYPE_POLYGON);
        $dictionary->offsetSet('Vertices', new SetaPDF_Core_Type_Array());

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
                array('SetaPDF_Core_Document_Page_Annotation_Polygon', 'createAnnotationDictionary'),
                $args
            );
            unset($args);
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'Subtype', 'Polygon')) {
            throw new InvalidArgumentException('The Subtype entry in an polygon annotation shall be "Polygon".');
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
     * Set the vertices.
     *
     * @param float[] $vertices
     */
    public function setVertices(array $vertices)
    {
        $_vertices = $this->_annotationDictionary->getValue('Vertices')->ensure(true);
        $_vertices->clear();

        foreach ($vertices AS $value) {
            $_vertices->offsetSet(null, new SetaPDF_Core_Type_Numeric($value));
        }
    }

    /**
     * Get the vertices.
     *
     * @return array
     */
    public function getVertices()
    {
        if (!$this->_annotationDictionary->offsetExists('Vertices'))
            return array();

        return $this->_annotationDictionary->getValue('Vertices')->ensure()->toPhp();
    }

    /**
     * Set the interior color.
     *
     * @param null|int|array|SetaPDF_Core_DataStructure_Color $color
     */
    public function setInteriorColor($color)
    {
        if (null === $color) {
            $this->_annotationDictionary->offsetUnset('IC');
            return;
        }

        if (!$color instanceof SetaPDF_Core_DataStructure_Color) {
            $color = SetaPDF_Core_DataStructure_Color::createByComponents($color);
        }

        $this->_annotationDictionary->offsetSet('IC', $color->getValue());
    }

    /**
     * Get the interior color.
     *
     * @return null|SetaPDF_Core_DataStructure_Color
     */
    public function getInteriorColor()
    {
        if (!$this->_annotationDictionary->offsetExists('IC'))
            return null;

        return SetaPDF_Core_DataStructure_Color::createByComponents(
            $this->_annotationDictionary->getValue('IC')
        );
    }

    /**
     * Get the border effect object.
     *
     * @param bool $create
     * @return null|SetaPDF_Core_Document_Page_Annotation_BorderEffect
     */
    public function getBorderEffect($create = false)
    {
        if (get_class($this) !== 'SetaPDF_Core_Document_Page_Annotation_Polygon') {
            throw new BadMethodCallException('This method is only useable for polygon annotations.');
        }

        $be = $this->_annotationDictionary->getValue('BE');
        if ($be === null) {
            if (false == $create)
                return null;

            $be = new SetaPDF_Core_Type_Dictionary();
            $this->_annotationDictionary->offsetSet('BE', $be);
        }

        return new SetaPDF_Core_Document_Page_Annotation_BorderEffect($be);
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

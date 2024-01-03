<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Widget.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a widget annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.19
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Widget
    extends SetaPDF_Core_Document_Page_Annotation
{
    /**
     * @var SetaPDF_Core_Document_Page_Annotation_BorderStyle
     */
    protected $_borderStyle;

    /**
     * Creates a widget annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createAnnotationDictionary($rect)
    {
        return SetaPDF_Core_Document_Page_Annotation::_createAnnotationDictionary($rect, SetaPDF_Core_Document_Page_Annotation_Link::TYPE_WIDGET);
    }

    /**
     * The constructor.
     *
     * A widget annotation instance can be created by an existing dictionary, indirect object/reference or by passing
     * the same parameter as for {@link createAnnotationDictionary()}.
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
                array('SetaPDF_Core_Document_Page_Annotation_Widget', 'createAnnotationDictionary'),
                $args
            );
            unset($args);
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'Subtype', 'Widget')) {
            throw new InvalidArgumentException('The Subtype entry in a widget annotation shall be "Widget".');
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
     * Get the height of the annotation.
     *
     * If the annotation is rotated width and height will be changed accordingly. This can be affected by the
     * $ignoreRotation parameter.
     *
     * @param boolean $ignoreRotation
     * @return float|int
     */
    public function getHeight($ignoreRotation = false)
    {
        $rect = $this->getRect();
        $mk = $this->getAppearanceCharacteristics();
        if ($ignoreRotation || null === $mk)
            return $rect->getHeight();

        $rotation = $mk->getRotation();
        $interchange = ($rotation / 90) % 2;

        return $interchange ? $rect->getWidth() : $rect->getHeight();
    }

    /**
     * Get the width of the annotation.
     *
     * If the annotation is rotated width and height will be changed accordingly. This can be affected by the
     * $ignoreRotation parameter.
     *
     * @param boolean $ignoreRotation
     * @return float|int
     */
    public function getWidth($ignoreRotation = false)
    {
        $rect = $this->getRect();
        $mk = $this->getAppearanceCharacteristics();
        if ($ignoreRotation || null === $mk)
            return $rect->getWidth();

        $rotation = $mk->getRotation();
        $interchange = ($rotation / 90) % 2;

        return $interchange ? $rect->getHeight() : $rect->getWidth();
    }

    /**
     * Get the action of the annotation.
     *
     * If no action is defined false will be returned.
     *
     * @return bool|SetaPDF_Core_Document_Action
     */
    public function getAction()
    {
        if (!$this->_annotationDictionary->offsetExists('A'))
            return false;

        return SetaPDF_Core_Document_Action::byObjectOrDictionary($this->_annotationDictionary->getValue('A'));
    }

    /**
     * Set the action of the annotation.
     *
     * The action could be an instance of {@link SetaPDF_Core_Document_Action} or a plain dictionary representing
     * the action.
     *
     * @throws InvalidArgumentException
     * @param SetaPDF_Core_Document_Action|SetaPDF_Core_Type_Dictionary $action
     */
    public function setAction($action)
    {
        if ($action instanceof SetaPDF_Core_Document_Action)
            $action = $action->getActionDictionary();

        if (!($action instanceof SetaPDF_Core_Type_Dictionary) || !$action->offsetExists('S')) {
            throw new InvalidArgumentException('Invalid $action parameter. SetaPDF_Core_Document_Action or SetaPDF_Core_Type_Dictionary with an S key needed.');
        }

        $this->_annotationDictionary->offsetSet('A', $action);
    }

    /**
     * Get the appearance characteristics object.
     *
     * @param bool $create
     * @return null|SetaPDF_Core_Document_Page_Annotation_AppearanceCharacteristics
     */
    public function getAppearanceCharacteristics($create = false)
    {
        $mk = $this->_annotationDictionary->getValue('MK');
        if ($mk === null) {
            if (false == $create)
                return null;

            $mk = new SetaPDF_Core_Type_Dictionary();
            $this->_annotationDictionary->offsetSet('MK', $mk);
        }

        return new SetaPDF_Core_Document_Page_Annotation_AppearanceCharacteristics($mk);
    }

    /**
     * Gets the additional actions object instance for this annotation.
     *
     * @return SetaPDF_Core_Document_Page_Annotation_Widget_AdditionalActions
     */
    public function getAdditionalActions()
    {
        if (null === $this->_additionalActions) {
            $this->_additionalActions = new SetaPDF_Core_Document_Page_Annotation_Widget_AdditionalActions($this);
        }

        return $this->_additionalActions;
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

<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Popup.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a Pop-up annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.14
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Popup
    extends SetaPDF_Core_Document_Page_Annotation
{
    /**
     * Creates an annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createAnnotationDictionary($rect)
    {
        return parent::_createAnnotationDictionary($rect, SetaPDF_Core_Document_Page_Annotation_Link::TYPE_POPUP);
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
                array('SetaPDF_Core_Document_Page_Annotation_Popup', 'createAnnotationDictionary'),
                $args
            );
            unset($args);
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'Subtype', 'Popup')) {
            throw new InvalidArgumentException('The Subtype entry in a Pop-up annotation shall be "Popup".');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Checks if the popup is open.
     *
     * @return boolean
     */
    public function isOpen()
    {
        if (!$this->_annotationDictionary->offsetExists('Open'))
            return false;

        return $this->_annotationDictionary->getValue('Open')->getValue();
    }

    /**
     * Set the open flag of the popup.
     *
     * @param boolean $open
     */
    public function setOpen($open)
    {
        if (false == $open) {
            $this->_annotationDictionary->offsetUnset('Open');
            return;
        }

        if (!$this->_annotationDictionary->offsetExists('Open')) {
            $this->_annotationDictionary->offsetSet('Open', new SetaPDF_Core_Type_Boolean($open));
            return;
        }

        $this->_annotationDictionary->getValue('Open')->setValue($open);
    }

    /**
     * Get the parent annotation.
     *
     * @return null|SetaPDF_Core_Document_Page_Annotation
     */
    public function getParent()
    {
        if (!$this->_annotationDictionary->offsetExists('Parent')) {
            return null;
        }

        return SetaPDF_Core_Document_Page_Annotation::byObjectOrDictionary(
            $this->_annotationDictionary->getValue('Parent')
        );
    }

    /**
     * Set the parent annotation.
     *
     * @param SetaPDF_Core_Document_Page_Annotation $annotation
     * @throws InvalidArgumentException
     */
    public function setParent(SetaPDF_Core_Document_Page_Annotation $annotation)
    {
        $object = $annotation->getIndirectObject();
        if (!$object instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            throw new InvalidArgumentException(
                'Using an annotation object as a parent of another requires that ' .
                'the parent annotation is attached to an indirect object.'
            );
        }

        $this->_annotationDictionary->offsetSet('Parent', $object);
    }
}
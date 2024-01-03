<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Stamp.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a rubber stamp annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.12
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Stamp
    extends SetaPDF_Core_Document_Page_Annotation_Markup
{

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_APPROVED = 'Approved'; // Default size: 245.378 x 64.53

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_EXPERIMENTAL = 'Experimental';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_NOT_APPROVED = 'NotApproved';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_AS_IS = 'AsIs';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_EXPIRED = 'Expired';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_NOT_FOR_PUBLIC_RELEASE = 'NotForPublicRelease'; // Default size: 245.378 x 64.53

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_CONFIDENTIAL = 'Confidential'; // Default size: 245.378 x 64.53

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_FINAL = 'Final';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_SOLD = 'Sold';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_DEPARTMENTAL = 'Departmental';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_FOR_COMMENT = 'ForComment';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_TOP_SECRET = 'TopSecret';

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_DRAFT = 'Draft'; // Default size: 245.378 x 64.53

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.12 Rubber Stamp Annotations
     *
     * @var string
     */
    const ICON_FOR_PUBLIC_RELEASE = 'ForPublicRelease';

    /**
     * Creates a rubber stamp annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @param string $icon
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createAnnotationDictionary($rect, $icon = null)
    {
        $dictionary = parent::_createAnnotationDictionary($rect, SetaPDF_Core_Document_Page_Annotation_Link::TYPE_STAMP);
        if (null !== $icon)
            $dictionary['Name'] = new SetaPDF_Core_Type_Name($icon);

        return $dictionary;
    }

    /**
     * The constructor.
     *
     * @param array|SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $objectOrDictionary The annotation dictionary or a rect value
     * @throws InvalidArgumentException
     */
    public function __construct($objectOrDictionary)
    {
        $dictionary = $objectOrDictionary instanceof SetaPDF_Core_Type_AbstractType
            ? $objectOrDictionary->ensure(true)
            : $objectOrDictionary;

        if (!($dictionary instanceof SetaPDF_Core_Type_Dictionary)) {
            $args = func_get_args();
            $dictionary = $objectOrDictionary = call_user_func_array(
                array('SetaPDF_Core_Document_Page_Annotation_Stamp', 'createAnnotationDictionary'),
                $args
            );
            unset($args);
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'Subtype', 'Stamp')) {
            throw new InvalidArgumentException('The Subtype entry in a rubber stamp annotation shall be "Stamp".');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Get the icon name of the annotation.
     *
     * @return string
     */
    public function getIconName()
    {
        if (!$this->_annotationDictionary->offsetExists('Name')) {
            return 'Draft';
        }

        return $this->_annotationDictionary->getValue('Name')->getValue();
    }

    /**
     * Set the name of the icon that shall be used in displaying the annotation.
     *
     * @param null|string $iconName
     */
    public function setIconName($iconName)
    {
        if (null == $iconName) {
            $this->_annotationDictionary->offsetUnset('Name');
            return;
        }

        if (!$this->_annotationDictionary->offsetExists('Name')) {
            $this->_annotationDictionary->offsetSet('Name', new SetaPDF_Core_Type_Name($iconName));
            return;
        }

        $this->_annotationDictionary->getValue('Name')->setValue($iconName);
    }
}
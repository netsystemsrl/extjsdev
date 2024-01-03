<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Text.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a Text annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.14
 *
 * A text annotations icon will display a static predefined icon which will not resize if the
 * document is zoomed. It will be aligned to the upper left corner of the Rect.
 *
 * By setting the no rotate flag ({@link SetaPDF_Core_Document_Page_Annotation::setNoRotateFlag})
 * and the no-zoom flag ({@link SetaPDF_Core_Document_Page_Annotation::setNoZoomFlag}) the fixed
 * size can be disabled and will allow you to define the size of the annotation your own. Anyhow
 * the annotation is still not zoomable.
 *
 * The aspect ratio of default icons are:
 * Comment: 20 x 18
 * Key: 18 x 17
 * Note: 18 x 20
 * Help: 20 x 20
 * NewParagraph: 13 x 20
 * Paragraph: 11 x 20
 * Insert: 20 x 17
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Text
    extends SetaPDF_Core_Document_Page_Annotation_Markup
{
    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.4 Text Annotations
     *
     * @var string
     */
    const ICON_COMMENT = 'Comment'; // Default Size: 20 x 18

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.4 Text Annotations
     *
     * @var string
     */
    const ICON_KEY = 'Key'; // Default Size: 18 x 17

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.4 Text Annotations
     *
     * @var string
     */
    const ICON_NOTE = 'Note'; // Default Size: 18 x 20

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.4 Text Annotations
     *
     * @var string
     */
    const ICON_HELP = 'Help'; // Default Size: 20 x 20

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.4 Text Annotations
     *
     * @var string
     */
    const ICON_NEW_PARAGRAPH = 'NewParagraph'; // Default Size: 13 x 20

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.4 Text Annotations
     *
     * @var string
     */
    const ICON_PARAGRAPH = 'Paragraph'; // Default Size: 11 x 20

    /**
     * Icon name defined in PDF 32000-1:2008 - 12.5.6.4 Text Annotations
     *
     * @var string
     */
    const ICON_INSERT = 'Insert'; // Default Size: 20 x 17

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_CIRCLE = 'Circle';

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_CHECK = 'Check';

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_CROSS = 'Cross';

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_RIGHT_ARROW = 'RightArrow';

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_RIGHT_POINTER = 'RightPointer';

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_STAR = 'Star';

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_UP_ARROW = 'UpArrow';

    /**
     * Icon name supported by Adobe Acrobat
     *
     * @var string
     */
    const ICON_UP_LEFT_ARROW = 'UpLeftArrow';

    /**
     * State model name
     *
     * @var string
     */
    const STATE_MODEL_MARKED = 'Marked';

    /**
     * State model name
     *
     * @var string
     */
    const STATE_MODEL_REVIEW = 'Review';

    /**
     * State model name
     *
     * @var string
     */
    const STATE_MODEL_MIGRATION_STATUS = 'MigrationStatus';

    /**
     * Creates an text annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createAnnotationDictionary($rect)
    {
        return parent::_createAnnotationDictionary($rect, SetaPDF_Core_Document_Page_Annotation_Link::TYPE_TEXT);
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
                array('SetaPDF_Core_Document_Page_Annotation_Text', 'createAnnotationDictionary'),
                $args
            );
            unset($args);
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'Subtype', 'Text')) {
            throw new InvalidArgumentException('The Subtype entry in a Text annotation shall be "Text".');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Checks if the annotation shall initially be displayed open.
     *
     * @return bool
     */
    public function isOpen()
    {
        if (!$this->_annotationDictionary->offsetExists('Open'))
            return false;

        return $this->_annotationDictionary->getValue('Open')->getValue();
    }

    /**
     * Sets whether the annotation shall initially be displayed open or not.
     *
     * @param bool $open
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
     * Get the icon name of the annotation.
     *
     * @return string
     */
    public function getIconName()
    {
        if (!$this->_annotationDictionary->offsetExists('Name')) {
            return 'Note';
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

    /**
     * Get the state model.
     *
     * @see PDF 32000-1:2008 - 12.5.6.3 Annotation States
     * @return mixed|null
     */
    public function getStateModel()
    {
        if (!$this->_annotationDictionary->offsetExists('StateModel'))
            return null;

        return $this->_annotationDictionary->getValue('StateModel')->getValue();
    }

    /**
     * Set the annotation model.
     *
     * @see PDF 32000-1:2008 - 12.5.6.3 Annotation States
     * @param string $stateModel
     */
    public function setStateModel($stateModel)
    {
        if (null == $stateModel) {
            $this->_annotationDictionary->offsetUnset('StateModel');
            return;
        }

        if (!$this->_annotationDictionary->offsetExists('StateModel')) {
            $this->_annotationDictionary->offsetSet('StateModel', new SetaPDF_Core_Type_String($stateModel));
            return;
        }

        $this->_annotationDictionary->getValue('StateModel')->setValue($stateModel);
    }

    /**
     * Get the annotation state.
     *
     * @see PDF 32000-1:2008 - 12.5.6.3 Annotation States
     * @return mixed|null
     */
    public function getState()
    {
        if (!$this->_annotationDictionary->offsetExists('State'))
            return null;

        return $this->_annotationDictionary->getValue('State')->getValue();
    }

    /**
     * Set the annotation state.
     *
     * This annotation should be a reply to another one and following annotation flags has to be set:
     * <code>
     * $annotation->setAnnotationFlags(
     *     SetaPDF_Core_Document_Page_Annotation_Flags::HIDDEN |
     *     SetaPDF_Core_Document_Page_Annotation_Flags::NO_ROTATE |
     *     SetaPDF_Core_Document_Page_Annotation_Flags::NO_ZOOM |
     *     SetaPDF_Core_Document_Page_Annotation_Flags::PRINTS
     * );
     * </code>
     * Otherwise Acrobat/Reader will not display the state in the comments panel.
     *
     * @see PDF 32000-1:2008 - 12.5.6.3 Annotation States
     * @param string $state
     */
    public function setState($state)
    {
        if (null == $state) {
            $this->_annotationDictionary->offsetUnset('State');
            return;
        }

        if (!$this->_annotationDictionary->offsetExists('State')) {
            $this->_annotationDictionary->offsetSet('State', new SetaPDF_Core_Type_String($state));
            return;
        }

        $this->_annotationDictionary->getValue('State')->setValue($state);
    }
}
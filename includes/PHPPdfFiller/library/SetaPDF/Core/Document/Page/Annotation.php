<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Annotation.php 1332 2019-04-05 08:46:23Z jan.slabon $
 */

/**
 * Class representing a PDF annotation
 *
 * See PDF 32000-1:2008 - 12.5
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation
{
    /**
     * Annotation type
     * 
     * @var string
     */
    const TYPE_TEXT            = 'Text';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_LINK            = 'Link';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_FREE_TEXT       = 'FreeText';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_LINE            = 'Line';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_SQUARE          = 'Square';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_CIRCLE          = 'Circle';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_POLYGON         = 'Polygon';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_POLY_LINE       = 'PolyLine';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_HIGHLIGHT       = 'Highlight';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_UNDERLINE       = 'Underline';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_SQUIGGLY        = 'Squiggly';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_STRIKE_OUT      = 'StrikeOut';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_STAMP           = 'Stamp';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_CARET           = 'Caret';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_INK             = 'Ink';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_POPUP           = 'Popup';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_FILE_ATTACHMENT = 'FileAttachment';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_SOUND           = 'Sound';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_MOVIE           = 'Movie';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_WIDGET          = 'Widget';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_SCREEN          = 'Screen';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_PRINTER_MARK    = 'PrinterMark';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_TRAP_NET        = 'TrapNet';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_WATERMARK       = 'Watermark';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_3D              = '3D';

    /**
     * Annotation type
     *
     * @var string
     */
    const TYPE_REDACT          = 'Redact';

    /**
     * The annotation dictionary
     * 
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_annotationDictionary;

    /**
     * @var SetaPDF_Core_Type_IndirectObjectInterface
     */
    protected $_indirectReference;

    /**
     * The rectangle
     *
     * @var SetaPDF_Core_DataStructure_Rectangle
     */
    protected $_rect;

    /**
     * @var SetaPDF_Core_Document_Page_Annotation_AdditionalActions
     */
    protected $_additionalActions;

    /**
     * Creates an annotation dictionary with default values.
     * 
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @param string $subtype
     * @return SetaPDF_Core_Type_Dictionary
     */
    static protected function _createAnnotationDictionary($rect, $subtype)
    {
        if (!($rect instanceof SetaPDF_Core_DataStructure_Rectangle)) {
            $rect = SetaPDF_Core_DataStructure_Rectangle::create($rect);
        }

        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('Annot', true));
        $dictionary->offsetSet('Subtype', new SetaPDF_Core_Type_Name($subtype, true));
        $dictionary->offsetSet('Rect', $rect->getValue());
        
        return $dictionary;
    }
    
    /**
     * Creates an annotation object by an annotation dictionary or its parent object.
     * 
     * @param SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $objectOrDictionary
     * @throws InvalidArgumentException
     * @return SetaPDF_Core_Document_Page_Annotation
     */
    static public function byObjectOrDictionary(SetaPDF_Core_Type_AbstractType $objectOrDictionary)
    {
        $dictionary = $objectOrDictionary->ensure(true);

        if (!$dictionary instanceof SetaPDF_Core_Type_Dictionary) {
            throw new InvalidArgumentException('Parameter have to be type of SetaPDF_Core_Type_Dictionary');
        }

        if (!$dictionary->offsetExists('Subtype')) {
            throw new InvalidArgumentException('An annotation dictionary needs at least a Subtype entry.');
        }
        
        $subtypeValue = $dictionary->getValue('Subtype')->ensure()->getValue();
        
        switch ($subtypeValue) {
            case self::TYPE_LINK:
            case self::TYPE_POPUP:
            case self::TYPE_TEXT:
            case self::TYPE_SQUARE:
            case self::TYPE_CIRCLE:
            case self::TYPE_STAMP:
            case self::TYPE_WIDGET:
            case self::TYPE_HIGHLIGHT:
            case self::TYPE_UNDERLINE:
            case self::TYPE_SQUIGGLY:
            case self::TYPE_STRIKE_OUT:
            case self::TYPE_INK:
            case self::TYPE_POLYGON:
            case self::TYPE_POLY_LINE:
            case self::TYPE_FILE_ATTACHMENT:
            case self::TYPE_FREE_TEXT:
            case self::TYPE_LINE:
                $className = 'SetaPDF_Core_Document_Page_Annotation_' . $subtypeValue;
                return new $className($objectOrDictionary);

            // Default to Markup until all annotation types are implemented
            case self::TYPE_CARET:
            case self::TYPE_SOUND:
            case self::TYPE_REDACT:
                return new SetaPDF_Core_Document_Page_Annotation_Markup($objectOrDictionary);

            default:
                return new self($objectOrDictionary);
        }
    }
    
    /**
     * The constructor.
     * 
     * @param SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $objectOrDictionary
     * @throws InvalidArgumentException
     */
    public function __construct(SetaPDF_Core_Type_AbstractType $objectOrDictionary)
    {
        if ($objectOrDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface)
            $this->_indirectReference = $objectOrDictionary;

        $objectOrDictionary = $objectOrDictionary->ensure();

        if (!$objectOrDictionary instanceof SetaPDF_Core_Type_Dictionary) {
            throw new InvalidArgumentException('Parameter have to be type of SetaPDF_Core_Type_Dictionary');
        }

        if (!$objectOrDictionary->offsetExists('Subtype')) {
            throw new InvalidArgumentException('An annotation dictionary needs a Subtype entry.');
        }
        if (!$objectOrDictionary->offsetExists('Rect')) {
        	throw new InvalidArgumentException('An annotation dictionary needs a Rect entry.');
        }
        
        $this->_annotationDictionary = $objectOrDictionary;
    }

    /**
     * Release memory/cycled references
     */
    public function cleanUp()
    {
        if (null !== $this->_additionalActions) {
            $this->_additionalActions->cleanUp();
            $this->_additionalActions = null;
        }

        $this->_annotationDictionary = null;
        $this->_indirectReference = null;
        $this->_rect = null;
    }

    /**
     * Get the annotation dictionary.
     * 
     * @return SetaPDF_Core_Type_Dictionary
     * @deprecated
     */
    public function getAnnotationDictionary()
    {
        return $this->_annotationDictionary;
    }

    /**
     * Get the annotation dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_annotationDictionary;
    }

    /**
     * Set the indirect object of this annotation.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectReference
     */
    public function setIndirectObject(SetaPDF_Core_Type_IndirectObjectInterface $indirectReference)
    {
        $this->_indirectReference = $indirectReference;
    }

    /**
     * Get the indirect object of this annotation.
     *
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     */
    public function getIndirectObject(SetaPDF_Core_Document $document = null)
    {
        if ($this->_indirectReference === null && $document !== null) {
            $this->_indirectReference = $document->createNewObject($this->getDictionary());
        }

        return $this->_indirectReference;
    }
    
    /**
     * Get the action type specified in the S key.
     * 
     * @return string
     */
    public function getType()
    {
        return $this->getDictionary()->getValue('Subtype')->ensure()->getValue();
    }
    
    /**
     * Get the rectangle object of this annotation.
     * 
     * @return SetaPDF_Core_DataStructure_Rectangle
     */
    public function getRect()
    {
        if (null === $this->_rect) {
            $this->_rect = new SetaPDF_Core_DataStructure_Rectangle($this->getDictionary()->getValue('Rect')->ensure());
        }

        return $this->_rect;
    }

    /**
     * Set the rectangle object.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle $rect
     */
    public function setRect(SetaPDF_Core_DataStructure_Rectangle $rect)
    {
        $this->_rect = $rect;
        $this->getDictionary()->offsetSet('Rect', $rect->getValue());
    }

    /**
     * Get the height of the annotation.
     *
     * @return float|int
     */
    public function getHeight()
    {
        return $this->getRect()->getHeight();
    }

    /**
     * Get the width of the annotation.
     *
     * @return float|int
     */
    public function getWidth()
    {
        return $this->getRect()->getWidth();
    }

    /**
     * Get the name of the annotation.
     *
     * @param string $encoding
     * @return mixed|null
     */
    public function getName($encoding = 'UTF-8')
    {
        if (!$this->getDictionary()->offsetExists('NM'))
            return null;

        return SetaPDF_Core_Encoding::convertPdfString(
            $this->getDictionary()->getValue('NM')->getValue(), $encoding
        );
    }

    /**
     * Set the name of the annotation.
     *
     * The annotation name, a text string uniquely identifying it among all the annotations on its page.
     *
     * @param string|null $name
     * @param string $encoding
     */
    public function setName($name, $encoding = 'UTF-8')
    {
        $dictionary = $this->getDictionary();
        if (null === $name) {
            $dictionary->offsetUnset('NM');
            return;
        }

        $name = SetaPDF_Core_Encoding::toPdfString($name, $encoding);

        if (!$dictionary->offsetExists('NM')) {
            $dictionary->offsetSet('NM', new SetaPDF_Core_Type_String($name));
            return;
        }

        $dictionary->getValue('NM')->setValue($name);
    }

    /**
     * Get the contents of the annotation.
     *
     * @param string $encoding
     * @return null|string
     */
    public function getContents($encoding = 'UTF-8')
    {
        if (!$this->getDictionary()->offsetExists('Contents'))
            return null;

        return SetaPDF_Core_Encoding::convertPdfString(
            $this->getDictionary()->getValue('Contents')->getValue(), $encoding
        );
    }

    /**
     * Set the contents of the annotation.
     *
     * @param string|null $contents
     * @param string $encoding
     */
    public function setContents($contents, $encoding = 'UTF-8')
    {
        $dictionary = $this->getDictionary();
        if (null === $contents) {
            $dictionary->offsetUnset('Contents');
            return;
        }

        $contents = SetaPDF_Core_Encoding::toPdfString($contents, $encoding);

        if (!$dictionary->offsetExists('Contents')) {
            $dictionary->offsetSet('Contents', new SetaPDF_Core_Type_String($contents));
            return;
        }

        $dictionary->getValue('Contents')->setValue($contents);
    }

    /**
     * Get the modification date.
     *
     * @param bool $asString
     * @return mixed|null|SetaPDF_Core_DataStructure_Date
     */
    public function getModificationDate($asString = true)
    {
        $dictionary = $this->getDictionary();
        if (!$dictionary->offsetExists('M'))
            return null;

        $date = $dictionary->getValue('M')->ensure()->getValue();
        if (true === $asString) {
            return $date;
        }

        return new SetaPDF_Core_DataStructure_Date($dictionary->getValue('M')->ensure());
    }

    /**
     * Set the modification date.
     *
     * @param SetaPDF_Core_DataStructure_Date|DateTime|string|bool $date If true is passed, the current date and time
     *                                                                   will be used.
     */
    public function setModificationDate($date = true)
    {
        if ($date === null) {
            $this->getDictionary()->offsetUnset('M');
            return;
        }

        if (!($date instanceof SetaPDF_Core_DataStructure_Date)) {
            if ($date instanceof DateTime) {
                $date = new SetaPDF_Core_DataStructure_Date($date);
            } else {
                $date = new SetaPDF_Core_DataStructure_Date($date !== true ? new SetaPDF_Core_Type_String($date) : null);
            }
        }
        $this->getDictionary()->offsetSet('M', $date->getValue());
    }

  /* Annotation Flags (F entry) */
    
    /**
     * Sets an annotation flag.
     *
     * @param integer $flags
     * @param boolean $set Set or unset
     */
    public function setAnnotationFlags($flags, $set = true)
    {
    	if (false === $set) {
            $this->unsetAnnotationFlags($flags);
            return;
        }
    
    	$dict = $this->getDictionary();

        if ($dict->offsetExists('F')) {
    		$value = $dict->getValue('F');
    		$value->setValue($value->getValue() | $flags);
    
    	} else {
            $dict->offsetSet('F', new SetaPDF_Core_Type_Numeric($flags));
    	}
    }
    
    /**
     * Removes a field flag.
     *
     * @param integer $flags
     */
    public function unsetAnnotationFlags($flags)
    {
    	$dict = $this->getDictionary();
    
    	if ($dict->offsetExists('F')) {
    		$value = $dict->getValue('F');
    		$value->setValue($value->getValue() & ~$flags);
    	}
    }
    
    /**
     * Checks if a specific annotation flag is set.
     *
     * @param integer $flag
     * @return boolean
     */
    public function isAnnotationFlagSet($flag)
    {
        $dictionary = $this->getDictionary();
        if (false === $dictionary->offsetExists('F'))
            return false;
        
        $f = $dictionary->getValue('F')->ensure()->getValue();
    	return ($f & $flag) !== 0;
    }
    
    /**
     * Checks for the "Invisible" flag.
     * 
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not display the annotation if it does not belong to one of the
     * standard annotation types and no annotation handler is available. If clear,
     * display such an unknown annotation using an appearance stream specified by
     * its appearance dictionary, if any"
     * 
     * @return boolean
     */
    public function getInvisibleFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::INVISIBLE);
    }
    
    /**
     * Set the "Invisible" flag.
     * 
     * @param boolean $invisible
     * @see getInvisibleFlag()
     */
    public function setInvisibleFlag($invisible = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::INVISIBLE, $invisible);
    }
    
    /**
     * Checks for the "Hidden" flag.
     *
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not display or print the annotation or allow it to interact with
     * the user, regardless of its annotation type or whether an annotation handler
     * is available."
     * 
     * @return boolean
     */
    public function getHiddenFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::HIDDEN);
    }
    
    /**
     * Set the "Hidden" flag.
     * 
     * @param boolean $hidden
     * @see getHiddenFlag()
     */
    public function setHiddenFlag($hidden = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::HIDDEN, $hidden);
    }
    
    /**
     * Checks for the "Print" flag.
     * 
     * PDF 32000-1:2008 - Table 165:
     * "If set, print the annotation when the page is printed. If clear, never print
     * the annotation, regardless of whether it is displayed on the screen."
     *
     * @return boolean
     */
    public function getPrintFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::PRINTS);
    }
    
    /**
     * Set the "Print" flag.
     * 
     * @param boolean $print
     * @see getPrintFlag()
     */
    public function setPrintFlag($print = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::PRINTS, $print);
    }
    
    /**
     * Checks fo the "NoZoom" flag.
     * 
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not scale the annotation’s appearance to match the magnification
     * of the page. The location of the annotation on the page (defined by the upper-
     * left corner of its annotation rectangle) shall remain fixed, regardless of the
     * page magnification."
     * 
     * @return boolean
     */
    public function getNoZoomFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::NO_ZOOM);
    }
    
    /**
     * Set the "NoZoom" flag.
     * 
     * @param boolean $noZoom
     * @see getNoZoomFlag()
     */
    public function setNoZoomFlag($noZoom = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::NO_ZOOM, $noZoom);
    }
    
    /**
     * Checks fo the "NoRotate" flag.
     * 
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not rotate the annotation’s appearance to match the rotation of the
     * page. The upper-left corner of the annotation rectangle shall remain in a fixed
     * location on the page, regardless of the page rotation."
     * 
     * @return boolean
     */
    public function getNoRotateFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::NO_ROTATE);
    }
    
    /**
     * Set the "NoRotate" flag.
     * 
     * @param boolean $noRotate
     * @see getNoRotateFlag()
     */
    public function setNoRotateFlag($noRotate = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::NO_ROTATE, $noRotate);
    }
    
    /**
     * Checks for the "NoView" flag.
     * 
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not display the annotation on the screen or allow it to interact
     * with the user. The annotation may be printed (depending on the setting of the
     * Print flag) but should be considered hidden for purposes of on-screen display
     * and user interaction."
     * 
     * @return boolean
     */
    public function getNoViewFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::NO_VIEW);
    }
    
    /**
     * Set the "NoView" flag.
     * 
     * @param boolean $noView
     * @see getNoViewFlag()
     */
    public function setNoViewFlag($noView = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::NO_VIEW, $noView);
    }
    
    /**
     * Checks the "ReadOnly" flag.
     * 
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not allow the annotation to interact with the user. The annotation
     * may be displayed or printed (depending on the settings of the NoView and Print
     * flags) but should not respond to mouse clicks or change its appearance in
     * response to mouse motions.
     * 
     * This flag shall be ignored for widget annotations; its function is subsumed by
     * the ReadOnly flag of the associated form field"
     * 
     * @return boolean
     */
    public function getReadOnlyFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::READ_ONLY);
    }
    
    /**
     * Set the "ReadOnly" flag.
     * 
     * @param boolean $readOnly
     * @see getReadOnlyFlag()
     */
    public function setReadOnlyFlag($readOnly = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::READ_ONLY, $readOnly);
    }
    
    /**
     * Checks the "Locked" flag.
     *
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not allow the annotation to be deleted or its properties (including
     * position and size) to be modified by the user. However, this flag does not
     * restrict changes to the annotation’s contents, such as the value of a form field."
     * 
     * @return boolean
     */
    public function getLockedFlag()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::LOCKED);
    }
    
    /**
     * Set the "Locked" flag.
     * 
     * @param boolean $locked
     * @see getLockedFlag()
     */
    public function setLocked($locked = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::LOCKED, $locked);
    }
    
    /**
     * Checks for the "ToggleNoView" flag.
     * 
     * PDF 32000-1:2008 - Table 165:
     * "If set, invert the interpretation of the NoView flag for certain events."
     * 
     * @return boolean
     */
    public function getToggleNoView()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::TOGGLE_NO_VIEW);
    }
    
    /**
     * Set the "ToggleNoView" flag.
     *
     * @param boolean $toggleNoView
     * @see getToggleNoView()
     */
    public function setToggleNoView($toggleNoView = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::TOGGLE_NO_VIEW, $toggleNoView);
    }
    
    /**
     * Checks for the "LockedContents" flag.
     *
     * PDF 32000-1:2008 - Table 165:
     * "If set, do not allow the contents of the annotation to be modified by the
     * user. This flag does not restrict deletion of the annotation or changes to
     * other annotation properties, such as position and size."
     *
     * @return boolean
     */
    public function getLockedContents()
    {
        return $this->isAnnotationFlagSet(SetaPDF_Core_Document_Page_Annotation_Flags::LOCKED_CONTENTS);
    }
    
    /**
     * Set the "LockedContents" flag.
     *
     * @param boolean $lockedContents
     * @see getLockedContents()
     */
    public function setLockedContents($lockedContents = true)
    {
        $this->setAnnotationFlags(SetaPDF_Core_Document_Page_Annotation_Flags::LOCKED_CONTENTS, $lockedContents);
    }

    /**
     * Set the color of the annotation.
     *
     * @param null|bool|int|float|string|array|SetaPDF_Core_DataStructure_Color $color
     */
    public function setColor($color)
    {
        if (null === $color) {
            $this->getDictionary()->offsetUnset('C');
            return;
        }

        if (!$color instanceof SetaPDF_Core_DataStructure_Color) {
            $color = SetaPDF_Core_DataStructure_Color::createByComponents($color);
        }

        $this->getDictionary()->offsetSet('C', $color->getValue());
    }

    /**
     * Get the color of the annotation.
     *
     * @return null|SetaPDF_Core_DataStructure_Color
     */
    public function getColor()
    {
        if (!$this->getDictionary()->offsetExists('C'))
            return null;

        return SetaPDF_Core_DataStructure_Color::createByComponents(
            $this->getDictionary()->getValue('C')
        );
    }

    /**
     * Get the annotation appearance stream.
     *
     * @param string $type
     * @param null|string $subType
     * @throws InvalidArgumentException
     * @return null|SetaPDF_Core_XObject_Form
     */
    public function getAppearance($type = 'N', $subType = null)
    {
        if (!$this->getDictionary()->offsetExists('AP')) {
            return null;
        }

        $ap = $this->getDictionary()->getValue('AP')->ensure();
        if (!$ap->offsetExists($type)) {
            return null;
        }

        /**
         * @var $ap SetaPDF_Core_Type_Dictionary
         */
        $ap = $ap->getValue($type);
        if ($ap instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            return new SetaPDF_Core_XObject_Form($ap->getValue($type));
        }

        if ($subType === null) {
            throw new InvalidArgumentException('This appearance has a subdictionary and requires a subtype to be defined');
        }

        if (!$ap->offsetExists($subType)) {
            return null;
        }

        return new SetaPDF_Core_XObject_Form($ap->getValue($subType));
    }

    /**
     * Set the annotation appearance stream.
     *
     * @param SetaPDF_Core_XObject_Form $xObject
     * @param string $type
     * @param string|null $subState
     */
    public function setAppearance(SetaPDF_Core_XObject_Form $xObject, $type = 'N', $subState = null)
    {
        $dictionary = $this->getDictionary();
        if (!$dictionary->offsetExists('AP')) {
            $dictionary->offsetSet('AP', new SetaPDF_Core_Type_Dictionary());
        }

        /**
         * @var $ap SetaPDF_Core_Type_Dictionary
         */
        $ap = $dictionary->getValue('AP')->ensure();

        if ($subState !== null) {
            $sub = $ap->getValue($type);
            if (!$sub instanceof SetaPDF_Core_Type_Dictionary) {
                $ap->offsetSet($type, new SetaPDF_Core_Type_Dictionary());
            }
            $ap = $ap->getValue($type);
            $ap->offsetSet($subState, $xObject->getIndirectObject());

        } else {
            $ap->offsetSet($type, $xObject->getIndirectObject());
        }
    }

    /**
     * Gets the additional actions object instance for this annotation.
     *
     * @return SetaPDF_Core_Document_Page_Annotation_AdditionalActions
     */
    public function getAdditionalActions()
    {
        if (null === $this->_additionalActions) {
            $this->_additionalActions = new SetaPDF_Core_Document_Page_Annotation_AdditionalActions($this);
        }

        return $this->_additionalActions;
    }
}
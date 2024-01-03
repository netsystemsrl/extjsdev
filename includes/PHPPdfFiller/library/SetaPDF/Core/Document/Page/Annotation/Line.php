<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id$
 */

/**
 * Class representing a line annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.7
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Line
    extends SetaPDF_Core_Document_Page_Annotation_Markup
{
    /**
     * Intent constant
     *
     * @var string
     */
    const INTENT_LINE_ARROW = 'LineArrow';

    /**
     * Intent constant
     *
     * @var string
     */
    const INTENT_LINE_DIMENSION = 'LineDimension';

    /**
     * Caption position constant
     *
     * @var string
     */
    const CAPTION_POSITION_INLINE = 'Inline';

    /**
     * Caption position constant
     *
     * @var string
     */
    const CAPTION_POSITION_TOP = 'Top';

    /**
     * @var SetaPDF_Core_Document_Page_Annotation_BorderStyle
     */
    protected $_borderStyle;

    /**
     * Creates an annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @param string $fontName The font name, which is registered in the AcroForm DR dictionary.
     * @param number $fontSize The font size
     * @param int|float|string|array|SetaPDF_Core_Type_Array $color See
     *                                  {@link SetaPDF_Core_DataStructure_Color::createByComponents()} for more details.
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createAnnotationDictionary($rect, $x1OrPoints, $y1 = null, $x2 = null, $y2 = null)
    {
        $dict = parent::_createAnnotationDictionary($rect, SetaPDF_Core_Document_Page_Annotation_Link::TYPE_LINE);
        if (!is_array($x1OrPoints)) {
            $x1OrPoints = [$x1OrPoints, $y1, $x2, $y2];
        }

        $x1OrPoints = array_values($x1OrPoints);
        $count = count($x1OrPoints);
        if ($count !== 4) {
            throw new InvalidArgumentException(
                'The line annotation needs 4 values (' . $count . ' given) to create 2 points.'
            );
        };

        $dict->offsetSet('L', new SetaPDF_Core_Type_Array([
            new SetaPDF_Core_Type_Numeric($x1OrPoints[0]),
            new SetaPDF_Core_Type_Numeric($x1OrPoints[1]),
            new SetaPDF_Core_Type_Numeric($x1OrPoints[2]),
            new SetaPDF_Core_Type_Numeric($x1OrPoints[3]),
        ]));

        return $dict;
    }

    /**
     * The constructor.
     *
     * If the parameter cannot be resolved as a dictionary all parameters were passed to the
     * {@link self::createAnnotationDictionary()} method.
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
                ['SetaPDF_Core_Document_Page_Annotation_Line', 'createAnnotationDictionary'],
                $args
            );
            unset($args);
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'Subtype', 'Line')) {
            throw new InvalidArgumentException('The Subtype entry in a line annotation shall be "Line".');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Release cycled references.
     */
    public function cleanUp()
    {
        $this->_borderStyle->cleanUp();
        $this->_borderStyle = null;
        parent::cleanUp();
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

    /**
     * Set the line ending styles.
     *
     * @see SetaPDF_Core_Document_Page_Annotation_LineEndingStyle
     * @param string $first
     * @param string $last
     */
    public function setLineEndingStyles($first, $last)
    {
        $le = $this->_annotationDictionary->getValue('LE');
        if (null === $le) {
            $le = new SetaPDF_Core_Type_Array();
            $this->_annotationDictionary->offsetSet('LE', $le);
        }

        $allowed = SetaPDF_Core_Document_Page_Annotation_LineEndingStyle::getAll();
        if (!in_array($first, $allowed)) {
            throw new InvalidArgumentException('Invalid line ending style parameter "' . $first . '".');
        }

        if (!in_array($last, $allowed)) {
            throw new InvalidArgumentException('Invalid line ending style parameter "' . $last . '".');
        }

        /**
         * @var SetaPDF_Core_Type_Array $le
         */
        $le = $le->ensure(true);
        $le->clear();
        $le[] = new SetaPDF_Core_Type_Name($first);
        $le[] = new SetaPDF_Core_Type_Name($last);
    }

    /**
     * Get the line ending styles.
     *
     * @return array
     */
    public function getLineEndingStyles()
    {
        $le = $this->_annotationDictionary->getValue('LE');
        if (null === $le) {
            return array(
                SetaPDF_Core_Document_Page_Annotation_LineEndingStyle::NONE,
                SetaPDF_Core_Document_Page_Annotation_LineEndingStyle::NONE
            );
        }

        return $le->ensure()->toPhp();
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
        if (!$this->_annotationDictionary->offsetExists('IC')) {
            return null;
        }

        return SetaPDF_Core_DataStructure_Color::createByComponents(
            $this->_annotationDictionary->getValue('IC')
        );
    }

    /**
     * Set the length of leader lines.
     *
     * @param int|float $length
     */
    public function setLeaderLine($length)
    {
        if (!$length) {
            $this->_annotationDictionary->offsetUnset('LL');
            return;
        }

        $this->_annotationDictionary->offsetSet('LL', new SetaPDF_Core_Type_Numeric($length));
    }

    /**
     * Get the length of leader lines.
     *
     * @return int|float
     */
    public function getLeaderLine()
    {
        $length = $this->_annotationDictionary->getValue('LL');
        if (!$length) {
            return 0;
        }

        return $length->ensure()->toPhp();
    }

    /**
     * Set the length of leader line extensions.
     *
     * @param int|float $length
     */
    public function setLeaderLineExtension($length)
    {
        if (!$length) {
            $this->_annotationDictionary->offsetUnset('LLE');
            return;
        }

        $this->_annotationDictionary->offsetSet('LLE', new SetaPDF_Core_Type_Numeric($length));
    }

    /**
     * Get the length of leader line extensions.
     *
     * @return int|float
     */
    public function getLeaderLineExtension()
    {
        $length = $this->_annotationDictionary->getValue('LLE');
        if (!$length) {
            return 0;
        }

        return $length->ensure()->toPhp();
    }

    /**
     * Set whether a caption should be shown or not.
     *
     * The value can be defined through the {@link self::setContent()} method.
     *
     * @param boolean $caption
     */
    public function setCaption($caption)
    {
        if (!$caption) {
            $this->_annotationDictionary->offsetUnset('Cap');
            return;
        }

        $this->_annotationDictionary->offsetSet('Cap', new SetaPDF_Core_Type_Boolean(true));
    }

    /**
     * Get whether a caption should be shown or not.
     *
     * @return boolean
     */
    public function getCaption()
    {
        $cap = $this->_annotationDictionary->getValue('Cap');
        if (!$cap) {
            return false;
        }

        return $cap->ensure()->toPhp();
    }

    /**
     * Set the name describing the intent of the free text annotation.
     *
     * @param string $intent
     */
    public function setIntent($intent)
    {
        $allowed = [
            self::INTENT_LINE_ARROW,
            self::INTENT_LINE_DIMENSION
        ];

        if (!in_array($intent, $allowed)) {
            throw new InvalidArgumentException('Invalid intent parameter "' . $intent . '".');
        }

        $this->_annotationDictionary->offsetSet('IT', new SetaPDF_Core_Type_Name($intent));
    }

    /**
     * Get the name describing the intent of the line annotation.
     *
     * @return string
     */
    public function getIntent()
    {
        $intent = $this->_annotationDictionary->getValue('IT');
        if ($intent === null) {
            return null;
        }

        return $intent->ensure()->getValue();
    }

    /**
     * Set length of the leader line offset.
     *
     * @param int|float $offset A non-negative number.
     */
    public function setLeaderLineOffset($offset)
    {
        if (!$offset || $offset < 0) {
            $this->_annotationDictionary->offsetUnset('LLO');
            return;
        }

        $this->_annotationDictionary->offsetSet('LLO', new SetaPDF_Core_Type_Numeric($offset));
    }

    /**
     * Get length of the leader line offset.
     *
     * @return int|float
     */
    public function getLeaderLineOffset()
    {
        $offset = $this->_annotationDictionary->getValue('LLO');
        if (!$offset) {
            return null;
        }

        return $offset->ensure()->toPhp();
    }

    /**
     * Set the caption position.
     *
     * See self::CAPTION_* constants for possible values.
     *
     * @param string $captionPosition
     */
    public function setCaptionPosition($captionPosition)
    {
        if (!$captionPosition || $captionPosition === self::CAPTION_POSITION_INLINE) {
            $this->_annotationDictionary->offsetUnset('CP');
            return;
        }

        if ($captionPosition !== self::CAPTION_POSITION_TOP) {
            throw new InvalidArgumentException('Invalid caption position "' . $captionPosition . '".');
        }

        $this->_annotationDictionary->offsetSet('CP', new SetaPDF_Core_Type_Name($captionPosition));
    }

    /**
     * Get the caption position.
     *
     * @return string
     */
    public function getCaptionPosition()
    {
        $captionPosition = $this->_annotationDictionary->getValue('CP');
        if (!$captionPosition) {
            return self::CAPTION_POSITION_INLINE;
        }

        return $captionPosition->ensure()->toPhp();
    }

    /**
     * Set the offset of the caption text.
     *
     * @param int|float $x
     * @param int|float $y
     */
    public function setCaptionOffset($x, $y)
    {
        if (($x + $y) == 0) {
            $this->_annotationDictionary->offsetUnset('CO');
            return;
        }

        $co = $this->_annotationDictionary->getValue('CO');
        if (null === $co) {
            $co = new SetaPDF_Core_Type_Array();
            $this->_annotationDictionary->offsetSet('CO', $co);
        }

        /**
         * @var SetaPDF_Core_Type_Array $co
         */
        $co = $co->ensure(true);
        $co->clear();
        $co[] = new SetaPDF_Core_Type_Numeric($x);
        $co[] = new SetaPDF_Core_Type_Numeric($y);
    }

    /**
     * Get the offset of the caption text.
     *
     * @return int[]|float[]
     */
    public function getCaptionOffset()
    {
        $captionOffset = $this->_annotationDictionary->getValue('CO');
        if (!$captionOffset) {
            return [0, 0];
        }

        return $captionOffset->ensure()->toPhp();
    }
}
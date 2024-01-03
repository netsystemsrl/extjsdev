<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Markup.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a markup annotation
 *
 * See PDF 32000-1:2008 - 12.5.6.2
 *
 * Markup annotations are:
 * - Text
 * - Free text annotations (no Popup)
 * - Line
 * - Square
 * - Circle
 * - Polygon
 * - PolyLine
 * - Highlight
 * - Underline
 * - Squiggly
 * - StrikeOut
 * - Stamp
 * - Caret
 * - Ink
 * - FileAttachment
 * - Sound (no Popup)
 * - Redact
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Markup
    extends SetaPDF_Core_Document_Page_Annotation
{
    /**
     * Get the associated popup object if available.
     *
     * @return null|SetaPDF_Core_Document_Page_Annotation_Popup
     */
    public function getPopup()
    {
        if (!$this->_annotationDictionary->offsetExists('Popup')) {
            return null;
        }

        return new SetaPDF_Core_Document_Page_Annotation_Popup(
            $this->_annotationDictionary->getValue('Popup')
        );
    }

    /**
     * Set the pop-up annotation object.
     *
     * @todo This method should be deactivated in "Free text annotations" and "Sound annotations"
     * @param SetaPDF_Core_Document_Page_Annotation_Popup $annotation
     * @throws InvalidArgumentException
     */
    public function setPopup(SetaPDF_Core_Document_Page_Annotation_Popup $annotation)
    {
        $object = $annotation->getIndirectObject();
        if (!$object instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            throw new InvalidArgumentException(
                'Adding a popup annotation to a text annotation requires that ' .
                    'the popup annotation is attached to an indirect object.'
            );
        }

        $annotation->setParent($this);

        $this->_annotationDictionary->offsetSet('Popup', $object);
    }

    /**
     * Create a popup annotation object for this annotation.
     *
     * If the x-offset value is less than zero the popup will be created at the left side of
     * the main annotation. Otherwise on the right side.
     * If the y-offset value is less than zero the popup will be create down below the main
     * annotation. Otherwise above.
     *
     * You need to re-add this new popup annotation to its origin annotation by passing it to
     * the {@link SetaPDF_Core_Document_Page_Annotation_Markup::addPopup() addPopup()} method after
     * assigning it to the page object.
     *
     * @param int|float $offsetX
     * @param int|float $offsetY
     * @param int|float $width
     * @param int|float $height
     *
     * @return SetaPDF_Core_Document_Page_Annotation_Popup
     */
    public function createPopup($offsetX = 30, $offsetY = 20, $width = 150, $height = 100)
    {
        $rect = $this->getRect();
        if ($offsetX >= 0) {
            $llx = $rect->getUrx() + $offsetX;
            $urx = $llx + $width;
        } else {
            $llx = $rect->getLlx() - $width - $offsetX;
            $urx = $llx - $width;
        }

        if ($offsetY >= 0) {
            $lly = $rect->getLly() + $offsetY;
            $ury = $lly + $height;
        } else {
            $lly = $rect->getLly() - $width - $offsetX;
            $ury = $lly - $height;
        }

        return new SetaPDF_Core_Document_Page_Annotation_Popup(array($llx, $lly, $urx, $ury));
    }

    /**
     * Get the creation date.
     *
     * <quote>
     * The date and time when the annotation was created.
     * </quote>
     *
     * @see setCreationDate()
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     *
     * @param bool $asString Whether receive the value as a string (PDF date string) or as a
     *                       SetaPDF_Core_DataStructure_Date instance.
     * @return null|mixed|SetaPDF_Core_DataStructure_Date
     */
    public function getCreationDate($asString = true)
    {
        if (!$this->_annotationDictionary->offsetExists('CreationDate'))
            return null;

        $date = $this->_annotationDictionary->getValue('CreationDate')->ensure()->getValue();
        if (true === $asString) {
            return $date;
        }

        return new SetaPDF_Core_DataStructure_Date($this->_annotationDictionary->getValue('CreationDate')->ensure());
    }

    /**
     * Set the creation date.
     *
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     * @see getCreationDate()
     * @param null|bool|string|DateTime|SetaPDF_Core_Type_String|SetaPDF_Core_DataStructure_Date $date
     */
    public function setCreationDate($date = true)
    {
        if ($date === null) {
            $this->_annotationDictionary->offsetUnset('CreationDate');
            return;
        }

        if (!($date instanceof SetaPDF_Core_DataStructure_Date))
            $date = new SetaPDF_Core_DataStructure_Date($date !== true ? new SetaPDF_Core_Type_String($date) : null);

        $this->_annotationDictionary->offsetSet('CreationDate', $date->getValue());
    }

    /**
     * Get the text label.
     *
     * <quote>
     * The text label that shall be displayed in the title bar of the annotation’s pop-up window when open and active.
     * This entry shall identify the user who added the annotation.
     * </quote>
     *
     * @see setTextLabel()
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     * @param string $encoding
     * @return null|string
     */
    public function getTextLabel($encoding = 'UTF-8')
    {
        if (!$this->_annotationDictionary->offsetExists('T'))
            return null;

        return SetaPDF_Core_Encoding::convertPdfString($this->_annotationDictionary->getValue('T')->getValue(), $encoding);
    }

    /**
     * Set the text label.
     *
     * @see getTextLabel()
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     * @param string|null $textLabel
     * @param string $encoding
     */
    public function setTextLabel($textLabel, $encoding = 'UTF-8')
    {
        if (null == $textLabel) {
            $this->_annotationDictionary->offsetUnset('T');
            return;
        }

        $textLabel = SetaPDF_Core_Encoding::toPdfString($textLabel, $encoding);

        if (!$this->_annotationDictionary->offsetExists('T')) {
            $this->_annotationDictionary->offsetSet('T', new SetaPDF_Core_Type_String($textLabel));
            return;
        }

        $this->_annotationDictionary->getValue('T')->setValue($textLabel);
    }

    /**
     * Get the subject.
     *
     * <quote>
     * Text representing a short description of the subject being addressed by the annotation.
     * </quote>
     *
     * @see setSubject()
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     * @param string $encoding
     * @return null|string
     */
    public function getSubject($encoding = 'UTF-8')
    {
        if (!$this->_annotationDictionary->offsetExists('Subj'))
            return null;

        return SetaPDF_Core_Encoding::convertPdfString($this->_annotationDictionary->getValue('Subj')->getValue(), $encoding);
    }

    /**
     * Get the subject.
     *
     * @see getSubject()
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     * @param string|null $subject
     * @param string $encoding
     */
    public function setSubject($subject, $encoding = 'UTF-8')
    {
        if (null == $subject) {
            $this->_annotationDictionary->offsetUnset('Subj');
            return;
        }

        $subject = SetaPDF_Core_Encoding::toPdfString($subject, $encoding);

        if (!$this->_annotationDictionary->offsetExists('Subj')) {
            $this->_annotationDictionary->offsetSet('Subj', new SetaPDF_Core_Type_String($subject));
            return;
        }

        $this->_annotationDictionary->getValue('Subj')->setValue($subject);
    }

    /**
     * Set the in reply to annotation object.
     *
     * @see getInReplyTo()
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     * @param SetaPDF_Core_Document_Page_Annotation_Markup $annotation
     * @throws InvalidArgumentException
     */
    public function setInReplyTo(SetaPDF_Core_Document_Page_Annotation_Markup $annotation)
    {
        $object = $annotation->getIndirectObject();
        if (!$object instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            throw new InvalidArgumentException(
                'Adding a reply-to annotation to a markup annotation requires that ' .
                'the markup annotation is attached to an indirect object.'
            );
        }

        $this->_annotationDictionary->offsetSet('IRT', $object);
    }

    /**
     * Get the in reply to annotation (if available).
     *
     * @see setInReplyTo()
     * @see PDF 32000-1:2008 - 12.5.6.2 - Table 170
     * @return null|SetaPDF_Core_Document_Page_Annotation
     */
    public function getInReplyTo()
    {
        if (!$this->_annotationDictionary->offsetExists('IRT'))
            return null;

        return SetaPDF_Core_Document_Page_Annotation::byObjectOrDictionary(
            $this->_annotationDictionary->getValue('IRT')
        );
    }

    /**
     * Checks if this annotation is a reply to another annotation.
     *
     * @return bool
     */
    public function isReplyTo()
    {
        return $this->_annotationDictionary->getValue('IRT') !== null;
    }

    /**
     * Get all replies or checks for their existance.
     *
     * @param SetaPDF_Core_Document_Page_Annotations $annotations
     * @param $onlyCheckForExistance
     * @return array|bool
     */
    private function _getReplies(SetaPDF_Core_Document_Page_Annotations $annotations, $onlyCheckForExistance)
    {
        $replies = array();

        foreach ($annotations->getAll() AS $annotation) {
            if (!($annotation instanceof SetaPDF_Core_Document_Page_Annotation_Markup))
                continue;

            if ($annotation->_indirectReference === null)
                continue;

            $inReplyTo = $annotation->getInReplyTo();
            if ($inReplyTo === null || $inReplyTo->_indirectReference === null) {
                continue;
            }

            if ($inReplyTo->_indirectReference->getObjectIdent() === $this->_indirectReference->getObjectIdent()) {
                if ($onlyCheckForExistance)
                    return true;

                $replies[] = $annotation;
            }
        }

        return $onlyCheckForExistance ? false : $replies;
    }

    /**
     * Check whether this annotation has a reply or not.
     *
     * @param SetaPDF_Core_Document_Page_Annotations $annotations
     * @return bool
     */
    public function hasReplies(SetaPDF_Core_Document_Page_Annotations $annotations)
    {
        return $this->_getReplies($annotations, true);
    }

    /**
     * Get all annotations which refer this annotation as an reply.
     *
     * @param SetaPDF_Core_Document_Page_Annotations $annotations
     * @return array
     */
    public function getReplies(SetaPDF_Core_Document_Page_Annotations $annotations)
    {
        return $this->_getReplies($annotations, false);
    }

    /**
     * Adds a reply to this annotation.
     *
     * @param SetaPDF_Core_Document_Page_Annotation_Markup $annotation
     */
    public function addReply(SetaPDF_Core_Document_Page_Annotation_Markup $annotation)
    {
        $annotation->setInReplyTo($this);
    }

    /**
     * Get the constant opacity value.
     *
     * @return float|mixed
     */
    public function getOpacity()
    {
        if (!$this->_annotationDictionary->offsetExists('CA'))
            return 1.0;

        return $this->_annotationDictionary->getValue('CA')->ensure()->getValue();
    }

    /**
     * Set the constant opacity value.
     *
     * @param float $opacity
     */
    public function setOpacity($opacity)
    {
        if ($opacity !== null) {
            $opacity = max(0, $opacity);
            $opacity = min(1, $opacity);
            if ($opacity == 1) {
                $opacity = null;
            }
        }

        if (null === $opacity) {
            $this->_annotationDictionary->offsetUnset('CA');
            return;
        }

        $ca = $this->_annotationDictionary->getValue('CA');
        if (null === $ca) {
            $ca = new SetaPDF_Core_Type_Numeric($opacity);
            $this->_annotationDictionary->offsetSet('CA', $ca);
        }

        $ca = $ca->ensure(true);
        $ca->setValue($opacity);
    }
}
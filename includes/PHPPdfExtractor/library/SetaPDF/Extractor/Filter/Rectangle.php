<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Rectangle.php 1062 2017-06-20 12:55:44Z jan.slabon $
 */

/**
 * A rectangle filter.
 *
 * This filter allows you to define a rectangle which is used to filter text items.
 * This filter automatically takes care of rotated pages/coordinate systems.
 *
 * The origin of the coordinate system is the lower left throughout.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Filter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Filter_Rectangle
implements SetaPDF_Extractor_Filter_PageFilterInterface
{
    /**
     * A mode constant.
     *
     * This mode says that the whole text item has to be contained by the rectangle of this filter instance.
     *
     * @var string
     */
    const MODE_CONTAINS = 'contains';

    /**
     * A mode constant.
     *
     * This mode says that the text item has to contact the rectangle of this filter instance through any point or
     * intersection.
     *
     * @var string
     */
    const MODE_CONTACT = 'contact';

    /**
     * The rectangle to filter by.
     *
     * @var SetaPDF_Core_Geometry_Rectangle
     */
    protected $_rectangle;

    /**
     * The rotated rectangle (if needed).
     *
     * @var SetaPDF_Core_Geometry_Rectangle
     */
    protected $_transformedRectangle;

    /**
     * The mode to work with.
     *
     * @var string
     */
    protected $_mode = self::MODE_CONTACT;

    /**
     * The rotation value.
     *
     * @var int
     */
    protected $_rotation = 0;

    /**
     * The current page object.
     *
     * @var SetaPDF_Core_Document_Page
     */
    protected $_page;

    /**
     * The id of this filter.
     *
     * @var string|null
     */
    protected $_id;

    /**
     * The constructor.
     *
     * The filter can work in 2 modes, which can be controlled by the 2nd paramter of the constructor:
     *
     * 1. MODE_CONTACT: This mode will match tangent items.
     * 2. MODE_CONTAINS: This mode will match if the rectangle contains the whole text item.
     *
     * @param SetaPDF_Core_Geometry_Rectangle $rectangle The rectangle to filter by.
     * @param string $mode A mode constant.
     * @param null|string The filter id.
     */
    public function __construct(SetaPDF_Core_Geometry_Rectangle $rectangle, $mode = self::MODE_CONTACT, $id = null)
    {
        $this->_rectangle = $rectangle;
        $this->_mode = $mode;
        if ($id !== null && $id == false) {
            throw new InvalidArgumentException(
                'The filter id needs to be a string which will not evaluate to false in a boolean comparison.'
            );
        }
        $this->_id = $id;
    }

    /**
     * Get the filter id.
     *
     * @return null|string
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * Get the rectangle.
     *
     * @param bool $ignoreTransform Whether to ignore the transformation (rotation and translation of the page
     *                              coordinate syste) or not.
     * @return SetaPDF_Core_Geometry_Rectangle
     */
    public function getRectangle($ignoreTransform = false)
    {
        if (true == $ignoreTransform || null === $this->_transformedRectangle) {
            return $this->_rectangle;
        }

        return $this->_transformedRectangle;
    }

    /**
     * Get the mode.
     *
     * @return string
     */
    public function getMode()
    {
        return $this->_mode;
    }

    /**
     * Set the current page object.
     *
     * @param SetaPDF_Core_Document_Page $page
     */
    public function setPage(SetaPDF_Core_Document_Page $page = null)
    {
        $this->_page = $page;
        $this->_rotation = $page->getRotation();

        $bbox = $page->getCropBox();
        $gs = new SetaPDF_Core_Canvas_GraphicState();
        if ($this->_rotation != 0) {
            switch ($this->_rotation) {
                case -270:
                case 90:
                    $gs->translate($bbox->getWidth(), 0);
                    break;
                case -180:
                case 180:
                $gs->translate($bbox->getWidth(), $bbox->getHeight());
                    break;
                case 270:
                case -90:
                $gs->translate(0, $bbox->getHeight());
                    break;
            }

            $gs->rotate($bbox->llx, $bbox->lly, $this->_rotation);
        }

        $gs->translate($bbox->llx, $bbox->lly);

        $ll = $gs->toUserSpace(SetaPDF_Core_Geometry_Vector::byPoint($this->_rectangle->getLl()))->toPoint();
        $ur = $gs->toUserSpace(SetaPDF_Core_Geometry_Vector::byPoint($this->_rectangle->getUr()))->toPoint();

        $this->_transformedRectangle = new SetaPDF_Core_Geometry_Rectangle($ll, $ur);
    }

    /**
     * Method that is called to decide if a text item accepted or not.
     *
     * @see SetaPDF_Extractor_Filter_FilterInterface::accept()
     * @param SetaPDF_Extractor_TextItem $textItem
     * @return bool|string
     * @throws SetaPDF_Extractor_Exception
     */
    public function accept(SetaPDF_Extractor_TextItem $textItem)
    {
        if ($this->_mode === self::MODE_CONTACT) {
            return $this->_contact($textItem)
                ? ($this->_id !== null ? $this->_id : true)
                : false;
        } elseif ($this->_mode === self::MODE_CONTAINS) {
            return $this->_contains($textItem)
                ? ($this->_id !== null ? $this->_id : true)
                : false;
        }

        throw new SetaPDF_Extractor_Exception('Unknown filter mode: "' . $this->_mode . '"');
    }

    /**
     * Checks whether the rectangle contains the item or not.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     * @return bool
     */
    public function _contains(SetaPDF_Extractor_TextItem $textItem)
    {
        $rectangle = $this->getRectangle();

        if (!$rectangle->contains($textItem->getLl()->toPoint())) {
            return false;
        }

        if (!$rectangle->contains($textItem->getUl()->toPoint())) {
            return false;
        }

        if (!$rectangle->contains($textItem->getUr()->toPoint())) {
            return false;
        }

        if (!$rectangle->contains($textItem->getLr()->toPoint())) {
            return false;
        }

        return true;
    }

    /**
     * Checks whether the rectangle and the text items contacting each other.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     * @return bool
     */
    public function _contact(SetaPDF_Extractor_TextItem $textItem)
    {
        $rectangle = $this->getRectangle();

        // check if a point is in the rectangle
        if ($rectangle->contains($textItem->getLl()->toPoint())) {
            return true;
        }

        if ($rectangle->contains($textItem->getUr()->toPoint())) {
            return true;
        }

        if ($rectangle->contains($textItem->getLr()->toPoint())) {
            return true;
        }

        if ($rectangle->contains($textItem->getUl()->toPoint())) {
            return true;
        }

        // check the other way. Because a text item can be rotated we re-create new points
        $difference = $textItem->getBaseLineStart()->subtract($textItem->getBaseLineEnd());
        if ($difference->getY() != 0) {
            $ll = new SetaPDF_Core_Geometry_Point(
                min(
                    $textItem->getLl()->getX(),
                    $textItem->getUl()->getX(),
                    $textItem->getUr()->getX(),
                    $textItem->getLr()->getX()
                ),
                min(
                    $textItem->getLl()->getY(),
                    $textItem->getUl()->getY(),
                    $textItem->getUr()->getY(),
                    $textItem->getLr()->getY()
                )
            );

            $ur = new SetaPDF_Core_Geometry_Point(
                max(
                    $textItem->getLl()->getX(),
                    $textItem->getUl()->getX(),
                    $textItem->getUr()->getX(),
                    $textItem->getLr()->getX()
                ),
                max(
                    $textItem->getLl()->getY(),
                    $textItem->getUl()->getY(),
                    $textItem->getUr()->getY(),
                    $textItem->getLr()->getY()
                )
            );
        } else {
            $ll = $textItem->getLl()->toPoint();
            $ur = $textItem->getUr()->toPoint();
        }

        try {
            $textRect = new SetaPDF_Core_Geometry_Rectangle($ll, $ur);
        } catch (InvalidArgumentException $e) {
            return false;
        }

        if ($rectangle->intersect($textRect)) {
            return true;
        }

        return false;
    }
}
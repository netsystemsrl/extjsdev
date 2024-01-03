<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Bounds.php 1079 2017-08-14 15:00:15Z timo.scholz $
 */

/**
 * Resulting bounds.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Result_Bounds
{
    /**
     * The bound points.
     *
     * @var SetaPDF_Core_Geometry_Point[]
     */
    protected $_data;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Geometry_Point $ll
     * @param SetaPDF_Core_Geometry_Point $ul
     * @param SetaPDF_Core_Geometry_Point $ur
     * @param SetaPDF_Core_Geometry_Point $lr
     */
    public function __construct(
        SetaPDF_Core_Geometry_Point $ll,
        SetaPDF_Core_Geometry_Point $ul,
        SetaPDF_Core_Geometry_Point $ur,
        SetaPDF_Core_Geometry_Point $lr
    )
    {
        $this->_data = array(
            'll' => $ll,
            'ul' => $ul,
            'ur' => $ur,
            'lr' => $lr
        );
    }

    /**
     * Get the lower left point.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getLl()
    {
        return $this->_data['ll'];
    }

    /**
     * Get the upper left point.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getUl()
    {
        return $this->_data['ul'];
    }

    /**
     * Get the upper right point.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getUr()
    {
        return $this->_data['ur'];
    }

    /**
     * Get the lower right point.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getLr()
    {
        return $this->_data['lr'];
    }

    /**
     * Get a rectangle instance for this bounds.
     *
     * The rectanlge is not rotated and will contain the most outer points.
     *
     * @return SetaPDF_Core_Geometry_Rectangle
     */
    public function getRectangle()
    {
        $llx = min(
            $this->getLl()->getX(),
            $this->getUl()->getX(),
            $this->getUr()->getX(),
            $this->getLr()->getX()
        );

        $lly = min(
            $this->getLl()->getY(),
            $this->getUl()->getY(),
            $this->getUr()->getY(),
            $this->getLr()->getY()
        );

        $urx = max(
            $this->getLl()->getX(),
            $this->getUl()->getX(),
            $this->getUr()->getX(),
            $this->getLr()->getX()
        );

        $ury = max(
            $this->getLl()->getY(),
            $this->getUl()->getY(),
            $this->getUr()->getY(),
            $this->getLr()->getY()
        );

        return new SetaPDF_Core_Geometry_Rectangle(
            new SetaPDF_Core_Geometry_Point($llx, $lly),
            new SetaPDF_Core_Geometry_Point($urx, $ury)
        );
    }
}
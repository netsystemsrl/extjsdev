<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Rectangle.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a rectangle
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Geometry_Rectangle implements SetaPDF_Core_Geometry_Collidable
{
    /**
     * ll => lower left
     * ur => upper right
     *
     * @var float
     */
    private $_llX, $_llY, $_urX, $_urY;

    /**
     * The constructor.
     *
     * There three ways to create a rectangle:
     *
     * <code>
     * - 2 params   SetaPDF_Core_Geometry_Point $a  point1
     *              SetaPDF_Core_Geometry_Point $b  point2
     *
     * - 3 params   SetaPDF_Core_Geometry_Point $a pointLL
     *              int|float $b width
     *              int|float $c height
     *
     * - 4 params   int|float $a x of point1
     *              int|float $b y of point1
     *              int|float $c x of point2
     *              int|float $d y of point2
     * </code>
     *
     * @param int|float|SetaPDF_Core_Geometry_Point $a point1 OR pointLL OR x of point1
     * @param int|float|SetaPDF_Core_Geometry_Point $b point2 OR width OR y of point1
     * @param int|float $c height OR x of point2
     * @param int|float $d none OR y of point2
     * @throws InvalidArgumentException
     */
    public function __construct($a, $b, $c = null, $d = null)
    {
        if ($a instanceof SetaPDF_Core_Geometry_Point && $b instanceof SetaPDF_Core_Geometry_Point) {
            $point1 = $a;
            $point2 = $b;

            $x1 = $point1->getX();
            $y1 = $point1->getY();
            $x2 = $point2->getX();
            $y2 = $point2->getY();
        } else if ($a instanceof SetaPDF_Core_Geometry_Point) {
            $ll = $a;
            $width = $b;
            $height = $c;

            if (!is_numeric($width) || !is_numeric($height) || $width <= 0 || $height <= 0) {
                throw new InvalidArgumentException('width and height need to be positive numerics');
            }

            $x1 = $ll->getX();
            $y1 = $ll->getY();
            $x2 = $x1 + $width;
            $y2 = $y1 + $height;
        } else {
            $x1 = $a;
            $y1 = $b;
            $x2 = $c;
            $y2 = $d;
        }

        $this->init($x1, $y1, $x2, $y2);
    }

    /**
     * Reset the complete rectangle by using two opposite points of the new rectangle.
     *
     * @param int|float $x1
     * @param int|float $y1
     * @param int|float $x2
     * @param int|float $y2
     * @throws InvalidArgumentException
     */
    public function init($x1, $y1, $x2, $y2)
    {
        if (!is_numeric($x1) || !is_numeric($y1) && !is_numeric($x2) && !is_numeric($y2)) {
            throw new InvalidArgumentException('the params need to be numeric');
        }

        if ($x2 < $x1) {
            $t = $x1;
            $x1 = $x2;
            $x2 = $t;
            unset($t);
        }

        if ($y2 < $y1) {
            $t = $y1;
            $y1 = $y2;
            $y2 = $t;
            unset($t);
        }

        $this->_llX = (float)$x1;
        $this->_llY = (float)$y1;
        $this->_urX = (float)$x2;
        $this->_urY = (float)$y2;
    }

    /**
     * Set the height of the rectangle.
     *
     * The lower left point couldn't be moved by this method.
     *
     * @param int|float $height
     * @throws InvalidArgumentException
     */
    public function setHeight($height)
    {
        if (!is_numeric($height) || $height < 0) {
            throw new InvalidArgumentException('height need to be positive numeric');
        }

        $this->_urY = (float)$this->_llY + $height;
    }

    /**
     * Set the width of the rectangle.
     *
     * The lower left point couldn't be moved by this method.
     *
     * @param int|float $width
     * @throws InvalidArgumentException
     */
    public function setWidth($width)
    {
        if (!is_numeric($width) || $width < 0) {
            throw new InvalidArgumentException('width need to be positive numeric');
        }

        $this->_urX = (float)$this->_llX + $width;
    }

    /**
     * Set the width and the height of the rectangle.
     *
     * The lower left point couldn't be moved by this method.
     *
     * @param int|float $width
     * @param int|float $height
     * @throws InvalidArgumentException
     */
    public function setDimensions($width, $height)
    {
        if (!is_numeric($width) || !is_numeric($height) || $width < 0 || $height < 0) {
            throw new InvalidArgumentException('width and height need to be positive numerics');
        }

        $this->_urX = (float)$this->_llX + $width;
        $this->_urY = (float)$this->_llY + $height;
    }

    /**
     * Set the lower left point of the rectangle.
     *
     * If you don't move this point over the x of the lower right or the y of the upper left this point stay the lower left.
     *
     * If you move this point over only one of them, this point will replace them and the other point will be lower left.
     *
     * If you move this point over both(x and y), this point will be the new upper right and upper right the new lower left.
     *
     * @param int|float|SetaPDF_Core_Geometry_Point $a
     * @param int|float $b
     */
    public function setLl($a, $b = null)
    {
        if ($a instanceof SetaPDF_Core_Geometry_Point) {
            $x1 = $a->getX();
            $y1 = $a->getY();
        } else {
            $x1 = $a;
            $y1 = $b;
        }

        $x2 = $this->_urX;
        $y2 = $this->_urY;

        $this->init($x1, $y1, $x2, $y2);
    }

    /**
     * Set the lower right point of the rectangle.
     *
     * @see setLl()
     * @param int|float|SetaPDF_Core_Geometry_Point $a
     * @param int|float $b
     */
    public function setLr($a, $b = null)
    {
        if ($a instanceof SetaPDF_Core_Geometry_Point) {
            $x2 = $a->getX();
            $y1 = $a->getY();
        } else {
            $x2 = $a;
            $y1 = $b;
        }

        $x1 = $this->_llX;
        $y2 = $this->_urY;

        $this->init($x1, $y1, $x2, $y2);
    }

    /**
     * Set the upper left point of the rectangle.
     *
     * @see setLl()
     * @param int|float|SetaPDF_Core_Geometry_Point $a
     * @param int|float $b
     */
    public function setUl($a, $b = null)
    {
        if ($a instanceof SetaPDF_Core_Geometry_Point) {
            $x1 = $a->getX();
            $y2 = $a->getY();
        } else {
            $x1 = $a;
            $y2 = $b;
        }

        $y1 = $this->_llY;
        $x2 = $this->_urX;

        $this->init($x1, $y1, $x2, $y2);
    }

    /**
     * Set the upper right point of the rectangle.
     *
     * @see setLl()
     * @param int|float|SetaPDF_Core_Geometry_Point $a
     * @param int|float $b
     */
    public function setUr($a, $b = null)
    {
        if ($a instanceof SetaPDF_Core_Geometry_Point) {
            $x2 = $a->getX();
            $y2 = $a->getY();
        } else {
            $x2 = $a;
            $y2 = $b;
        }

        $x1 = $this->_llX;
        $y1 = $this->_llY;

        $this->init($x1, $y1, $x2, $y2);
    }

    /**
     * Returns the lower left point of the rectangle.
     *
     * Note: changing the returned point object don't changing the rectangle.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getLl()
    {
        return new SetaPDF_Core_Geometry_Point($this->_llX, $this->_llY);
    }

    /**
     * Returns the lower right point of the rectangle.
     *
     * Note: changing the returned point object don't changing the rectangle.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getLr()
    {
        return new SetaPDF_Core_Geometry_Point($this->_urX, $this->_llY);
    }

    /**
     * Returns the upper left point of the rectangle.
     *
     * Note: changing the returned point object don't changing the rectangle.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getUl()
    {
        return new SetaPDF_Core_Geometry_Point($this->_llX, $this->_urY);
    }

    /**
     * Returns the upper right point of the rectangle.
     *
     * Note: changing the returned point object don't changing the rectangle.
     *
     * @return SetaPDF_Core_Geometry_Point
     */
    public function getUr()
    {
        return new SetaPDF_Core_Geometry_Point($this->_urX, $this->_urY);
    }

    /**
     * Returns the actual width of the rectangle.
     *
     * @return float
     */
    public function getWidth()
    {
        return ($this->_urX - $this->_llX);
    }

    /**
     * Returns the actual height of the rectangle.
     *
     * @return float
     */
    public function getHeight()
    {
        return ($this->_urY - $this->_llY);
    }

    /**
     * Returns the width and height of the rectangle.
     *
     * @return array
     */
    public function getDimensions()
    {
        return ['width' => $this->getWidth(), 'height' => $this->getHeight()];
    }

    /**
     * Checks whether a point is inside or on the border of this rectangle.
     *
     * @param int|float $x
     * @param int|float $y
     * @param boolean $ignoreEqual If the point lays on the border and this is true false will returned
     * @return boolean
     */
    private function _pointInside($x, $y, $ignoreEqual = false)
    {
        if ($ignoreEqual) {
            return (
                $x > $this->_llX && $x < $this->_urX
                && $y > $this->_llY && $y < $this->_urY
            );
        }

        return (
            $x >= $this->_llX && $x <= $this->_urX
            && $y >= $this->_llY && $y <= $this->_urY
        );
    }

    /**
     * Checks whether this rectangle contains another geometric object.
     *
     * @param SetaPDF_Core_Geometry_Point|SetaPDF_Core_Geometry_Rectangle $geometry
     * @return boolean
     * @throws InvalidArgumentException
     */
    public function contains($geometry)
    {
        if (!is_object($geometry)) {
            throw new InvalidArgumentException('Invalid param');
        }

        if ($geometry instanceof SetaPDF_Core_Geometry_Point) {
            $x = $geometry->getX();
            $y = $geometry->getY();

            $result = $this->_pointInside($x, $y);

        } else if ($geometry instanceof SetaPDF_Core_Geometry_Rectangle) {
            $ll = $geometry->getLl();
            $ur = $geometry->getUr();

            $x1 = $ll->getX();
            $y1 = $ll->getY();
            $x2 = $ur->getX();
            $y2 = $ur->getY();

            $result = ($this->_pointInside($x1, $y1) && $this->_pointInside($x2, $y2));

        } else {
            throw new InvalidArgumentException('Invalid param');
        }

        return $result;
    }

    /**
     * Checks whether the geometry shape intersect this rectangle.
     *
     * @param SetaPDF_Core_Geometry_Rectangle $geometry
     * @return boolean
     * @throws InvalidArgumentException
     */
    public function intersect($geometry)
    {
        switch (1) {
            case $geometry instanceof SetaPDF_Core_Geometry_Rectangle:
                return $this->getLl()->getX() < $geometry->getLr()->getX() &&
                    $this->getLr()->getX() > $geometry->getLl()->getX() &&
                    $this->getLl()->getY() < $geometry->getUl()->getY() &&
                    $this->getUl()->getY() > $geometry->getLl()->getY();
        }

        throw new InvalidArgumentException('Invalid parameter.');
    }

    /**
     * Scale the rectangle by a value into all directions.
     *
     * @param float $by
     * @return SetaPDF_Core_Geometry_Rectangle
     */
    public function scale($by)
    {
        $llX = $this->_llX - (float)$by;
        $llY = $this->_llY - (float)$by;
        $urX = $this->_urX + (float)$by;
        $urY = $this->_urY + (float)$by;

        $this->init($llX, $llY, $urX, $urY);

        return $this;
    }

    /**
     * Scales the rectangle by a value on the x directon.
     *
     * @param float $by
     * @return SetaPDF_Core_Geometry_Rectangle
     */
    public function scaleX($by)
    {
        $ll = $this->getLl();
        $ur = $this->getUr();
        $llX = $ll->getX() - (float)$by;
        $urX = $ur->getX() + (float)$by;

        $this->init($llX, $ll->getY(), $urX, $ur->getY());

        return $this;
    }

    /**
     * Scales the rectangle by a value on the y directon.
     *
     * @param float $by
     * @return SetaPDF_Core_Geometry_Rectangle
     */
    public function scaleY($by)
    {
        $ll = $this->getLl();
        $ur = $this->getUr();
        $llY = $ll->getY() - (float)$by;
        $urY = $ur->getY() + (float)$by;

        $this->init($ll->getX(), $llY, $ur->getX(), $urY);

        return $this;
    }

    /**
     * @inheritdoc
     */
    public function collides(SetaPDF_Core_Geometry_Collidable $geometry)
    {
        if ($geometry instanceof SetaPDF_Core_Geometry_Rectangle) {
            return $this->getLl()->getX() <= $geometry->getLr()->getX() &&
                $this->getLr()->getX() >= $geometry->getLl()->getX() &&
                $this->getLl()->getY() <= $geometry->getUl()->getY() &&
                $this->getUl()->getY() >= $geometry->getLl()->getY();
        } elseif ($geometry instanceof SetaPDF_Core_Geometry_Point) {
            return $this->contains($geometry);
        }

        throw new InvalidArgumentException(get_class($this) . ' cannot collide with ' . get_class($geometry));
    }
}
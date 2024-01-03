<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Vector.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a vecotr.
 *
 * Internally the matrix is represented as a 3x3 matrix.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Geometry_Vector
{
    /**
     * The X value.
     *
     * @var float
     */
    protected $_x;

    /**
     * The Y value.
     *
     * @var float
     */
    protected $_y;

    /**
     * The Z value.
     *
     * @var float
     */
    protected $_z;

    /**
     * Creates an instance by an array.
     *
     * @param array $array
     * @return SetaPDF_Core_Geometry_Vector
     */
    static public function byArray(array $array)
    {
        if (count($array) !== 3) {
            throw new InvalidArgumentException('Argument needs to be an array of 3 values.');
        }

        $values = array_values($array);

        return new self($values[0], $values[1], $values[2]);
    }

    /**
     * Creates an instance by a point.
     *
     * @param SetaPDF_Core_Geometry_Point $point
     * @return SetaPDF_Core_Geometry_Vector
     */
    static public function byPoint(SetaPDF_Core_Geometry_Point $point)
    {
        return new self($point->getX(), $point->getY(), 0);
    }

    /**
     * The constructor.
     *
     * @param integer|float $x
     * @param integer|float $y
     * @param integer|float $z
     */
    public function __construct($x = .0, $y = .0, $z = .0)
    {
        $this->_x = (float)$x;
        $this->_y = (float)$y;
        $this->_z = (float)$z;
    }

    /**
     * Get the value of X.
     *
     * @return float
     */
    public function getX()
    {
        return $this->_x;
    }

    /**
     * Get the value of Y.
     *
     * @return float
     */
    public function getY()
    {
        return $this->_y;
    }

    /**
     * Get the value of Z.
     *
     * @return float
     */
    public function getZ()
    {
        return $this->_z;
    }

    /**
     * Add a vector to this vector and return the resulting vector.
     *
     * @param SetaPDF_Core_Geometry_Vector $vector
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function add(SetaPDF_Core_Geometry_Vector $vector)
    {
        $x = $this->_x + $vector->_x;
        $y = $this->_y + $vector->_y;
        $z = $this->_z + $vector->_z;

        return new self($x, $y, $z);
    }

    /**
     * Subtract a vector from this vector and return the resulting vector.
     *
     * @param SetaPDF_Core_Geometry_Vector $vector
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function subtract(SetaPDF_Core_Geometry_Vector $vector)
    {
        $x = $this->_x - $vector->_x;
        $y = $this->_y - $vector->_y;
        $z = $this->_z - $vector->_z;

        return new self($x, $y, $z);
    }

    /**
     * Multiply the vector with a float value or a matrix and return the resulting vector.
     *
     * @param float|integer|SetaPDF_Core_Geometry_Matrix $with
     * @return SetaPDF_Core_Geometry_Vector
     * @TODO Rewrite to 2 methods mulitply() and multiplyWithMatrix() with type hints.
     */
    public function multiply($with)
    {
        if ($with instanceof SetaPDF_Core_Geometry_Matrix) {
            $x = $with->getA() * $this->_x + $with->getC() * $this->_y + $with->getE();
            $y = $with->getB() * $this->_x + $with->getD() * $this->_y + $with->getF();
            $z = $this->_z;
        } else {
            $with = (float)$with;
            $x = $this->_x * $with;
            $y = $this->_y * $with;
            $z = $this->_z * $with;
        }

        return new self($x, $y, $z);
    }

    /**
     * Devide the vector by a float value and return the resulting vector.
     *
     * @param float|integer $by
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function divide($by)
    {
        $by = (float)$by;
        if ($by === 0.0) {
            throw new InvalidArgumentException('Division by zero.');
        }
        $x = $this->_x / $by;
        $y = $this->_y / $by;
        $z = $this->_z / $by;

        return new self($x, $y, $z);
    }

    /**
     * Compute the cross product of this and another vector and return the resulting vector.
     *
     * @param $with
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function cross($with)
    {
        if ($with instanceof SetaPDF_Core_Geometry_Vector) {
            $x = $this->_y * $with->_z - $this->_z * $with->_y;
            $y = $this->_z * $with->_x - $this->_x * $with->_z;
            $z = $this->_x * $with->_y - $this->_y * $with->_x;

        } elseif ($with instanceof SetaPDF_Core_Geometry_Matrix) {
            throw new InvalidArgumentException('Matrix not implemented yet.');
            #$x = 0;
            #$y = 0;
            #$z = 0;

        } else {
            throw new InvalidArgumentException('Vector or Matrix instance needed.');
        }

        return new self($x, $y, $z);
    }

    /**
     * Computes the scalar/dot/inner product of this and another vector.
     *
     * @param SetaPDF_Core_Geometry_Vector $with
     * @return float
     */
    public function scalar(SetaPDF_Core_Geometry_Vector $with)
    {
        return $this->_x * $with->_x + $this->_y * $with->_y + $this->_z * $with->_z;
    }

    /**
     * Normalize the vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function normalize()
    {
        $length = $this->getLength();
        return $this->divide($length);
    }

    /**
     * Get the length of the vector.
     *
     * @return float
     */
    public function getLength()
    {
        return sqrt($this->getLengthSquared());
    }

    /**
     * Get the squared length of the vector.
     *
     * @return float
     */
    public function getLengthSquared()
    {
        return $this->_x * $this->_x + $this->_y * $this->_y + $this->_z * $this->_z;
    }

    /**
     * Get all vector values.
     *
     * @return array
     */
    public function getValues()
    {
        return array(
            'x' => $this->_x,
            'y' => $this->_y,
            'z' => $this->_z
        );
    }

    /**
     * @return SetaPDF_Core_Geometry_Point
     */
    public function toPoint()
    {
        return new SetaPDF_Core_Geometry_Point($this->_x, $this->_y);
    }
}
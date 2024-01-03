<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Matrix.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a transformation matrix of six elements.
 *
 * Internally the matrix is represented as a 3x3 matrix.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Geometry_Matrix
{
    /**
     * Matrix value a
     *
     * @var float|int
     */
    protected $_a = 1;

    /**
     * Matrix value b
     *
     * @var float|int
     */
    protected $_b = 0;

    /**
     * Matrix value c
     *
     * @var float|int
     */
    protected $_c = 0;

    /**
     * Matrix value d
     *
     * @var float|int
     */
    protected $_d = 1;

    /**
     * Matrix value e
     *
     * @var float|int
     */
    protected $_e = 0;

    /**
     * Matrix value f
     *
     * @var float|int
     */
    protected $_f = 0;

    /**
     * The constructor.
     *
     * @param int|array $a
     * @param int $b
     * @param int $c
     * @param int $d
     * @param int $e
     * @param int $f
     */
    public function __construct($a = 1, $b = 0, $c = 0, $d = 1, $e = 0, $f = 0)
    {
        if (is_array($a) && count($a) === 6) {
            list($a, $b, $c, $d, $e, $f) = array_values($a);
        }

        $this->_a = (float)$a;
        $this->_b = (float)$b;
        $this->_c = (float)$c;
        $this->_d = (float)$d;
        $this->_e = (float)$e;
        $this->_f = (float)$f;
    }

    /**
     * Get the value of element A.
     *
     * @return mixed
     */
    public function getA()
    {
        return $this->_a;
    }

    /**
     * Get the value of element B.
     *
     * @return mixed
     */
    public function getB()
    {
        return $this->_b;
    }

    /**
     * Get the value of element C.
     *
     * @return mixed
     */
    public function getC()
    {
        return $this->_c;
    }

    /**
     * Get the value of element D.
     *
     * @return mixed
     */
    public function getD()
    {
        return $this->_d;
    }

    /**
     * Get the value of element E.
     *
     * @return mixed
     */
    public function getE()
    {
        return $this->_e;
    }

    /**
     * Get the value of element F.
     *
     * @return mixed
     */
    public function getF()
    {
        return $this->_f;
    }

    /**
     * Get all matrix elements values.
     *
     * @return array
     */
    public function getValues()
    {
        return array(
            $this->_a, $this->_b, 0 /* fixed */,
            $this->_c, $this->_d, 0 /* fixed */,
            $this->_e, $this->_f, 1 /* fixed */
        );
    }

    /**
     * Multiply the matrix by another matrix.
     *
     * @param SetaPDF_Core_Geometry_Matrix $by
     * @return SetaPDF_Core_Geometry_Matrix
     */
    public function multiply(SetaPDF_Core_Geometry_Matrix $by)
    {
        $a =
            $this->_a * $by->_a
            + $this->_b * $by->_c
            //+ 0 * $by->_e
        ;

        $b =
            $this->_a * $by->_b
            + $this->_b * $by->_d
            //+ 0 * $by->_f
        ;

        $c =
            $this->_c * $by->_a
            + $this->_d * $by->_c
            //+ 0 * $by->_e
        ;

        $d =
            $this->_c * $by->_b
            + $this->_d * $by->_d
            //+ 0 * $by->_f
        ;

        $e =
            $this->_e * $by->_a
            + $this->_f * $by->_c
            + /*1 * */$by->_e;

        $f =
            $this->_e * $by->_b
            + $this->_f * $by->_d
            + /*1 * */$by->_f;

        return new self($a, $b, $c, $d, $e, $f);
    }
}
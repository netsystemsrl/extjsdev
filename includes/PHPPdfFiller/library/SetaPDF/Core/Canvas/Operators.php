<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Operators.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract class for accessing canvas helper objects
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Canvas_Operators
{
    /**
     * The origin canvas object
     *
     * @var SetaPDF_Core_Canvas
     */
    protected $_canvas;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Canvas $canvas
     */
    public function __construct(SetaPDF_Core_Canvas $canvas)
    {
        $this->_canvas = $canvas;
    }

    /**
     * Release objects to free memory and cycled references.
     *
     * After calling this method the instance of this object is unusable!
     *
     * @return void
     */
    public function cleanUp()
    {
        $this->_canvas = null;
    }

    /**
     * Get the draw helper.
     *
     * @return SetaPDF_Core_Canvas_Draw
     */
    public function draw()
    {
        return $this->_canvas->draw();
    }

    /**
     * Get the path helper.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function path()
    {
        return $this->_canvas->path();
    }

    /**
     * Get the text helper.
     *
     * @return SetaPDF_Core_Canvas_Text
     */
    public function text()
    {
        return $this->_canvas->text();
    }
}
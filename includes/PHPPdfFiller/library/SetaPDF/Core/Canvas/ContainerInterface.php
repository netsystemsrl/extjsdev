<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ContainerInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * An interface for objects which contains a canvas object.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Canvas_ContainerInterface
{
    /**
     * Get the indirect object of the container.
     *
     * This could be an object holding a dictionary or a stream.
     *
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function getObject();

    /**
     * Get the stream proxy object.
     *
     * @return SetaPDF_Core_Canvas_StreamProxyInterface
     */
    public function getStreamProxy();

    /**
     * Get the width for the canvas.
     *
     * @return float
     */
    public function getWidth();

    /**
     * Get the height for the canvas.
     *
     * @return float
     */
    public function getHeight();
}
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
 * Class representing a GIF image
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif extends SetaPDF_Core_Image
{
    /**
     * The GIF reader.
     *
     * @var SetaPDF_Core_Image_Gif_Reader
     */
    private $_reader;

    /**
     * The given frames.
     *
     * @var SetaPDF_Core_Image_Gif_Frame[]
     */
    private $_frames;

    /**
     * The frame that will get rendered when calling toXObject().
     *
     * @var int
     */
    private $_frame = 0;

    /**
     * Returns the total number of available frames.
     *
     * @return int
     */
    public function getFrameCount()
    {
        return count($this->_frames);
    }

    /**
     * Sets the active frame.
     *
     * @param int $value Numbering starts by zero.
     * @throws SetaPDF_Core_Image_Exception
     */
    public function setFrame($value)
    {
        if (!isset($this->_frames[$value])) {
            throw new SetaPDF_Core_Image_Exception('Frame index out of range.');
        }

        $this->_frame = $value;
    }

    /**
     * Get the active frame.
     *
     * @return int
     */
    public function getFrame()
    {
        return $this->_frame;
    }

    /**
     * Processes the image data.
     *
     * @throws SetaPDF_Core_Image_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    protected function _process()
    {
        $this->_binaryReader->reset(0, 10);
        $this->_reader = new SetaPDF_Core_Image_Gif_Reader($this->_binaryReader);
        $this->_frames = $this->_reader->createFrames();
        $this->_width = $this->_reader->screenDescriptor->width;
        $this->_height = $this->_reader->screenDescriptor->height;
    }

    /**
     * Converts an image to an external object.
     *
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_XObject_Image
     * @throws SetaPDF_Core_Image_Exception
     */
    public function toXObject(SetaPDF_Core_Document $document)
    {
        if (!isset($this->_frames[$this->_frame])) {
            throw new SetaPDF_Core_Image_Exception('Frame index out of range.');
        }

        return $this->_frames[$this->_frame]->toXObject($document);
    }
}
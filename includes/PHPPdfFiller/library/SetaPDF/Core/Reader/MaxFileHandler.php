<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: MaxFileHandler.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class that handles SetaPDF_Core_Reader_MaxFile instances.
 *
 * It is responsible for observing the open file handles and ensures that a specific limit is not reached by
 * setting other instances into sleep-mode.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Reader_MaxFileHandler
{
    /**
     * The reader instances
     *
     * @var SetaPDF_Core_Reader_MaxFile[]
     */
    protected $_instances = array();

    /**
     * Maximum open handles
     *
     * @var int
     */
    protected $_maxOpenHandles = 1000;

    /**
     * Currently open handles.
     *
     * @var int
     */
    protected $_openHandles = 0;

    /**
     * The constructor.
     *
     * @param int $maxOpenHandles
     */
    public function __construct($maxOpenHandles = 1000)
    {
        $this->setMaxOpenHandles($maxOpenHandles);
    }

    /**
     * Set the maximum open handles.
     *
     * @param int $maxOpenHandles
     */
    public function setMaxOpenHandles($maxOpenHandles)
    {
        $this->_maxOpenHandles = (int)$maxOpenHandles;
    }

    /**
     * Get the maximum open handles.
     *
     * @return int
     */
    public function getMaxOpenHandles()
    {
        return $this->_maxOpenHandles;
    }

    /**
     * Helper method to create a reader instance.
     *
     * @param $filename
     * @return SetaPDF_Core_Reader_MaxFile
     * @see SetaPDF_Core_Reader_MaxFile
     */
    public function createReader($filename)
    {
        $reader = new SetaPDF_Core_Reader_MaxFile($filename, $this);
        return $reader;
    }

    /**
     * Registers a reader instance.
     *
     * @param SetaPDF_Core_Reader_MaxFile $reader
     * @internal
     */
    public function registerReader(SetaPDF_Core_Reader_MaxFile $reader)
    {
        if ($reader->getHandler(false) !== $this) {
            throw new InvalidArgumentException('Reader instance is already attached to another handler!');
        }

        $this->_instances[spl_object_hash($reader)] = $reader;
    }

    /**
     * Unregisters a reader instance.
     *
     * @param SetaPDF_Core_Reader_MaxFile $reader
     * @internal
     */
    public function unregisterReader(SetaPDF_Core_Reader_MaxFile $reader)
    {
        if (!isset($this->_instances[spl_object_hash($reader)])) {
            return;
        }

        if (!$reader->isSleeping()) {
            $this->onHandleClosed();
        }

        unset($this->_instances[spl_object_hash($reader)]);
    }

    /**
     * Get all reader instances registered in this handler instance.
     *
     * @return SetaPDF_Core_Reader_MaxFile[]
     */
    public function getInstances()
    {
        return $this->_instances;
    }

    /**
     * Ensures a free handle.
     */
    public function ensureFreeHandle()
    {
        if ($this->_openHandles >= $this->_maxOpenHandles) {
            foreach ($this->_instances AS $instance) {
                if (!$instance->isSleeping()) {
                    $instance->sleep();
                    break;
                }
            }
        }
    }

    /**
     * Shall be triggered if a handle is opened.
     */
    public function onHandleOpened()
    {
        $this->_openHandles++;
    }

    /**
     * Shall be triggered if a handle is closed.
     */
    public function onHandleClosed()
    {
        $this->_openHandles--;
    }

    /**
     * Get the currently opened handles count.
     *
     * @return int
     */
    public function getOpenHandles()
    {
        return $this->_openHandles;
    }
}
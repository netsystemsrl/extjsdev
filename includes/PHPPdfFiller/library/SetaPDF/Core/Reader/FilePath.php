<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FilePath.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A simple class representing a file path.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Reader_FilePath
{
    /**
     * The file path
     *
     * @var string
     */
    protected $_path;

    /**
     * The constructor
     *
     * @param string $path
     */
    public function __construct($path)
    {
        $this->setPath($path);
    }

    /**
     * Set the path.
     *
     * @param string $path
     */
    public function setPath($path)
    {
        $this->_path = (string)$path;
    }

    /**
     * Get the path.
     *
     * @return string
     */
    public function getPath()
    {
        return $this->_path;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->_path;
    }
}
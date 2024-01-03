<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Record.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A record in a TrueType file
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_Record
{
    /**
     * The true type file
     *
     * @var SetaPDF_Core_Font_TrueType_File
     */
    protected $_file;

    /**
     * The offset of the table
     *
     * @var integer
     */
    protected $_offset;

    /**
     * The length of the table
     *
     * @var null|integer
     */
    protected $_length;

    /**
     * The class name representing this type of table
     *
     * @var null|string
     */
    protected $_className;

    /**
     * The table instance
     *
     * @var SetaPDF_Core_Font_TrueType_Table
     */
    protected $_table;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_File $file
     * @param integer $offset
     * @param null|integer $length
     * @param null|string $className
     */
    public function __construct(
        SetaPDF_Core_Font_TrueType_File $file,
        $offset,
        $length = null,
        $className = null
    )
    {
        $this->_file = $file;
        $this->_offset = $offset;
        $this->_length = $length;
        $this->_className = $className;
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        if ($this->_table !== null) {
            $this->_table->cleanUp();
            $this->_table = null;
        }
    }

    /**
     * Get the TrueType file.
     *
     * @return SetaPDF_Core_Font_TrueType_File
     */
    public function getFile()
    {
        return $this->_file;
    }

    /**
     * Get the table offset.
     *
     * @return int
     */
    public function getOffset()
    {
        return $this->_offset;
    }

    /**
     * Get the length of the table.
     *
     * @return int|null
     */
    public function getLength()
    {
        return $this->_length;
    }

    /**
     * Get the class name for this type of table.
     *
     * @return null|string
     */
    public function getClassName()
    {
        return $this->_className;
    }

    /**
     * Get the table instance for this record.
     *
     * @return SetaPDF_Core_Font_TrueType_Table
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getTable()
    {
        if (null !== $this->_table) {
            return $this->_table;
        }

        if (class_exists($this->_className)) {
            $this->_table = new $this->_className($this);
            return $this->_table;
        }

        throw new SetaPDF_Exception_NotImplemented(
            sprintf('Access to this table is not implemented.')
        );
    }
}
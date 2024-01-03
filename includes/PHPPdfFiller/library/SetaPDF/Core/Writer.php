<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Writer.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class for writer constants and short hand writer object
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer
    implements SetaPDF_Core_WriteInterface
{
    /**
     * Writer status flag
     *
     * @var integer
     */
    const ACTIVE = 1;

    /**
     * Writer status flag
     *
     * @var integer
     */
    const INACTIVE = 0;

    /**
     * Writer status flag
     *
     * @var integer
     */
    const FINISHED = -1;

    /**
     * Writer status flag
     *
     * @var integer
     */
    const CLEANED_UP = -2;

    /**
     * The content of the writer
     *
     * @var string
     */
    public $content = '';

    /**
     * Writes bytes to the output.
     *
     * @param string $bytes
     */
    public function write($bytes)
    {
        $this->content .= $bytes;
    }

    /**
     * Implementation of the __toString method.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->content;
    }

}
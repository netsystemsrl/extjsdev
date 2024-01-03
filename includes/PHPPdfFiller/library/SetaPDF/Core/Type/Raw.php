<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Owner.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a raw PDF type.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_Raw
{
    /**
     * @var string
     */
    public $type;

    /**
     * @var mixed
     */
    public $value;

    /**
     * The constructor.
     *
     * @param integer $type
     * @param mixed $value
     */
    public function __construct($type = null, $value = null)
    {
        $this->type = $type;
        $this->value = $value;
    }
}
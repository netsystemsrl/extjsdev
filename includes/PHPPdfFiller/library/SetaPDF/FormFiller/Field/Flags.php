<?php 
/**
 * This file is part of the SetaPDF-FormFiller Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Flags.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing named form field flags
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller_Field_Flags
{
  /* Field Flags for all field types */
    /**
     * Constant defines that a field is readonly
     *
     * @var int
     */
    const READ_ONLY =               0x01;         // 1

    /**
     * Constant defines that a field is required
     *
     * @var int
     */
    const REQUIRED =                0x02;         // 2

    /**
     * Constant defines that a field can not be exported
     *
     * @var int
     */
    const NO_EXPORT =               0x04;         // 3
    
  /* Field flags for Button Fields */

    /**
     * Constant defines that a button field can not be toggled to off
     *
     * @var int
     */
    const NO_TOGGLE_TO_OFF =        0x4000;       // 15

    /**
     * Constant defines that a button field is a radiobutton
     *
     * @var int
     */
    const RADIO =                   0x8000;       // 16

    /**
     * Constant defines that a button field is a pushbutton
     *
     * @var int
     */
    const PUSHBUTTON =              0x010000;     // 17

    /**
     * Constant defines that a button field is a pushbutton
     *
     * @var int
     */
    const RADIOS_IN_UNISON =        0x02000000;   // 26
    
  /* Field flags for Text Fields */

    /**
     * Constant defines that a text field is a multiline text field
     *
     * @var int
     */
    const MULTILINE =               0x1000;       // 13

    /**
     * Constant defines that a text field is a password text field
     *
     * @var int
     */
    const PASSWORD =                0x2000;       // 14

    /**
     * Constant defines that a text field is a file select field
     *
     * @var int
     */
    const FILE_SELECT =             0x100000;     // 21

    /**
     * Constant defines that a text field should not be spell checked
     *
     * @var int
     */
    const DO_NOT_SPELL_CHECK =      0x400000;     // 23

    /**
     * Constant defines that a text field can not be scrolled
     *
     * @var int
     */
    const DO_NOT_SCROLL =           0x800000;     // 24

    /**
     * Constant defines that a text field is a comb text field
     *
     * @var int
     */
    const COMB =                    0x01000000;   // 25

    /**
     * Constant defines that a text field is a rich text text field
     *
     * @var int
     */
    const RICH_TEXT =               0x02000000;   // 26
    
  /* Field flags for Choice Fields */
    /**
     * Constant defines that a choice field is a combo field
     *
     * @var int
     */
    const COMBO =                   0x020000;     // 18

    /**
     * Constant defines that a choice field is editable
     *
     * @var int
     */
    const EDIT =                    0x040000;     // 19

    /**
     * Constant defines that a choice field is sortable
     *
     * @var int
     */
    const SORT =                    0x080000;     // 20

    /**
     * Constant defines that a choice field allows multiselection
     *
     * @var int
     */
    const MULTI_SELECT =            0x200000;     // 22

    /**
     * Constant defines that a choice field is committed on selection change
     *
     * @var int
     */
    const COMMIT_ON_SEL_CHANGE =    0x04000000;   // 27  

    /**
     * Prohibit object initiation by defining the constructor to be private.
     *
     * @internal
     */
    private function __construct()
    {
    }
}
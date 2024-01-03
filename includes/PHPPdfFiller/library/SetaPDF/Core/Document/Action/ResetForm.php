<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ResetForm.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a reset-form action
 *
 * Set fields to their default values.
 * See PDF 32000-1:2008 - 12.7.5.3 Reset-Form Action
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_ResetForm extends SetaPDF_Core_Document_Action
{
    /**
     * Action flag
     */
    const FLAG_EXCLUDE = 0x01; // 1

    /**
     * Create a Named Action dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary()
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('ResetForm', true));

        return $dictionary;
    }

    /**
     * The constructor.
     *
     * @param string|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $objectOrDictionary
     * @throws InvalidArgumentException
     */
    public function __construct($objectOrDictionary = null)
    {
        $dictionary = $objectOrDictionary instanceof SetaPDF_Core_Type_AbstractType
            ? $objectOrDictionary->ensure(true)
            : $objectOrDictionary;

        if (!($dictionary instanceof SetaPDF_Core_Type_Dictionary)) {
            $dictionary = $objectOrDictionary = self::createActionDictionary();
        }

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->getValue() !== 'ResetForm') {
            throw new InvalidArgumentException('The S entry in a reset-form action shall be "ResetForm".');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Set which fields to reset or which to exclude from resetting, depending on the setting of the Include/Exclude flag.
     *
     * @see setFlags()
     * @param array $fields An array of fully qualified names or an indirect object to a field dictionary
     * @param string $encoding The input encoding
     */
    public function setFields(array $fields = null, $encoding = 'UTF-8')
    {
        if (null === $fields) {
            $this->_actionDictionary->offsetUnset('Fields');
            return;
        }

        $array = new SetaPDF_Core_Type_Array();
        foreach ($fields AS $fieldname) {
            if ($fieldname instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
                $array[] = $fieldname;
            } else {
                $array[] = new SetaPDF_Core_Type_String(SetaPDF_Core_Encoding::toPdfString($fieldname, $encoding));
            }
        }

        $this->_actionDictionary->offsetSet('Fields', $array);
    }

    /**
     * Get the fields to include or exclude in the submission.
     *
     * @param string $encoding The output encoding
     * @return array|null An array of field names in the specific encoding
     */
    public function getFields($encoding = 'UTF-8')
    {
        if (!$this->_actionDictionary->offsetExists('Fields')) {
            return null;
        }

        $fieldnames = array();
        $array = $this->_actionDictionary->getValue('Fields')->ensure();
        foreach ($array AS $field) {
            if ($field instanceof SetaPDF_Core_Type_StringValue) {
                $fieldnames[] = SetaPDF_Core_Encoding::convertPdfString($field->getValue(), $encoding);
            } elseif ($field instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
                $field = $field->ensure();
                $fieldname = SetaPDF_Core_Document_Catalog_AcroForm::resolveFieldName($field);
                $fieldnames[] = SetaPDF_Core_Encoding::convert($fieldname, 'UTF-8', $encoding);
            }
        }

        return $fieldnames;
    }

    /**
     * Sets a flag or flags.
     *
     * @param integer $flags
     * @param boolean|null $add Add = true, remove = false, set = null
     */
    public function setFlags($flags, $add = true)
    {
        if (false === $add) {
            $this->unsetFieldFlags($flags);
            return;
        }

        $value = $this->_actionDictionary->getValue('Flags');
        if (null === $value) {
            $this->setFlag($flags);
        } else {
            if ($add === true) {
                $value->setValue($value->getValue() | $flags);
            } else {
                $value->setValue($flags);
            }
        }
    }

    /**
     * Removes a flag or flags.
     *
     * @param integer $flags
     */
    public function unsetFlags($flags)
    {
        $value = $this->_actionDictionary->getValue('Flags');
        if (null === $value)
            return;

        $value->setValue($value->getValue() & ~$flags);
    }

    /**
     * Returns the current flags.
     *
     * @return integer
     */
    public function getFlags()
    {
        $value = $this->_actionDictionary->getValue('Flags');
        if (null === $value) {
            return 0;
        }

        return $value->getValue();
    }

    /**
     * Checks if a specific flag is set.
     *
     * @param integer $flag
     * @return boolean
     */
    public function isFlagSet($flag)
    {
        return ($this->getFlags() & $flag) !== 0;
    }
}
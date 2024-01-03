<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: PushButton.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A push button field
 *
 * This class handles the access to a push button field.
 *
 * It has no functionality but only allows you to flatten, delete or access low level properties of the field.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller_Field_PushButton
    extends SetaPDF_FormFiller_Field_AbstractField
    implements SetaPDF_FormFiller_Field_FieldInterface
{
    /**
     * A push button field has no default value.
     *
     * @param string $encoding
     * @return null
     */
    public function getDefaultValue($encoding = 'UTF-8')
    {
        return null;
    }

    /**
     * Implementation of SetaPDF_FormFiller_Field_FieldInterface::setDefaultValue() - not usable!
     *
     * @param mixed $value
     * @param string $encoding
     * @throws BadMethodCallException
     * @internal
     */
    public function setDefaultValue($value, $encoding = 'UTF-8')
    {
        throw new BadMethodCallException('Setting a default value of a push button field is not possible.');
    }

    /**
     * A push button field has no value.
     *
     * @param string $encoding
     *
     * @return null|SetaPDF_Core_Type_Dictionary
     */
    public function getValue($encoding = 'UTF-8')
    {
        return null;
    }

    /**
     * Implementation of SetaPDF_FormFiller_Field_FieldInterface::setValue() - not usable!
     *
     * @param mixed $value
     * @throws BadMethodCallException
     * @internal
     */
    public function setValue($value)
    {
        throw new BadMethodCallException('Setting a value of a push button field is not possible.');
    }

    /**
     * Implementation of SetaPDF_FormFiller_Field_FieldInterface::recreateAppearance() - without functionality!
     * @internal
     */
    public function recreateAppearance()
    {
        // empty method body
    }

    /**
     * Get the reference to the normal appearance stream object.
     *
     * @return SetaPDF_Core_Type_IndirectObject|false
     */
    protected function _getAppearanceReference()
    {
        $ap = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'AP');
        if (!$ap || !$ap->offsetExists('N')) {
            return false;
        }

        // get the N entry
        return $ap->offsetGet('N')->getValue();
    }
}
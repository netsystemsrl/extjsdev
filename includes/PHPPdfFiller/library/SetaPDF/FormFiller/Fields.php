<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Fields.php 1328 2019-04-03 11:32:07Z jan.slabon $
 */

/**
 * Class allowing transparent access to form fields of a PDF document
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller_Fields implements Countable, Iterator, ArrayAccess
{
    /**
     * The form filler instance
     *
     * @var SetaPDF_FormFiller
     */
    protected $_formFiller;

    /**
     * The field instances
     *
     * @var array
     */
    protected $_fields = array();

    /**
     * An array of names of related fields
     *
     * @var array
     */
    protected $_relatedFields = array();

    /**
     * The pdf object of each form field / collection (at PDF level)
     *
     * @var array
     */
    protected $_fieldObjects = array();

    /**
     * Flag defines that the fields are read from the document
     *
     * @var boolean
     */
    protected $_fieldsRead = false;

    /**
     * Flag defines that the forwarding of setValue calls is active
     *
     * @var boolean
     */
    protected $_forwardValue = false;

    /**
     * Defines whether a delete or flatten action is done for all available fields.
     *
     * @var boolean
     */
    protected $_handleAllFieldsActive = false;

    /**
     * The constructor.
     *
     * @param SetaPDF_FormFiller $formFiller The form filler instance
     */
    public function __construct(SetaPDF_FormFiller $formFiller)
    {
        $this->_formFiller = $formFiller;
    }

    /**
     * Releases memory and resources.
     *
     * @return void
     */
    public function cleanUp()
    {
        foreach (array_keys(array_filter($this->_fields)) AS $fieldName) {
            $this->_fields[$fieldName]->cleanUp();
        }

        $this->_fields = array();
        $this->_fieldObjects = array();
        $this->_formFiller = null;
    }

    /**
     * Get the form filler instance.
     *
     * @return SetaPDF_FormFiller
     */
    public function getFormFiller()
    {
        return $this->_formFiller;
    }

    /**
     * Get all available field names.
     *
     * @return array
     */
    public function getNames()
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        return array_keys($this->_fieldObjects);
    }

    /**
     * Gets a single field by field name.
     *
     * @param string $name The name of the field
     * @param boolean $cache Cache the field instance in the fields object.
     * @return SetaPDF_FormFiller_Field_FieldInterface
     * @throws SetaPDF_FormFiller_Exception
     */
    public function get($name, $cache = true)
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        // Check if the field is already initiated
        if (isset($this->_fields[$name])) {
            return $this->_fields[$name];
        }

        if (!isset($this->_fieldObjects[$name])) {
            throw new SetaPDF_FormFiller_Exception(
                sprintf('Form field not found (%s)', $name)
            );
        }

        $fieldData = $this->_fieldObjects[$name];

        switch ($fieldData['type'])
        {
            case 'Btn':
                $field = new SetaPDF_FormFiller_Field_Button(
                    $this, $name, $fieldData['fieldObject'], $fieldData['originalName']
                );
                break;

            case 'BtnGroup':
                $field = new SetaPDF_FormFiller_Field_ButtonGroup($this, $name, $fieldData['firstFieldObject']);
                foreach ($fieldData['buttonFieldObjects'] AS $key => $buttonFieldObject) {
                    $field->addButton(
                        new SetaPDF_FormFiller_Field_Button($this, $name . '#' . $key, $buttonFieldObject, $name)
                    );
                }

                break;

            case 'Tx':
                $field = new SetaPDF_FormFiller_Field_Text(
                    $this, $name, $fieldData['fieldObject'], $fieldData['originalName']
                );

                break;

            case 'Ch':
                $className = 'SetaPDF_FormFiller_Field_List';
                if ($fieldData['fieldFlags'] & SetaPDF_FormFiller_Field_Flags::COMBO) {
                    $className = 'SetaPDF_FormFiller_Field_Combo';
                }

                $field = new $className(
                    $this, $name, $fieldData['fieldObject'], $fieldData['originalName']
                );

                break;

            case 'Sig':
                $field = new SetaPDF_FormFiller_Field_Signature(
                    $this, $name, $fieldData['fieldObject'], $fieldData['originalName']
                );

                break;

            case 'PushBtn':
                $field = new SetaPDF_FormFiller_Field_PushButton(
                    $this, $name, $fieldData['fieldObject'], $fieldData['originalName']
                );

                break;
            default:
                // should never be reached, because
                throw new SetaPDF_FormFiller_Exception('Unknown field type "' . $fieldData['type'] . '"');

        }

        if ($cache) {
            $this->_fields[$name] = $field;
        }

        return $field;
    }

    /**
     * Releases the cached instance of the field.
     *
     * @param string $name The field name.
     * @return bool Whether the cached instance was removed or not.
     */
    public function release($name)
    {
        if (isset($this->_fields[$name])) {
            $this->_fields[$name]->cleanUp();
            unset($this->_fields[$name]);

            return true;
        }

        return false;
    }

    /**
     * Get all available field objects.
     *
     * @param boolean $cache Cache the field instance in the fields object.
     * @return array
     */
    public function getAll($cache = true)
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        $fields = array();
        foreach ($this->_fieldObjects AS $name => $data) {
            $fields[$name] = $this->get($name, $cache);
        }

        return $fields;
    }

    /**
     * NOT IMPLEMENTED: Get form fields by a page number.
     *
     * @param integer $pageNo The page number
     * @throws SetaPDF_Exception_NotImplemented
     * @todo IMPLEMENT
     * @internal
     */
    public function getByPage($pageNo)
    {
        // TODO: Implement
        throw new SetaPDF_Exception_NotImplemented('Not implemented yet');
    }

    /** @noinspection PhpUnusedParameterInspection */
    /**
     * This method is called before a field is deleted.
     *
     * @param SetaPDF_FormFiller_Field_FieldInterface $field
     */
    public function beforeFieldFlattenOrDelete(SetaPDF_FormFiller_Field_FieldInterface $field)
    {
        $xfa = $this->_formFiller->getXfa();
        if ($xfa) {
            if (!$this->_handleAllFieldsActive) {
                throw new BadMethodCallException(
                    'It is impossible to delete/flatten single fields of an XFA form.'
                );
            }
        }
    }

    /**
     * This method is called when a field is deleted.
     *
     * @param SetaPDF_FormFiller_Field_FieldInterface $field The field instance that is deleted
     * @return void
     */
    public function onFieldDeleted(SetaPDF_FormFiller_Field_FieldInterface $field)
    {
        $name = $field->getQualifiedName();

        $fieldData = $this->_fieldObjects[$name];

        if (isset($this->_fields[$name])) {
            $this->_fields[$name]->cleanUp();
            unset($this->_fields[$name]);
        }

        unset($this->_fieldObjects[$name]);

        // Delete entry in relatedFields property
        if (isset($this->_relatedFields[$fieldData['originalName']])) {
            $key = array_search($name, $this->_relatedFields[$fieldData['originalName']]);
            unset($this->_relatedFields[$fieldData['originalName']][$key]);
        }
    }

    /**
     * Delete a field.
     *
     * @param null|string|SetaPDF_FormFiller_Field_FieldInterface $field The name or an instance of the field, or null to delete all fields
     * @return void
     */
    public function delete($field = null)
    {
        if (null === $field) {
            $this->_handleAllFieldsActive = true;

            $acroForm = $this->getFormFiller()->getAcroForm();
            if ($acroForm)
                $acroForm->removeXfaInformation();

            foreach ($this->getNames() AS $name) {
                $this->delete($name);
            }

            $this->_handleAllFieldsActive = false;
            return;
        }

        if (!($field instanceof SetaPDF_FormFiller_Field_FieldInterface))
            $field = $this->get($field);

        $field->delete();
    }

    /**
     * Flatten a field to the pages content stream.
     *
     * @param null|string|SetaPDF_FormFiller_Field_FieldInterface $field The name or an instance of the field, or null to flatten all fields
     * @return void
     */
    public function flatten($field = null)
    {
        if (null === $field) {
            $this->_handleAllFieldsActive = true;

            $acroForm = $this->getFormFiller()->getAcroForm();
            if ($acroForm)
                $acroForm->removeXfaInformation();

            foreach ($this->getNames() AS $name) {
                $this->get($name)->flatten();
            }

            $this->_handleAllFieldsActive = false;
            return;
        }

        if (!($field instanceof SetaPDF_FormFiller_Field_FieldInterface))
            $field = $this->get($field);

        $field->flatten();
    }

    /**
     * Reads the form field objects and prepares them for later usage.
     *
     * @return void
     */
    protected function _readFormFields()
    {
        $acroForm = $this->getFormFiller()->getAcroForm();
        if ($acroForm) {
            $fields = $acroForm->getTerminalFieldsObjects();

            $dir = dirname(__FILE__);
            $availableFieldTypes = array(
                'ButtonGroup' => is_readable($dir . '/Field/ButtonGroup.php'),
                'Text'        => is_readable($dir . '/Field/Text.php'),
                'List'        => is_readable($dir . '/Field/List.php'),
                'Button'      => is_readable($dir . '/Field/Button.php'),
                'PushButton'  => is_readable($dir . '/Field/PushButton.php'),
                'Signature'   => is_readable($dir . '/Field/Signature.php')
            );
            unset($dir);

            foreach ($fields AS $field) {
                $fieldsDict = $this->_formFiller->getDocument()->ensureObject($field)->ensure(true);

                // Acrobat adds such strange keys to a field dictionary if it encounters problems while deleting it
                if ($fieldsDict->offsetExists('removed') && $fieldsDict['removed']->ensure()->getValue() === true) {
                    continue;
                }

                $name = SetaPDF_Core_Document_Catalog_AcroForm::resolveFieldName($fieldsDict);

                $fieldType = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($fieldsDict, 'FT');
                if (null === $fieldType)
                    continue;

                $type = $fieldType->getValue();
                $fieldFlags = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute(
                    $fieldsDict, 'Ff', new SetaPDF_Core_Type_Numeric(0)
                )->getValue();

                // Jump over special fields
                if (
                    'Tx' === $type && ($fieldFlags & SetaPDF_FormFiller_Field_Flags::FILE_SELECT)
                ) {
                    continue;

                // Radio button
                } elseif ('Btn' === $type && $fieldFlags & SetaPDF_FormFiller_Field_Flags::RADIO) {
                    // Check if field type is available
                    if (false === $availableFieldTypes['ButtonGroup'] || isset($this->simulateLiteVersion)) {
                        continue;
                    }

                    if (!isset($this->_fieldObjects[$name])) {
                        $this->_fieldObjects[$name] = array(
                            'type' => 'BtnGroup',
                            'buttonFieldObjects' => array(),
                            'firstFieldObject' => $field,
                            'originalName' => $name
                        );
                    }

                    $this->_fieldObjects[$name]['buttonFieldObjects'][] = $field;

                // All other fields
                } else {
                    if ('Btn' === $type && $fieldFlags & SetaPDF_FormFiller_Field_Flags::PUSHBUTTON) {
                        $type = 'PushBtn';
                    }

                    // Check if field type is available
                    if (
                        'Tx'  === $type && false === $availableFieldTypes['Text']
                        || 'Ch'  === $type && (false === $availableFieldTypes['List'] || isset($this->simulateLiteVersion))
                        || 'Btn' === $type && (false === $availableFieldTypes['Button'] || isset($this->simulateLiteVersion))
                        || 'Sig' === $type && (false === $availableFieldTypes['Signature'] || isset($this->simulateLiteVersion))
                        || 'PushBtn' === $type && (false === $availableFieldTypes['PushButton'] || isset($this->simulateLiteVersion))
                    ) {
                        continue;
                    }

                    $originalName = $name;

                    // Only same field types could be related
                    if (isset($this->_fieldObjects[$name]) && $this->_fieldObjects[$name]['type'] !== $type) {
                        continue;
                    }

                    $i = 1;
                    while (isset($this->_fieldObjects[$name])) {
                        $name = $originalName . '#' . ($i++);
                    }

                    $this->_fieldObjects[$name] = array(
                        'type' => $type,
                        'fieldObject' => $field,
                        'fieldFlags' => $fieldFlags,
                        'originalName' => $originalName
                    );

                    if ($name !== $originalName) {
                        if (!isset($this->_relatedFields[$originalName]))
                            $this->_relatedFields[$originalName] = array($originalName);

                        $this->_relatedFields[$originalName][] = $name;
                    }
                }

                // prefill in the array for the final objects
                $this->_fields[$name] = null;
            }
        }

        $this->_fieldsRead = true;
    }

    /**
     * Get all names of related form fields.
     *
     * @param string|SetaPDF_FormFiller_Field_FieldInterface $field The name or an instance to get related form fields
     * @param boolean $leftOriginFieldName Left the origin passed field in the resulting array or not
     * @return string[]
     */
    public function getRelatedFieldNames($field, $leftOriginFieldName = true)
    {
        if (!($field instanceof SetaPDF_FormFiller_Field_FieldInterface))
            $field = $this->get($field);

        // The name including the suffix ("Text#1")
        $name = $field->getQualifiedName();
        // The original name ("Text")
        $originalName = $field->getOriginalQualifiedName();
        $relatedFieldNames = array();

        if (isset($this->_relatedFields[$originalName])) {
            foreach ($this->_relatedFields[$originalName] AS $relatedFieldName) {
                // Is it the field name, from the initial field, skip over
                if (true === $leftOriginFieldName && $relatedFieldName == $name)
                    continue;

                $relatedFieldNames[] = $relatedFieldName;
            }
        }

        // If no related field is known but the original fieldname should not be left.
        if (false === $leftOriginFieldName && 0 === count($relatedFieldNames)) {
            $relatedFieldNames[] = $name;
        }

        return $relatedFieldNames;
    }

    /**
     * Get all same named/related form fields.
     *
     * @param SetaPDF_FormFiller_Field_FieldInterface|string $field The initial field
     * @param boolean $leftOriginField Left the origin passed field in the resulting array or not
     * @return SetaPDF_FormFiller_Field_FieldInterface[]
     */
    public function getRelatedFields($field, $leftOriginField = true)
    {
        if (!($field instanceof SetaPDF_FormFiller_Field_FieldInterface))
            $field = $this->get($field);

        // The name including the suffix ("Text#1")
        $name = $field->getQualifiedName();
        // The original name ("Text")
        $originalName = $field->getOriginalQualifiedName();
        $relatedFields = array();

        // Walk through all related field entries and forward the setValue-call if needed
        if (isset($this->_relatedFields[$originalName])) {
            foreach ($this->_relatedFields[$originalName] AS $relatedFieldName) {
                // Is it the field name, from the initial field, skip over it
                if (true === $leftOriginField && $relatedFieldName === $name)
                    continue;

                $relatedFields[$relatedFieldName] = $this->get($relatedFieldName);
            }
        }

        // If no related field is known but the original field should not be left.
        if (false === $leftOriginField && 0 === count($relatedFields)) {
            $relatedFields[$originalName] = $field;
        }

        return $relatedFields;
    }

    /**
     * This method forwards a setValue call to related/same named form fields.
     *
     * @param mixed $value The value
     * @param SetaPDF_FormFiller_Field_FieldInterface $field The initial form field, which was changed
     * @param string $encoding The encoding of the value
     * @param string $method The method that forwards the value
     * @return void
     */
    public function forwardValueToRelated(
        $value,
        SetaPDF_FormFiller_Field_FieldInterface $field,
        $encoding = 'UTF-8',
        $method = 'setValue'
    )
    {
        // Are we already forwarding?
        if (true === $this->_forwardValue)
            return;

        // set the "forwarding"-flag to true
        $this->_forwardValue = true;

        $relatedFields = $this->getRelatedFields($field);

        if ('setValue' === $method) {
            // Walk through all related field entries and forward the setValue-call if needed
            foreach ($relatedFields AS $relatedField) {
                // Button fields / Checkboxes should be handled in a special way:
                // Same named with different values will xor each other, like a
                // radio button group
                if ($field instanceof SetaPDF_FormFiller_Field_Button) {
                    if ($field->getOnStateName() === $relatedField->getOnStateName()) {
                        $relatedField->$method($value, $encoding);
                    } else {
                        $relatedField->$method(false);
                    }

                } else {
                    $relatedField->$method($value, $encoding);
                }
            }
        }

        $xfa = $this->_formFiller->getXfa();
        if ($xfa) {
            $name = $field->getOriginalQualifiedName();
            if ($field instanceof SetaPDF_FormFiller_Field_Button) {
                if ($value === true) {
                    $xfa->$method($name, $field->getExportValue());
                } else {
                    $xfa->$method($name, $value);
                }

            } else if (
                $field instanceof SetaPDF_FormFiller_Field_Text ||
                $field instanceof SetaPDF_FormFiller_Field_List ||
                $field instanceof SetaPDF_FormFiller_Field_Combo
            ) {
                $xfa->$method($name, $value, $encoding);
            }

        }
        // set the "forwarding"-flag to false
        $this->_forwardValue = false;
    }

    /**
     * Returns whether the "forwarding"-flag is set active.
     *
     * @return bool
     */
    public function isForwardValueActive()
    {
        return $this->_forwardValue;
    }

    /**
     * Ensure that each field have it's own appearance stream.
     *
     * Some PDFs share the appearance stream in different fields (e.g. for empty fields).
     * This would make it impossible to fill these fields individually. This method checks
     * for such fields and "repairs" them by creating a new empty appearance stream.
     *
     * @return int
     */
    public function ensureIndividualAppearanceStreams()
    {
        $fixed = 0;
        $counts = [];
        foreach ($this->getAll() AS $name => $field) {
            if (!$field instanceof SetaPDF_FormFiller_Field_Text &&
                !$field instanceof SetaPDF_FormFiller_Field_Choice_AbstractChoice
            ) {
                continue;
            }

            /**
             * @var SetaPDF_FormFiller_Field_AbstractField $field
             */
            $object = $field->getNormalAppearanceObject();
            $id = $object->getObjectId();

            if (!isset($counts[$id])) {
                $counts[$id] = true;
            } else {
                $newObject = $field->getNormalAppearanceObject(true);
                $id = $newObject->getObjectId();
                $counts[$id] = true;
                $fixed++;
            }
        }

        return $fixed;
    }

  /* Implementation of SPL interfaces */

    /**
     * Implementation of Countable.
     *
     * @return int
     */
    public function count()
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        return count($this->_fieldObjects);
    }

    /**
     * Implementation of the Iterator interface.
     */
    public function current()
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        $currentName = key($this->_fields);

        if (!isset($this->_fields[$currentName]))
            $this->get($currentName);

        return $this->_fields[$currentName];
    }

    /**
     * Implementation of the Iterator interface.
     */
    public function next()
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        next($this->_fields);
    }

    /**
     * Implementation of the Iterator interface.
     */
    public function key()
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        return key($this->_fields);
    }

    /**
     * Implementation of the Iterator interface.
     */
    public function valid()
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        return key($this->_fields) !== null;
    }

    /**
     * Implementation of the Iterator interface.
     */
    public function rewind()
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        reset($this->_fields);
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @param string $offset An offset to check for
     * @return boolean
     */
    public function offsetExists($offset)
    {
        if (false === $this->_fieldsRead)
            $this->_readFormFields();

        return array_key_exists($offset, $this->_fields);
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @param string $offset The offset to retrieve
     * @return SetaPDF_FormFiller_Field_FieldInterface
     */
    public function offsetGet($offset)
    {
        return $this->get($offset);
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @param string $offset The offset to assign the value to
     * @param mixed $value The value to set
     * @throws BadMethodCallException
     */
    public function offsetSet($offset, $value)
    {
        throw new BadMethodCallException("Set operations are not allowed for this object.");
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @param string $offset The offset to unset
     */
    public function offsetUnset($offset)
    {
        $this->delete($offset);
    }
}
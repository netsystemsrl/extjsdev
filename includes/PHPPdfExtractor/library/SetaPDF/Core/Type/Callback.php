<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Callback.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * This class acts like a proxy for all available SetaPDF_Core_Type_* classes
 *
 * The class allows a developer to attach callbacks before and/or after any
 * native method of the original type instance.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_Callback extends SetaPDF_Core_Type_AbstractType
{
    /**
     * @var SetaPDF_Core_Type_AbstractType
     */
    protected $_value;

    /**
     * @var callback
     */
    protected $_callbacks;

    /** @noinspection PhpMissingParentConstructorInspection */

    /**
     * Constructor.
     *
     * @param SetaPDF_Core_Type_AbstractType $value
     */
    public function __construct(SetaPDF_Core_Type_AbstractType $value)
    {
        $this->_value = $value;
        unset($this->_observed);
    }

    /**
     * Add a callback before or after a specific method call.
     *
     * @param string $method
     * @param callback $callback
     * @param bool $before
     * @throws InvalidArgumentException
     */
    public function addCallback($method, $callback, $before = true)
    {
        if (!method_exists($this->_value, $method)) {
            throw new InvalidArgumentException('Unknown method ' . get_class($this->_value) . '::' . $method);
        }

        $this->_callbacks[($before ? 'before_' : 'after_') . $method] = $callback;
    }

    /**
     * Implementation of __clone().
     *
     * @internal
     */
    public function __clone()
    {
        $this->_value = clone $this->_value;
    }

    /**
     * Overloads all method calls.
     *
     * @param string $method
     * @param array $arguments
     * @return mixed
     * @throws BadMethodCallException
     */
    public function __call($method, array $arguments)
    {
        if (method_exists($this->_value, $method)) {
            if (isset($this->_callbacks['before_' . $method])) {
                call_user_func_array($this->_callbacks['before_' . $method], array($this->_value, &$arguments, $method));
            }

            $return = call_user_func_array(array($this->_value, $method), $arguments);

            if (isset($this->_callbacks['after_' . $method])) {
                call_user_func_array($this->_callbacks['after_' . $method], array($this->_value, &$arguments, &$return, $method));
            }

            return $return;
        }

        throw new BadMethodCallException('Unknown method: ' . get_class($this->_value) . '::' . $method);
    }

    /**
     * Sets the value of the PDF type.
     *
     * @param mixed $value
     */
    public function setValue($value)
    {
        $this->__call('setValue', array($value));
    }

    /**
     * Gets the PDF value.
     *
     * @return mixed
     */
    public function getValue()
    {
        return $this->__call('getValue', array());
    }

    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        return $this->__call('toPdfString', array($pdfDocument));
    }

    /**
     * Writes the type as a formatted PDF string to the document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     */
    public function writeTo(SetaPDF_Core_Document $pdfDocument)
    {
        $this->__call('writeTo', array($pdfDocument));
    }

    /**
     * Converts the PDF data type to a PHP data type and returns it.
     *
     * @return mixed
     */
    public function toPhp()
    {
        return $this->__call('toPhp', array());
    }

    /**
     * Release resources/memory.
     */
    public function cleanUp()
    {
        $this->_value->cleanUp();
        $this->_value = null;
    }
}
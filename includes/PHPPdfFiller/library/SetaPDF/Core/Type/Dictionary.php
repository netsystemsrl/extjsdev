<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Dictionary.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a dictionary
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_Dictionary extends SetaPDF_Core_Type_AbstractType
    implements SplObserver, ArrayAccess, Countable, Iterator
{
    /**
     * The entries/values in the dictionary
     *
     * @var array An array of SetaPDF_Core_Type_Dictionary_Entry objects
     */
    protected $_entries = array();

    /**
     * Defines if this object make use of pdf string callbacks
     *
     * @var boolean
     */
    protected $_usePdfStringCallbacks = false;

    /**
     * An array of callbacks before this object is converted to a PDF string.
     *
     * @var array
     */
    protected $_pdfStringCallbacks = array();

    /**
     * Parses an associative array to a pdf dictionary string and writes it to a writer.
     *
     * @see SetaPDF_Core_Type_AbstractType
     * @param SetaPDF_Core_WriteInterface $writer
     * @param array $values
     * @return void
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $values)
    {
        $writer->write('<<');

        $i = 0;
        foreach ($values AS $key => $value) {
            if ($i++ > 10) {
                $writer->write("\n");
                $i = 0;
            }
            SetaPDF_Core_Type_Name::writePdfString($writer, $key);
            SetaPDF_Core_Type_AbstractType::writePdfString($writer, $value);
        }

        $writer->write('>>');
    }

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     *
     * @param array $entries An array filled with SetaPDF_Core_Type_Dictionary_Entry OR an associative array
     * @throws InvalidArgumentException
     */
    public function __construct(array $entries = null)
    {
        unset($this->_observed);

        if (null !== $entries) {
            foreach ($entries AS $name => $value) {
                if ($value instanceof SetaPDF_Core_Type_Dictionary_Entry) {
                    $name = $value->getKeyValue();
                    $this->_entries[$name] = $value;
                } else if ($value instanceof SetaPDF_Core_Type_AbstractType) {
                    $this->offsetSet($name, $value);
                } else {
                    throw new InvalidArgumentException(
                        'Parameter should be an array of values of type SetaPDF_Core_Type_Dictionary_Entry'
                    );
                }
            }
        }

        unset($this->_usePdfStringCallbacks, $this->_pdfStringCallbacks);
    }

    /**
     * Implementation of {@link http://www.php.net/language.oop5.magic.php#object.wakeup __wakeup()}.
     *
     * @internal
     */
    public function __wakeup()
    {
        if (false === $this->_usePdfStringCallbacks) {
            unset($this->_usePdfStringCallbacks, $this->_pdfStringCallbacks);
        }

        parent::__wakeup();
    }

    /**
     * Implementation of {@link http://www.php.net/language.oop5.cloning.php#object.clone __clone()}.
     *
     * @see SetaPDF_Core_Type_AbstractType::__clone()
     * @internal
     */
    public function __clone()
    {
        foreach ($this->_entries AS $key => $entry) {
            $this->_entries[$key] = clone $entry;
        }

        parent::__clone();
    }

    /**
     * Clone the object recursively in the context of a document.
     *
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function deepClone(SetaPDF_Core_Document $document)
    {
        $clone = clone $this;

        foreach ($clone->_entries AS $key => $value) {
            $clone->_entries[$key] = $value->deepClone($document);
        }

        return $clone;
    }

    /**
     * Add an observer to the object.
     *
     * Implementation of the Observer Pattern. This overwritten method forwards the attach()-call
     * to all dictionary values.
     *
     * @param SplObserver $observer
     */
    public function attach(SplObserver $observer)
    {
        $isObserved = isset($this->_observed);
        parent::attach($observer);

        if (false === $isObserved) {
            foreach ($this->_entries AS $entry) {
                $entry->attach($this);
            }
        }
    }

    /**
     * Triggered if a value of this object is changed. Forward this to the "parent" object.
     *
     * @param SplSubject $SplSubject
     */
    public function update(SplSubject $SplSubject)
    {
        if (isset($this->_observed)) {
            $this->notify();
        }

        // TODO: Should be optimized
        $oldKey = array_search($SplSubject, $this->_entries, true);
        if ($oldKey) {
            $newKey = $SplSubject->getKeyValue();
            if ($newKey !== $oldKey) {
                unset($this->_entries[$oldKey]);
                $this->_entries[$newKey] = $SplSubject;
            }
        }
    }

    /**
     * Set the values of the dictionary.
     *
     * @param array $entries Array of SetaPDF_Core_Type_Dictionary_Entry objects
     * @throws InvalidArgumentException
     */
    public function setValue($entries)
    {
        if (!is_array($entries)) {
            throw new InvalidArgumentException(
                'Parameter should be an array of SetaPDF_Core_Type_Dictionary_Entry objects.'
            );
        }

        // disable observing
        $observed = isset($this->_observed);
        if ($observed) {
            unset($this->_observed);
        }

        foreach ($entries AS $entry) {
            $this->offsetSet(null, $entry);
        }

        // reset observing
        if ($observed) {
            $this->_observed = true;

            // and notify...
            $this->notify();
        }
    }

    /**
     * Gets the value.
     *
     * Returns all entries of this dictionary or a specific value of a named entry.
     *
     * @param string|null $offset The name of the entry or null to receive all entries
     * @return array|SetaPDF_Core_Type_AbstractType|null An array of SetaPDF_Core_Type_Dictionary_Entry objects,
     *          a SetaPDF_Core_Type_AbstractType instance or null if the given offset was not found
     */
    public function getValue($offset = null)
    {
        if (null === $offset) {
            return $this->_entries;
        }

        if (isset($this->_entries[$offset])) {
            return $this->_entries[$offset]->getValue();
        }

        return null;
    }

    /**
     * Returns the key names.
     *
     * @return array
     */
    public function getKeys()
    {
        return array_keys($this->_entries);
    }

    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        // Handle write callback in the owner document instance
        $self = $pdfDocument->getCurrentObjectDocument()->handleWriteCallback($this);

        $self->_handlePdfStringCallback($pdfDocument);
        $s = '<<';

        $i = 0;
        foreach ($self->_entries AS $entry) {
            if ($i++ > 10) {
                $s .= "\n";
                $i = 0;
            }
            $s .= $entry->toPdfString($pdfDocument);
            #$s .= $pdfDocument->typeToPdfString($entry);
        }

        return $s . '>>';
    }

    /**
     * Writes the type as a formatted PDF string to the document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     */
    public function writeTo(SetaPDF_Core_Document $pdfDocument)
    {
        // Handle write callback in the owner document instance
        $self = $pdfDocument->getCurrentObjectDocument()->handleWriteCallback($this);

        $self->_handlePdfStringCallback($pdfDocument);
        $pdfDocument->write('<<');

        $i = 0;
        foreach ($self->_entries AS $entry) {
            if ($i++ > 10) {
                $pdfDocument->write("\n");
                $i = 0;
            }
            $entry->writeTo($pdfDocument);
        }

        $pdfDocument->write('>>');
    }

    /**
     * Release objects/memory.
     *
     * @see SetaPDF_Core_Type_AbstractType::cleanUp()
     */
    public function cleanUp()
    {
        if (!isset($this->_observed)) {
            /*
            foreach (array_keys($this->_entries) AS $key) {
                $this->_entries[$key]->detach($this);
                $this->_entries[$key]->cleanUp();
                unset($this->_entries[$key]);
            }
            */
            while (($value = array_pop($this->_entries)) !== null) {
                $value->detach($this);
                $value->cleanUp();
            }
        }
    }

    /**
     * Converts the PDF data type to a PHP data type and returns it.
     *
     * @return array
     */
    public function toPhp()
    {
        $result = array();

        foreach ($this->_entries AS $entry) {
            $php = $entry->toPhp();
            $result[$php['key']] = $php['value'];
        }

        return $result;
    }

    /**
     * Checks whether a offset exists.
     *
     * @link http://www.php.net/ArrayAccess.offsetExists ArrayAccess::offsetExists
     * @param string $offset An offset to check for.
     * @return boolean
     */
    public function offsetExists($offset)
    {
        return isset($this->_entries[$offset]);
    }

    /**
     * Offset to retrieve.
     *
     * @link http://www.php.net/ArrayAccess.offsetGet ArrayAccess::offsetGet
     * @param string $offset The offset to retrieve.
     * @return SetaPDF_Core_Type_Dictionary_Entry
     */
    public function offsetGet($offset)
    {
        if (isset($this->_entries[$offset])) {
            return $this->_entries[$offset];
        }

        return null;
    }

    /**
     * Offset to set.
     *
     * If offset is null then the value need to be a SetaPDF_Core_Type_Dictionary_Entry.
     *
     * If value is scalar and offset is already set the setValue method of the offset will be used.
     *
     * Otherwise it should be an instance of SetaPDF_Core_Type_AbstractType.
     *
     * @link http://www.php.net/ArrayAccess.offsetSet ArrayAccess::offsetSet
     * @param null|string|SetaPDF_Core_Type_Name $offset The offset to assign the value to.
     * @param SetaPDF_Core_Type_Dictionary_Entry|SetaPDF_Core_Type_AbstractType|mixed $value The value to set.
     * @throws InvalidArgumentException
     */
    public function offsetSet($offset, $value)
    {
        if (null !== $offset && is_scalar($offset) && isset($this->_entries[$offset])) {
            $this->_entries[$offset]->setValue($value);
            return;
        }

        if (null !== $offset && !($value instanceof SetaPDF_Core_Type_Dictionary_Entry)) {
            $value = new SetaPDF_Core_Type_Dictionary_Entry(
                ($offset instanceof SetaPDF_Core_Type_Name) ? $offset : new SetaPDF_Core_Type_Name($offset, true),
                $value
            );
        }

        /** This will need some microseconds if there are thousands of entries */
        if (!($value instanceof SetaPDF_Core_Type_Dictionary_Entry)) {
            throw new InvalidArgumentException('Parameter should be a value of type SetaPDF_Core_Type_Dictionary_Entry');
        }

        $name = $value->getKeyValue();
        if (isset($this->_entries[$name])) {
            $this->offsetUnset($name);
        }

        $this->_entries[$name] = $value;

        if (isset($this->_observed)) {
            $value->attach($this);
            $this->notify();
        }
    }

    /**
     * Checks whether a offset exists.
     *
     * @link http://www.php.net/ArrayAccess.offsetUnset ArrayAccess::offsetUnset
     * @param string $offset
     */
    public function offsetUnset($offset)
    {
        if ($offset instanceof SetaPDF_Core_Type_Dictionary_Entry) {
            $key = $offset->getKey()->getValue();
        } else {
            $key = $offset;
        }

        if (isset($this->_entries[$key])) {
            if ($this->_entries[$key]->isObserved()) {
                $this->_entries[$key]->detach($this);
            }
            $this->_entries[$key]->cleanUp(); // If not called, we've a memory leak
            unset($this->_entries[$key]);

            if (isset($this->_observed)) {
                $this->notify();
            }
        }
    }

    /**
     * Returns the number of elements in the dictionary.
     *
     * @link http://www.php.net/Countable.count Countable::count
     * @return int
     */
    public function count()
    {
        return count($this->_entries);
    }

    /**
     * Returns the current element.
     *
     * @link http://www.php.net/Iterator.current Iterator::current
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function current()
    {
        $entry = current($this->_entries);
        return $entry ? $entry->getValue() : $entry;
    }

    /**
     * Moves forward to next element.
     *
     * @link http://www.php.net/Iterator.next Iterator::next
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function next()
    {
        $entry = next($this->_entries);
        return $entry ? $entry->getValue() : $entry;
    }

    /**
     * Returns the key of the current element.
     *
     * @link http://www.php.net/Iterator.key Iterator::key
     * @return integer
     */
    public function key()
    {
        return key($this->_entries);
    }

    /**
     * Checks if current position is valid.
     *
     * @see http://www.php.net/Iterator.valid Iterator::valid
     * @return boolean
     */
    public function valid()
    {
        return current($this->_entries) !== false;
    }

    /**
     * Rewinds the Iterator to the first element.
     *
     * @link http://www.php.net/Iterator.rewind Iterator::rewind
     */
    public function rewind()
    {
        reset($this->_entries);
    }

    /**
     * Register a callback function which is called before the object is converted to a PDF string.
     *
     * @param callback $callback
     * @param string $name
     */
    public function registerPdfStringCallback($callback, $name)
    {
        if (!isset($this->_pdfStringCallbacks)) {
            $this->_pdfStringCallbacks = array();
        }

        $this->_pdfStringCallbacks[$name] = $callback;
        $this->_usePdfStringCallbacks = true;
    }

    /**
     * Unregister a callback function.
     *
     * @param string $name
     */
    public function unRegisterPdfStringCallback($name)
    {
        if (isset($this->_pdfStringCallbacks[$name])) {
            unset($this->_pdfStringCallbacks[$name]);
        }

        if (isset($this->_pdfStringCallbacks) && count($this->_pdfStringCallbacks) === 0) {
            unset($this->_usePdfStringCallbacks, $this->_pdfStringCallbacks);
        }

        parent::__wakeup();
    }

    /**
     * Execute the registered callbacks before the object is converted to a PDF string.
     */
    protected function _handlePdfStringCallback()
    {
        if (!isset($this->_usePdfStringCallbacks)) {
            return;
        }

        foreach ($this->_pdfStringCallbacks AS $name => $callback) {
            call_user_func_array($callback, array($this, $name));
        }
    }
}
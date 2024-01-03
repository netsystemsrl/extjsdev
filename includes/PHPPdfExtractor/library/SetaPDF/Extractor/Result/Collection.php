<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Collection.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * This class represents a collection of items implementing SetaPDF_Extractor_Result_HasBoundsInterface
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Result_Collection implements
    Iterator, ArrayAccess, Countable, SetaPDF_Extractor_Result_HasBoundsInterface
{
    /**
     * @var SetaPDF_Extractor_Result_HasBoundsInterface[]
     */
    protected $_items = array();

    /**
     * The constructor.
     *
     * @param SetaPDF_Extractor_Result_HasBoundsInterface[] $items
     */
    public function __construct(array $items = array())
    {
        foreach ($items AS $item) {
            $this->offsetSet(null, $item);
        }
    }

    /**
     * Release memory and cycled references
     */
    public function cleanUp()
    {
        foreach ($this->_items AS $item) {
            $item->cleanUp();
        }

        $this->_items = null;
    }

    /**
     * Get all items.
     *
     * @return SetaPDF_Extractor_Result_HasBoundsInterface[]
     */
    public function getItems()
    {
        return $this->_items;
    }

    /**
     * Get the outer most bounds of all items in this collection.
     *
     * This method will only return values of non-rotated items.
     *
     * @return SetaPDF_Extractor_Result_Bounds[]
     */
    public function getBounds()
    {
        $llx = $lly = $urx = $ury = null;

        /**
         * @var SetaPDF_Extractor_Result_Bounds $bound
         */

        foreach ($this->_items AS $item) {
            foreach ($item->getBounds() AS $bound) {
                $rect = $bound->getRectangle();
                $llx = isset($llx) ? min($llx, $rect->getLl()->getX()) : $rect->getLl()->getX();
                $lly = isset($lly) ? min($lly, $rect->getLl()->getY()) : $rect->getLl()->getY();
                $urx = isset($urx) ? max($urx, $rect->getUr()->getX()) : $rect->getUr()->getX();
                $ury = isset($ury) ? max($ury, $rect->getUr()->getY()) : $rect->getUr()->getY();
            }
        }

        return [new SetaPDF_Extractor_Result_Bounds(
            new SetaPDF_Core_Geometry_Point($llx, $lly),
            new SetaPDF_Core_Geometry_Point($llx, $ury),
            new SetaPDF_Core_Geometry_Point($urx, $ury),
            new SetaPDF_Core_Geometry_Point($urx, $lly)
        )];
    }

    /* interface implementations */

    /**
     * Implementation of the Iterator interface.
     *
     * @see http://php.net/manual/iterator.current.php
     * @return SetaPDF_Extractor_Result_HasBoundsInterface|null
     */
    public function current()
    {
        return current($this->_items);
    }

    /**
     * Implementation of the Iterator interface.
     *
     * @see http://php.net/manual/iterator.key.php
     * @return integer
     */
    public function key()
    {
        return key($this->_items);
    }

    /**
     * Implementation of the Iterator interface.
     *
     * @see http://php.net/manual/iterator.next.php
     */
    public function next()
    {
        next($this->_items);
    }

    /**
     * Implementation of the Iterator interface.
     *
     * @see http://php.net/manual/iterator.reset.php
     * @return void
     */
    public function rewind()
    {
        reset($this->_items);
    }

    /**
     * Implementation of the Iterator interface.
     *
     * @see http://php.net/manual/iterator.valid.php
     * @return boolean
     */
    public function valid()
    {
        return key($this->_items) !== null;
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @see http://php.net/manual/arrayaccess.offsetset.php
     * @param null|integer $key
     * @param SetaPDF_Extractor_Result_HasBoundsInterface $value
     * @throws InvalidArgumentException
     */
    public function offsetSet($key, $value)
    {
        if (!$value instanceof SetaPDF_Extractor_Result_HasBoundsInterface) {
            throw new InvalidArgumentException(
                'Only items implementing SetaPDF_Extractor_Result_HasBoundsInterface allowed.'
            );
        }

        if (null === $key) {
            $this->_items[] = $value;
        } else {
            $this->_items[$key] = $value;
        }
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @see http://php.net/manual/arrayaccess.offsetget.php
     * @param integer $key
     * @return SetaPDF_Extractor_Result_HasBoundsInterface
     * @throws InvalidArgumentException
     */
    public function offsetGet($key)
    {
        if (!isset($this->_items[$key])) {
            throw new InvalidArgumentException('Unknown offset "' . $key . '".');
        }

        return $this->_items[$key];
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @param integer $key
     * @see http://php.net/manual/arrayaccess.offsetunset.php
     */
    public function offsetUnset($key)
    {
        if (isset($this->_items[$key])) {
            unset($this->_items[$key]);
        }
    }

    /**
     * Implementation of the ArrayAccess interface.
     *
     * @see http://php.net/manual/arrayaccess.offsetexists.php
     * @param integer $key
     * @return boolean
     */
    public function offsetExists($key)
    {
        return isset($this->_items[$key]);
    }

    /**
     * Implementation of the Countable interface.
     * @see http://php.net/manual/countable.count.php
     * @return int
     */
    public function count()
    {
        return count($this->_items);
    }
}
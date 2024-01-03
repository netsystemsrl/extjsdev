<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CrossReferenceTable.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a cross reference table
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_CrossReferenceTable
{
    /**
     * The pointer to the last written xref table
     *
     * @var integer
     */
    protected $_pointerToXref = null;

    /**
     * The cross reference content
     *
     * @var array
     */
    protected $_objectOffsets = [
        0 => [65535 => [0, 65535, false]]
    ];

    /**
     * Updated offsets
     *
     * @var array
     */
    protected $_updatedOffsets = [];

    /**
     * The greatest used object id
     *
     * @var integer
     */
    protected $_maxObjId = 0;

    /**
     * Mark an object as deleted.
     *
     * @param integer $objectId
     */
    public function deleteObject($objectId)
    {
        $this->_objectOffsets[$objectId][65535] = [
            0,
            65535,
            false
        ];

        $this->_updatedOffsets[$objectId] = 65535;
        $this->_maxObjId = max($this->_maxObjId, $objectId);
    }

    /**
     * Get all defined object ids.
     *
     * @return array
     */
    public function getDefinedObjectIds()
    {
        $objects = array_keys($this->_objectOffsets);
        sort($objects);
        unset($objects[0]);

        return $objects;
    }

    /**
     * Alias for getDefinedObjectIds()
     *
     * @deprecated
     * @return array
     */
    public function getDefiniedObjectIds()
    {
        return $this->getDefinedObjectIds();
    }

    /**
     * Get the generation number by an object id.
     *
     * @param integer $objectId
     * @return integer|boolean
     */
    public function getGenerationNumberByObjectId($objectId)
    {
        return isset($this->_objectOffsets[$objectId])
            ? 0
            : false;
    }

    /**
     * Get an offset for an object.
     *
     * @param integer $objectId
     * @param integer|null $generation
     * @return integer|array|boolean
     */
    public function getOffsetFor($objectId, $generation = 0)
    {
        if (isset($this->_objectOffsets[$objectId]) &&
            isset($this->_objectOffsets[$objectId][$generation])
        ) {
            return $this->_objectOffsets[$objectId][$generation];
        }

        // No generation known, so return the last generation number
        if ($generation === null && isset($this->_objectOffsets[$objectId])) {
            return end($this->_objectOffsets[$objectId]);
        }

        return false;
    }

    /**
     * Set an object offset.
     *
     * @param integer $objectId
     * @param integer $generation
     * @param integer|array $offset
     */
    public function setOffsetFor($objectId, $generation, $offset)
    {
        $this->_objectOffsets[$objectId][$generation] = [
            $offset,
            $generation,
            true
        ];

        $this->_updatedOffsets[$objectId] = $generation;
        $this->updateSize($objectId);
    }

    /**
     * Updates the size value of this cross-reference table.
     *
     * @param integer $objectId
     */
    public function updateSize($objectId)
    {
        $this->_maxObjId = max($this->_maxObjId, $objectId);
    }

    /**
     * Checks if an objects offset is updated.
     *
     * @param integer $objectId
     * @return boolean
     */
    public function isOffsetUpdated($objectId)
    {
        return isset($this->_updatedOffsets[$objectId]);
    }

    /**
     * Checks whether any offset was updated or not.
     *
     * @return bool
     */
    public function offsetsUpdated()
    {
        return count($this->_updatedOffsets) > 0;
    }

    /**
     * Get the cross reference as a compressed stream object.
     *
     * @param SetaPDF_Core_Type_Dictionary $value
     * @param integer $newPointerToXref
     * @param boolean $onlyUpdated
     * @return boolean|SetaPDF_Core_Type_Stream
     */
    public function getCompressedStream
    (
        SetaPDF_Core_Type_Dictionary $value,
        $newPointerToXref,
        $onlyUpdated = true
    )
    {
        if ($onlyUpdated === true && $this->offsetsUpdated() === false) {
            return false;
        }

        $value['Type'] = new SetaPDF_Core_Type_Name('XRef', true);
        $value['Filter'] = new SetaPDF_Core_Type_Name('FlateDecode', true);

        $sections = [];
        $section = 0;
        $entryLengths = [1, 0, 0];

        $buildEntry = function($data) use (&$entryLengths) {
            $inObjectStream = is_array($data[0]);

            if ($inObjectStream) {
                $objectId = ltrim(pack("N", $data[0][0]), "\0");
                $entryLengths[1] = max(strlen($objectId), $entryLengths[1]);

                $index = ltrim(pack("N", $data[0][1]), "\0");
                $entryLengths[2] = max(strlen($index), $entryLengths[2]);

                return ["\x02", $objectId, $index];
            }

            /* We save deleted/free objects as \0,\0,\0 which is done by all big players such as Adobe and Foxit.
             */
            if (!$data[2]) {
                return ['', '', ''];
            }

            $offset = ltrim(pack("N",  $data[0]), "\0");
            $entryLengths[1] = max(strlen($offset), $entryLengths[1]);

            $generation = ltrim(pack("N", $data[1]), "\0");
            $entryLengths[2] = max(strlen($generation), $entryLengths[2]);

            return ["\x01", $offset, $generation];
        };

        // build sections
        if ($onlyUpdated) {
            $updatedOffsets = $this->_updatedOffsets;
            ksort($updatedOffsets);

            $lastObjId = null;
            foreach ($updatedOffsets AS $objectId => $generation) {
                $data = $this->_objectOffsets[$objectId][$generation];

                if ($lastObjId !== null && $objectId != ($lastObjId + 1)) {
                    $section++;
                }

                $sections[$section][$objectId] = $buildEntry($data);
                $lastObjId = $objectId;
            }

            // otherwise create a single big section
        } else {
            for ($objectId = 0; $objectId < $this->getSize(); $objectId++) {
                if (isset($this->_updatedOffsets[$objectId])) {
                    $generation = $this->_updatedOffsets[$objectId];
                    $data = $this->_objectOffsets[$objectId][$generation];
                    $sections[$section][$objectId] = $buildEntry($data);
                } else {
                    $sections[$section][$objectId] = $buildEntry([0, 0, 0]);
                }
            }
        }

        $size = $this->getSize();

        $value['Size'] = new SetaPDF_Core_Type_Numeric($size);

        $value['W'] = new SetaPDF_Core_Type_Array([
            new SetaPDF_Core_Type_Numeric($entryLengths[0]),
            new SetaPDF_Core_Type_Numeric($entryLengths[1]),
            new SetaPDF_Core_Type_Numeric($entryLengths[2]),
        ]);

        if ($onlyUpdated) {
            $index = new SetaPDF_Core_Type_Array();
            $value['Index'] = $index;
        }

        $streamValue = '';

        foreach ($sections AS $section) {
            if ($onlyUpdated) {
                $index[] = new SetaPDF_Core_Type_Numeric(key($section));
                $index[] = new SetaPDF_Core_Type_Numeric(count($section));
            }

            foreach ($section AS $entry) {
                if ($entryLengths[0] > 0)
                    $entry[0] = str_pad($entry[0], $entryLengths[0], "\0", STR_PAD_LEFT);
                if ($entryLengths[1] > 0)
                    $entry[1] = str_pad($entry[1], $entryLengths[1], "\0", STR_PAD_LEFT);
                if ($entryLengths[2] > 0)
                    $entry[2] = str_pad($entry[2], $entryLengths[2], "\0", STR_PAD_LEFT);

                $streamValue .= implode('', $entry);
            }
        }

        $streamObject = new SetaPDF_Core_Type_Stream($value);
        $streamObject->setStream($streamValue);

        $this->_updatedOffsets = [];

        $this->_pointerToXref = $newPointerToXref;

        return $streamObject;
    }

    /**
     * Writes the cross reference to a writer.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     * @param boolean $onlyUpdated
     * @return integer
     */
    public function writeNormal
    (
        SetaPDF_Core_Writer_WriterInterface $writer,
        $onlyUpdated = true
    )
    {
        if ($onlyUpdated === true && $this->offsetsUpdated() === false) {
            return false;
        }

        $this->_pointerToXref = $writer->getPos();

        $writer->write("xref\n");
        $offsets = $this->_updatedOffsets;

        if ($onlyUpdated === false) {
            $offsets[0] = 65535;
        }
        ksort($offsets);

        $count = 0;
        $lastObjId = 0;
        $startObjId = null;
        $xref = [];

        foreach ($offsets AS $objectId => $generation) {
            $data = $this->_objectOffsets[$objectId][$generation];

            if ($lastObjId !== null && $objectId != ($lastObjId + 1)) {
                if ($onlyUpdated === true && $lastObjId !== 0) {
                    $writer->write($startObjId . ' ' . $count . "\n");
                    $writer->write(implode("\n", $xref) . "\n");
                    $xref = [];
                    $count = 0;
                    $startObjId = $objectId;

                } elseif ($onlyUpdated === false) {
                    // Fill missing/deleted objects
                    while (($lastObjId + 1) < $objectId) {
                        $xref[] = '0000000000 65535 f ';
                        $count++;
                        $lastObjId++;
                    }
                }
            }

            if (!isset($startObjId)) {
                $startObjId = $objectId;
            }

            $xref[] = sprintf('%010s %05s %s ', $data[0], $data[1], ($data[2] ? 'n' : 'f'));
            $lastObjId = $objectId;
            $count++;
        }

        $size = $this->getSize();
        // Fill missing/deleted objects
        if ($onlyUpdated === false) {
            while ($count < $size) {
                $data = $this->getOffsetFor($count, null);
                if ($data === false) {
                    $xref[] = '0000000000 65535 f ';
                } else {
                    $xref[] = sprintf('%010s %05s n ', $data[0], $data[1]);
                }
                $count++;
            }
        }

        $writer->write(((int)$startObjId) . ' ' . $count . "\n");
        if ($count) {
            $writer->write(implode("\n", $xref) . "\n");
        }

        $this->_updatedOffsets = [];

        return $this->_pointerToXref;
    }

    /**
     * Returns the offset of the last written xref table.
     *
     * @return integer
     */
    public function getPointerToXref()
    {
        return $this->_pointerToXref;
    }

    /**
     * Get the size of the cross reference table.
     *
     * @return integer
     */
    public function getSize()
    {
        return $this->_maxObjId + 1;
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        // empty body
    }
}
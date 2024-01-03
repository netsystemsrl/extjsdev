<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Parser
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CorruptedCrossReferenceTable.php 1160 2018-01-10 09:22:49Z jan.slabon $
 */

/**
 * A PDF cross reference parser for corrupted pdfs
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Parser
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Parser_CorruptedCrossReferenceTable
    extends SetaPDF_Core_Document_CrossReferenceTable
    implements SetaPDF_Core_Parser_CrossReferenceTable_CrossReferenceTableInterface
{
    /**
     * The PDF parser instance
     *
     * @var SetaPDF_Core_Parser_Pdf
     */
    protected $_parser;

    /**
     * The trailer dictionary
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_trailer;

    /**
     *
     * @var null
     */
    protected $_matchedPositions = array(
        '/Catalog' => null,
        '~/XRef\s+~' => null,
        '~/Type\s*/Info~m' => null,
    );

    /**
     * Object offsets in the parser File
     *
     * @var array
     */
    protected $_parserObjectOffsets = array();

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Parser_Pdf $parser
     * @throws SetaPDF_Core_Parser_CrossReferenceTable_Exception
     */
    public function __construct(SetaPDF_Core_Parser_Pdf $parser)
    {
        $this->_parser = $parser;
        $this->_screen();

        if ($this->_matchedPositions['~/XRef\s+~'] !== null) {
            throw new SetaPDF_Core_Parser_CrossReferenceTable_Exception(
                'The cross-reference table seems to be compressed and corrupted. A repair is not possible.'
            );
        }
    }

    /**
     * Check if the xref table uses compressed xref streams.
     *
     * @return boolean
     */
    public function isCompressed()
    {
        return false;
    }

    /**
     * Get all defined object ids.
     *
     * @return array
     */
    public function getDefinedObjectIds()
    {
        $objects = array_keys($this->_parserObjectOffsets);
        sort($objects);
        unset($objects[0]);

        return $objects;
    }

    /**
     * Get the generation number by an object id.
     *
     * @param integer $objectId
     * @return integer|boolean
     */
    public function getGenerationNumberByObjectId($objectId)
    {
        $offset = $this->getParserOffsetFor($objectId);
        if ($offset !== false) {
            // check for free entry
            return key($this->_parserObjectOffsets[$objectId]);
        }

        return parent::getGenerationNumberByObjectId($objectId);
    }

    /**
     * Screens the file for objects and keywords.
     */
    protected function _screen()
    {
        $start = 0;
        $bufferLen = 1000;

        $reader = $this->_parser->getReader();
        $reader->reset($start, $bufferLen);

        while (($buffer = $reader->getBuffer()) != '') {
            $this->_extractObjectIds($buffer, $start);
            $this->_extractTrailers($buffer, $start);
            $this->_matchKeywords($buffer, $start);

            $start += $bufferLen / 2;
            $reader->reset($start, $bufferLen);
        }

        ksort($this->_parserObjectOffsets);
    }

    /**
     * Extracts object ids and their offsets from a buffer.
     *
     * @param string $buffer
     * @param int $start
     */
    protected function _extractObjectIds($buffer, $start)
    {
        preg_match_all('/[^\S](\d+) (\d+) obj/U', $buffer, $match, PREG_OFFSET_CAPTURE);

        if (count($match) > 0) {
            foreach ($match[0] as $key => $data) {
                $objId = (int)$match[1][$key][0];
                $generation = (int)$match[2][$key][0];

                if (!isset($this->_parserObjectOffsets[$objId])) {
                    $this->_parserObjectOffsets[$objId] = array();
                }

                $lastFound = $data[1];

                $this->_parserObjectOffsets[$objId][$generation] = array(
                    $start + $lastFound, $generation
                );

                $this->_maxObjId = max($this->_maxObjId, $objId);
            }
        }
    }

    /**
     * Extracts trailer information from a buffer.
     *
     * @param string $buffer
     * @param int $start
     */
    protected function _extractTrailers($buffer, $start)
    {
        if (false !== ($pos = strpos($buffer, 'trailer'))) {
            $this->_parser->reset($start + $pos + 7);
            // read trailer
            try {
                $trailer = $this->_parser->readValue('SetaPDF_Core_Type_Dictionary');
            } catch (SetaPDF_Core_Parser_Pdf_InvalidTokenException $e) {
                return;
            }

            if (null === $this->_trailer) {
                $this->_trailer = $trailer;
            } else {
                foreach (array('Size', 'Root', 'Encrypt', 'Info', 'ID') AS $key) {
                    if (!$this->_trailer->offsetExists($key) && $trailer->offsetExists($key)) {
                        $this->_trailer->offsetSet($key, $trailer->offsetGet($key));
                    }
                }
            }
        }
    }

    /**
     * Extracts offsets for specific keywords from a buffer.
     *
     * @param string $buffer
     * @param int $start
     */
    protected function _matchKeywords($buffer, $start)
    {
        foreach (array_keys($this->_matchedPositions) AS $searchFor) {
            if ($searchFor[0] === '~') {
                if (0 === (preg_match($searchFor, $buffer, $match, PREG_OFFSET_CAPTURE))) {
                    continue;
                }

                $pos = $match[0][1];

            } else {
                if (false === ($pos = strpos($buffer, $searchFor))) {
                    continue;
                }
            }

            $this->_matchedPositions[$searchFor] = $start + $pos;
        }
    }

    /**
     * Ensures that a trailer dictionary exists or is created.
     *
     * @throws SetaPDF_Core_Parser_CrossReferenceTable_Exception
     */
    public function ensureTrailer()
    {
        if (null === $this->_trailer) {
            $this->_trailer = new SetaPDF_Core_Type_Dictionary();
        }

        $this->_trailer['Size'] = new SetaPDF_Core_Type_Numeric($this->_maxObjId);

        // Find Root
        if ($this->_matchedPositions['/Catalog'] === null) {
            throw new SetaPDF_Core_Parser_CrossReferenceTable_Exception('No trailer nor root object found.');
        }

        $offsets = array();
        foreach ($this->_parserObjectOffsets AS $objId => $generations) {
            $last = end($generations);
            $offsets[$last[0]] = array($objId, $last[1]);
        }
        ksort($offsets, true);

        $lastObjData = array();
        foreach ($offsets AS $offset => $objData) {
            if ($offset > $this->_matchedPositions['/Catalog']) {
                $root = new SetaPDF_Core_Type_IndirectReference($lastObjData[0], $lastObjData[1], $this->_parser->getOwner());
                break;
            }
            $lastObjData = $objData;
        }

        if (!isset($root)) {
            $tmpRoot = new SetaPDF_Core_Type_IndirectReference($lastObjData[0], $lastObjData[1], $this->_parser->getOwner());
            if (SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($tmpRoot->ensure(), 'Type', 'Catalog'))
                $root = $tmpRoot;
        }

        if (!isset($root) || null === $root) {
            throw new SetaPDF_Core_Parser_CrossReferenceTable_Exception('No trailer nor root object found.');
        }

        $this->_trailer['Root'] = $root;

        // Update Info if not already set in the trailer
        if (!$this->_trailer->offsetExists('Info') && isset($this->_matchedPositions['~/Type\s*/Info~m'])) {
            $info = null;
            $lastObjData = array();
            foreach ($offsets AS $offset => $objData) {
                if ($offset > $this->_matchedPositions['~/Type\s*/Info~m']) {
                    $info = new SetaPDF_Core_Type_IndirectReference($lastObjData[0], $lastObjData[1], $this->_parser->getOwner());
                    break;
                }
                $lastObjData = $objData;
            }

            if (null !== $info)
                $this->_trailer['Info'] = $info;
        }
    }

    /**
     * Returns the offset position for a specific object.
     *
     * @param int $objectId
     * @param int|null $generation
     * @return bool|int
     */
    public function getParserOffsetFor($objectId, $generation = null)
    {
        $offsetExists = isset($this->_parserObjectOffsets[$objectId]);
        if (
            ($generationExists = ($offsetExists && isset($this->_parserObjectOffsets[$objectId][$generation]))) ||
            ($offsetExists && $generation === null)
        ) {
            return $generationExists
                ? $this->_parserObjectOffsets[$objectId][$generation]
                : current($this->_parserObjectOffsets[$objectId]);
        }

        return false;
    }

    /**
     * Returns the trailer dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getTrailer()
    {
        return $this->_trailer;
    }
}
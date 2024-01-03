<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Chain.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A writer class which chains different writer objects
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_Chain
    extends SetaPDF_Core_Writer_AbstractWriter
    implements SetaPDF_Core_Writer_WriterInterface
{
    /**
     * Writer instances
     *
     * @var SetaPDF_Core_Writer_WriterInterface[]
     */
    protected $_writers = array();

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Writer_WriterInterface[] $writers An array of writer instances
     */
    public function __construct(array $writers = array())
    {
        foreach ($writers AS $writer)
            $this->addWriter($writer);
    }

    /**
     * Add a writer object to the chain.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     */
    public function addWriter(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $this->_writers[] = $writer;
    }

    /**
     * Method which should/will be called when the writing process starts.
     *
     * @throws SetaPDF_Core_Writer_Exception
     */
    public function start()
    {
        if (0 === count($this->_writers)) {
            throw new SetaPDF_Core_Writer_Exception('No writers found!');
        }

        foreach ($this->_writers AS $writer) {
            $writer->start();
        }

        parent::start();
    }

    /**
     * Forward the string to the registered writer objects.
     *
     * @param string $s
     */
    public function write($s)
    {
        foreach ($this->_writers AS $writer) {
            $writer->write($s);
        }
    }

    /**
     * Forward the finish() call to the registered writer objects.
     */
    public function finish()
    {
        foreach ($this->_writers AS $writer) {
            $writer->finish();
        }
        parent::finish();
    }

    /**
     * Proxy method for the getPos() method.
     *
     * @see SetaPDF_Core_Writer_WriterInterface::getPos()
     */
    public function getPos()
    {
        reset($this->_writers);
        $writer = current($this->_writers);
        return $writer->getPos();
    }

    /**
     * Forwards the cleanUp() call to the registered writer objects.
     *
     * @see SetaPDF_Core_Writer_AbstractWriter::cleanUp()
     */
    public function cleanUp()
    {
        foreach ($this->_writers AS $writer)
            $writer->cleanUp();

        parent::cleanUp();
    }
}
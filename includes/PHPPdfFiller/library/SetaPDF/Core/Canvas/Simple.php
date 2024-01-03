<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Simple.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing minimum functions to access a Canvas.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Canvas_Simple
{
    /**
     * The main dictionary of the canvas
     *
     * @var SetaPDF_Core_Canvas_ContainerInterface
     */
    protected $_canvasContainer;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Canvas_ContainerInterface $canvasContainer
     */
    public function __construct(SetaPDF_Core_Canvas_ContainerInterface $canvasContainer)
    {
        $this->_canvasContainer = $canvasContainer;
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        $this->_canvasContainer = null;
    }

    /**
     * Get the whole byte stream of the canvas.
     *
     * @see SetaPDF_Core_Canvas_StreamProxyInterface::getStream()
     * @return string
     */
    public function getStream()
    {
        return $this->_canvasContainer->getStreamProxy()->getStream();
    }

    /**
     * Get the container of the canvas (origin object).
     *
     * @return SetaPDF_Core_Canvas_ContainerInterface
     */
    public function getContainer()
    {
        return $this->_canvasContainer;
    }

    /**
     * Returns the resources dictionary or an entry of it.
     *
     * If no resource dictionary exists it is possible to automatically
     * create it and/or the desired entry.
     *
     * @param boolean $inherited Check for a resources dictionary in parent nodes
     * @param boolean $create Create dictionary/ies if they do not exists
     * @param string $entryKey The entries key (Font, XObject,...)
     * @return bool|SetaPDF_Core_Type_AbstractType Returns the resources object or dictionary or false if none was found.
     */
    public function getResources($inherited = true, $create = false, $entryKey = null)
    {
        $mainDict = $this->_canvasContainer->getObject(true)->ensure(true);
        if ($mainDict instanceof SetaPDF_Core_Type_Stream) {
            $mainDict = $mainDict->getValue();
        }

        $dict = $mainDict;

        while (
            false === ($resourcesExists = $dict->offsetExists('Resources'))
            && true === $inherited
        ) {
            if ($dict->offsetExists('Parent')) {
                $dict = $dict->getValue('Parent')->ensure(true);
            } else {
                break;
            }
        }

        if (false === $resourcesExists) {
            if (false === $create) {
                return false;
            }

            $dict = $mainDict;
            $dict->offsetSet('Resources', new SetaPDF_Core_Type_Dictionary(array(
                new SetaPDF_Core_Type_Dictionary_Entry(
                    new SetaPDF_Core_Type_Name(SetaPDF_Core_Resource::TYPE_PROC_SET, true),
                    new SetaPDF_Core_Type_Array(array(
                        new SetaPDF_Core_Type_Name('PDF', true),
                        new SetaPDF_Core_Type_Name('Text', true),
                        new SetaPDF_Core_Type_Name('ImageB', true),
                        new SetaPDF_Core_Type_Name('ImageC', true),
                        new SetaPDF_Core_Type_Name('ImageI', true)
                    ))
                )
            )));
        }

        $resources = $dict->offsetGet('Resources')->ensure(true);

        // Get all resources
        if (null === $entryKey) {
            return $resources;
        }

        if (!$resources->offsetExists($entryKey)) {
            if (false === $create) {
                return false;
            }

            $resources->offsetSet($entryKey, new SetaPDF_Core_Type_Dictionary());
        }

        return $resources->offsetGet($entryKey)->ensure();
    }
}
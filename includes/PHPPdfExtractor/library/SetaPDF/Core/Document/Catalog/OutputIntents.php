<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: OutputIntents.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing the output intents entry
 *
 * @see PDF 32000-1:2008 - 14.11.5 Output Intents
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_OutputIntents
{
    /**
     * The documents catalog instance
     *
     * @var SetaPDF_Core_Document
     */
    protected $_catalog;

    /**
     * The output intents array
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_array;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document_Catalog $catalog
     */
    public function __construct(SetaPDF_Core_Document_Catalog $catalog)
    {
        $this->_catalog = $catalog;
    }

    /**
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument()
    {
        return $this->_catalog->getDocument();
    }

    /**
     * Release cycled references.
     */
    public function cleanUp()
    {
        $this->_array = null;
        $this->_catalog = null;
    }

    /**
     * Get and creates the AcroForm dictionary.
     *
     * @param boolean $create
     * @return boolean|SetaPDF_Core_Type_Array
     */
    public function getArray($create = false)
    {
        if ($this->_array === null) {
            $catalog = $this->_catalog->getDictionary($create);
            if ($catalog === null || !$catalog->offsetExists('OutputIntents') && $create === false
            ) {
                return null;
            }

            if ($catalog->offsetExists('OutputIntents')) {
                $this->_array = $catalog->offsetGet('OutputIntents')->ensure();

            } else {
                $this->_array = new SetaPDF_Core_Type_Array();

                $object = $this->getDocument()->createNewObject($this->_array);
                $catalog->offsetSet('OutputIntents', $object);
            }
        }

        return $this->_array;
    }

    /**
     * Get an array of available output intents.
     *
     * @return SetaPDF_Core_OutputIntent[]
     */
    public function getOutputIntents()
    {
        $result = array();
        $array = $this->getArray();
        if (null === $array)
            return $result;

        foreach ($array AS $outputIntentDictionary) {
            $result[] = new SetaPDF_Core_OutputIntent($outputIntentDictionary->ensure());
        }

        return $result;
    }

    /**
     * Add an output intent.
     *
     * @param SetaPDF_Core_OutputIntent $outputIntent
     */
    public function addOutputIntent(SetaPDF_Core_OutputIntent $outputIntent)
    {
        $array = $this->getArray(true);
        $array->push($outputIntent->getDictionary());
    }
}
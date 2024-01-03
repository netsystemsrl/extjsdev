<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: OutputIntent.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing an Output Intent dictionary entry
 *
 * @see PDF 32000-1:2008 - 14.11.5 Output Intents
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_OutputIntent
{
    /**
     * Predefined output intent subtype
     *
     * @var string
     */
    const SUBTYPE_GTS_PDFX = 'GTS_PDFX';

    /**
     * Predefined output intent subtype
     *
     * @var string
     */
    const SUBTYPE_GTS_PDFA1 = 'GTS_PDFA1';

    /**
     * Predefined output intent subtype
     *
     * @var string
     */
    const SUBTYPE_ISO_PDFE1 = 'ISO_PDFE1';

    /**
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;

    /**
     * Creates an output intent instance.
     *
     * @param string $subtype
     * @param SetaPDF_Core_IccProfile_Stream $profile
     * @return SetaPDF_Core_OutputIntent
     */
    static public function createByProfile($subtype, SetaPDF_Core_IccProfile_Stream $profile)
    {
        $parser = $profile->getParser();
        $description = new SetaPDF_Core_Type_String($parser->getDescription('PDFDocEncoding'));

        $dict = new SetaPDF_Core_Type_Dictionary(array(
            'Type' => new SetaPDF_Core_Type_Name('OutputIntent', true),
            'S' => new SetaPDF_Core_Type_Name($subtype),
            'OutputConditionIdentifier' => $description,
            'Info' => $description,
            'DestOutputProfile' => $profile->getIndirectObject()
        ));

        return new self($dict);
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_Dictionary $dictionary
     * @throws InvalidArgumentException if
     */
    public function __construct(SetaPDF_Core_Type_Dictionary $dictionary)
    {
        if (!$dictionary->offsetExists('S')) {
            throw new InvalidArgumentException('An OutputIntent requires a subtype (S) entry.');
        }

        $this->_dictionary = $dictionary;
    }

    /**
     * Get the dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }

    /**
     * Set the subtype.
     *
     * @param string $subtype
     */
    public function setSubtype($subtype)
    {
        $this->_dictionary->getValue('S')->setValue($subtype);
    }

    /**
     * Get the subtype.
     *
     * @return mixed
     */
    public function getSubtype()
    {
        return $this->_dictionary->getValue('S')->getValue();
    }

    /**
     * Set the text string concisely identifying the intended output device or production condition in human-readable form.
     *
     * @param string|null $outputCondition
     * @param string $encoding
     */
    public function setOutputCondition($outputCondition, $encoding = 'UTF-8')
    {
        if (null === $outputCondition) {
            $this->_dictionary->offsetUnset('OutputCondition');
            return;
        }

        $this->_setTextString('OutputCondition', $outputCondition, $encoding);
    }

    /**
     * Get the text string concisely identifying the intended output device or production condition in human-readable form.
     *
     * @param string $encoding
     * @return null|string
     */
    public function getOutputCondition($encoding = 'UTF-8')
    {
        return $this->_getTextString('OutputCondition', $encoding);
    }

    /**
     * Set the text string identifying the intended output device or production condition in human- or machine-readable form.
     *
     * @param string|null $outputConditionIdentifier
     * @param string $encoding
     */
    public function setOutputConditionIdentifier($outputConditionIdentifier, $encoding = 'UTF-8')
    {
        $this->_setTextString('OutputConditionIdentifier', $outputConditionIdentifier, $encoding);
    }

    /**
     * Get the text string identifying the intended output device or production condition in human- or machine-readable form.
     *
     * @param string $encoding
     * @return null|string
     */
    public function getOutputConditionIdentifier($encoding = 'UTF-8')
    {
        return $this->_getTextString('OutputConditionIdentifier', $encoding);
    }

    /**
     * Set the registry in which the condition designated by OutputConditionIdentifier is defined.
     *
     * @param string|null $registryName
     * @param string $encoding
     */
    public function setRegistryName($registryName, $encoding = 'UTF-8')
    {
        if (null === $registryName) {
            $this->_dictionary->offsetUnset('RegistryName');
            return;
        }

        $this->_setTextString('RegistryName', $registryName, $encoding);
    }

    /**
     * Get the registry in which the condition designated by OutputConditionIdentifier is defined.
     *
     * @param string $encoding
     * @return null|string
     */
    public function getRegistryName($encoding = 'UTF-8')
    {
        return $this->_getTextString('RegistryName', $encoding);
    }

    /**
     * Set the human-readable text string containing additional information or comments about the intended target device or production condition.
     *
     * @param string|null $info
     * @param string $encoding
     */
    public function setInfo($info, $encoding = 'UTF-8')
    {
        if (null === $info) {
            $this->_dictionary->offsetUnset('Info');
            return;
        }

        $this->_setTextString('Info', $info, $encoding);
    }

    /**
     * Get the human-readable text string containing additional information or comments about the intended target device or production condition.
     *
     * @param string $encoding
     * @return null|string
     */
    public function getInfo($encoding = 'UTF-8')
    {
        return $this->_getTextString('Info', $encoding);
    }

    /**
     * Set the ICC profile stream defining the transformation from the PDF document’s source colours to output device colorants.
     *
     * @param SetaPDF_Core_IccProfile_Stream $stream
     */
    public function setDestOutputProfile(SetaPDF_Core_IccProfile_Stream $stream = null)
    {
        if (null === $stream) {
            $this->_dictionary->offsetUnset('DestOutputProfile');
            return;
        }

        $this->_dictionary->offsetSet('DestOutputProfile', $stream->getIndirectObject());
    }

    /**
     * Get the ICC profile stream defining the transformation from the PDF document’s source colours to output device colorants.
     *
     * @return null|SetaPDF_Core_IccProfile_Stream
     */
    public function getDestOutputProfile()
    {
        $stream = $this->_dictionary->getValue('DestOutputProfile');
        if ($stream === null) {
            return null;
        }

        return new SetaPDF_Core_IccProfile_Stream($stream);
    }

    /**
     * Set a text stream in the dictionary.
     *
     * @param string $key
     * @param string $value
     * @param string $encoding
     */
    protected function _setTextString($key, $value, $encoding)
    {
        $this->_dictionary->offsetSet($key, new SetaPDF_Core_Type_String(
            SetaPDF_Core_Encoding::convert($value, $encoding, 'PDFDocEncoding')
        ));
    }

    /**
     * @param string $key
     * @param string $encoding
     * @return null|string
     */
    protected function _getTextString($key, $encoding)
    {
        $value = $this->_dictionary->getValue($key);
        if (null === $value) {
            return null;
        }

        return SetaPDF_Core_Encoding::convertPdfString($value->getValue(), $encoding);
    }
}
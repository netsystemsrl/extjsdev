<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FormFiller.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * The main class of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller
{
    /**
     * Version
     *
     * @var string
     */
    const VERSION = SetaPDF_Core::VERSION;

    /**
     * The document instance
     *
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * The object representing the form fields collection
     *
     * @var SetaPDF_FormFiller_Fields
     */
    protected $_fields;

    /**
     * An instance allowing access to the XFA data of a form.
     *
     * @var SetaPDF_FormFiller_Xfa
     */
    protected $_xfa;

    /**
     * Flag defining how to handle XFA information if found
     *
     * @var boolean
     */
    protected $_removeXfaInformation = false;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document $document The document instance
     */
    public function __construct(SetaPDF_Core_Document $document)
    {
        $this->_document = $document;

        $hash = spl_object_hash($this);
        $document->addBeforeSaveCallback('FormFiller-' . $hash, array($this, '_beforeSaveCallback'));
    }

    /**
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument()
    {
        return $this->_document;
    }

    /**
     * Get the fields collection object.
     *
     * @return SetaPDF_FormFiller_Fields
     */
    public function getFields()
    {
        if (null === $this->_fields)
            $this->_fields = new SetaPDF_FormFiller_Fields($this);

        return $this->_fields;
    }

    /**
     * Get the XFA helper object.
     *
     * @return bool|SetaPDF_FormFiller_Xfa
     */
    public function getXfa()
    {
        $acroForm = $this->getDocument()->getCatalog()->getAcroForm();
        $isXfaForm = $acroForm->isXfaForm();
        if (!$isXfaForm && $this->_xfa instanceof SetaPDF_FormFiller_Xfa) {
            $this->_xfa->cleanUp();
            $this->_xfa = null;
        }

        if ($this->_xfa !== null) {
            return $this->_xfa;
        }

        if ($isXfaForm && $this->_removeXfaInformation === false) {
            $this->_xfa = new SetaPDF_FormFiller_Xfa($this);
            return $this->_xfa;
        }

        return false;
    }

    /**
     * Get the AcroForm object from the document.
     *
     * This method resolves or creates the AcroForm dictionary and returns it.
     * This method is normally only used internally.
     *
     * @return bool|SetaPDF_Core_Document_Catalog_AcroForm
     * @internal
     */
    public function getAcroForm()
    {
        $acroForm = $this->getDocument()->getCatalog()->getAcroForm();

        $dictionary = $acroForm->getDictionary();
        if ($this->_removeXfaInformation) {
            $acroForm->removeXfaInformation();
        }

        return false === $dictionary
            ? false
            : $acroForm;
    }

    /**
     * Checks if the NeedAppearances flag is set or not.
     *
     * @return boolean
     */
    public function isNeedAppearancesSet()
    {
        return $this->_document->getCatalog()->getAcroForm()->isNeedAppearancesSet();
    }

    /**
     * Set the NeedAppearances flag.
     *
     * This flag indicates the viewer to re-render the form field appearances.
     *
     * @param boolean $needAppearances The NeedAppearances flag status
     * @return void
     */
    public function setNeedAppearances($needAppearances = true)
    {
        $this->_document->getCatalog()->getAcroForm()->setNeedAppearances($needAppearances);
    }

    /**
     * Set the flag for handling XFA information.
     *
     * @param boolean $removeXfaInformation The RemoveXfaInformation flag status
     */
    public function setRemoveXfaInformation($removeXfaInformation)
    {
        $this->_removeXfaInformation = (boolean)$removeXfaInformation;
    }

    /**
     * Get the flag how to handling XFA information.
     *
     * @return boolean
     */
    public function getRemoveXfaInformation()
    {
        return $this->_removeXfaInformation;
    }

    /**
     * Save the document.
     *
     * A proxy method to the documents save() method.
     *
     * @see SetaPDF_Core_Document::save()
     * @param boolean $update Update the document or rewrite it completely
     * @deprecated Deprecated since version 2.5
     */
    public function save($update = true)
    {
        $this->_document->save($update);
    }

    /**
     * The callback that is called before the save method is triggered.
     *
     * @param SetaPDF_Core_Document $document
     * @internal
     */
    public function _beforeSaveCallback(SetaPDF_Core_Document $document)
    {
        if ($this->_removeXfaInformation === true) {
            $document->getCatalog()->getAcroForm()->removeXfaInformation();
        }

        $info = $document->getInfo();
        $info->setSyncMetadata(true);
        try {
            $info->setModDate(new SetaPDF_Core_DataStructure_Date());
            $producer = $info->getProducer();

            $newProducer = 'SetaPDF-FormFiller Component v' . self::VERSION .
                ' ©Setasign 2005-' . date('Y') . ' (www.setasign.com)';

            if ($producer) {
                $pos = strpos($producer, '; modified by ');
                if ($pos !== false) {
                    $producer = substr($producer, 0, $pos);
                }

                if ($producer != $newProducer) {
                    $producer .= '; modified by ';
                    $producer .= $newProducer;
                }
            } else {
                $producer = $newProducer;
            }

            $info->setProducer($producer);
            $info->syncMetadata();
        } catch (SetaPDF_Core_SecHandler_Exception $e) {
            // ignore updating of producer meta data
            $info->syncMetadata();
        }

        $xfa = $this->getXfa();
        if ($xfa) {
            $xfa->syncDataNode();
            $xfa->saveTemplate(true);
        }
    }

    /**
     * Release objects to free memory and cycled references.
     *
     * After calling this method the instance of this object is unusable.
     *
     * @return void
     */
    public function cleanUp()
    {
        if (null !== $this->_fields)
            $this->_fields->cleanUp();
        $this->_fields = null;

        if (null !== $this->_xfa)
            $this->_xfa->cleanUp();
        $this->_xfa = null;

        /* This should be called manually to let different
         * instances work on the document
         */
        // $this->_document->cleanUp();

        $hash = spl_object_hash($this);
        $this->_document->removeBeforeSaveCallback('FormFiller-' . $hash);

        $this->_document = null;
    }
}
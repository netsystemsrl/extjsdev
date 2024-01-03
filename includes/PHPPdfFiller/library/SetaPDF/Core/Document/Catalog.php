<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Catalog.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing the document catalog
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog
{
    /**
     * The document instance
     *
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * The viewer preferences object
     *
     * @var SetaPDF_Core_Document_Catalog_ViewerPreferences
     */
    protected $_viewerPreferences;

    /**
     * Pages instance
     *
     * @var SetaPDF_Core_Document_Catalog_Pages
     */
    protected $_pages;

    /**
     * Names instance
     *
     * @var SetaPDF_Core_Document_Catalog_Names
     */
    protected $_names;

    /**
     * The documents page labels object
     *
     * @var SetaPDF_Core_Document_Catalog_PageLabels
     */
    protected $_pageLabels;

    /**
     * The documents AcroForm object
     *
     * @var SetaPDF_Core_Document_Catalog_AcroForm
     */
    protected $_acroForm;

    /**
     * The documents outlines object
     *
     * @var SetaPDF_Core_Document_Catalog_Outlines
     */
    protected $_outlines;
    
    /**
     * The optional content object
     * 
     * @var SetaPDF_Core_Document_Catalog_OptionalContent
     */
    protected $_optionalContent;

    /**
     * The output intent object
     *
     * @var SetaPDF_Core_Document_Catalog_OutputIntents
     */
    protected $_outputIntents;

    /**
     * The additional actions object
     *
     * @var SetaPDF_Core_Document_Catalog_AdditionalActions
     */
    protected $_additionalActions;

    /**
     * The permissions object
     *
     * @var SetaPDF_Core_Document_Catalog_Permissions
     */
    protected $_permissions;

    /**
     * The extensions object
     *
     * @var SetaPDF_Core_Document_Catalog_Extensions
     */
    protected $_extensions;

    /**
     * Returns method names which should be available in a documents instance too.
     *
     * @return array
     */
    static public function getDocumentMagicMethods()
    {
        return array(
            'getPageLayout',
            'setPageLayout',
            'getPageMode',
            'setPageMode',
            'getMetadata',
            'setMetadata',
            'getBaseUri',
            'setBaseUri',
            'getViewerPreferences',
            'getPages',
            'getNames',
            'getPageLabels',
            'getAcroForm',
            'getOutlines',
            'getOptionalContent',
            'getOutputIntents',
            'getPermissions',
            'getExtensions',
        );
    }
    
    /**
     * The constructor.
     * 
     * @param SetaPDF_Core_Document $document
     */
    public function __construct(SetaPDF_Core_Document $document)
    {
        $this->_document = $document;
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
     * Release cycled references / memory.
     */
    public function cleanUp()
    {
        if (null !== $this->_viewerPreferences) {
            $this->_viewerPreferences->cleanUp();
            $this->_viewerPreferences = null;
        }

        if (null !== $this->_pages) {
            $this->_pages->cleanUp();
            $this->_pages = null;
        }

        if (null !== $this->_names) {
            $this->_names->cleanUp();
            $this->_names = null;
        }

        if (null !== $this->_pageLabels) {
            $this->_pageLabels->cleanUp();
            $this->_pageLabels = null;
        }

        if (null !== $this->_acroForm) {
            $this->_acroForm->cleanUp();
            $this->_acroForm = null;
        }

        if (null !== $this->_outlines) {
            $this->_outlines->cleanUp();
            $this->_outlines = null;
        }

        if (null !== $this->_outputIntents) {
            $this->_outputIntents->cleanUp();
            $this->_outputIntents = null;
        }

        if (null !== $this->_additionalActions) {
            $this->_additionalActions->cleanUp();
            $this->_additionalActions = null;
        }

        if (null !== $this->_permissions) {
            $this->_permissions->cleanUp();
            $this->_permissions = null;
        }

        if (null !== $this->_extensions) {
            $this->_extensions->cleanUp();
            $this->_extensions = null;
        }

        $this->_document = null;
    }

    /**
     * Get the catalog dictionary.
     *
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary($create = false)
    {
        $trailer = $this->_document->getTrailer();
        if (!$trailer->offsetExists('Root')) {
            if (false === $create)
                return null;

            SetaPDF_Core_SecHandler::checkPermission($this->_document, SetaPDF_Core_SecHandler::PERM_MODIFY);

            $trailer->offsetSet('Root', $this->_document->createNewObject(
                new SetaPDF_Core_Type_Dictionary(array(
                    'Type' => new SetaPDF_Core_Type_Name('Catalog', true)
                ))
            ));
        }

        return $trailer->offsetGet('Root')->ensure();
    }

    /**
     * Get the value of the Version entry of the catalog dictionary.
     *
     * This value defines the version of the PDF specification to which the document conforms if
     * later than the version specified in the file's header.
     *
     * @return string|null
     */
    public function getVersion()
    {
        $catalog = $this->getDictionary();
        if (
            null === $catalog
            || !$catalog->offsetExists('Version')
        ) {
            return null;
        }

        return $catalog->getValue('Version')->getValue();
    }

    /**
     * Set the version of the PDF specification to which the document conforms.
     *
     * @param string $version
     */
    public function setVersion($version)
    {
        $catalog = $this->getDictionary(true);
        if (null === $version) {
            if ($this->getVersion() !== null) {
                $catalog->offsetUnset('Version');
            }
        } else {
            $catalog->offsetSet('Version', new SetaPDF_Core_Type_Name($version));
        }
    }

    /**
     * Get the extensions helper instance.
     *
     * @return SetaPDF_Core_Document_Catalog_Extensions
     */
    public function getExtensions()
    {
        if (null === $this->_extensions)
            $this->_extensions = new SetaPDF_Core_Document_Catalog_Extensions($this);

        return $this->_extensions;
    }

    /**
     * Get the page layout.
     *
     * @see PDF 32000-1:2008 - 7.7.2 Document Catalog
     * @return string
     */
    public function getPageLayout()
    {
        $catalog = $this->getDictionary();
        if (
            null === $catalog
            || !$catalog->offsetExists('PageLayout')
        ) {
            return SetaPDF_Core_Document_PageLayout::SINGLE_PAGE;
        }

        return $catalog->getValue('PageLayout')->getValue();
    }

    /**
     * Set the page layout.
     *
     * Possible values are declared as class constants in the {@link SetaPDF_Core_Document_PageLayout} class.
     *
     * @TODO Check for valid values
     * @see SetaPDF_Core_Document_PageLayout
     * @param string $pageLayout The name of the page layout
     */
    public function setPageLayout($pageLayout)
    {
        $catalog = $this->getDictionary(true);
        $catalog->offsetSet('PageLayout', new SetaPDF_Core_Type_Name($pageLayout));

        switch ($pageLayout) {
            case SetaPDF_Core_Document_PageLayout::TWO_PAGE_LEFT:
            case SetaPDF_Core_Document_PageLayout::TWO_PAGE_RIGHT:
                $this->getDocument()->setMinPdfVersion('1.5');
        }
    }

    /**
     * Get the page mode.
     *
     * @see PDF 32000-1:2008 - 7.7.2 Document Catalog
     * @return string
     */
    public function getPageMode()
    {
        $catalog = $this->getDictionary();
        if (
            null === $catalog
            || !$catalog->offsetExists('PageMode')
        ) {
            return SetaPDF_Core_Document_PageMode::USE_NONE;
        }

        return $catalog->getValue('PageMode')->getValue();
    }

    /**
     * Set the page mode.
     *
     * Possible values are declared as class constants in the {@link SetaPDF_Core_Document_PageMode} class.
     *
     * @todo Check for valid values
     * @see SetaPDF_Core_Document_PageMode
     * @param string $pageMode The name of the page mode
     */
    public function setPageMode($pageMode)
    {
        $catalog = $this->getDictionary(true);
        $catalog->offsetSet('PageMode', new SetaPDF_Core_Type_Name($pageMode));

        switch ($pageMode) {
            case SetaPDF_Core_Document_PageMode::USE_OC:
                $this->getDocument()->setMinPdfVersion('1.5');
                break;
            case SetaPDF_Core_Document_PageMode::USE_ATTACHMENTS:
                $this->getDocument()->setMinPdfVersion('1.6');
                break;
        }
    }

    /**
     * Get the metadata stream.
     *
     * This is a method for low level access to the XMP stream data. The {@link SetaPDF_Core_Document_Info} class
     * offers a {@link SetaPDF_Core_Document_Info::getMetadata() same named} method, that allows you to access the
     * XMP package via a DOMDocument instance.
     *
     * The class also allows you to automatically sync Info dictionary data with the XMP metadata.
     *
     * @return null|string Null if no document metadata are available.<br/>
     *                     A string if the desired structure is available.
     */
    public function getMetadata()
    {
        $catalog = $this->getDictionary();

        if (
            null === $catalog ||
            !$catalog->offsetExists('Metadata')
        ) {
            return null;
        }

        try {
            $metadataStream = $catalog->getValue('Metadata')->ensure();
            if ($metadataStream instanceof SetaPDF_Core_Type_Stream) {
                return $metadataStream->getStream();
            }
        } catch (SetaPDF_Core_Type_IndirectReference_Exception $e) {
            // if the object is not found this entry is invalid.
        }
        return null;
    }

    /**
     * Set the metadata stream.
     *
     * To remove the metadata just pass null to this method.
     *
     * @TODO Automatically remove the XML declaration in the first line
     * @param string $metadata
     */
    public function setMetadata($metadata)
    {
        $catalog = $this->getDictionary(true);
        $metadataExists = $catalog->offsetExists('Metadata');

        if ($metadata === null) {
            if ($metadataExists) {
                $streamReference = $catalog->getValue('Metadata');
                $this->getDocument()->deleteObject($streamReference->getValue());
                $catalog->offsetUnset('Metadata');
            }
            return;
        }

        if ($metadataExists) {
            try {
                $stream = $catalog->getValue('Metadata')->ensure();
                $stream->setStream($metadata);
                return;
            } catch (SetaPDF_Core_Type_IndirectReference_Exception $e) {
                // ignore this and create a new object
            }
        }

        $stream = new SetaPDF_Core_Type_Stream();
        $streamDictionary = new SetaPDF_Core_Type_Dictionary();
        $streamDictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('Metadata', true));
        $streamDictionary->offsetSet('Subtype', new SetaPDF_Core_Type_Name('XML', true));
        $stream->setValue($streamDictionary);
        $stream->setStream($metadata);

        $catalog->offsetSet('Metadata', $this->_document->createNewObject($stream));
    }

    /**
     * Get the base URI that shall be used in resolving relative URI references.
     *
     * URI actions within the document may specify URIs in partial form, to be
     * interpreted relative to this base address. If no base URI is specified,
     * such partial URIs shall be interpreted relative to the location of the
     * document itself.
     *
     * @return null|string
     */
    public function getBaseUri()
    {
        $catalog = $this->getDictionary();
        if (
            null === $catalog ||
            !$catalog->offsetExists('URI')
        ) {
            return null;
        }

        $uriDict = $catalog->offsetGet('URI')->ensure();

        return $uriDict->getValue('Base')->getValue();
    }

    /**
     * Set the base URI.
     *
     * @see SetaPDF_FormFiller::getBaseUri()
     * @param string $uri
     * @return void
     */
    public function setBaseUri($uri)
    {
        $catalog = $this->getDictionary(true);

        if (!$catalog->offsetExists('URI')) {
            $catalog->offsetSet('URI', new SetaPDF_Core_Type_Dictionary());
        }

        $uriDict = $catalog->offsetGet('URI')->ensure();
        $uriDict->offsetSet('Base', new SetaPDF_Core_Type_String($uri));
    }

    /**
     * Get a viewer preferences object.
     *
     * @return SetaPDF_Core_Document_Catalog_ViewerPreferences
     */
    public function getViewerPreferences()
    {
        if (null === $this->_viewerPreferences) {
            $this->_viewerPreferences = new SetaPDF_Core_Document_Catalog_ViewerPreferences($this);
        }

        return $this->_viewerPreferences;
    }

    /**
     * Get a pages object from the document.
     *
     * @return SetaPDF_Core_Document_Catalog_Pages
     */
    public function getPages()
    {
        if (null === $this->_pages) {
            $this->_pages = new SetaPDF_Core_Document_Catalog_Pages($this);
        }

        return $this->_pages;
    }

    /**
     * Get a names object from the document.
     *
     * @return SetaPDF_Core_Document_Catalog_Names
     */
    public function getNames()
    {
        if (null === $this->_names) {
            $this->_names = new SetaPDF_Core_Document_Catalog_Names($this);
        }

        return $this->_names;
    }

    /**
     * Get the documents page labels object.
     *
     * @return SetaPDF_Core_Document_Catalog_PageLabels
     */
    public function getPageLabels()
    {
        if (null === $this->_pageLabels) {
            $this->_pageLabels = new SetaPDF_Core_Document_Catalog_PageLabels($this);
        }

        return $this->_pageLabels;
    }

    /**
     * Get the documents AcroForm object.
     *
     * This method resolves or creates the AcroForm dictionary and returns it.
     *
     * @return SetaPDF_Core_Document_Catalog_AcroForm
     */
    public function getAcroForm()
    {
        if (null === $this->_acroForm) {
            $this->_acroForm = new SetaPDF_Core_Document_Catalog_AcroForm($this);
        }

        return $this->_acroForm;
    }

    /**
     * Get the documents outline object.
     *
     * @return SetaPDF_Core_Document_Catalog_Outlines
     */
    public function getOutlines()
    {
        if (null === $this->_outlines)
            $this->_outlines = new SetaPDF_Core_Document_Catalog_Outlines($this);

        return $this->_outlines;
    }
    
    /**
     * Get the documents optional content object.
     *
     * @return SetaPDF_Core_Document_Catalog_OptionalContent
     */
    public function getOptionalContent()
    {
        if (null === $this->_optionalContent)
            $this->_optionalContent = new SetaPDF_Core_Document_Catalog_OptionalContent($this);
    
        return $this->_optionalContent;
    }

    /**
     * Get the output intents object.
     *
     * @return SetaPDF_Core_Document_Catalog_OutputIntents
     */
    public function getOutputIntents()
    {
        if (null === $this->_outputIntents)
            $this->_outputIntents = new SetaPDF_Core_Document_Catalog_OutputIntents($this);

        return $this->_outputIntents;
    }

    /**
     * Get the additional actions object.
     *
     * @return SetaPDF_Core_Document_Catalog_AdditionalActions
     */
    public function getAdditionalActions()
    {
        if (null === $this->_additionalActions)
            $this->_additionalActions = new SetaPDF_Core_Document_Catalog_AdditionalActions($this);

        return $this->_additionalActions;
    }

    /**
     * Get the permission object.
     *
     * @return SetaPDF_Core_Document_Catalog_Permissions
     */
    public function getPermissions()
    {
        if (null === $this->_permissions)
            $this->_permissions = new SetaPDF_Core_Document_Catalog_Permissions($this);

        return $this->_permissions;
    }

    /**
     * Get the open action.
     *
     * The open action entry specifies a destination that shall be displayed or an action that shall be executed when
     * the document is opened.
     *
     * Additional document related actions could be get or set in the
     * {@link SetaPDF_Core_Document_Catalog_AdditionalActions} class that could be get with the
     * {@link getAdditionalActions()} method.
     *
     * @return null|SetaPDF_Core_Document_Action|SetaPDF_Core_Document_Destination An action or destination instance or
     *                                                                             null if no open action is defined.
     * @throws SetaPDF_Core_Exception
     */
    public function getOpenAction()
    {
        $dictionary = $this->getDictionary();
        if (!$dictionary || !$dictionary->offsetExists('OpenAction'))
            return null;

        $openActionValue = $dictionary->getValue('OpenAction');
        $openAction = $openActionValue->ensure(true);
        if ($openAction instanceof SetaPDF_Core_Type_Array) {
            return new SetaPDF_Core_Document_Destination($openActionValue);
        } elseif ($openAction instanceof SetaPDF_Core_Type_Dictionary) {
            return SetaPDF_Core_Document_Action::byObjectOrDictionary($openActionValue);
        }

        throw new SetaPDF_Core_Exception('Unsupported OpenAction type: ' . get_class($openAction));
    }

    /**
     * Set the open action.
     *
     * The open action entry specifies a destination that shall be displayed or an action that shall be executed when
     * the document is opened.
     *
     * Additional document related actions could be get or set in the
     * {@link SetaPDF_Core_Document_Catalog_AdditionalActions} class that could be get with the
     * {@link getAdditionalActions()} method.
     *
     * @param SetaPDF_Core_Document_Destination|SetaPDF_Core_Document_Action $openAction
     *          An {@link SetaPDF_Core_Document_Action} or {@link SetaPDF_Core_Document_Destination} object
     * @throws InvalidArgumentException
     */
    public function setOpenAction($openAction)
    {
        if (!($openAction instanceof SetaPDF_Core_Document_Destination) &&
            !($openAction instanceof SetaPDF_Core_Document_Action)
        ) {
            throw new InvalidArgumentException(
                'Open action parameter has to be an instance of SetaPDF_Core_Document_Destination or ' .
                'SetaPDF_Core_Document_Action'
            );
        }

        $dictionary = $this->getDictionary(true);
        $dictionary->offsetSet('OpenAction', $openAction->getPdfValue());
    }
}
<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Names.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class for handling Names in a PDF document
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_Names
{
    /**
     * Name/Category key
     *
     * @var string
     */
    const DESTS = 'Dests';

    /**
     * Name/Category key
     *
     * @var string
     */
    const AP = 'AP';

    /**
     * Name/Category key
     *
     * @var string
     */
    const JAVA_SCRIPT = 'JavaScript';

    /**
     * Name/Category key
     *
     * @var string
     */
    const PAGES = 'Pages';

    /**
     * Name/Category key
     *
     * @var string
     */
    const TEMPLATES = 'Templates';

    /**
     * Name/Category key
     *
     * @var string
     */
    const IDS = 'IDS';

    /**
     * Name/Category key
     *
     * @var string
     */
    const URLS = 'URLS';

    /**
     * Name/Category key
     *
     * @var string
     */
    const EMBEDDED_FILES = 'EmbeddedFiles';

    /**
     * Name/Category key
     *
     * @var string
     */
    const ALTERNATE_PRESENTATIONS = 'AlternatePresentations';

    /**
     * Name/Category key
     *
     * @var string
     */
    const RENDITIONS = 'Renditions';

    /**
     * The catalog instance
     *
     * @var SetaPDF_Core_Document_Catalog
     */
    protected $_catalog;

    /**
     * The Names dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_namesDictionary;

    /**
     * @var array
     */
    protected $_nameTrees = array();

    /**
     * @var SetaPDF_Core_Document_Catalog_Names_EmbeddedFiles
     */
    protected $_embeddedFiles;

    /**
     * Returns all available category keys of possible name trees.
     *
     * @return array
     */
    static public function getAvailableCategoryKeys()
    {
        return array(
            self::DESTS, self::AP, self::JAVA_SCRIPT, self::PAGES,
            self::TEMPLATES, self::IDS, self::URLS, self::EMBEDDED_FILES,
            self::ALTERNATE_PRESENTATIONS, self::RENDITIONS
        );
    }

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
     * Get a name tree by its name.
     *
     * @param string $name
     * @param boolean $create
     * @return SetaPDF_Core_DataStructure_NameTree|null
     */
    public function getTree($name, $create = false)
    {
        if (isset($this->_nameTrees[$name]))
            return $this->_nameTrees[$name];

        $names = $this->getNamesDictionary($create);
        if (null === $names)
            return null;

        $exists = $names->offsetExists($name);
        if (false === $exists && false === $create)
            return null;

        if (false === $exists) {
            SetaPDF_Core_SecHandler::checkPermission($this->getDocument(), SetaPDF_Core_SecHandler::PERM_MODIFY);

            $object = $this->getDocument()->createNewObject(new SetaPDF_Core_Type_Dictionary());
            $names->offsetSet($name, $object);
        }

        try {
            $this->_nameTrees[$name] = new SetaPDF_Core_DataStructure_NameTree($names->offsetGet($name)->ensure(), $this->getDocument());
        } catch (SetaPDF_Core_Type_IndirectReference_Exception $e) {
            return null;
        }

        return $this->_nameTrees[$name];
    }

    /**
     * Get all available name trees.
     *
     * @return array Array of SetaPDF_Core_DataStructure_NameTree objects
     * @see getAvailableCategoryKeys()
     */
    public function getTrees()
    {
        foreach (self::getAvailableCategoryKeys() AS $key) {
            $this->getTree($key);
        }

        return $this->_nameTrees;
    }

    /**
     * Returns the Names dictionary in the document's catalog.
     *
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Dictionary
     */
    public function getNamesDictionary($create = false)
    {
        if (null === $this->_namesDictionary) {
            $catalog = $this->getDocument()->getCatalog()->getDictionary($create);
            // if $create is true $catalog will not be null at any time
            if (
                $catalog === null ||
                !$catalog->offsetExists('Names') && $create === false
            ) {
                return null;
            }

            if (!$catalog->offsetExists('Names')) {
                $names = $this->getDocument()->createNewObject(new SetaPDF_Core_Type_Dictionary());
                $catalog->offsetSet('Names', $names);
            }

            $this->_namesDictionary = $catalog->offsetGet('Names')->ensure();
        }

        return $this->_namesDictionary;
    }

    /**
     * Release objects to free memory and cycled references.
     *
     * After calling this method the instance of this object is unusable!
     *
     * @return void
     */
    public function cleanUp()
    {
        foreach ($this->_nameTrees AS $nameTree) {
            $nameTree->cleanUp();
        }
        $this->_nameTrees = array();

        if (null !== $this->_embeddedFiles) {
            $this->_embeddedFiles->cleanUp();
        }

        $this->_catalog = null;
    }

    /**
     * Get the embedded files helper.
     *
     * @return SetaPDF_Core_Document_Catalog_Names_EmbeddedFiles
     */
    public function getEmbeddedFiles()
    {
        if (null === $this->_embeddedFiles) {
            $this->_embeddedFiles = new SetaPDF_Core_Document_Catalog_Names_EmbeddedFiles($this);
        }

        return $this->_embeddedFiles;
    }
}
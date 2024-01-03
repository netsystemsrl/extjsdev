<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: EmbeddedFiles.php 1339 2019-06-13 12:31:49Z jan.slabon $
 */

/**
 * Class allowing access to embedded files.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_Names_EmbeddedFiles
{
    /**
     * The names instance
     *
     * @var SetaPDF_Core_Document_Catalog_Names
     */
    protected $_names;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document_Catalog_Names $names
     */
    public function __construct(SetaPDF_Core_Document_Catalog_Names $names)
    {
        $this->_names = $names;
    }

    /**
     * Release cycled references.
     */
    public function cleanUp()
    {
        $this->_names = null;
    }

    /**
     * Get the tree instance.
     *
     * @param boolean $create
     * @return null|SetaPDF_Core_DataStructure_NameTree
     */
    private function _getTree($create = false)
    {
        return $this->_names->getTree(SetaPDF_Core_Document_Catalog_Names::EMBEDDED_FILES, $create);
    }

    /**
     * Get all embedded files.
     *
     * @return SetaPDF_Core_FileSpecification[]
     */
    public function getAll()
    {
        $tree = $this->_getTree();
        if (null === $tree) {
            return [];
        }

        return $tree->getAll(false, 'SetaPDF_Core_FileSpecification');
    }

    /**
     * Get an embedded file by its name.
     *
     * @param string $name
     * @return false|SetaPDF_Core_FileSpecification
     */
    public function get($name)
    {
        $tree = $this->_getTree();
        if (null === $tree) {
            return false;
        }

        return $tree->get($name, 'SetaPDF_Core_FileSpecification');
    }

    /**
     * Adds an embedded file by its file specification.
     *
     * @param string $name The unique name in the name tree for embedded files. This string shall be a PDF string in
     *                     PDFDoc encoding oder UTF-16BE.
     * @param SetaPDF_Core_FileSpecification $fileSpecification
     * @return SetaPDF_Core_Type_IndirectObject
     * @throws SetaPDF_Core_DataStructure_Tree_KeyAlreadyExistsException
     */
    public function add($name, SetaPDF_Core_FileSpecification $fileSpecification)
    {
        $embeddedFileStream = $fileSpecification->getEmbeddedFileStream();
        if (false === $embeddedFileStream) {
            throw new InvalidArgumentException(
                'The file specification needs to have an embedded file stream attached.'
            );
        }

        $this->_getTree(true)->add(
            $name,
            $object = $this->_names->getDocument()->createNewObject($fileSpecification->getDictionary())
        );

        return $object;
    }

    /**
     * Remove an embedded file.
     *
     * @param string $name No encoding is used. The name needs to be passed as it is registered in the name tree.
     * @param bool $removeObjects If this is set to false only the registration in the name tree is removed. By default
     *                            also the embedded streams will be deleted.
     * @return bool
     */
    public function remove($name, $removeObjects = true)
    {
        $tree = $this->_getTree();
        if (null === $tree) {
            return false;
        }

        $fsValue = $tree->get($name);
        if (false === $fsValue) {
            return false;
        }

        if ($removeObjects) {
            $document = $this->_names->getDocument();
            $_fs = new SetaPDF_Core_FileSpecification($fsValue);
            $f = $_fs->getEmbeddedFileStream();
            if ($f) {
                $document->deleteObject($f->getIndirectObject());
            }

            $uf = $_fs->getEmbeddedFileStream(true);
            if ($uf) {
                $document->deleteObject($uf->getIndirectObject());
            }

            if ($fsValue instanceof SetaPDF_Core_Type_IndirectReference) {
                $document->deleteObject($fsValue);
            }
        }

        return $tree->remove($name);
    }
}
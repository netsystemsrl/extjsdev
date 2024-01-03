<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ViewerPreferences.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing the access to the ViewerPreferences dictionary of a document
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_ViewerPreferences
{
    /**
     * Constant value specifying how to display the document on exiting full-screen mode.
     *
     * Neither document outline nor thumbnail images visible.
     *
     * @var string
     */
    const NON_FULL_SCREEN_PAGE_MODE_USE_NONE = 'UseNone';

    /**
     * Constant value specifying how to display the document on exiting full-screen mode.
     *
     * Document outline visible.
     *
     * @var string
     */
    const NON_FULL_SCREEN_PAGE_MODE_USE_OUTLINES = 'UseOutlines';

    /**
     * Constant value specifying how to display the document on exiting full-screen mode.
     *
     * Thumbnail images visible.
     *
     * @var string
     */
    const NON_FULL_SCREEN_PAGE_MODE_USE_THUMBS = 'UseThumbs';

    /**
     * Constant value specifying how to display the document on exiting full-screen mode.
     *
     * Optional content group panel visible.
     *
     * @var string
     */
    const NON_FULL_SCREEN_PAGE_MODE_USE_OC = 'UseOC';

    /**
     * Constant value for predominant reading order for text.
     *
     * Left to right.
     *
     * @var string
     */
    const DIRECTION_L2R = 'L2R';

    /**
     * Constant value for predominant reading order for text.
     *
     * Right to left.
     *
     * @var string
     */
    const DIRECTION_R2L = 'R2L';

    /**
     * Constant value of the the page scaling option that shall be selected when a print dialog is displayed for this document.
     *
     * No page scaling.
     *
     * @var string
     */
    const PRINT_SCALING_NONE = 'None';

    /**
     * Constant value of the the page scaling option that shall be selected when a print dialog is displayed for this document.
     *
     * Reader’s default print scaling.
     *
     * @var string
     */
    const PRINT_SCALING_APP_DEFAULT = 'AppDefault';

    /**
     * Constant value of the paper handling option that shall be used when printing the file from the print dialog.
     *
     * Print single-sided.
     *
     * @var string
     */
    const DUPLEX_SIMPLEX = 'Simplex';

    /**
     * Constant value of the paper handling option that shall be used when printing the file from the print dialog.
     *
     * Duplex and flip on the short edge of the sheet.
     *
     * @var string
     */
    const DUPLEX_FLIP_SHORT_EDGE = 'DuplexFlipShortEdge';

    /**
     * Constant value of the paper handling option that shall be used when printing the file from the print dialog.
     *
     * Duplex and flip on the long edge of the sheet.
     *
     * @var string
     */
    const DUPLEX_FLIP_LONG_EDGE = 'DuplexFlipLongEdge';

    /**
     * The catalog instance
     *
     * @var SetaPDF_Core_Document_Catalog
     */
    protected $_catalog;

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
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
    	$this->_catalog = null;
    }

    /**
     * Set the flag specifying whether to hide the conforming reader’s tool bars when the document is active.
     *
     * @param boolean $value A boolean value defining whether to hide the tool bars or not.
     */
    public function setHideToolbar($value = true)
    {
        $this->_setBooleanValue('HideToolbar', $value);
    }

    /**
     * Get the flag specifying whether to hide the conforming reader’s tool bars when the document is active.
     *
     * @return boolean
     */
    public function getHideToolbar()
    {
    	return $this->_getValue('HideToolbar');
    }

    /**
     * Set the flag specifying whether to hide the conforming reader’s menu bar when the document is active.
     *
     * Does not affect the display through a browser plugin.
     *
     * @param boolean $value A boolean value defining whether to hide the menu bar or not.
     */
    public function setHideMenubar($value = true)
    {
        $this->_setBooleanValue('HideMenubar', $value);
    }

    /**
     * Get the flag specifying whether to hide the conforming reader’s menu bar when the document is active.
     *
     * @return boolean
     */
    public function getHideMenubar()
    {
    	return $this->_getValue('HideMenubar');
    }

    /**
     * Set flag specifying whether to hide user interface elements in the document’s window
     * (such as scroll bars and navigation controls), leaving only the document’s contents displayed.
     *
     * @param boolean $value A boolean value defining whether to hide user interface elements in the document's windows.
     */
    public function setHideWindowUI($value = true)
    {
    	$this->_setBooleanValue('HideWindowUI', $value);
    }

    /**
     * Get flag specifying whether to hide user interface elements in the document’s window
     * (such as scroll bars and navigation controls), leaving only the document’s contents displayed.
     *
     * @return boolean
     */
    public function getHideWindowUI()
    {
    	return $this->_getValue('HideWindowUI');
    }

    /**
     * Set the flag specifying whether to resize the document’s window to fit the size of the first displayed page.
     *
     * @param boolean $value A boolean value defining whether to resize the document’s window.
     */
    public function setFitWindow($value = true)
    {
    	$this->_setBooleanValue('FitWindow', $value);
    }

    /**
     * Get the flag specifying whether to resize the document’s window to fit the size of the first displayed page.
     *
     * @return boolean
     */
    public function getFitWindow()
    {
    	return $this->_getValue('FitWindow');
    }

    /**
     * Set the flag specifying whether to position the document’s window in the center of the screen.
     *
     * @param boolean $value A boolean value defining whether to position the document’s window in the center.
     */
    public function setCenterWindow($value = true)
    {
    	$this->_setBooleanValue('CenterWindow', $value);
    }

    /**
     * Get the flag specifying whether to position the document’s window in the center of the screen.
     *
     * @return boolean
     */
    public function getCenterWindow()
    {
    	return $this->_getValue('CenterWindow');
    }

    /**
     * Set the flag whether the title or the filename of the document should be displayed in the window’s title bar.
     *
     * @param boolean $value The value defining whether if the title of the document should be displayed in the
     *                       window’s title bar (true) or the filename (false).
     */
    public function setDisplayDocTitle($value = true)
    {
    	$this->_setBooleanValue('DisplayDocTitle', $value);
    	if (true === $value) {
    	    $this->getDocument()->setMinPdfVersion('1.4');
    	}
    }

    /**
     * Get the flag whether the title or the filename of the document should be displayed in the window’s title bar.
     *
     * @return boolean
     */
    public function getDisplayDocTitle()
    {
    	return $this->_getValue('DisplayDocTitle');
    }

    /**
     * Set the document's page mode, specifying how to display the document on exiting full-screen mode.
     *
     * @param string $name A constant value of
     *                     {@link SetaPDF_Core_Document_Catalog_ViewerPreferences::NON_FULL_SCREEN_PAGE_MODE_XXX}.
     */
    public function setNonFullScreenPageMode($name = self::NON_FULL_SCREEN_PAGE_MODE_USE_NONE)
    {
        // TODO: Check for allowed values
        $this->_setNameValue('NonFullScreenPageMode', $name);
    }

    /**
     * Get the document's page mode, specifying how to display the document on exiting full-screen mode.
     *
     * @return string
     */
    public function getNonFullScreenPageMode()
    {
        return $this->_getValue('NonFullScreenPageMode', self::NON_FULL_SCREEN_PAGE_MODE_USE_NONE);
    }

    /**
     * Set the predominant reading order for text.
     *
     * @param string $name A constant value of {@link SetaPDF_Core_Document_Catalog_ViewerPreferences::DIRECTION_XXX}.
     */
    public function setDirection($name)
    {
        // TODO: Check for allowed values
        $this->_setNameValue('Direction', $name);
        $this->getDocument()->setMinPdfVersion('1.3');
    }

    /**
     * Get the predominant reading order for text.
     *
     * @return string
     */
    public function getDirection()
    {
        return $this->_getValue('Direction', self::DIRECTION_L2R);
    }

    /**
     * Set the page boundary representing the area of a page that shall be displayed when
     * viewing the document on the screen.
     *
     * @param string $boundaryName A boundary name as defined as a constant in {@link SetaPDF_Core_PageBoundaries}.
     * @throws InvalidArgumentException
     */
    public function setViewArea($boundaryName)
    {
        if (!SetaPDF_Core_PageBoundaries::isValidName($boundaryName)) {
            throw new InvalidArgumentException(
                "'%' is an invalid page boundary."
            );
        }
        $this->_setNameValue('ViewArea', $boundaryName);
        $this->getDocument()->setMinPdfVersion('1.4');
    }

    /**
     * Get the page boundary representing the area of a page that shall be displayed when
     * viewing the document on the screen.
     *
     * @return string
     */
    public function getViewArea()
    {
        return $this->_getValue('ViewArea', SetaPDF_Core_PageBoundaries::CROP_BOX);
    }

    /**
     * Set the name of the page boundary to which the contents of a page shall be clipped when
     * viewing the document on the screen.
     *
     * @param string $boundaryName A boundary name as defined as a constant in {@link SetaPDF_Core_PageBoundaries}.
     * @throws InvalidArgumentException
     */
    public function setViewClip($boundaryName)
    {
        if (!SetaPDF_Core_PageBoundaries::isValidName($boundaryName)) {
            throw new InvalidArgumentException(
                "'%' is an invalid page boundary."
            );
        }
    	$this->_setNameValue('ViewClip', $boundaryName);
    	$this->getDocument()->setMinPdfVersion('1.4');
    }

    /**
     * Get the name of the page boundary to which the contents of a page shall be clipped when
     * viewing the document on the screen.
     *
     * @return string
     */
    public function getViewClip()
    {
    	return $this->_getValue('ViewClip', SetaPDF_Core_PageBoundaries::CROP_BOX);
    }

    /**
     * Set the name of the page boundary representing the area of a page that shall be rendered
     * when printing the document.
     *
     * @param string $boundaryName A boundary name as defined as a constant in {@link SetaPDF_Core_PageBoundaries}.
     * @throws InvalidArgumentException
     */
    public function setPrintArea($boundaryName)
    {
        if (!SetaPDF_Core_PageBoundaries::isValidName($boundaryName)) {
            throw new InvalidArgumentException(
                "'%' is an invalid page boundary."
            );
        }
    	$this->_setNameValue('PrintArea', $boundaryName);
    	$this->getDocument()->setMinPdfVersion('1.4');
    }

    /**
     * Get the name of the page boundary representing the area of a page that shall be rendered
     * when printing the document.
     *
     * @return string
     */
    public function getPrintArea()
    {
    	return $this->_getValue('PrintArea', SetaPDF_Core_PageBoundaries::CROP_BOX);
    }

    /**
     * Set the name of the page boundary to which the contents of a page shall be clipped
     * when printing the document.
     *
     * @param string $boundaryName A boundary name as defined as a constant in {@link SetaPDF_Core_PageBoundaries}.
     * @throws InvalidArgumentException
     */
    public function setPrintClip($boundaryName)
    {
    	if (!SetaPDF_Core_PageBoundaries::isValidName($boundaryName)) {
    		throw new InvalidArgumentException(
    				"'%' is an invalid page boundary."
    		);
    	}
    	$this->_setNameValue('PrintClip', $boundaryName);
    	$this->getDocument()->setMinPdfVersion('1.4');
    }

    /**
     * Get the name of the page boundary to which the contents of a page shall be clipped
     * when printing the document.
     *
     * @return string
     */
    public function getPrintClip()
    {
    	return $this->_getValue('PrintClip', SetaPDF_Core_PageBoundaries::CROP_BOX);
    }

    /**
     * Set the page scaling option that shall be selected when a print dialog is displayed for this document.
     *
     * @param string $name A constant value of SetaPDF_Core_Document_Catalog_ViewerPreferences::PRINT_SCALING_XXX.
     */
    public function setPrintScaling($name)
    {
        $this->_setNameValue('PrintScaling', $name);
        $this->getDocument()->setMinPdfVersion('1.6');
    }

    /**
     * Get the page scaling option that shall be selected when a print dialog is displayed for this document.
     *
     * @return string
     */
    public function getPrintScaling()
    {
        return $this->_getValue('PrintScaling', self::PRINT_SCALING_APP_DEFAULT);
    }

    /**
     * Set the paper handling option that shall be used when printing the file from the print dialog.
     *
     * @param string|false $name A constant value of SetaPDF_Core_Document_Catalog_ViewerPreferences::DUPLEX_XXX.
     *                           To remove this preference pass false.
     */
    public function setDuplex($name)
    {
        if (!$name) {
            $this->_removeKey('Duplex');
            return;
        }

        // TODO: Check for allowed values
        $this->_setNameValue('Duplex', $name);
    }

    /**
     * Get the paper handling option that shall be used when printing the file from the print dialog.
     *
     * @return string|null
     */
    public function getDuplex()
    {
        return $this->_getValue('Duplex', null);
    }

    /**
     * Set the flag specifying whether the PDF page size shall be used to select the input paper tray.
     *
     * @param boolean $value A boolean value
     */
    public function setPickTrayByPdfSize($value = true)
    {
        $this->_setBooleanValue('PickTrayByPDFSize', $value);
        $this->getDocument()->setMinPdfVersion('1.7');
    }

    /**
     * Get the flag specifying whether the PDF page size shall be used to select the input paper tray.
     *
     * @param null|boolean $defaultValue
     * @return bool|mixed
     */
    public function getPickTrayByPdfSize($defaultValue = null)
    {
        return $this->_getValue('PickTrayByPDFSize', $defaultValue);
    }

    /**
     * Set the page numbers used to initialize the print dialog box when the file is printed.
     *
     * @param array|null $pageRange An array of even number of integer values to be interpreted in pairs. Each pair
     *                              represents the first and last pages in a sub-range of pages.
     */
    public function setPrintPageRange(array $pageRange = null)
    {
        $count = count($pageRange);
        if ($pageRange === null || $count === 0) {
            $this->_removeKey('PrintPageRange');
            return;
        }

        $pageRange = array_map('intval', $pageRange);
        if (($count % 2) !== 0) {
            $pageRange[] = $pageRange[$count - 1];
        }

        $value = new SetaPDF_Core_Type_Array();
        foreach ($pageRange AS $pageNumber) {
            $value->offsetSet(null, new SetaPDF_Core_Type_Numeric($pageNumber - 1));
        }

        $this->_setValue('PrintPageRange', $value);
        $this->getDocument()->setMinPdfVersion('1.7');
    }

    /**
     * Get the page numbers used to initialize the print dialog box when the file is printed.
     *
     * @param array $defaultValue A default value that will be returned if no preference is defined.
     * @return array
     */
    public function getPrintPageRange(array $defaultValue = array())
    {
        $value = $this->_getValue('PrintPageRange', $defaultValue, true);
        if ($value instanceof SetaPDF_Core_Type_AbstractType)
            $value = $value->toPhp();

        return $value;
    }

    /**
     * Set the number of copies that shall be printed when the print dialog is opened for this file.
     *
     * @param integer $numCopies The number of copies.
     */
    public function setNumCopies($numCopies)
    {
        $this->_setValue('NumCopies', new SetaPDF_Core_Type_Numeric((int)$numCopies));
    }

    /**
     * Get the number of copies that shall be printed when the print dialog is opened for this file.
     *
     * @param integer $defaultValue
     */

    /**
     * Get the number of copies that shall be printed when the print dialog is opened.
     *
     * @param int $defaultValue A default value, to be used if no preference is defined.
     * @return bool|mixed
     */
    public function getNumCopies($defaultValue = 1)
    {
        return $this->_getValue('NumCopies', $defaultValue);
    }


  /* Helper methods to get and set common types */

    /**
     * Helper method to get a value of the ViewerPreferences dictionary.
     *
     * @param string $key
     * @param mixed $default
     * @param boolean $pdfObject
     * @return mixed
     */
    protected function _getValue($key, $default = false, $pdfObject = false)
    {
    	$catalog = $this->_catalog->getDictionary();
    	if (null === $catalog)
    		return $default;

        if (!$catalog->offsetExists('ViewerPreferences'))
            return $default;

        /**
         * @var $viewerPreferences SetaPDF_Core_Type_Dictionary
         */
        $viewerPreferences = $catalog->getValue('ViewerPreferences')->ensure(true);
        if (!$viewerPreferences->offsetExists($key))
    		return $default;

    	if (false === $pdfObject)
    	    return $viewerPreferences->getValue($key)->ensure()->getValue();

    	return $viewerPreferences->getValue($key)->ensure();
    }

    /**
     * Helper method for setting boolean values.
     *
     * @param string $key
     * @param boolean $value
     */
    protected function _setBooleanValue($key, $value)
    {
    	$this->_setValue($key, new SetaPDF_Core_Type_Boolean($value));
    }

    /**
     * Helper method for setting a name value.
     *
     * @param string $key
     * @param string $name
     */
    protected function _setNameValue($key, $name)
    {
        $this->_setValue($key, new SetaPDF_Core_Type_Name($name));
    }

    /**
     * Helper method for setting a value.
     *
     * @param string $key
     * @param SetaPDF_Core_Type_AbstractType $value
     */
    protected function _setValue($key, SetaPDF_Core_Type_AbstractType $value)
    {
        $catalog = $this->_catalog->getDictionary(true);
        if (!$catalog->offsetExists('ViewerPreferences'))
            $catalog->offsetSet('ViewerPreferences', new SetaPDF_Core_Type_Dictionary());

        $viewerPreferences = $catalog->getValue('ViewerPreferences')->ensure(true);
        $viewerPreferences->offsetSet($key, $value);
    }

    /**
     * Helper method for removing a key from the ViewerPreferences dictionary.
     *
     * @param string $key
     */
    protected function _removeKey($key)
    {
        $catalog = $this->_catalog->getDictionary(true);
        if (!$catalog->offsetExists('ViewerPreferences'))
            return;

        $viewerPreferences = $catalog->getValue('ViewerPreferences')->ensure(true);
        $viewerPreferences->offsetUnset($key);
    }
}
<?php 
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: PageLabels.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class for handling page labels
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_PageLabels
{
    /**
     * Style constant
     * 
     * Decimal arabic numerals
     * 
     * @var string
     */
    const STYLE_DECIMAL_NUMERALS = 'D';
    
    /**
     * Style constant
     *
     * Uppercase roman numerals
     *
     * @var string
     */
    const STYLE_UPPERCASE_ROMAN_NUMERALS = 'R';
    
    /**
     * Style constant
     *
     * Lowercase roman numerals
     *
     * @var string
     */
    const STYLE_LOWERCASE_ROMAN_NUMERALS = 'r';
    
    /**
     * Style constant
     *
     * Uppercase letters (A to Z for the first 26 pages, AA to ZZ for the next 26, and so on)
     *
     * @var string
     */
    const STYLE_UPPERCASE_LETTERS = 'A';
    
    /**
     * Style constant
     *
     * Lowercase letters (a to z for the first 26 pages, aa to zz for the next 26, and so on)
     *
     * @var string
     */
    const STYLE_LOWERCASE_LETTERS = 'a';
    
    /**
     * The documents catalog instance
     *
     * @var SetaPDF_Core_Document_Catalog
     */
    protected $_catalog;
    
    /**
     * The number tree
     * 
     * @var SetaPDF_Core_DataStructure_NumberTree
     */
    protected $_tree;
    
    /**
     * Label ranges
     *  
     * @var array
     */
    protected $_ranges = array();
    
    /**
     * Converts an integer to roman numerals.
     * 
     * @param integer $integer
     * @param boolean $uppercase
     * @return string
     */
    static public function integerToRoman($integer, $uppercase = true)
    {
        $integer = (int) $integer;
        $result = '';
        
        $lookup = array(
            $uppercase ? 'M'  : 'm'  => 1000,
    		$uppercase ? 'CM' : 'cm' => 900,
    		$uppercase ? 'D'  : 'd'  => 500,
    		$uppercase ? 'CD' : 'cd' => 400,
    		$uppercase ? 'C'  : 'c'  => 100,
    		$uppercase ? 'XC' : 'xc' => 90,
    		$uppercase ? 'L'  : 'l'  => 50,
    		$uppercase ? 'XL' : 'xl' => 40,
    		$uppercase ? 'X'  : 'x'  => 10,
    		$uppercase ? 'IX' : 'ix' => 9,
    		$uppercase ? 'V'  : 'v'  => 5,
    		$uppercase ? 'IV' : 'iv' => 4,
    		$uppercase ? 'I'  : 'i'  => 1
        );
        
        foreach($lookup as $roman => $value) {
        	$matches = intval($integer / $value);
        	$result .= str_repeat($roman, $matches);
        	$integer = $integer % $value;
        }
        
        return $result;
    }
    
    /**
     * Converts an integer to a letter.
     * 
     * @param integer $integer
     * @param boolean $uppercase
     * @return string
     */
    static public function integerToLetters($integer, $uppercase = true)
    {
        $charCode = $integer % 26;
        $charCode = $charCode === 0 ? 26 : $charCode;
        
        return str_repeat(chr(($uppercase ? 64 : 96) + $charCode), ceil($integer / 26));
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
     * Release memory / cycled references.
     */
    public function cleanUp()
    {
        if (null !== $this->_tree) {
            $this->_tree->cleanUp();
            $this->_tree = null;
        }
        
        $this->_catalog = null;
    }
    
    /**
     * Get the page label by a page number/index.
     * 
     * @param integer $pageNo The page number/index to get the page label for
     * @param string $encoding The output encoding
     * @return string Returns the page label for the specific page number/index
     */
    public function getPageLabelByPageNo($pageNo, $encoding = 'UTF-8')
    {
        $ranges = $this->_getRanges();
        if (count($ranges) === 0) {
            return (string)$pageNo;
        }

        $_pageNo = $pageNo - 1;
        
        foreach ($ranges AS $start => $data) {
            if ($start <= $_pageNo) 
                break;
        }
        
        if ($start > $_pageNo) {
            return (string)$pageNo;
        }
            
        $pageLabel = '';
        
        if (isset($data['S'])) {
            $pageLabel = $_pageNo - $start;
            
            if (isset($data['St'])) {
                $pageLabel += $data['St'];
            } else {
                $pageLabel += 1;
            }
            
            switch ($data['S']) {
                case self::STYLE_DECIMAL_NUMERALS:
                    break;
                case self::STYLE_UPPERCASE_ROMAN_NUMERALS:
                case self::STYLE_LOWERCASE_ROMAN_NUMERALS:
                    $pageLabel = self::integerToRoman($pageLabel, $data['S'] === self::STYLE_UPPERCASE_ROMAN_NUMERALS);
                    break;
                case self::STYLE_UPPERCASE_LETTERS:
                case self::STYLE_LOWERCASE_LETTERS:
                    $pageLabel = self::integerToLetters($pageLabel, $data['S'] === self::STYLE_UPPERCASE_LETTERS);
                    break;
            }
            
            $pageLabel = SetaPDF_Core_Encoding::convert($pageLabel, 'UTF-8', $encoding);
        }
        
        $prefix = '';
        if (isset($data['P'])) {
            $prefix = SetaPDF_Core_Encoding::convertPdfString($data['P'], $encoding);
        }
        
        return $prefix . $pageLabel;
    }
    
    /**
     * Get the tree page labels number tree object.
     *  
     * @param boolean $create
     * @return null|SetaPDF_Core_DataStructure_NumberTree
     */
    protected function _getTree($create = false)
    {
        if (null === $this->_tree) {
            $catalog = $this->_catalog->getDictionary($create);
            if (null === $catalog)
                return null;
            
            if (!$catalog->offsetExists('PageLabels')) {
                if (false === $create)
                    return null;
                $object = $this->getDocument()->createNewObject(new SetaPDF_Core_Type_Dictionary());
                $catalog->offsetSet('PageLabels', $object);
            }
            
            $this->_tree = new SetaPDF_Core_DataStructure_NumberTree($catalog->getValue('PageLabels')->ensure(), $this->getDocument());
        }
        
        return $this->_tree;
    }
    
    /**
     * Get the page label ranges.
     * 
     * @return array
     */
    protected function _getRanges()
    {
        if (count($this->_ranges) === 0) {
            $tree = $this->_getTree();
            if (null === $tree)
                return $this->_ranges;
            
            $values = $tree->getAll();
            
            $this->_ranges = array();
            foreach ($values AS $start => $data) {
                $this->_ranges[$start] = $data['value']->ensure()->toPhp();
            }
            
            krsort($this->_ranges);
        }
        
        return $this->_ranges;
    }
    
    /**
     * Ger all ranges.
     * 
     * @param string $encoding
     * @return array
     */
    public function getRanges($encoding = 'UTF-8')
    {
        $ranges = array();
        
        foreach ($this->_getRanges() AS $_startPage => $rangeData) {
            $startPage = $_startPage + 1;
            $ranges[$startPage] = array(
                'startPage' => $startPage,
                'style' => isset($rangeData['S']) ? $rangeData['S'] : null,
                'prefix' => isset($rangeData['P']) ? SetaPDF_Core_Encoding::convertPdfString($rangeData['P'], $encoding) : '',
                'firstPageValue' => isset($rangeData['St']) ? $rangeData['St'] : 1,
            );
        }
        
        return $ranges;
    }
    
    /**
     * Get a range by starting page number.
     * 
     * @param integer $startPage
     * @param string $encoding
     * @return array|null
     */
    public function getRange($startPage, $encoding = 'UTF-8')
    {
        $ranges = $this->_getRanges();
        $startPage--;
        if (isset($ranges[$startPage])) {
            $rangeData = $ranges[$startPage];
            return array(
                'startPage' => $startPage + 1,
                'style' => isset($rangeData['S']) ? $rangeData['S'] : null,
                'prefix' => isset($rangeData['P']) ? SetaPDF_Core_Encoding::convertPdfString($rangeData['P'], $encoding) : '',
                'firstPageValue' => isset($rangeData['St']) ? $rangeData['St'] : 1,
            );
        }
        
        return null;
    }
    
    /**
     * Removes a range by the starting page number.
     * 
     * @param integer $startPage
     * @throws InvalidArgumentException
     * @return null|boolean
     */
    public function removeRange($startPage)
    {
        $tree = $this->_getTree();
        if (null === $tree) {
            return null;
        }

        $startPage--;
        if ($startPage === 0 && count($this->_ranges) > 1) {
            /* If index 0 is deleted adobe reader ignores the complete tree.
             * Foxit works. Anyhow, we avoid to create such documents here.
             * <cite>
             * 12.4.2 Page Labels
             * [...]The tree shall include a value for page index 0.[...]
             * </cite>
             */
            throw new InvalidArgumentException(
                'It is only possible to delete the range for page 1 if all other ranges were deleted before.'
            );
        }
        
        if (isset($this->_ranges[$startPage])) {
        	unset($this->_ranges[$startPage]);
        }
        
        return $tree->remove((float)$startPage);
    }
    
    /**
     * Add a page label range.
     * 
     * @param integer $startPage The page index to start the page label range
     * @param string $style The page label style. See {@link SetaPDF_Core_Document_Catalog_PageLabels}::STYLE_XXX constants
     * @param string $prefix A page label prefix
     * @param integer $firstPageValue The value of the numeric portion for the first page in the range
     * @param string $encoding The input encoding
     * @throws InvalidArgumentException
     */
    public function addRange($startPage, $style = null, $prefix ='', $firstPageValue = 1, $encoding = 'UTF-8')
    {
        $startPage = (int)$startPage - 1;
        $ranges = $this->_getRanges();
        if (isset($ranges[$startPage])) {
            throw new InvalidArgumentException(
                sprintf("Page range starting with '%s' already exists.", $startPage + 1)
            );
        }

        /* Make sure that a range for the first page is available */ 
        if ($startPage !== 0 && !isset($ranges[0])) {
            $this->addRange(1, self::STYLE_DECIMAL_NUMERALS);
        }
        
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        if ($style !== null)
            $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name($style));
        
        if ($prefix !== '') 
            $dictionary->offsetSet('P', new SetaPDF_Core_Type_String(SetaPDF_Core_Encoding::toPdfString($prefix, $encoding)));
            
        if ($firstPageValue !== 1)
            $dictionary->offsetSet('St', new SetaPDF_Core_Type_Numeric($firstPageValue));
        
        $tree = $this->_getTree(true);
        $tree->add($startPage, $dictionary);
        
        $this->_ranges[$startPage] = $dictionary->toPhp();
        krsort($this->_ranges);
    }
}
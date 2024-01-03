<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FontSize.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A font size filter.
 *
 * This filter allows you to text in view to its font size.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Filter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Filter_FontSize
    implements SetaPDF_Extractor_Filter_FilterInterface
{
    /**
     * A mode constant.
     *
     * Defines that the font size needs to be equal to the given filter value.
     *
     * @var string
     */
    const MODE_EQUALS = '==';

    /**
     * A mode constant.
     *
     * Defines that the font size needs to be smaller than the given filter value.
     *
     * @var string
     */
    const MODE_SMALLER = '<';

    /**
     * A mode constant.
     *
     * Defines that the font size needs to be smaller or equal than the given filter value.
     *
     * @var string
     */
    const MODE_SMALLER_OR_EQUALS = '<=';

    /**
     * A mode constant.
     *
     * Defines that the font size needs to be larger than the given filter value.
     *
     * @var string
     */
    const MODE_LARGER = '>';

    /**
     * A mode constant.
     *
     * Defines that the font size needs to be larger or equal than the given filter value.
     *
     * @var string
     */
    const MODE_LARGER_OR_EQUALS = '>=';

    /**
     * A mode constant.
     *
     * Defines that the font size needs to be between the given filter values.
     * If this mode is used the filter value needs to be an array. Otherwise the mode will be the same as
     * {@link SetaPDF_Extractor_Filter_FontSize::MODE_EQUALS}
     *
     * @var string
     */
    const MODE_BETWEEN = '><';

    /**
     * A mode constant.
     *
     * Defines that the font size needs to be between or equal to the given filter values.
     * If this mode is used the filter value needs to be an array. Otherwise the mode will be the same as
     * {@link SetaPDF_Extractor_Filter_FontSize::MODE_EQUALS}
     *
     * @var string
     */
    const MODE_BETWEEN_OR_EQUALS = '<=||>=';

    /**
     * The current page object.
     *
     * @var SetaPDF_Core_Document_Page
     */
    protected $_page;

    /**
     * The id of this filter.
     *
     * @var string|null
     */
    protected $_id;

    /**
     * The font size data to filter by.
     *
     * @var null|number|number[]
     */
    protected $_fontSize = null;

    /**
     * The mode to work with.
     *
     * @var string
     */
    protected $_mode = self::MODE_EQUALS;

    /**
     * The constructor.
     *
     * This filter can work in different modes which are specified through class constants:
     *
     * 1. MODE_EQUALS: The font size equals the filter value.
     * 2. MODE_BETWEEN: The font size is between 2 given filter values (pass an array as $fontSize)
     * 3. MODE_SMALLER: The font size is smaler than the filter value.
     * 4. MODE_LARGER: The font size is larger than the filter value.
     *
     * @param $fontSize
     * @param string $mode
     * @param null $id
     */
    public function __construct($fontSize, $mode = self::MODE_EQUALS, $id = null)
    {
        switch ($mode) {
            case self::MODE_BETWEEN:
            /** @noinspection PhpMissingBreakStatementInspection */
            case self::MODE_BETWEEN_OR_EQUALS:
                if (is_array($fontSize)) {
                    if (count($fontSize) !== 2) {
                        throw new InvalidArgumentException(
                            'The "equals" mode requires an array with exactly 2 numeric ' .
                            'entries to be passed as the $fontSize parameter.'
                        );
                    }
                    $_fontSize = array_map('floatval', array_values($fontSize));
                    $fontSize = array(min($_fontSize), max($_fontSize));
                    break;
                } else {
                    $mode = self::MODE_EQUALS;
                }
            default:
                $fontSize = (float)$fontSize;
        }

        $this->_mode = $mode;
        $this->_fontSize = $fontSize;

        if ($id !== null && $id == false) {
            throw new InvalidArgumentException(
                'The filter id needs to be a string which will not evaluate to false in a boolean comparison.'
            );
        }
        $this->_id = $id;
    }

    /**
     * Get the filter id.
     *
     * @return null|string
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * Get the mode.
     *
     * @return string
     */
    public function getMode()
    {
        return $this->_mode;
    }

    /**
     * Get the font size data.
     *
     * @return array|float|null|number|number[]
     */
    public function getFontSize()
    {
        return $this->_fontSize;
    }

    /**
     * Method that is called to decide if a text item accepted or not.
     *
     * @see SetaPDF_Extractor_Filter_FilterInterface::accept()
     * @param SetaPDF_Extractor_TextItem $textItem
     * @return bool|string
     * @throws SetaPDF_Extractor_Exception
     */
    public function accept(SetaPDF_Extractor_TextItem $textItem)
    {
        // calculate the font size in user space values
        $vector = new SetaPDF_Core_Geometry_Vector(0, $textItem->getFontSize());
        $vector = $vector->multiply($textItem->getStartMatrix());
        $vector = $vector->subtract($textItem->getBaseLineStart());

        $fontSize = $vector->getY();

        switch ($this->_mode) {
            case self::MODE_EQUALS:
                if (abs($fontSize - $this->_fontSize) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
                    return false;
                }
                break;

            case self::MODE_BETWEEN:
                if ($fontSize <= $this->_fontSize[0] || $fontSize >= $this->_fontSize[1]) {
                    return false;
                }
                break;
            case self::MODE_BETWEEN_OR_EQUALS:
                if ($fontSize < $this->_fontSize[0] || $fontSize > $this->_fontSize[1]) {
                    return false;
                }
                break;

            case self::MODE_LARGER:
                if ($fontSize <= $this->_fontSize) {
                    return false;
                }
                break;
            case self::MODE_LARGER_OR_EQUALS:
                if ($fontSize < $this->_fontSize) {
                    return false;
                }
                break;

            case self::MODE_SMALLER:
                if ($fontSize >= $this->_fontSize) {
                    return false;
                }
                break;

            case self::MODE_SMALLER_OR_EQUALS:
                if ($fontSize > $this->_fontSize) {
                    return false;
                }
                break;
        }

        return ($this->_id !== null ? $this->_id : true);
    }
}
<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: DefaultAppearanceData.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Helper class to parse data from the default apperance entry of a form field.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller_Field_DefaultAppearanceData
{
    /**
     * The font name.
     *
     * @var string
     */
    protected $_fontName;

    /**
     * The font size.
     *
     * @var float
     */
    protected $_fontSize = .0;

    /**
     * The text color.
     *
     * @var SetaPDF_Core_DataStructure_Color
     */
    protected $_textColor;

    /**
     * The constuctor.
     *
     * @param string $daString The default appearance string.
     */
    public function __construct($daString)
    {
        $parser = new SetaPDF_Core_Parser_Content($daString);
        $parser->registerOperator(array('g', 'rg', 'k'), array($this, '_onNonstrokingColor'));
        $parser->registerOperator('Tf', array($this, '_onTextFont'));
        $parser->process();
    }

    /**
     * Callback of the content parser which is called if a nonstroking color operator is matched (g, rg, k).
     *
     * @param array $arguments
     */
    public function _onNonstrokingColor($arguments)
    {
        $this->_textColor = SetaPDF_Core_DataStructure_Color::createByComponents($arguments);
    }

    /**
     * Callback of the content parser which is called if the text font operator is matched (Tf).
     *
     * @param array $arguments
     */
    public function _onTextFont($arguments)
    {
        $this->_fontName = $arguments[0]->getValue();
        $this->_fontSize = $arguments[1]->getValue();
    }

    /**
     * Get the font name.
     *
     * @return string
     */
    public function getFontName()
    {
        return $this->_fontName;
    }

    /**
     * Get the font size.
     *
     * @return float
     */
    public function getFontSize()
    {
        return $this->_fontSize;
    }

    /**
     * Get the text color.
     *
     * @return SetaPDF_Core_DataStructure_Color
     */
    public function getTextColor()
    {
        if (null === $this->_textColor) {
            return new SetaPDF_Core_DataStructure_Color_Gray(0);
        }

        return $this->_textColor;
    }
}
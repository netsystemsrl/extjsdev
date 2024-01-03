<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: TextMarkup.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract class representing a text markup annotation.
 *
 * See PDF 32000-1:2008 - 12.5.6.10
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Document_Page_Annotation_TextMarkup
    extends SetaPDF_Core_Document_Page_Annotation_Markup
{
    /**
     * Creates a highlight annotation dictionary.
     *
     * @param SetaPDF_Core_DataStructure_Rectangle|array $rect
     * @param string $subtype
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static protected function _createAnnotationDictionary($rect, $subtype)
    {
        $dictionary = parent::_createAnnotationDictionary($rect, $subtype);

        $rect = new SetaPDF_Core_DataStructure_Rectangle($dictionary->getValue('Rect'));
        // TopLeft, TopRight, BottomLeft, BottomRight
        $dictionary['QuadPoints'] = new SetaPDF_Core_Type_Array(array(
            new SetaPDF_Core_Type_Numeric($rect->getLlx()),
            new SetaPDF_Core_Type_Numeric($rect->getUry()),
            new SetaPDF_Core_Type_Numeric($rect->getUrx()),
            new SetaPDF_Core_Type_Numeric($rect->getUry()),
            new SetaPDF_Core_Type_Numeric($rect->getLlx()),
            new SetaPDF_Core_Type_Numeric($rect->getLly()),
            new SetaPDF_Core_Type_Numeric($rect->getUrx()),
            new SetaPDF_Core_Type_Numeric($rect->getLly()),
        ));

        return $dictionary;
    }

    /**
     * Set the Quadpoints.
     *
     * @param int|float|array $x1OrArray
     * @param int|float $y1
     * @param int|float $x2
     * @param int|float $y2
     * @param int|float $x3
     * @param int|float $y3
     * @param int|float $x4
     * @param int|float $y4
     */
    public function setQuadPoints($x1OrArray, $y1 = null, $x2 = null, $y2 = null, $x3 = null, $y3 = null, $x4 = null, $y4 = null)
    {
        if (is_array($x1OrArray)) {
            if (count($x1OrArray) != 8) {
                throw new InvalidArgumentException('Quadpoints needs to be an array of 8 numeric values!');
            }
            $x1 = $x1OrArray[0];
            $y1 = $x1OrArray[1];
            $x2 = $x1OrArray[2];
            $y2 = $x1OrArray[3];
            $x3 = $x1OrArray[4];
            $y3 = $x1OrArray[5];
            $x4 = $x1OrArray[6];
            $y4 = $x1OrArray[7];
        } else {
            $x1 = $x1OrArray;
        }

        $points = new SetaPDF_Core_Type_Array(array(
            new SetaPDF_Core_Type_Numeric($x1),
            new SetaPDF_Core_Type_Numeric($y1),
            new SetaPDF_Core_Type_Numeric($x2),
            new SetaPDF_Core_Type_Numeric($y2),
            new SetaPDF_Core_Type_Numeric($x3),
            new SetaPDF_Core_Type_Numeric($y3),
            new SetaPDF_Core_Type_Numeric($x4),
            new SetaPDF_Core_Type_Numeric($y4)
        ));

        $this->_annotationDictionary->offsetSet('QuadPoints', $points);
    }

    /**
     * Get the Quadpoints.
     *
     * @return array
     */
    public function getQuadPoints()
    {
        if ($this->_annotationDictionary->offsetExists('QuadPoints')) {
            return $this->_annotationDictionary->getValue('QuadPoints')->ensure()->toPhp();
        }

        $rect = $this->getRect();

        // TopLeft, TopRight, BottomLeft, BottomRight
        return array(
            $rect->getLlx(), $rect->getUry(), // x4
            $rect->getUrx(), $rect->getUry(), // x3
            $rect->getLlx(), $rect->getLly(), // x1
            $rect->getUrx(), $rect->getLly(), // x2
        );
    }
}
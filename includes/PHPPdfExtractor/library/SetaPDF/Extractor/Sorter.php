<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Sorter.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * The abstract sorter class.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Sorter
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Extractor_Sorter
{
    /**
     * A temporary matrix used in the sort process.
     *
     * @var SetaPDF_Core_Geometry_Matrix
     */
    protected $_matrix;

    /**
     * Checks whether two items are on the same line or not.
     *
     * This method has to be implemented by the extending classes.
     *
     * @param SetaPDF_Extractor_Result_CompareableInterface $a
     * @param SetaPDF_Extractor_Result_CompareableInterface $b
     * @param SetaPDF_Core_Geometry_Matrix $matrix
     * @return boolean
     */
    abstract public function isOnSameLine(
        SetaPDF_Extractor_Result_CompareableInterface $a,
        SetaPDF_Extractor_Result_CompareableInterface $b,
        SetaPDF_Core_Geometry_Matrix $matrix = null
    );

    /**
     * Groups all text items by lines.
     *
     * @param SetaPDF_Extractor_TextItem[] $textItems The text items
     * @return array
     */
    abstract public function groupByLines(array $textItems);

    /**
     * A sort callback that sort first horizontally then vertically.
     *
     * @see http://www.php.net/usort
     * @param SetaPDF_Extractor_TextItem $a
     * @param SetaPDF_Extractor_TextItem $b
     * @return int
     */
    public function horizontallyThenVertically(SetaPDF_Extractor_TextItem $a, SetaPDF_Extractor_TextItem $b)
    {
        $ulA = $a->getUl();
        $ulB = $b->getUl();

        if (isset($this->_matrix)) {
            $ulA = $ulA->multiply($this->_matrix);
            $ulB = $ulB->multiply($this->_matrix);
        }

        $diff = $ulA->getY() - $ulB->getY();
        if (abs($diff) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            return $diff < 0 ? 1 : -1;
        }

        $diff = $ulA->getX() - $ulB->getX();
        if (abs($diff) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            return $diff > 0 ? 1 : -1;
        }

        // if both UL points are equal, check the LR point
        $lrA = $a->getLr();
        $lrB = $b->getLr();

        $diff = $lrA->getX() - $lrB->getX();
        if (abs($diff) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            return $diff > 0 ? 1 : -1;
        }

        return 0;
    }

    /**
     * A sort callback that sort first vertically then horizontally.
     *
     * @see http://www.php.net/usort
     * @param SetaPDF_Extractor_TextItem $a
     * @param SetaPDF_Extractor_TextItem $b
     * @return int
     */
    public function verticallyThenHorizontally(SetaPDF_Extractor_TextItem $a, SetaPDF_Extractor_TextItem $b)
    {
        $ulA = $a->getUl();
        $ulB = $b->getUl();

        if (isset($this->_matrix)) {
            $ulA = $ulA->multiply($this->_matrix);
            $ulB = $ulB->multiply($this->_matrix);
        }

        $diff = $ulA->getX() - $ulB->getX();
        if (abs($diff) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            return $diff > 0 ? 1 : -1;
        }

        $diff = $ulA->getY() - $ulB->getY();
        if (abs($diff) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            return $diff < 0 ? 1 : -1;
        }

        // if both UL points are equal, check the LR point
        $lrA = $a->getLr();
        $lrB = $b->getLr();

        $diff = $lrA->getX() - $lrB->getX();
        if (abs($diff) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            return $diff > 0 ? 1 : -1;
        }

        return 0;
    }

    /**
     * Checks if two items joining each other.
     *
     * @param SetaPDF_Extractor_Result_CompareableInterface $prevItem The left item.
     * @param SetaPDF_Extractor_Result_CompareableInterface $item The right item.
     * @param float $spaceWidthFactor The space width factor.
     * @return bool
     */
    public function itemsJoining(
        SetaPDF_Extractor_Result_CompareableInterface $prevItem,
        SetaPDF_Extractor_Result_CompareableInterface $item,
        $spaceWidthFactor = 2.
    )
    {
        $orientation = $item->getOrientation();

        if ($orientation != 0) {
            $c = cos(-$orientation);
            $s = sin(-$orientation);

            $m1 = new SetaPDF_Core_Geometry_Matrix();
            $orientationMatrix = $m1->multiply(new SetaPDF_Core_Geometry_Matrix($c, $s, -$s, $c, 0, 0));
            $start = $item->getBaseLineStart()->multiply($orientationMatrix);
            $prevEnd = $prevItem->getBaseLineEnd()->multiply($orientationMatrix);
        } else {
            $start = $item->getBaseLineStart();
            $prevEnd = $prevItem->getBaseLineEnd();
        }
        $spaceWidthA = $prevItem->getUserSpaceSpaceWidth();
        $spaceWidthB = $item->getUserSpaceSpaceWidth();
        $spaceWidth = ($spaceWidthA + $spaceWidthB) / 2;

        return $this->isOnSameLine($prevItem, $item) && !($prevEnd->getX() < $start->getX() &&
            abs($prevEnd->getX() - $start->getX()) >= ($spaceWidth / $spaceWidthFactor));
    }
}
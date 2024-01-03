<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FlexLine.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A sorter class that sorts lines by comparing text items on their baseline and a threshold factor.
 *
 * This sorter is not able to detect if an item lays on top of another one!
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Sorter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Sorter_FlexLine
extends SetaPDF_Extractor_Sorter
{
    /**
     * Checks whether two items are on the same line or not.
     *
     * @param SetaPDF_Extractor_Result_CompareableInterface $a
     * @param SetaPDF_Extractor_Result_CompareableInterface $b
     * @param SetaPDF_Core_Geometry_Matrix $matrix
     * @return bool
     */
    public function isOnSameLine(
        SetaPDF_Extractor_Result_CompareableInterface $a,
        SetaPDF_Extractor_Result_CompareableInterface $b,
        SetaPDF_Core_Geometry_Matrix $matrix = null)
    {
        $orientationA = $a->getOrientation();
        $orientationB = $b->getOrientation();
        if (abs($orientationA - $orientationB) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            return false;
        }

        if ($orientationA != 0 && $matrix === null) {
            $c = cos(-$orientationA);
            $s = sin(-$orientationA);

            $m1 = new SetaPDF_Core_Geometry_Matrix();
            $matrix = $m1->multiply(new SetaPDF_Core_Geometry_Matrix($c, $s, -$s, $c, 0, 0));
        }

        if ($matrix !== null) {
            $aYtop    = $a->getUr()->multiply($matrix)->getY();
            $aYbottom = $a->getLr()->multiply($matrix)->getY();

            $bYtop    = $b->getUl()->multiply($matrix)->getY();
            $bYbottom = $b->getLl()->multiply($matrix)->getY();
        } else {
            $aYtop    = $a->getUr()->getY();
            $aYbottom = $a->getLr()->getY();

            $bYtop    = $b->getUl()->getY();
            $bYbottom = $b->getLl()->getY();
        }

        // Check if both items intersect. If not, we have a new line.
        if (
            $bYbottom < $aYtop && $bYbottom < $aYbottom &&
            $bYtop < $aYtop && $bYtop < $aYbottom ||
            $bYbottom > $aYtop && $bYbottom > $aYbottom &&
            $bYtop > $aYtop && $bYtop > $aYbottom
        ) {
            return false;

            // otherwise check for an intersection
        } else {

            $height1 = $aYtop - $aYbottom;
            $height2 = $bYtop - $bYbottom;

            // Check if the items vari in height by the factor 3
            if (($height1 > $height2 * 3 || $height2 > $height1 * 3)) {
                return false;
            }

            $f1 = $f2 = null;

            if ($height1 != 0 && $height2 != 0) {
                $diff = min($bYtop, $aYtop) - max($bYbottom, $aYbottom);
                $f1   = abs($diff / $height1);
                $f2   = abs($diff / $height2);
            }

            /* The "lines" do not intersect (> 1) or both intersect with a small part
             */
            if ($height1 == 0 || $height2 == 0 || $f1 < 0.5 && $f2 < 0.5) {
                return false;
            }
        }

        return true;
    }

    /**
     * Groups all text items by lines.
     *
     * @param SetaPDF_Extractor_TextItem[] $textItems The text items
     * @return array
     */
    public function groupByLines(array $textItems)
    {
        if (count($textItems) === 0)
            return array();

        $matrixes = array(
            '0.00000' => null
        );

        $itemsByOrientation = array();
        foreach ($textItems AS $item) {
            $orientation = $item->getOrientation();
            $orientationString = sprintf('%.5F', $orientation);

            $matrix = null;
            if ($orientation != 0) {
                if (!isset($matrixes[$orientationString])) {
                    $c = cos(-$orientation);
                    $s = sin(-$orientation);

                    $m1 = new SetaPDF_Core_Geometry_Matrix();
                    $matrixes[$orientationString] = $m1->multiply(new SetaPDF_Core_Geometry_Matrix($c, $s, -$s, $c, 0, 0));
                }

                $y = $item->getBaseLineStart()->multiply($matrixes[$orientationString])->getY();
            } else {
                $y = $item->getBaseLineStart()->getY();
            }

            $itemsByOrientation[$orientationString][sprintf('%.5F', $y)][] = $item;
        }

        $lines = array();

        /**
         * @var $prevItem SetaPDF_Extractor_TextItem
         * @var $item SetaPDF_Extractor_TextItem
         */
        foreach ($itemsByOrientation AS $orientationString => $byBaseLine) {
            $prevItem = null;
            $lines[] = array('items' => array(), 'matrix' => $matrixes[$orientationString]);
            $line = &$lines[count($lines) - 1];

            krsort($byBaseLine, SORT_NUMERIC);

            foreach ($byBaseLine AS $y => $items) {
                if ($prevItem !== null && !$this->isOnSameLine($prevItem, $items[0], $matrixes[$orientationString])) {
                    $lines[] = array('items' => array(), 'matrix' => $matrixes[$orientationString]);
                    $line    = &$lines[count($lines) - 1];
                }

                $line['items'] = array_merge($line['items'], $items);
                $prevItem = $items[0];
            }
        }

        $result = array();
        $isPhp7 = PHP_MAJOR_VERSION >= 7;

        foreach ($lines AS $key => $data) {
            $this->_matrix = $data['matrix'];
            // due to https://bugs.php.net/bug.php?id=50688 we need to make this silent
            if ($isPhp7) {
                usort($data['items'], array($this, 'verticallyThenHorizontally'));
            } else {
                // due to https://bugs.php.net/bug.php?id=50688 we need to make this silent
                @usort($data['items'], array($this, 'verticallyThenHorizontally'));
            }
            $this->_matrix = null;
            $result[] = $data['items'];
        }

        return $result;
    }
}
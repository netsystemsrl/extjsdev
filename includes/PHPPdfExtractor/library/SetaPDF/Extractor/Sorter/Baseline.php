<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Baseline.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A sorter class that sorts lines by comparing the baseline of text items.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Sorter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Sorter_Baseline
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
        SetaPDF_Core_Geometry_Matrix $matrix = null
    )
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
            $aYBaseLine = $a->getBaseLineStart()->multiply($matrix)->getY();
            $bYBaseLine = $b->getBaseLineStart()->multiply($matrix)->getY();
        } else {
            $aYBaseLine = $a->getBaseLineStart()->getY();
            $bYBaseLine = $b->getBaseLineStart()->getY();
        }

        if (abs($aYBaseLine - $bYBaseLine) > .7) {
            return false;
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
            $lastY = null;
            $lines[] = array('items' => array(), 'matrix' => $matrixes[$orientationString]);
            $line = &$lines[count($lines) - 1];

            krsort($byBaseLine, SORT_NUMERIC);

            foreach ($byBaseLine AS $y => $items) {
                if ($lastY !== null && abs($lastY - $y) > .7) {
                    $lines[] = array('items' => array(), 'matrix' => $matrixes[$orientationString]);
                    $line    = &$lines[count($lines) - 1];
                }

                $line['items'] = array_merge($line['items'], $items);
                $lastY = $y;
            }
        }

        $result = array();
        $isPhp7 = PHP_MAJOR_VERSION >= 7;

        foreach ($lines AS $key => $data) {
            $this->_matrix = $data['matrix'];
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
<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ContentStreamCleaner.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * Helper class to clean up content streams.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_ContentStreamCleaner
{
    /**
     * Constant defining a content type.
     *
     * @var integer
     */
    const TYPE_NONE         = 0;

    /**
     * Constant defining a content type.
     *
     * @var integer
     */
    const TYPE_STRING       = 1;

    /**
     * Constant defining a content type.
     *
     * @var integer
     */
    const TYPE_OPERATOR     = 2;

    /**
     * Constant defining a content type.
     *
     * @var integer
     */
    const TYPE_INLINE_IMAGE = 4;

    /**
     * Constant defining all content types.
     *
     * @var integer
     */
    const TYPE_ALL          = 7;

    /**
     * Constant defining a regex for path operators.
     *
     * @var string
     */
    const REGEX_PATHOPERATORS = '/(?<=[}\]\x00\x09\x0A\x0C\x0D\x20]|^)([\d\.\-]+[\x00\x09\x0A\x0C\x0D\x20]+){0,6}(m|l|c|v|y|re|h|S|s|f|F|f\*|B|B\*|b|b\*|n|W|W\*)(?=[\x00\x09\x0A\x0C\x0D\x20{\[\/]|$)/S';

    /**
     * Constant defining a regex for color operators.
     *
     * @var string
     */
    const REGEX_COLORS = '/(?<=[}\]\x00\x09\x0A\x0C\x0D\x20]|^)([\d\.\-]+[\x00\x09\x0A\x0C\x0D\x20]+){1,4}(k|K|SC|sc|SCN|scn|rg|RG|g|G)(?=[\x00\x09\x0A\x0C\x0D\x20{\[\/]|$)/S';

    /**
     * Splits a content stream string into literal strings, inline images and operators (all left).
     *
     * The pieces offer information about their type.
     *
     * @param string $string
     *
     * @return array
     */
    static public function splitStream($string, $ignore = self::TYPE_INLINE_IMAGE)
    {
        $result = [];
        $totalStringLength = strlen($string);
        $offset = 0;
        $buffer = '';

        while (
            $offset !== false &&
            $totalStringLength > $offset &&
            ($currentPos = self::_strposa($string, ['(', 'BI'], $offset)) !== false
        ) {
            if (!($ignore & self::TYPE_OPERATOR) && $offset != $currentPos) {
                $buffer .= substr($string, $offset, $currentPos - $offset);
            }

            // a string starts
            if ($string[$currentPos] == '(') {
                // the buffer is filled and the operator shouldn't be ignored
                if (!($ignore & self::TYPE_OPERATOR) && strlen($buffer) > 0) {
                    $result[] = [
                        self::TYPE_OPERATOR,
                        $buffer,
                    ];
                    $buffer = '';
                }

                // search the closing bracket. Balanced brackets have to be tracked
                $resultingStringPos = $currentPos + 1;
                $level = 1;
                do {
                    $pos = strcspn($string, '()', $resultingStringPos);
                    $resultingStringPos = $resultingStringPos + $pos;

                    if ($resultingStringPos === $totalStringLength) {
                        break;
                    }

                    // if the breaket is not escaped, increase the level
                    if ($string[$resultingStringPos - 1] !== '\\') {
                        $level += $string[$resultingStringPos] === '(' ? 1 : -1;
                    }

                    $resultingStringPos++;
                } while ($level > 0);

                if (!($ignore & self::TYPE_STRING)) {
                    $result[] = [
                        self::TYPE_STRING,
                        substr($string, $currentPos, $resultingStringPos - $currentPos),
                    ];
                }

                $offset = $resultingStringPos;

            // a hex string or a dictionary starts
            } elseif ($string[$currentPos] === 'B') {
                // Check for a token delemiter on the previous byte
                if (
                    (
                        $currentPos > 0
                        &&
                        strspn(
                            $string[$currentPos - 1],
                            "\x00\x09\x0A\x0C\x0D\x20)]>"
                        ) === 0
                    // and ensure that the following byte is a white sign
                    ) || (
                        // + 2 because we need to look behind BI
                        isset($string[$currentPos + 2]) &&
                        strcspn(
                            $string[$currentPos + 2],
                            "\x00\x09\x0A\x0C\x0D\x20"
                        ) === 1
                    )
                ) {
                    if (!($ignore & self::TYPE_OPERATOR)) {
                        $buffer .= 'BI';
                    }
                    $offset = $currentPos + 2;
                    continue;
                }

                if (!($ignore & self::TYPE_OPERATOR) && strlen($buffer) > 0) {
                    $result[] = [
                        self::TYPE_OPERATOR,
                        $buffer,
                    ];
                    $buffer = '';
                }

                // search for the EI token
                $resultingStringPos = $currentPos + 2;
                while (($resultingStringPos = strpos($string, 'EI', $resultingStringPos)) !== false) {
                    // ensure that the EI token is surrounded by white signs or followed by a token delemitter
                    $nextPos = $resultingStringPos + 2;
                    if (
                        strspn(
                            $string[$resultingStringPos - 1],
                            "\x00\x09\x0A\x0C\x0D\x20"
                        ) != 0
                        &&
                            isset($string[$nextPos])
                        &&
                        (
                            strspn(
                                $string[$nextPos],
                                "\x00\x09\x0A\x0C\x0D\x20/{[(<%"
                            ) != 0
                        )
                    ) {
                        $resultingStringPos = $nextPos;
                        break;
                    }
                    $resultingStringPos = $nextPos;
                }

                // if EI was not found
                if ($resultingStringPos > $totalStringLength || $resultingStringPos === false) {
                    $resultingStringPos = $totalStringLength;
                }

                if (!($ignore & self::TYPE_INLINE_IMAGE)) {
                    $result[] = [
                        self::TYPE_INLINE_IMAGE,
                        substr($string, $currentPos, $resultingStringPos - $currentPos),
                    ];
                }

                $offset = $resultingStringPos;
            }
        }

        // if operators are left....
        if (!($ignore & self::TYPE_OPERATOR)) {
            if ($offset !== false && ($totalStringLength - $offset) > 0) {
                $buffer .= substr($string, $offset, $totalStringLength - $offset);
            }

            if (strlen($buffer) > 0) {
                $result[] = [
                    self::TYPE_OPERATOR,
                    $buffer
                ];
            }
        }

        return $result;
    }

    /**
     * Searches for the closest needle in the string.
     *
     * If there is no needle in the string, it will return false.
     *
     * @param string $haystack
     * @param array $needles
     * @param int $offset
     * @return bool|int
     */
    static private function _strposa($haystack, array $needles, $offset = 0)
    {
        $closest = false;
        foreach ($needles as $needle) {
            $strpos = strpos($haystack, $needle, $offset);
            if ($strpos !== false && ($closest === false || ($strpos < $closest))) {
                $closest = $strpos;
            }
        }
        return $closest;
    }

    /**
     * Cleans a content stream string by using regexes on the chosen targets.
     *
     * The regexes will NOT affect literal string objects.
     *
     * @param string|array $data
     * @param array $regexes
     * @param int $target
     *
     * @return string
     */
    static public function clean($data, array $regexes, $target = self::TYPE_OPERATOR)
    {
        if (!is_array($data)) {
            $data = self::splitStream($data);
        }

        $resultingString = '';
        foreach ($data as $result) {
            $tempResult = $result[1];
            if ($result[0] & $target) {
                foreach ($regexes as $regex) {
                    $tempResult = preg_replace($regex, '', $tempResult);
                }
            }
            $resultingString .= $tempResult;
        }

        return $resultingString;
    }
}
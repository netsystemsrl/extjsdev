<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Date.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Data structure class for date objects
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_DataStructure_Date
    implements SetaPDF_Core_DataStructure_DataStructureInterface
{
    /**
     * The string object representing the date
     *
     * Format: (D:YYYYMMDDHHmmSSOHH'mm)
     *
     * @var SetaPDF_Core_Type_String
     */
    protected $_string;

    /**
     * Converts an PDF date time string into a DateTime object.
     *
     * @param string $string
     * @return DateTime
     * @throws OutOfRangeException
     */
    static public function stringToDateTime($string)
    {
        $matches = array();
        // YYYYMMDDHHmmSSOHH'mm
        preg_match("/(D:)?" // shall be present but is not present throughout
                . '(?P<year>\d{4})' // YYYY
                . '(?P<month>\d{2})?' // MM
                . '(?P<day>\d{2})?' // DD
                . '(?P<hour>\d{2})?' // HH
                . '(?P<minute>\d{2})?' // mm
                . '(?P<second>\d{2})?' // SS
                . '(?P<relationToUT>[\-\+Z])?' // O
                . '(?P<hoursFromUT>\d{2})?' // HH
                . '(\'(?P<minutesFromUT>\d{2})?)?' // 'mm
                . '/',
            $string, $matches);

        if (!isset($matches['year'])) {
            throw new OutOfRangeException(
                sprintf('A date could not be extracted from the string (%s)', $string)
            );
        }

        if (isset($matches['relationToUT']) && $matches['relationToUT'] === 'Z') {
            $matches['relationToUT'] = '+';
            $matches['hoursFromUT'] = '00';
            $matches['minutesFromUT'] = '00';
        }

        $date = new DateTime(
            $matches['year'] . '/' .
                (isset($matches['month']) ? $matches['month'] : '01') . '/' .
                (isset($matches['day']) ? $matches['day'] : '01') . ' ' .
                (isset($matches['hour']) ? $matches['hour'] : '00') . ':' .
                (isset($matches['minute']) ? $matches['minute'] : '00') . ':' .
                (isset($matches['second']) ? $matches['second'] : '00') .
                (isset($matches['relationToUT']) ? $matches['relationToUT'] : '+') .
                (isset($matches['hoursFromUT']) ? $matches['hoursFromUT'] : '00') .
                (isset($matches['minutesFromUT']) ? $matches['minutesFromUT'] : '00')
        );

        return $date;
    }

    /**
     * The constructor.
     *
     * The $string parameter can be of various types:<br/>
     * <ul>
     * <li>If a {@link SetaPDF_Core_Type_String} object is passed, it will be used as the date value.</li>
     * <li>If a DateTime instance is passed, it will be forwarded to the {@link setByDateTime()} method.</li>
     * <li>If a simple string is passed, it will be passed to create a new DateTime instance which is forward to the
     *   {@link setByDateTime()} method then.</li>
     * </ul>
     * @param string|DateTime|SetaPDF_Core_Type_String $string
     */
    public function __construct($string = null)
    {
        if ($string instanceof SetaPDF_Core_Type_String) {
            $this->_string = $string;
        } else {
            $this->_string = new SetaPDF_Core_Type_String();

            if ($string === null) {
                $this->setByDateTime(new DateTime());
            } elseif ($string instanceof DateTime) {
                $this->setByDateTime($string);
            } else {
                $this->setByDateTime(new DateTime($string));
            }
        }
    }

    /**
     * Get the PDF date as a DateTime object.
     *
     * @return DateTime
     */
    public function getAsDateTime()
    {
        return self::stringToDateTime($this->_string->getValue());
    }

    /**
     * Set the date by a DateTime object.
     *
     * @param DateTime $dateTime
     */
    public function setByDateTime(DateTime $dateTime)
    {
        // D:YYYYMMDDHHmmSSOHH'mm' <- the trailing apostroph is required by Adobe Reader but not documented in ISO specs!
        $this->_string->setValue(
            substr_replace($dateTime->format('\D\:YmdHisO'), "'", -2, 0) . "'"
        );
    }

    /**
     * Get the PDF string object.
     *
     * @see SetaPDF_Core_DataStructure_DataStructureInterface::getValue()
     * @return SetaPDF_Core_Type_String
     */
    public function getValue()
    {
        return $this->_string;
    }

    /**
     * Get the date as a PHP string.
     *
     * @see SetaPDF_Core_DataStructure_DataStructureInterface::toPhp()
     */
    public function toPhp()
    {
        return $this->_string->toPhp();
    }
}
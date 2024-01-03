<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Parser.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * ICC profile parser
 *
 * This ICC profile parser is based on the specs ICC.1:2001-04 and ICC.1:2010.
 * The parser actually only offers an access to the header data and description tag.
 *
 * @see Spec ICC.1:2001-04
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_IccProfile_Parser
{
    /**
     * The reader instance
     *
     * @var SetaPDF_Core_Reader_Binary
     */
    protected $_reader;

    /**
     * Information about tagged element data offset and size
     *
     * @var null|array
     */
    protected $_tagsData = null;

    /**
     * @var null|array
     */
    protected $_headerData = null;

    /**
     * @var null|array
     */
    protected $_descriptionData = null;

    /**
     * The constructor.
     *
     * @param string|SetaPDF_Core_Reader_Binary $reader
     * @throws SetaPDF_Core_Exception
     */
    public function __construct($reader)
    {
        if (!$reader instanceof SetaPDF_Core_Reader_Binary) {
            $fileReader = $reader;
            if (!$fileReader instanceof SetaPDF_Core_Reader_AbstractReader) {
                $fileReader = new SetaPDF_Core_Reader_File($reader);
            }

            $reader = new SetaPDF_Core_Reader_Binary($fileReader);
        }

        $this->_reader = $reader;

        $this->_parseHeader();

        $this->_parseTagTable();
    }

    /**
     * Release resources.
     */
    public function cleanUp()
    {
        $this->_reader->cleanUp();
        $this->_reader = null;
    }

    /**
     * Get the reader instance.
     *
     * @return SetaPDF_Core_Reader_Binary
     */
    public function getReader()
    {
        return $this->_reader;
    }

    /**
     * Get all data resolved by the header description.
     *
     * @return array
     */
    public function getHeaderData()
    {
        return $this->_headerData;
    }

    /**
     * Get the profile size.
     *
     * @see getHeaderData()
     * @return integer
     */
    public function getProfileSize()
    {
        return $this->_headerData['profileSize'];
    }

    /**
     * Get preferred Color Management Module.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getPreferredCMM()
    {
        return $this->_headerData['preferredCMM'];
    }

    /**
     * Get the profile version number.
     *
     * A 4 byte string:
     * Byte 0 = Major Revision in Binary-Coded Decimal
     * Byte 1 = Minor Revision & Bug Fix Revision in each nibble in Binary-Coded Decimal
     * Byte 2 + 3 = reserved, must be set to 0
     *
     * @see getHeaderData()
     * @param boolean $raw
     * @return string
     */
    public function getVersion($raw = false)
    {
        if ($raw) {
            return $this->_headerData['version'];
        }

        $major = ord($this->_headerData['version'][0]);
        $minor = ord($this->_headerData['version'][1]) >> 4;
        $bugfix = ord($this->_headerData['version'][1]) & 15;

        return $major . '.' . $minor . '.' . $bugfix;
    }

    /**
     * Get the Profile/Device Class signature.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getClass()
    {
        return $this->_headerData['class'];
    }

    /**
     * Get the color space signature or readable form.
     *
     * @see getHeaderData()
     * @param boolean $signature
     * @return string
     */
    public function getColorSpace($signature = false)
    {
        $colorSpaceSignature = $this->_headerData['colorSpace'];
        if ($signature)
            return $colorSpaceSignature;

        $types = array(
            // 'XYZ ' => 'nCIEXYZ or PCSXYZ',
            // 'Lab ' => 'CIELAB or PCSLAB',
            'Luv ' => 'CIELUV',
            'YCbr' => 'YCbCr',
            'Yxy ' => 'CIEYxy',
            'GRAY' => 'Gray',
            'RGB ' => 'RGB',
            'HSV ' => 'HSV',
            'HLS ' => 'HLS',
            // 'CMYK' => 'CMYK',
            'CMY ' => 'CMY',
            '2CLR' => '2 colour',
            '3CLR' => '3 colour',
            '4CLR' => '4 colour',
            '5CLR' => '5 colour',
            '6CLR' => '6 colour',
            '7CLR' => '7 colour',
            '8CLR' => '8 colour',
            '9CLR' => '9 colour',
            'ACLR' => '10 colour',
            'BCLR' => '11 colour',
            'CCLR' => '12 colour',
            'DCLR' => '13 colour',
            'ECLR' => '14 colour',
            'FCLR' => '15 colour',
        );

        if (isset($types[$colorSpaceSignature]))
            return $types[$colorSpaceSignature];

        return $colorSpaceSignature;
    }

    /**
     * Get the Profile Connection Space signature.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getPCS()
    {
        return $this->_headerData['pcs'];
    }

    /**
     * Get the Primary Platform signature.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getPrimaryPlatform()
    {
        return $this->_headerData['primaryPlatform'];
    }

    /**
     * Get Profile flags.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getFlags()
    {
        return $this->_headerData['flags'];
    }

    /**
     * Get the Device manufacturer of the device for which this profile is created.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getDeviceManufacturer()
    {
        return $this->_headerData['deviceManufacturer'];
    }

    /**
     * Get the Device model of the device for which this profile is created.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getDeviceModel()
    {
        return $this->_headerData['deviceModel'];
    }

    /**
     * Get the Device attributes.
     *
     * @return string
     */
    public function getDeviceAttributes()
    {
        return $this->_headerData['deviceAttributes'];
    }

    /**
     * Get the Profile Creator signature.
     *
     * @see getHeaderData()
     * @return string
     */
    public function getCreator()
    {
        return $this->_headerData['creator'];
    }

    /**
     * Get the number of components/channels.
     *
     * @see Spec ICC.1:2001-04 - Table 48
     * @return int
     */
    public function getNumberOfComponents()
    {
        $colorSpace = $this->getColorSpace(true);
        switch ($colorSpace) {
            case 'CMYK':
                return 4;
                break;

            case strpos($colorSpace, 'CLR') === 1:
                if (is_numeric($colorSpace[0])) {
                    return (int)$colorSpace[0];
                } else {
                    switch ($colorSpace[0]) {
                        case 'A':
                            return 10;
                        case 'B':
                            return 11;
                        case 'C':
                            return 12;
                        case 'D':
                            return 13;
                        case 'E':
                            return 14;
                        case 'F':
                            return 15;
                    }
                }
        }

        return 3;
    }

    /**
     * Get description.
     *
     * If the profile is of version 4 a language and country code can be passed to
     * get a specific description entry.
     *
     * To get an overview of all resolved description data see {@link getDescriptionData()}.
     *
     * @see getDescriptionData()
     * @param string $encoding
     * @param null $languageCode
     * @param null $countryCode
     *
     * @return array|null|string
     */
    public function getDescription($encoding = 'UTF-8', $languageCode = null, $countryCode = null)
    {
        $this->_parseDescTag();

        // version 2
        if (isset($this->_descriptionData['ascii'])) {
            /* The test documents, which are available will offer less
             * information in the unicode entry than in the ASCII one
            if (!empty($this->_descriptionData['unicodeDescription'])) {
                return SetaPDF_Core_Encoding::convert($this->_descriptionData['unicodeDescription'], 'UTF-16BE', $encoding);
            }*/
            return SetaPDF_Core_Encoding::convert($this->_descriptionData['ascii'], 'ASCII', $encoding);
        }

        // version 4
        $result = array();
        if ($languageCode === null && $countryCode === null) {
            foreach ($this->_descriptionData AS $data) {
                return SetaPDF_Core_Encoding::convert($data['value'], 'UTF-16BE', $encoding);
            }
        }

        if ($countryCode === null) {
            foreach ($this->_descriptionData AS $data) {
                if ($data['languageCode'] != $languageCode)
                    continue;

                return SetaPDF_Core_Encoding::convert($data['value'], 'UTF-16BE', $encoding);
            }

            return $result;
        }


        foreach ($this->_descriptionData AS $data) {
            if ($data['languageCode'] != $languageCode || $data['countryCode'] != $countryCode)
                continue;

            return SetaPDF_Core_Encoding::convert($data['value'], 'UTF-16BE', $encoding);
        }

        return null;
    }

    /**
     * Get all resolved description data.
     *
     * @return array|null
     */
    public function getDescriptionData()
    {
        $this->_parseDescTag();
        return $this->_descriptionData;
    }

    /**
     * Parse the header data.
     *
     * @throws SetaPDF_Core_Exception
     */
    protected function _parseHeader()
    {
        if ($this->_headerData !== null)
            return;

        $this->_headerData = array();

        $reader = $this->_reader;
        $reader->seek(0);

        $this->_headerData['profileSize'] = $reader->readUInt32();
        $this->_headerData['preferredCMM'] = $reader->readBytes(4);
        $this->_headerData['version'] = $reader->readBytes(4);
        $this->_headerData['class'] = $reader->readBytes(4);
        $this->_headerData['colorSpace'] = $reader->readBytes(4);
        $this->_headerData['pcs'] = $reader->readBytes(4);
        // Skip Date and time
        $reader->skip(12);

        if ($reader->readBytes(4) !== 'acsp') {
            throw new SetaPDF_Core_Exception('Invalid file header signature in ICC profile.');
        }

        $this->_headerData['primaryPlatform'] = $reader->readBytes(4);
        $this->_headerData['flags'] = $reader->readBytes(4);
        $this->_headerData['deviceManufacturer'] = $reader->readBytes(4);
        $this->_headerData['deviceModel'] = $reader->readBytes(4);
        $this->_headerData['deviceAttributes'] = $reader->readBytes(8);
        $this->_headerData['renderingIntent'] = $reader->readUInt32();

        // Skip XYZNumber.
        $reader->skip(12);

        $this->_headerData['creator'] = $reader->readBytes(4);
    }

    /**
     * Parse the tag table.
     */
    protected function _parseTagTable()
    {
        if ($this->_tagsData !== null)
            return;

        $this->_tagsData = array();

        $reader = $this->_reader;
        $reader->seek(128);
        $tagCount = $reader->readUInt32();
        for ($i = 0; $i < $tagCount; $i++) {
            $tag = $reader->readBytes(4);
            $offset = $reader->readInt32();
            $size = $reader->readInt32();

            $this->_tagsData[$tag] = array($offset, $size);
        }
    }

    /**
     * Parse the description tag.
     */
    protected function _parseDescTag()
    {
        if ($this->_descriptionData !== null)
            return;

        $this->_descriptionData = array();

        // multiLocalizedUnicodeType
        $reader = $this->_reader;
        $tagPosition = $this->_tagsData['desc'][0];
        $reader->seek($tagPosition);

        $sig = $reader->readBytes(4);
        if ($sig === 'desc') {
            $reader->skip(4);
            $asciiLength = $reader->readUInt32();
            $this->_descriptionData['ascii'] = substr($reader->readBytes($asciiLength), 0, -1);
            $this->_descriptionData['unicodeLanguageCode'] = $reader->readUInt32();
            $descriptionLength = $reader->readUInt32();
            $this->_descriptionData['unicodeDescription'] = $descriptionLength ? substr($reader->readBytes($descriptionLength), 0, -1) : '';

            $this->_descriptionData['scriptCode'] = $reader->readUInt16();
            $descriptionLength = $reader->readUInt8();
            $this->_descriptionData['macDescription'] = $descriptionLength ? substr($reader->readBytes($descriptionLength), 0, -1) : '';

        } elseif ($sig === 'mluc') {
            $reader->skip(4);
            $recordCount = $reader->readUInt32();
            $reader->skip(4);
            $recordsData = array();
            for ($i = 0; $i < $recordCount; $i++) {
                $recordsData[] = array(
                    'iso639-1' => $reader->readBytes(2),
                    'iso3166-1' => $reader->readBytes(2),
                    'length' => $reader->readUInt32(),
                    'offset' => $reader->readUInt32(),
                );
            }

            foreach($recordsData AS $recordData) {
                $reader->seek($tagPosition + $recordData['offset']);
                $value = $reader->readBytes($recordData['length']);

                $this->_descriptionData[] = array(
                    'languageCode' => $recordData['iso639-1'],
                    'countryCode' => $recordData['iso3166-1'],
                    'value' => $value
                );
            }
        }
    }
}
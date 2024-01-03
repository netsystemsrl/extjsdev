<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Cmap.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a CMAP.
 *
 * This class includes a very simple parser for CID data. The extracted data are limited
 * to unicode and cid mappings.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Cmap implements SetaPDF_Core_Font_Cmap_CmapInterface
{
    /**
     * Cache for named instances.
     *
     * @var array
     */
    static public $namedInstances = [];

    /**
     * Code space ranges.
     *
     * @var array
     */
    protected $_codeSpaceRanges = [];

    /**
     * CID and uncidoe mappings.
     *
     * @var array
     */
    protected $_mappings = [
        'uni' => [
            'single' => [],
            'range' => []
        ],
        'cid' => [
            'single' => [],
            'range' => []
        ],
    ];

    /**
     * The name resolved from the CMAP file.
     *
     * @var string
     */
    protected $_name;

    /**
     * A separate CMAP instance of only CID mappings.
     *
     * @var SetaPDF_Core_Font_Cmap
     */
    protected $_cidMap;

    /**
     * Resolved data for an optimization of a reverse lookup.
     *
     * @var array
     */
    protected $_lookUps = ['uni' => [], 'cid' => []];

    /**
     * Creates an instance of an existing CMAP.
     *
     * Existing CMAPs can be found in /SetaPDF/Font/Cmap/_cmaps/.
     * A named instance will be cached. To remove it from memory you will need to call
     * SetaPDF_Core_Font_Cmap::cleanUpNamedInstanceCache().
     *
     * @param $name
     * @param bool $cache
     *
     * @return mixed|null|SetaPDF_Core_Font_Cmap
     * @throws SetaPDF_Core_Font_Exception
     */
    static public function createNamed($name, $cache = false)
    {
        $name = (string)preg_replace('/[^a-z0-9_\-]/i', '', $name);

        if (isset(self::$namedInstances[$name])) {
            return self::$namedInstances[$name];
        }

        $dir = __DIR__ . '/Cmap/_cmaps/';
        $path = realpath($dir . $name);

        if (false === $path || !is_readable($path)) {
            throw new InvalidArgumentException('Unable to load cmap file for "' . $name . '"');
        }

        if (file_exists($path . '.cache') && is_readable($path . '.cache')) {
            $cmap = unserialize(file_get_contents($path . '.cache'));
        } else {
            $cmap = self::create(new SetaPDF_Core_Reader_File($path));
            if ($cache && is_writable($dir)) {
                file_put_contents($path . '.cache', serialize($cmap));
            }
        }

        self::$namedInstances[$name] = $cmap;

        return $cmap;
    }

    /**
     * Remove named cmap instances from the local cache.
     *
     * @param string|null $name The name or null for all cached instances
     */
    static public function cleanUpNamedInstanceCache($name = null)
    {
        if (null === $name) {
            self::$namedInstances = [];
        } else {
            unset(self::$namedInstances[$name]);
        }
    }

    /**
     * Create an instance based on CMAP data through an reader instance.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader
     * @return null|SetaPDF_Core_Font_Cmap
     * @throws SetaPDF_Core_Font_Exception
     */
    static public function create(SetaPDF_Core_Reader_ReaderInterface $reader)
    {
        $tokenizer = new SetaPDF_Core_Tokenizer($reader);
        /**
         * @var $cmap self
         */
        $cmap = null;
        $stack = [];

        while (($token = $tokenizer->readToken()) !== false) {
            switch ($token) {
                case '%':
                    $tokenizer->getReader()->readLine();
                    continue 2;
                case 'usecmap':
                    self::_ensureCMapInstance($cmap);

                    $name = array_pop($stack);
                    $tmpCmap = self::createNamed($name);
                    $cmap->_mappings = $tmpCmap->_mappings;
                    $cmap->_codeSpaceRanges = $tmpCmap->_codeSpaceRanges;
                    unset($tmpCmap);
                    $stack = [];
                    break;
                case 'begincmap':
                    $cmap = new self();
                    break;
                case 'endcmap':
                    break 2;
                case 'begincodespacerange':
                    $values = [];
                    while (($value = self::_readValue($tokenizer)) !== 'endcodespacerange' && false !== $value) {
                        $values[] = $value;
                    }

                    $valueCount = count($values);
                    if ($valueCount > 1) {
                        self::_ensureCMapInstance($cmap);
                    }

                    for ($i = 0; $i < $valueCount; $i += 2) {
                        if (!isset($values[$i + 1])) {
                            break;
                        }

                        $cmap->addCodeSpaceRange(
                            SetaPDF_Core_Type_HexString::hex2str($values[$i]),
                            SetaPDF_Core_Type_HexString::hex2str($values[$i + 1])
                        );
                    }
                    break;
                case 'beginbfchar':
                    $values = [];
                    while (($value = self::_readValue($tokenizer)) !== 'endbfchar' && false !== $value) {
                        $values[] = $value;
                    }

                    $valueCount = count($values);
                    if ($valueCount > 1) {
                        self::_ensureCMapInstance($cmap);
                    }

                    for ($i = 0; $i < $valueCount; $i += 2) {
                        if (!isset($values[$i + 1])) {
                            break;
                        }

                        $dst = $values[$i + 1];

                        // Some ToUnicode maps map to unicode points instead of UTF16-BE values.
                        // So we prefix them with a "null byte" to have a valid UTF16-BE value.
                        if (strlen($dst) < 4) {
                            $dst = str_pad($dst, 4, '0', STR_PAD_LEFT);
                        }

                        $cmap->addSingleMapping(
                            SetaPDF_Core_Type_HexString::hex2str($values[$i]),
                            SetaPDF_Core_Type_HexString::hex2str($dst)
                        );
                    }
                    break;
                case 'beginbfrange':
                    $values = [];
                    while (($value = self::_readValue($tokenizer)) !== 'endbfrange' && false !== $value) {
                        $values[] = $value;
                    }

                    $valueCount = count($values);
                    if ($valueCount > 2) {
                        self::_ensureCMapInstance($cmap);
                    }

                    for ($i = 0; $i < $valueCount; $i += 3) {
                        if (!isset($values[$i + 1], $values[$i + 2])) {
                            break;
                        }

                        if ($values[$i] === $values[$i + 1]) {
                            $dst = $values[$i + 2];
                            if (is_array($dst)) {
                                $dst = $dst[0];
                            }

                            // Some ToUnicode maps map to unicode points instead of UTF16-BE values.
                            // So we prefix them with a "null byte" to have a valid UTF16-BE value.
                            if (strlen($dst) < 4) {
                                $dst = str_pad($dst, 4, '0', STR_PAD_LEFT);
                            }

                            $cmap->addSingleMapping(
                                SetaPDF_Core_Type_HexString::hex2str($values[$i]),
                                SetaPDF_Core_Type_HexString::hex2str($dst)
                            );

                        } else {
                            if (strlen($values[$i]) !== strlen($values[$i + 1])) {
                                continue;
                            }

                            // Some ToUnicode maps map to unicode points instead of UTF16-BE values.
                            // So we prefix them with a "null byte" to have a valid UTF16-BE value.
                            $dst = $values[$i + 2];
                            if (is_array($dst)) {
                                $dst = array_map(function($dst) {
                                    if (strlen($dst) < 4) {
                                        $dst = str_pad($dst, 4, '0', STR_PAD_LEFT);
                                    }
                                    return $dst;
                                }, $dst);
                            } else {
                                if (strlen($dst) < 4) {
                                    $dst = str_pad($dst, 4, '0', STR_PAD_LEFT);
                                }
                            }

                            $cmap->addRangeMapping(
                                hexdec($values[$i]),
                                hexdec($values[$i + 1]),
                                $dst,
                                strlen($values[$i]) / 2
                            );
                        }
                    }
                    break;
                case 'begincidchar':
                    $values = [];
                    while (($value = self::_readValue($tokenizer)) !== 'endcidchar' && false !== $value) {
                        $values[] = $value;
                    }

                    $valueCount = count($values);
                    if ($valueCount > 1) {
                        self::_ensureCMapInstance($cmap);
                    }

                    for ($i = 0; $i < $valueCount; $i += 2) {
                        if (!isset($values[$i + 1])) {
                            break;
                        }

                        $cmap->addCidSingleMapping(
                            SetaPDF_Core_Type_HexString::hex2str($values[$i]),
                            $values[$i + 1]
                        );
                    }

                    break;
                case 'begincidrange':
                    $values = [];
                    while (($value = self::_readValue($tokenizer)) !== 'endcidrange' && false !== $value) {
                        $values[] = $value;
                    }

                    $valueCount = count($values);
                    if ($valueCount > 2) {
                        self::_ensureCMapInstance($cmap);
                    }

                    for ($i = 0; $i < $valueCount; $i += 3) {
                        if (!isset($values[$i + 1], $values[$i + 2])) {
                            break;
                        }

                        if ($values[$i] == $values[$i + 1]) {
                            $dst = $values[$i + 2];
                            if (is_array($dst)) {
                                $dst = $dst[0];
                            }

                            $cmap->addCidSingleMapping(
                                SetaPDF_Core_Type_HexString::hex2str($values[$i]),
                                (int)$dst
                            );

                        } else {
                            $cmap->addCidRangeMapping(
                                hexdec($values[$i]),
                                hexdec($values[$i + 1]),
                                $values[$i + 2],
                                strlen($values[$i]) / 2
                            );
                        }
                    }
                    break;

                case 'def':
                    $lenght = count($stack);
                    if ($lenght > 2) {
                        if ($stack[$lenght - 3] === 'CMapName') {
                            self::_ensureCMapInstance($cmap);
                            $cmap->_name = $stack[$lenght - 1];
                        }
                        $stack = [];
                        break;
                    }
                    break;

                default:
                    $stack[] = $token;
                    continue 2;
            }
        }

        if (!$cmap instanceof self) {
            throw new SetaPDF_Core_Font_Exception('This cmap table does not include any data.');
        }

        return $cmap;
    }

    /**
     * Helper method that ensures an instance of self.
     * 
     * @param mixed $cmap
     * @throws SetaPDF_Core_Font_Exception
     */
    static protected function _ensureCMapInstance(&$cmap)
    {
        if (!$cmap instanceof self) {
            $cmap = new self();
        }
    }

    /**
     * Read the next value via the tokenizer instance.
     *
     * @param SetaPDF_Core_Tokenizer $tokenizer
     * @return array|string
     */
    static protected function _readValue(SetaPDF_Core_Tokenizer $tokenizer)
    {
        $token = $tokenizer->readToken();

        switch ($token) {
            case '<':
                $values = [];
                while (($value = self::_readValue($tokenizer)) !== '>') {
                    $values[] = $value;
                }

                return implode('', $values);

            case '[':
                $values = [];
                while (($value = self::_readValue($tokenizer)) !== ']') {
                    $values[] = $value;
                }
                return $values;
                break;
            default:
                return $token;
        }
    }

    /**
     * Add a codespace range.
     *
     * @param string $start
     * @param string $end
     */
    public function addCodeSpaceRange($start, $end)
    {
        $this->_codeSpaceRanges[strlen($start)] = [$start, $end];
    }

    /**
     * Add a single mapping.
     *
     * @param string $src
     * @param string $dst
     */
    public function addSingleMapping($src, $dst)
    {
        $this->_mappings['uni']['single'][$src] = $dst;
    }

    /**
     * Add a range mapping.
     *
     * @param integer $src1
     * @param integer $src2
     * @param string $dst
     * @param integer $size
     */
    public function addRangeMapping($src1, $src2, $dst, $size)
    {
        $this->_mappings['uni']['range'][$size][] = [$src1 , $src2, $dst];
    }

    /**
     * Add a single cid mapping.
     *
     * @param string $src
     * @param string $dst
     */
    public function addCidSingleMapping($src, $dst)
    {
        $this->_mappings['cid']['single'][$src] = $dst;
    }

    /**
     * Add a cid range mapping.
     *
     * @param integer $src1
     * @param integer $src2
     * @param string $dst
     * @param integer $size
     */
    public function addCidRangeMapping($src1, $src2, $dst, $size)
    {
        $this->_mappings['cid']['range'][$size][] = [$src1 , $src2, $dst];
    }

    /**
     * Set the CID map instance.
     *
     * @param SetaPDF_Core_Font_Cmap $cidMap
     */
    public function setCidMap(SetaPDF_Core_Font_Cmap $cidMap)
    {
        $this->_cidMap = $cidMap;
    }

    /**
     * Get the separate CID Map.
     *
     * @return SetaPDF_Core_Font_Cmap
     */
    public function getCidMap()
    {
        return $this->_cidMap;
    }

    /**
     * Lookup by a type.
     *
     * @param string $type
     * @param string $src
     * @return bool|number|string
     */
    protected function _lookup($type, $src)
    {
        $table = $this->_mappings[$type];
        if (isset($table['single'][$src])) {
            return $table['single'][$src];
        }

        if (isset($this->_lookUps[$type][$src])) {
            return $this->_lookUps[$type][$src];
        }

        $srcInt = hexdec(SetaPDF_Core_Type_HexString::str2hex($src));
        $size = strlen($src);

        $sizes = [$size];
        if (!isset($table['range'][$size])) {
            $sizes = array_keys($table['range']);
            if (count($sizes) === 0 || max($sizes) > $size) {
                return false;
            }
        }

        foreach ($sizes AS $size) {
            /* walk backwards to get latest definitions first
             * e.g.
             *   ETenms-B5-H make use of "/ETen-B5-H usecmap" which is executed first
             *   but ascii definitions are done in ETenms-B5-H later...
             */
            for ($i = count($table['range'][$size]) - 1; $i >= 0; $i--) {
                $range = $table['range'][$size][$i];
                $src1 = $range[0];
                $src2 = $range[1];
                if ($srcInt >= $src1 && $srcInt <= $src2) {
                    if (is_array($range[2])) {
                        $diff = $srcInt - $src1;
                        if (!isset($range[2][$diff])) {
                            continue;
                        }

                        if ($type === 'cid') {
                            return $range[2][$diff];
                        }

                        $this->_lookUps[$type][$src] = SetaPDF_Core_Type_HexString::hex2str($range[2][$diff]);
                        return $this->_lookUps[$type][$src];
                    }

                    $diff = $srcInt - $src1;

                    if ($type === 'cid') {
                        $this->_lookUps[$type][$src] = $range[2] + $diff;
                        return $this->_lookUps[$type][$src];
                    }

                    // fallback for invalid byte strings. It should only the last byte get incremented.
                    if ($diff > 255) {
                        $value = hexdec($range[2]) + $diff;
                        $value = SetaPDF_Core_Encoding::unicodePointToUtf16Be($value);
                    } else {
                        $value = SetaPDF_Core_Type_HexString::hex2str($range[2]);
                        $value[strlen($value) - 1] = chr(ord($value[strlen($value) - 1]) + $diff);
                    }

                    $this->_lookUps[$type][$src] = $value;

                    return $value;
                }
            }
        }

        return false;
    }

    /**
     * Do a reverse lookup.
     *
     * @param string $dest
     * @return bool|mixed
     */
    public function reverseLookup($dest)
    {
        return $this->_reverseLookup($dest, 'uni');
    }

    /**
     * Do a reverse CID lookup.
     *
     * @param string $dest
     * @return bool|mixed
     */
    public function reverseCidLoopkup($dest)
    {
        return $this->_reverseLookup($dest, 'cid');
    }

    /**
     * Do a reverse lookup by a specific type.
     *
     * @param string $dest
     * @param string $type
     * @return bool|number|string
     */
    protected function _reverseLookup($dest, $type)
    {
        $table = $this->_mappings[$type];
        $src = array_search($dest, $table['single']);
        if ($src !== false) {
            return $src;
        }

        $src = array_search($dest, $this->_lookUps[$type]);
        if ($src !== false) {
            return $src;
        }

        if ($type === 'cid') {
            $code = (int)$dest;

            foreach ($table['range'] AS $size => $entries) {
                foreach ($entries AS $entry) {
                    if (is_array($entry[2])) {
                        foreach ($entry[2] AS $offset => $_entry) {
                            $_entry = (int)$_entry;

                            if ($_entry === $code) {
                                $result = $entry[0] + $offset;
                                return SetaPDF_Core_BitConverter::formatToUInt($result, $size);
                            }
                        }
                    } else {
                        $diff = $entry[1] - $entry[0];
                        $start = (int)$entry[2];
                        $end = $start + $diff;

                        if ($code >= $start && $code <= $end) {
                            $diff2 = $code - $start;
                            $result = $entry[0] + $diff2;
                            return SetaPDF_Core_BitConverter::formatToUInt($result, $size);
                        }
                    }
                }
            }

        } else {

            /**
             * As a mapping can be done to sequences of unicode characters we need to cut the destination value
             * into a prefix and suffix (= last byte). In the search routines, we search for the prefix and suffix
             * explicity.
             */
            $destPrefix = substr($dest, 0, -1);
            $destSuffixValue = ord(substr($dest, -1, 1));

            foreach ($table['range'] AS $size => $entries) {
                foreach ($entries AS $entry) {
                    if (is_array($entry[2])) {
                        foreach ($entry[2] AS $offset => $_entry) {
                            $_entry = SetaPDF_Core_Type_HexString::hex2str($_entry);
                            if ($dest === $_entry) {
                                return SetaPDF_Core_BitConverter::formatToUInt($entry[0] + $offset, $size);
                            }
                        }
                    } else {
                        $_entry = SetaPDF_Core_Type_HexString::hex2str($entry[2]);
                        $prefix = substr($_entry, 0, -1);

                        if ($prefix !== $destPrefix) {
                            continue;
                        }

                        $startValue = ord(substr($_entry, -1, 1));
                        $diffValue = $entry[1] - $entry[0];
                        $endValue = $startValue + $diffValue;
                        if ($destSuffixValue >= $startValue && $destSuffixValue <= $endValue) {
                            $diff2 = $destSuffixValue - $startValue;
                            $result = $entry[0] + $diff2;
                            return SetaPDF_Core_BitConverter::formatToUInt($result, $size);
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Lookup a unicode value.
     *
     * @param string $src
     * @return bool|number|string
     */
    public function lookup($src)
    {
        if ($this->_cidMap !== null) {
            $cid = $this->_cidMap->lookupCid($src);
            if (!$cid) {
                return $cid;
            }

            $src = SetaPDF_Core_Encoding::unicodePointToUtf16Be($cid);
        }

        return $this->_lookup('uni', $src);
    }

    /**
     * Lookup for a CID.
     *
     * @param string $src
     * @return bool|number|string
     */
    public function lookupCid($src)
    {
        return $this->_lookup('cid', $src);
    }

    /**
     * Get the name of the CID map.
     *
     * @return string
     */
    public function getName()
    {
        return $this->_name;
    }
}
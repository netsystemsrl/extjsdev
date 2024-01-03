<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Tags.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract class representing TrueType table tags
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_TrueType_Table_Tags
{
  /* Required Tables */

    /**
     * Character to glyph mapping
     * @var string
     */
    const CMAP = 'cmap';

    /**
     * Font header
     * @var string
     */
    const HEADER = 'head';

    /**
     * Horizontal header
     * @var string
     */
    const HORIZONTAL_HEADER = 'hhea';

    /**
     * Horizontal metrics
     * @var string
     */
    const HORIZONTAL_METRICS = 'hmtx';

    /**
     * Maximum profile
     * @var string
     */
    const MAXIMUM_PROFILE = 'maxp';

    /**
     * Naming table
     * @var string
     */
    const NAME = 'name';

    /**
     * OS/2 and Windows specific metrics
     * @var string
     */
    const OS2 = 'OS/2';

    /**
     * PostScript information
     * @var string
     */
    const POST = 'post';

  /* Tables Related to TrueType Outlines */

    /**
     * Control Value Table
     * @var string
     */
    const CVT = 'cvt ';

    /**
     * Font program
     * @var string
     */
    const FPGM = 'fpgm';

    /**
     * Glyph data
     * @var string
     */
    const GLYF = 'glyf';

    /**
     * Index to location
     * @var string
     */
    const LOCA = 'loca';

    /**
     * CVT Program
     * @var string
     */
    const PREP = 'prep';

    /**
     * Grid-fitting/Scan-conversion (optional table)
     * @var string
     */
    const GASP = 'gasp';

  /* Tables Related to PostScript Outlines */

    /**
     * PostScript font program (compact font format)
     * @var string
     */
    const CFF =  'CFF ';

    /**
     * Vertical Origin (optional table)
     * @var string
     */
    const VORG = 'VORG';

  /* Table related to SVG outlines */

    /**
     * The SVG (Scalable Vector Graphics) table
     * @var string
     */
    const SVG = 'SVG ';

  /* Tables Related to Bitmap Glyphs */

    /**
     * Embedded bitmap data
     * @var string
     */
    const EBDT = 'EBDT';

    /**
     * Embedded bitmap location data
     * @var string
     */
    const EBLC = 'EBLC';

    /**
     * Embedded bitmap scaling data
     * @var string
     */
    const EBSC = 'EBSC';

    /**
     * Color bitmap data
     * @var string
     */
    const CBDT = 'CBDT';

    /**
     * Color bitmap location data
     * @var string
     */
    const CBLC = 'CBLC';

  /* Advanced Typographic Tables */

    /**
     * Baseline data
     * @var string
     */
    const BASE = 'BASE';

    /**
     * Glyph definition data
     * @var string
     */
    const GDEF = 'GDEF';

    /**
     * Glyph positioning data
     * @var string
     */
    const GPOS = 'GPOS';

    /**
     * Glyph substitution data
     * @var string
     */
    const GSUB = 'GSUB';

    /**
     * Justification data
     * @var string
     */
    const JSTF = 'JSTF';

    /**
     * Math layout data
     * @var string
     */
    const MATH = 'MATH';

  /* Other OpenType Tables */

    /**
     * Digital signature
     * @var string
     */
    const DSIG = 'DSIG';

    /**
     * Horizontal device metrics
     * @var string
     */
    const HDMX = 'hdmx';

    /**
     * Kerning
     * @var string
     */
    const KERN = 'kern';

    /**
     * Linear threshold data
     * @var string
     */
    const LTSH = 'LTSH';

    /**
     * PCL 5 data
     * @var string
     */
    const PCLT = 'PCLT';

    /**
     * Vertical device metrics
     * @var string
     */
    const VDMX = 'VDMX';

    /**
     * Vertical Metrics header
     * @var string
     */
    const VHEA = 'vhea';

    /**
     * Vertical Metrics
     * @var string
     */
    const VMTX = 'vmtx';

    /**
     * Color table
     * @var string
     */
    const COLR = 'COLR';

    /**
     * Color palette table
     * @var string
     */
    const CPAL = 'CPAL';
}
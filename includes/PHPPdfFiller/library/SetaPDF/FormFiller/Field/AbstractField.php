<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: AbstractField.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract form field
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_FormFiller_Field_AbstractField
{
    /**
     * The name including a suffix if needed ("Text#1")
     * 
     * @var string
     */
    protected $_qualifiedName;
    
    /**
     * The name without the suffix
     * 
     * @var string
     */
    protected $_originalQualifiedName;
    
    /**
     * A reference to the fields instance
     * 
     * @var SetaPDF_FormFiller_Fields
     */
    protected $_fields;
    
    /**
     * The main field dictionary
     * 
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_fieldDictionary;
    
    /**
     * The fields indirect object
     * 
     * @var SetaPDF_Core_Type_IndirectObject
     */
    protected $_fieldObject;
    
    /**
     * The page instance on which the form field is placed 
     * 
     * @var SetaPDF_Core_Document_Page
     */
    protected $_page;
    
    /**
     * The font object, which should be used to create the appearance
     * 
     * @var SetaPDF_Core_Font_FontInterface
     */
    protected $_font = null;

    /**
     * The font size, which should be used to create the appearance
     *
     * @var float|null
     */
    protected $_fontSize = null;

    /**
     * An individual color object which should be used for drawing the text appearance
     *
     * @var SetaPDF_Core_DataStructure_Color|null
     */
    protected $_textColor = null;

    /**
     * An individual color space object which should be used for setting the non-stroking color space
     *
     * @var SetaPDF_Core_ColorSpace|null
     */
    protected $_textColorSpace = null;

    /**
     * The annotation object of this form field
     *
     * @var SetaPDF_Core_Document_Page_Annotation_Widget
     */
    protected $_annotation;

    /**
     * The canvas object of the appearance
     *
     * @var SetaPDF_Core_Canvas
     */
    protected $_appearanceCanvas;

    /**
     * The factor to calculate the line height based on the font size
     *
     * @var float
     */
    protected $_lineHeightFactor;

    /**
     * @var SetaPDF_FormFiller_Field_DefaultAppearanceData
     */
    protected $_defaultAppearanceData;

    /**
     * The constructor.
     * 
     * @param SetaPDF_FormFiller_Fields $fields The fields instance
     * @param string $qualifiedName The qualified name of the field
     * @param SetaPDF_Core_Type_IndirectReference|SetaPDF_Core_Type_IndirectObject $fieldObject
     *                          The indirect object or reference holding the field dictionary
     * @param string $originalQualifiedName The original qualified name of the field
     */
    public function __construct(
        SetaPDF_FormFiller_Fields $fields,
        $qualifiedName,
        $fieldObject,
        $originalQualifiedName = null
    )
    {
        $this->_fields = $fields;
        $this->_qualifiedName = (string)$qualifiedName;
        $this->_fieldDictionary = $fieldObject->ensure(true);
        
        if ($fieldObject instanceof SetaPDF_Core_Type_IndirectReference)
            $fieldObject = $fieldObject->getValue();
        
        $this->_fieldObject = $fieldObject;
        
        $this->_originalQualifiedName = $originalQualifiedName === null
                                      ? (string)$qualifiedName
                                      : (string)$originalQualifiedName;
    }
    
    /**
     * Release cycled references and release memory.
     * 
     * @return void
     */
    public function cleanUp()
    {
        $this->_fields = null;
        $this->_fieldObject = null;
        $this->_fieldDictionary = null;
        $this->_page = null;
        $this->_annotation = null;
        $this->_font = null;
        if (null !== $this->_appearanceCanvas) {
            $this->_appearanceCanvas->cleanUp();
            $this->_appearanceCanvas = null;
        }
    }

    /**
     * Get the fields instance.
     *
     * @return SetaPDF_FormFiller_Fields
     */
    public function getFields()
    {
        return $this->_fields;
    }

    /**
     * Get the indirect object of the form field.
     *
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function getFieldObject()
    {
        return $this->_fieldObject;
    }

    /**
     * Get the field dictionary.
     *
     * @return SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary
     */
    public function getFieldDictionary()
    {
        return $this->_fieldDictionary;
    }

    /**
     * Returns the qualified name.
     * 
     * @return string
     */
    public function getQualifiedName()
    {
        return $this->_qualifiedName;
    }
    
    /**
     * Alias for getQualifiedName().
     * 
     * @see SetaPDF_FormFiller_Field_AbstractField::getQualifiedName()
     * @return string
     */
    public function getName()
    {
        return $this->getQualifiedName();
    }
    
    /**
     * Get the original qualified name (without suffix).
     * 
     * @return string
     */
    public function getOriginalQualifiedName()
    {
        return $this->_originalQualifiedName;
    }
    
    /**
     * Sets a field flag.
     * 
     * @param integer $flags
     * @param boolean|null $add Add = true, remove = false, set = null
     */
    public function setFieldFlags($flags, $add = true)
    {
        if (false === $add) {
            $this->unsetFieldFlags($flags);
            return;
        }
            
        $dict = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'Ff');
        
        if ($dict instanceof SetaPDF_Core_Type_AbstractType) {
            /**
             * @var SetaPDF_Core_Type_Dictionary $dict
             */
            $dict = $dict->ensure();
            $value = $dict->getValue('Ff');
            if ($add === true) {
                $value->setValue($value->getValue() | $flags);
            } else {
                $value->setValue($flags);
            }
            
        } else {
            $dict = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'T');
            $dict->offsetSet('Ff', new SetaPDF_Core_Type_Numeric($flags));
        }
    }
    
    /**
     * Removes a field flag.
     * 
     * @param integer $flags
     */
    public function unsetFieldFlags($flags)
    {
        $dict = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'Ff');
        
        if ($dict instanceof SetaPDF_Core_Type_AbstractType) {
            /**
             * @var SetaPDF_Core_Type_Dictionary $dict
             */
            $dict = $dict->ensure();
            $value = $dict->getValue('Ff');
            $value->setValue($value->getValue() & ~$flags);
        }
    }
    
    /**
     * Returns the current field flags.
     * 
     * @return integer
     */
    public function getFieldFlags()
    {
        $fieldFlags = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'Ff');
        if ($fieldFlags)
            return $fieldFlags->getValue();
            
        return 0;
    }
    
    /**
     * Checks if a specific field flag is set.
     * 
     * @param integer $flag
     * @return boolean
     */
    public function isFieldFlagSet($flag)
    {
        return ($this->getFieldFlags() & $flag) !== 0;
    }
    
    /**
     * Checks if the field is set to read-only.
     * 
     * @return boolean
     */
    public function isReadOnly()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::READ_ONLY);
    }
    
    /**
     * Sets the read-only flag.
     * 
     * @param boolean $readOnly
     */
    public function setReadOnly($readOnly = true)
    {
        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::READ_ONLY, $readOnly);

        $xfa = $this->_fields->getFormFiller()->getXfa();
        if ($xfa) {
            $xfa->setReadOnly($this->getOriginalQualifiedName(), $readOnly);
        }
    }
    
    /**
     * Checks if the field is set to be required.
     * 
     * @return boolean
     */
    public function isRequired()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::REQUIRED);
    }
    
    /**
     * Sets the required flag.
     * 
     * @param boolean $required
     */
    public function setRequired($required = true)
    {
        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::REQUIRED, $required);
    }
    
    /**
     * Checks if the no-export flag is set.
     * 
     * @return boolean
     */
    public function getNoExport()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::NO_EXPORT);
    }
    
    /**
     * Set the no-export flag.
     * 
     * @param boolean $noExport
     */
    public function setNoExport($noExport = true)
    {
        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::NO_EXPORT, $noExport);
    }

    /**
     * Get the tooltip value.
     *
     * @param string $encoding
     * @return bool|string
     */
    public function getTooltip($encoding = 'UTF-8')
    {
        $tooltip = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'TU');
        if ($tooltip) {
            return SetaPDF_Core_Encoding::convertPdfString($tooltip->getValue(), $encoding);
        }

        return false;
    }

    /**
     * Set the tooltip value.
     *
     * @param string|false $value
     * @param string $encoding
     */
    public function setTooltip($value, $encoding = 'UTF-8')
    {
        if (false === $value) {
            $dict = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'TU');
            $dict->offsetUnset('TU');
            return;
        }

        $value = SetaPDF_Core_Encoding::convert($value, $encoding, 'UTF-16BE');

        $tooltip = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'TU');
        if (null === $tooltip) {
            $dict = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'T');
            $tooltip = new SetaPDF_Core_Type_String();
            $dict->offsetSet('TU', $tooltip);
        }

        $tooltip = $tooltip->ensure();
        $tooltip->setValue("\xFE\xFF" . $value);
    }

    /**
     * Gets the page object on which the form field is placed.
     * 
     * @throws SetaPDF_FormFiller_Field_Exception
     * @return SetaPDF_Core_Document_Page
     */
    public function getPage()
    {
        if (null === $this->_page) {
            $formFiller = $this->_fields->getFormFiller();
            $document = $formFiller->getDocument();

            /** @var SetaPDF_Core_Type_IndirectReference $pageObjectReference */
            $pageObjectReference = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute(
                $this->_fieldDictionary, 'P', null, false
            );

            $pages = $document->getCatalog()->getPages();
            $page = false;
            if ($pageObjectReference && ($pageObject = $pageObjectReference->getValue())) {
                if ($pageObject && $pageObjectReference->ensure() instanceof SetaPDF_Core_Type_Dictionary) {
                    $page = $pages->getPageByIndirectObject($pageObject);
                }
            }
            
            if (false === $page) {
                $page = $pages->getPageByAnnotation($this->_fieldObject);
            }
            
            if (false === $page) {
                throw new SetaPDF_FormFiller_Field_Exception(
                    sprintf(
                    	'The page object of this form field (%s) could not be resolved.',
                        $this->_qualifiedName
                    ),
                    SetaPDF_FormFiller_Field_Exception::PAGE_CANNOT_BE_RESOLVE
                );
            }
            
            $this->_page = $page;
        }
        
        return $this->_page;
    }
    
    /**
     * Get the page number on which the field appears.
     * 
     * @return integer
     */
    public function getPageNumber()
    {
        $formFiller = $this->_fields->getFormFiller();
        $document = $formFiller->getDocument();
        
        $pages = $document->getCatalog()->getPages();
        return $pages->getPageNumberByPageObject($this->getPage());
    }

    /**
     * Get the appearance canvas of the "normal" appearance object.
     *
     * @return SetaPDF_Core_Canvas
     */
    public function getAppearanceCanvas()
    {
        if (null === $this->_appearanceCanvas) {
            $n = $this->getNormalAppearanceObject();
            $this->_appearanceCanvas = new SetaPDF_Core_Canvas(SetaPDF_Core_XObject::get($n, 'Form'), null, true);
        }

        return $this->_appearanceCanvas;
    }

    /**
     * Recreate or creates the background appearance of the form field.
     * 
     * @return SetaPDF_Core_Canvas
     */
    protected function _recreateAppearance()
    {
        // We have to ignore the type, because it is not set for all terminal fields
        $canvas = $this->getAppearanceCanvas();
        $nDictionary = $canvas->getContainer()->getObject(true)->ensure(true)->getValue();
        $canvas->clear();
        
        // Ensure that resources entry was added
        $canvas->getResources(false, true);

        $annotation = $this->getAnnotation();
        $width = $annotation->getWidth();
        $height = $annotation->getHeight();

        $appearanceCharacteristics = $annotation->getAppearanceCharacteristics();
        $borderStyle = $annotation->getBorderStyle();
        $borderWidth = 0;
        $_borderStyle = SetaPDF_Core_Document_Page_Annotation_BorderStyle::SOLID;

        if ($borderStyle) {
            $_borderStyle = $borderStyle->getStyle();
            $borderWidth = $borderStyle->getWidth();
        }

        if ($borderWidth == 0 && $appearanceCharacteristics && $appearanceCharacteristics->getBorderColor() !== null) {
            $borderWidth = 1;
        }

        // Handle Rotation
        $rotation = $appearanceCharacteristics
                  ? $appearanceCharacteristics->getRotation()
                  : 0;
        if ($rotation != 0) {
            // TODO: Refactor by using a GraphicState instance!
            $rotation = $rotation % 360;
            if ($rotation < 0)
                $rotation = $rotation + 360;

            $r = deg2rad($rotation);
            $a = $d = cos($r);
            $b = sin($r);
            $c = -$b;
            $e = 0;
            $f = 0;

            // INFO: The translate values ($e, $f) only take account if the field is flattened!
            if ($a == -1) {
                $e = $width;
                $f = $height;
            }
            
            if ($b == 1) 
                $e = $height;
            
            if ($c == 1)
                $f = $width;

            $nDictionary->offsetSet('Matrix', new SetaPDF_Core_Type_Array(array(
                new SetaPDF_Core_Type_Numeric($a),
                new SetaPDF_Core_Type_Numeric($b),
                new SetaPDF_Core_Type_Numeric($c),
                new SetaPDF_Core_Type_Numeric($d),
                new SetaPDF_Core_Type_Numeric($e),
                new SetaPDF_Core_Type_Numeric($f)
            )));
        }

        // Set the BBox
        $nDictionary->offsetSet('BBox', new SetaPDF_Core_Type_Array(array(
            new SetaPDF_Core_Type_Numeric(0),
            new SetaPDF_Core_Type_Numeric(0),
            new SetaPDF_Core_Type_Numeric($width),
            new SetaPDF_Core_Type_Numeric($height)
        )));

        // Draw Background
        $backgroundColor = $appearanceCharacteristics
                         ? $appearanceCharacteristics->getBackgroundColor()
                         : null;
        if ($backgroundColor) {
            $backgroundColor->draw($canvas, false);
            $canvas->draw()->rect(0, 0, $width, $height, SetaPDF_Core_Canvas_Draw::STYLE_FILL);
        }
        
        // Draw Border:
        $borderColor = $appearanceCharacteristics
                     ? $appearanceCharacteristics->getBorderColor()
                     : null;

        // It is possible to have no border but only a border style!
        
        // Beveled or Inset
        if ($_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::BEVELED ||
            $_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::INSET) {
            $colorLtValue = 1; //' 1 g';
            if ($_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::INSET)
                $colorLtValue = .5; // ' 0.5 g';
                
            /**
             * This color adjustment is not needed for list boxes.
             * The effect will only occur if the field is active
             * All other fields will use this effect.
             */
            if (
                !($this instanceof SetaPDF_FormFiller_Field_List) &&
                $_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::BEVELED && $backgroundColor
            ) {
                $tmpColor = clone $backgroundColor;
                $tmpColor->adjustAllComponents(-0.250977);
                $colorRb = $tmpColor;
            } else {
                $colorRb = new SetaPDF_Core_DataStructure_Color_Gray(.75);
            }
            
            // Draw the inner border
            $canvas->saveGraphicState();  // q
            SetaPDF_Core_DataStructure_Color_Gray::writePdfString($canvas, $colorLtValue, false);
            
            $_borderWidth = $borderWidth * 2;
            $canvas->write(
                sprintf(" %.4F %.4F m", $x = $_borderWidth / 2, $y = $height-$_borderWidth / 2) .
                sprintf(" %.4F %.4F l", $x = $width - $x, $y) .
                sprintf(" %.4F %.4F l", $x - $_borderWidth / 2, $y -= $_borderWidth / 2) .
                sprintf(" %.4F %.4F l", $x = $_borderWidth, $y) .
                sprintf(" %.4F %.4F l", $x, $y = $_borderWidth) .
                sprintf(" %.4F %.4F l", $x /= 2, $y /= 2) .
                ' h f'
            );
            
            $colorRb->draw($canvas, false);
            $canvas->write(
                sprintf(" %.4F %.4F m", $x, $y) .
                sprintf(" %.4F %.4F l", $x *= 2, $y *= 2) . 
                sprintf(" %.4F %.4F l", $x = $width - $x, $y) . 
                sprintf(" %.4F %.4F l", $x, $y += $height - $_borderWidth * 2) .
                sprintf(" %.4F %.4F l", $x += $_borderWidth / 2, $y + $_borderWidth / 2) .
                sprintf(" %.4F %.4F l", $x, $_borderWidth / 2) .
                ' h f'
            );
            
            $canvas->restoreGraphicState(); // Q
        } 
        
        if ($borderColor) {
            $canvas->path()->setLineWidth($borderWidth);
            $borderColor->draw($canvas, true);

            // Dashed
            if ($_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::DASHED) {
                $canvas->path()->setDashPattern($borderStyle->getDashPattern());
            }
            
            // Draw border 
            // NOT underline
            if ($_borderStyle !== SetaPDF_Core_Document_Page_Annotation_BorderStyle::UNDERLINE) {
                $canvas->draw()->rect(
                    $borderWidth * .5,
                    $borderWidth * .5,
                    $width - $borderWidth,
                    $height - $borderWidth
                );

                // underline
            } else {
                $y = $borderWidth / 2;
                $canvas->draw()->line(0, $y, $width, $y);
            }
        }
        
        return $canvas;
    }
    
    /**
     * Checks for form-filling permissions.
     * 
     * @param integer $permission
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    protected function _checkPermission($permission = SetaPDF_Core_SecHandler::PERM_FILL_FORM)
    {
        SetaPDF_Core_SecHandler::checkPermission($this->_fields->getFormFiller()->getDocument(), $permission);
    }
    
    /**
     * Get the reference to the normal appearance stream object.
     * 
     * @return SetaPDF_Core_Type_IndirectReference
     */
    protected function _getAppearanceReference()
    {
        $ap = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'AP');
        // Create N entry if it does not exists
        if (!$ap || !$ap->offsetExists('N')) {
            $this->recreateAppearance();
            $ap = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'AP');
        }
            
        // get the N entry
        return $ap->offsetGet('N')->getValue();
    }
    
    /**
     * Get the default appearance data of the DA value.
     *
     * @return SetaPDF_FormFiller_Field_DefaultAppearanceData
     * @throws SetaPDF_FormFiller_Field_Exception
     */
    public function getDefaultAppearanceData()
    {
        if (null !== $this->_defaultAppearanceData) {
            return $this->_defaultAppearanceData;
        }

        $da = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'DA');
        $da = $da
            ? $da
            : SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute(
                $this->_fields->getFormFiller()->getDocument()->getCatalog()->getAcroForm()->getDictionary(),
                'DA'
            );

        if (!$da) {
            throw new SetaPDF_FormFiller_Field_Exception('No DA key found.');
        }

        $daString = $da->getValue();

        $this->_defaultAppearanceData = new SetaPDF_FormFiller_Field_DefaultAppearanceData($daString);

        return $this->_defaultAppearanceData;
    }

    /**
     * Set the appearance font object.
     *
     * @param SetaPDF_Core_Font_FontInterface $font
     * @param float $size
     */
    public function setAppearanceFont(SetaPDF_Core_Font_FontInterface $font, $size = null)
    {
        $this->_font = $font;
        $this->setAppearanceFontSize($size);
    }

    /**
     * Get the appearance font object.
     * 
	 * @return null|SetaPDF_Core_Font_FontInterface
     */
    public function getAppearanceFont()
    {
        if ($this->_font === null) {
            $fontName = $this->getDefaultAppearanceData()->getFontName();

            // Ensure that resources entry was added
            $canvas = $this->getAppearanceCanvas();
            $canvas->getResources(false, true);
            // Resolve and make sure a Font Resource entry is available
            $nDictionary = $canvas->getContainer()->getObject(true)->ensure(true)->getValue();
            $fontRelation = $this->_getFontRelation($nDictionary, $fontName);

            $this->_font = SetaPDF_Core_Font::get($fontRelation->getValue());
        }

        return $this->_font;
    }

    /**
     * Set the line height factor
     *
     * The line height is calculated by this factor in relation to the font size:
     * <code>
     * $lineHeight = $fontSize * $lineHeightFactor
     * </code>
     *
     * By default this value is calculated by the font bounding box values "ury - lly / 1000".
     *
     * @param null|float $lineHeightFactor
     * @see getLineHeightFactor()
     */
    public function setLineHeightFactor($lineHeightFactor)
    {
        $this->_lineHeightFactor = (null !== $lineHeightFactor) ? (float)$lineHeightFactor : null;
    }

    /**
     * Get the line height factor
     *
     * The line height is calculated by this factor in relation to the font size:
     * <code>
     * $lineHeight = $fontSize * $lineHeightFactor
     * </code>
     *
     * By default this value is calculated by the font bounding box values "ury - lly / 1000".
     *
     * @return float
     * @see setLineHeightFactor()
     */
    public function getLineHeightFactor()
    {
        if (null === $this->_lineHeightFactor) {
            $font = $this->getAppearanceFont();
            $fontBBox = $font->getFontBBox();

            return ($fontBBox[3] - $fontBBox[1]) / 1000;
        }

        return $this->_lineHeightFactor;
    }

    /**
     * Set an individual appearance text color.
     *
     * @param SetaPDF_Core_DataStructure_Color $textColor
     */
    public function setAppearanceTextColor(SetaPDF_Core_DataStructure_Color $textColor = null)
    {
        $this->_textColor = $textColor;
    }

    /**
     * Get the individual appearance text color.
     *
     * @return null|SetaPDF_Core_DataStructure_Color
     */
    public function getAppearanceTextColor()
    {
        if (null === $this->_textColor) {
            return $this->getDefaultAppearanceData()->getTextColor();
        }

        return $this->_textColor;
    }

    /**
     * Set the individual color space object which should be used for setting the non-stroking color space.
     *
     * @param SetaPDF_Core_ColorSpace|null $colorSpace
     */
    public function setAppearanceTextColorSpace(SetaPDF_Core_ColorSpace $colorSpace = null)
    {
        $this->_textColorSpace = $colorSpace;
    }

    /**
     * Get the individual color space object which should be used for setting the non-stroking color space.
     *
     * @return null|SetaPDF_Core_ColorSpace
     */
    public function getAppearanceTextColorSpace()
    {
        return $this->_textColorSpace;
    }

    /**
     * Set an individual font size.
     *
     * @param float|null $fontSize
     */
    public function setAppearanceFontSize($fontSize)
    {
        $this->_fontSize = $fontSize === null ? $fontSize : (float)$fontSize;
    }

    /**
     * Get the appearance font size.
     *
     * @return float|null
     * @throws SetaPDF_FormFiller_Field_Exception
     */
    public function getAppearanceFontSize()
    {
        if (null === $this->_fontSize) {
            return $this->getDefaultAppearanceData()->getFontSize();
        }

        return $this->_fontSize;
    }

    /**
     * Get the font relation and copy the resources to the Resources entry if needed.
     *
     * @param SetaPDF_Core_Type_Dictionary $nDictionary
     * @param string $fontName
     * @return SetaPDF_Core_Type_Dictionary_Entry
     * @throws SetaPDF_FormFiller_Exception
     */
    protected function _getFontRelation(SetaPDF_Core_Type_Dictionary $nDictionary, &$fontName)
    {
        $formFiller = $this->_fields->getFormFiller();
        
        $resources = $nDictionary->offsetGet('Resources')->ensure();
        if (!$resources->offsetExists('Font')) {
            $fonts = new SetaPDF_Core_Type_Dictionary();
            $resources->offsetSet('Font', $fonts);
        } else {
            $fonts = $resources->offsetGet('Font')->ensure();
        }
        
        $fontRelation = null;
        
        if ($fonts->offsetExists($fontName)) {
            $fontRelation = $fonts->offsetGet($fontName);
        } else {
            // 1. Check in the fields DR entry
            /*
            $dr = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'DR');
            if ($dr instanceof SetaPDF_Core_Type_Dictionary &&
                $dr->offsetExists('Font') &&
                $dr->offsetGet('Font')->ensure()->offsetExists($fontName)
            ) {
                $defaultFonts = $dr->offsetGet('Font')->ensure();
                
            // 2. Check in the AcroForm DR entry
            } else {
            */
                $acroForm = $formFiller->getDocument()->getCatalog()->getAcroForm();
                $acroForm->addDefaultEntriesAndValues();
                $acroFormDictionary = $acroForm->getDictionary();
                $dr = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($acroFormDictionary, 'DR');

                $defaultFonts = $dr->offsetGet('Font')->ensure();

                // Let's check for a fallback or create one
                if (!$defaultFonts->offsetExists($fontName))
                {
                    // Some documents have default fonts present
                    if ($defaultFonts->offsetExists('Helv')) {
                        $fontName = 'Helv';
                        
                    } else {
                        // TODO: Add some aliases like "Helv", "Cour", "Times", "Time",...
                        
                        // Try to find a core-font by the font name
                        $mapping = SetaPDF_Core_Font_Standard::getStandardFontsToClasses();
                        // If it doesn't exists map to Helvetica
                        if (!isset($mapping[$fontName])) {
                            $fontName = 'Helvetica';
                        }
                        
                        $fontDict = call_user_func(array(
                            $mapping[$fontName], 'getDefaultDictionary'));
                        
                        $document = $formFiller->getDocument();
                        $fontObject = $document->createNewObject($fontDict);
                        $defaultFonts->offsetSet($fontName, $fontObject);
                    }
                }
            //}
            
            $fontRelation = clone $defaultFonts->offsetGet($fontName);
            $fonts->offsetSet(null, $fontRelation);
        }
        
        return $fontRelation;
    }
    
    /**
     * Get or create the normal appearance object (the object referenced in the N entry).
     *
     * @param boolean $createNew Pass true to force a recreation
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function getNormalAppearanceObject($createNew = false)
    {
        $formFiller = $this->_fields->getFormFiller();
        $document = $formFiller->getDocument();
            
        // get or create AP entry
        $ap = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'AP');
        if (null === $ap) {
            $ap = new SetaPDF_Core_Type_Dictionary();
            $this->_fieldDictionary->offsetSet('AP', $ap);
        }
        
        // get or create N entry
        $n = $ap->getValue('N');
        
        if ($createNew || null === $n || !($n->ensure() instanceof SetaPDF_Core_Type_Stream)) {
            $nDictionary = new SetaPDF_Core_Type_Dictionary();
            $nDictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('XObject', true));
            $nDictionary->offsetSet('Subtype', new SetaPDF_Core_Type_Name('Form', true));
            $nDictionary->offsetSet('FormType', new SetaPDF_Core_Type_Numeric(1));

            $annotation = $this->getAnnotation();

            // Set the BBox
            $nDictionary->offsetSet('BBox', new SetaPDF_Core_Type_Array(array(
                new SetaPDF_Core_Type_Numeric(0),
                new SetaPDF_Core_Type_Numeric(0),
                new SetaPDF_Core_Type_Numeric($annotation->getWidth()),
                new SetaPDF_Core_Type_Numeric($annotation->getHeight())
            )));

            $n = $document->createNewObject(
                new SetaPDF_Core_Type_Stream($nDictionary)
            );
            
            $ap->offsetSet('N', $n);
        }
        
        return $n;
    }
    
    /**
     * Flatten the field to the pages content stream.
     * 
     * @see SetaPDF_FormFiller_Field_AbstractField::delete()
     */
    public function flatten()
    {
        $this->_preFlatten();

        try {
            $page = $this->getPage();

            $nStreamRef = $this->_getAppearanceReference();

            // Make sure that an appearance stream exists
            if ($nStreamRef !== false && $nStreamRef->getValue() instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            // if this object was no observed before, force an observation!
                $nStreamRef->getValue()->observe();

                $xObject = new SetaPDF_Core_XObject_Form($nStreamRef);
                if ($xObject->getWidth() > 0 && $xObject->getHeight() > 0) {
                    $name = $page->getCanvas()->addResource($xObject);

                    // Add XObject definition to the N object
                    // (could be missing if the field was filled by another program)
                    $xObject->ensureDefaultKeys();

                    // 2. Get the pages canvas object
                    $canvas = $page->getCanvas();

                    // 2b. Encapsulate the existing content stream
                    $page->getContents()->encapsulateExistingContentInGraphicState();

                    // 3. Let's display the XObject by appending the needed
                    // commands to the content stream.
                    $rect = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'Rect');
                    $rect = new SetaPDF_Core_DataStructure_Rectangle($rect);

                    $canvas->saveGraphicState();
                    $canvas->write(' 0 J 1 w 0 j 0 G 0 g [] 0 d ');
                    $xObject->draw($canvas, $rect->getLlx(), $rect->getLly(), $rect->getWidth(), $rect->getHeight());
                    $canvas->restoreGraphicState();

                    if ($canvas->getStream() instanceof SetaPDF_Core_Document_Page_Contents) {
                        // TODO: This should be automated
                        $canvas->getStream()
                            ->getStream()->getValue()
                            ->offsetSet('Filter', new SetaPDF_Core_Type_Name('FlateDecode', true));
                    }
                }
            }
        } catch (SetaPDF_FormFiller_Field_Exception $e) {
            if ($e->getCode() !== SetaPDF_FormFiller_Field_Exception::PAGE_CANNOT_BE_RESOLVE) {
                throw $e;
            }
        }

        $this->_fields->delete($this);
    }
    
    /**
     * Delete the field.
     * 
     * @return void
     * @throws SetaPDF_FormFiller_Field_Exception
     */
    public function delete()
    {
        $this->_preDelete();

        $formFiller = $this->_fields->getFormFiller();
        $document = $formFiller->getDocument();

        try {
            $page = $this->getPage();
            $annotationsArray = $page->getAnnotations()->getArray();
            if (false !== $annotationsArray) {
                $key = $annotationsArray->indexOf($this->_fieldObject);
                if (-1 !== $key) {
                    $annotationsArray->offsetUnset($key);
                }
            }
        } catch (SetaPDF_FormFiller_Field_Exception $e) {
            if ($e->getCode() !== SetaPDF_FormFiller_Field_Exception::PAGE_CANNOT_BE_RESOLVE) {
                throw $e;
            }

            // if page cannot be resolved -> ignore
        }

        // Delete field object(s)
        $fieldObject = $this->_fieldObject;
        $objectsToDelete = array($fieldObject);
        $currentObject = $fieldObject;
        $removeFieldsEntry = true;
        while ($currentObject->getValue()->offsetExists('Parent')) {
            $lastObject = $currentObject;
            $currentObject = $currentObject->getValue()->getValue('Parent')->getValue();
            if ($currentObject->getValue()->offsetExists('Kids')) {
                $kids = $currentObject->getValue()->offsetGet('Kids')->ensure();
                foreach ($kids as $key => $value) {
                    if ($lastObject->getObjectId() === $value->getObjectId()) {
                        $kids->offsetUnset($key);
                    }
                }

                // If there are still fields in the kids array, stop here
                if ($kids->count() > 0) {
                    $removeFieldsEntry = false;
                    break;
                }
            }

            $objectsToDelete[] = $currentObject;
        }

        $fieldsArray = $document->getCatalog()->getAcroForm()->getFieldsArray();

        foreach ($objectsToDelete AS $objectToDelete) {
            $document->deleteObject($objectToDelete);

            /* Sadly there are PDF creators/editors on the road which seems to ignore the Parent/Kids structure
             * and move their leaf nodes to the root while leaving the Parent key referencing another node which will
             * never reach the root node. So we additionally try to remove the references in the root node/fields array.
             */
            if ($fieldsArray === false) {
                continue;
            }

            foreach ($fieldsArray AS $key => $value) {
                if ($objectToDelete->getObjectId() === $value->getObjectId()) {
                    $fieldsArray->offsetUnset($key);
                    break;
                }
            }
        }

        // Delete reference in the the AcroForm array
        if ($removeFieldsEntry && false !== $fieldsArray) {
            foreach ($fieldsArray AS $key => $value) {
                if ($currentObject->getObjectId() === $value->getObjectId()) {
                    $fieldsArray->offsetUnset($key);
                    break;
                }
            }
            
            // If no fields left delete AcroForm object and reference to it
            if ($fieldsArray->count() == 0) {
                $trailer = $document->getTrailer();
                if ($trailer->offsetExists('Root')) {
                    /**
                     * @var SetaPDF_Core_Type_Dictionary $root
                     */
                    $root = $trailer->offsetGet('Root')->getValue()->ensure(true);
                    
                    if ($root->offsetExists('AcroForm')) {
                        $acroForm = $root->getValue('AcroForm');
                        if ($acroForm instanceof SetaPDF_Core_Type_IndirectObjectInterface)
                            $document->deleteObject($acroForm);
                        $root->offsetUnset('AcroForm');
                    }
                }
            }
        }

        $this->_postDelete();
    }

    /**
     * A method called before flattening a field.
     *
     * This method forwards the flatten info to the fields instance.
     *
     * @return void
     */
    protected function _preFlatten()
    {
        $this->_fields->beforeFieldFlattenOrDelete($this);
    }

    /**
     * A method called before deleting a field.
     *
     * This method forwards the deletion info to the fields instance.
     *
     * @return void
     */
    protected function _preDelete()
    {
        $this->_fields->beforeFieldFlattenOrDelete($this);
    }

    /**
     * A method called after deleting a field.
     * 
     * This method forwards the deletion info to the fields instance.
     * 
     * @return void
     */
    protected function _postDelete()
    {
        $this->_fields->onFieldDeleted($this);
    }

    /**
     * Get the widget annotation object from this field.
     *
     * @return SetaPDF_Core_Document_Page_Annotation_Widget
     */
    public function getAnnotation()
    {
        if (null === $this->_annotation) {
            $this->_annotation = SetaPDF_Core_Document_Page_Annotation::byObjectOrDictionary($this->_fieldObject);
        }

        return $this->_annotation;
    }
}
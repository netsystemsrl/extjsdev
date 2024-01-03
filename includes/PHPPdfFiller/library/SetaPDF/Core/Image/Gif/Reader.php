<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id$
 */

/**
 * Class used for reading GIF images.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Reader
{
    /**
     * The GIF header.
     *
     * @var SetaPDF_Core_Image_Gif_Block_Header
     */
    public $head;

    /**
     * The screen descriptor.
     *
     * @var SetaPDF_Core_Image_Gif_Block_LogicalScreenDescriptor
     */
    public $screenDescriptor;

    /**
     * All blocks that where stored in this image.
     *
     * @var array
     */
    protected $_blocks = [];

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     * @throws SetaPDF_Core_Image_Exception
     */
    public function __construct(SetaPDF_Core_Reader_Binary $reader)
    {
        try {
            $this->head = new SetaPDF_Core_Image_Gif_Block_Header($reader);
            $this->screenDescriptor = new SetaPDF_Core_Image_Gif_Block_LogicalScreenDescriptor($reader);

            do {
                $this->_blocks[] = $block = SetaPDF_Core_Image_Gif_Block_AbstractBlock::createExtensionOrImageDescriptor($reader);
            } while (!is_bool($block));

            if ($block === false) {
                throw new SetaPDF_Core_Image_Exception('Cannot find trailer block in GIF data.');
            }

            array_pop($this->_blocks);
        } catch (Exception $e) {
            throw new SetaPDF_Core_Image_Exception('Cannot read data from GIF.', 0, $e);
        }
    }

    /**
     * Parses the data and returns resolved frames.
     *
     * @return SetaPDF_Core_Image_Gif_Frame[]
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function createFrames()
    {
        $frames = [];
        $transparentIndices = [];

        $currentDisposalMethod = null;

        $delayTime = 0;

        foreach ($this->_blocks as $block) {
            if ($block instanceof SetaPDF_Core_Image_Gif_Block_Extension_GraphicControl) {
                if ($block->transparentColorFlag) {
                    $transparentIndices[] = $block->transparentColorIndex;
                }

                if ($block->disposalMethodFlag !== 0) {
                    $currentDisposalMethod = $block->disposalMethodFlag;
                }

                $delayTime += $block->delayTime;

                continue;
            }

            if ($block instanceof SetaPDF_Core_Image_Gif_Block_ImageDescriptor) {
                if (count($frames) !== 0) {
                    end($frames);
                    switch ($currentDisposalMethod) {
                        case null:
                        case 1:
                            // just draw on top of the old one.
                            end($frames);
                            $previousFrame = current($frames);
                            break;
                        case 2:
                            $previousFrame = null;
                            // reset to background color.
                            break;
                        case 3:
                            // restore the state to before the image was drawn.
                            end($frames);
                            $previousFrame = prev($frames);
                            break;
                        default:
                            throw new SetaPDF_Exception_NotImplemented('Unknown disposal method.');
                    }
                } else {
                    $previousFrame = null;
                }

                $frames[] = new SetaPDF_Core_Image_Gif_Frame($this, $block, $transparentIndices, $previousFrame, $delayTime);
                $delayTime = 0;
                $transparentIndices = [];
                continue;
            }
        }

        return $frames;
    }
}
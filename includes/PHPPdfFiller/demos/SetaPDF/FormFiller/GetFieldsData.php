<?php 
/**
 * This demo shows you how to get properties and values 
 * of existing form field elements with the SetaPDF-FormFiller
 * component.
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// A little helper function for htmlspecialchars
function esc($s)
{
    return htmlspecialchars($s, ENT_COMPAT, 'UTF-8');
}

$files = glob('_files/*.pdf');
$files = array_merge($files, glob('../_files/pdfs/*.pdf'));
$files = array_merge($files, glob('../_files/pdfs/*/*.pdf'));
?>
<ul>
<?php foreach ($files AS $k => $file): ?>
    <li><a href="GetFieldsData.php?f=<?php echo $k; ?>"><?php echo ($file); ?></a></li>
<?php endforeach; ?>
</ul>

<?php 
if (!isset($_GET['f']) || !isset($files[$_GET['f']]))
    die();
?>

<h1><?php echo basename($files[$_GET['f']]); ?></h1>

<?php 
// load and register the autoload function
require_once('../../../library/SetaPDF/Autoload.php');

// let's get access to a document
$reader = new SetaPDF_Core_Reader_File($files[$_GET['f']]);
$document = SetaPDF_Core_Document::load($reader);

// now get an instance of the form filler
$formFiller = new SetaPDF_FormFiller($document);

// Get the form fields of the document
$fields = $formFiller->getFields();
?>
<p>Field count: <?php echo count($fields); ?></p>
<?php 
// walk trough the fields
foreach ($fields AS $name => $field):
    $type = get_class($field);
?>
    
	<h2>Fieldname: <?php echo esc($name);
	    // Check for the real name (suffixed if several fields with the same name exists)
        if ($field->getOriginalQualifiedName() != $name) {
            echo ' (' . esc($field->getOriginalQualifiedName()) . ')';
        }
	?></h2>
	<table border="1">
		<caption>Standard properties</caption>
		<colgroup>
			<col width="250" />
			<col width="450" />
		</colgroup>
		<tr>
			<th>Type:</th>
			<td><?php echo $type; ?></td>
		</tr>
		<tr>
			<th>Page #:</th>
			<td><?php print_r($field->getPageNumber()); ?></td>
		</tr>
		<tr>
			<th>Read-only:</th>
			<td><?php echo ($field->isReadOnly() ? 'Yes' : 'No'); ?></td>
		</tr>
		<tr>
			<th>Required:</th>
			<td><?php echo ($field->isRequired() ? 'Yes' : 'No'); ?></td>
		</tr>
		<tr>
			<th>No Export flag set:</th>
			<td><?php echo ($field->getNoExport() ? 'Yes' : 'No'); ?></td>
		</tr>
	</table>
		
	<table border="1">
		<caption>Type related properties</caption>
		<colgroup>
			<col width="250" />
			<col width="450" />
		</colgroup>
    <?php if(method_exists($field, 'getAdditionalActions')):
            $additionalActions = $field->getAdditionalActions();

            $aas = array(
                'calculate' => $additionalActions->getCalculate(),
                'keystroke' => $additionalActions->getKeystroke(),
                'format' => $additionalActions->getFormat(),
                'validate' => $additionalActions->getValidate()
            );
            $aas = array_filter($aas);

            if (count($aas) > 0):
                ?>
                <tr>
                    <th>Additional Actions:</th>
                    <td>
                        <?php
                        foreach($aas AS $name => $action) {
                            echo $name . ': ';
                            echo '<pre>' . htmlspecialchars($action->getJavaScript()) . '</pre>';
                        }
                        ?>
                    </td>
                </tr>

            <?php endif;
        endif; ?>
	<?php

    switch($type) {
        
// Button / Checkbox
        case 'SetaPDF_FormFiller_Field_Button':
    ?>
    	<tr>
			<th>Default Value:</th>
			<td><?php echo esc($field->getDefaultValue()); ?></td>
		</tr>
		<tr>
			<th>Checked:</th>
			<td><?php echo ($field->isChecked() ? 'Yes' : 'No'); ?></td>
		</tr>
		<tr>
			<th>Export Value:</th>
			<td><?php echo esc($field->getExportValue()); ?></td>
		</tr>
	<?php 
	    break;
        case 'SetaPDF_FormFiller_Field_ButtonGroup':
	?>
		<tr>
			<th>Default Value:</th>
			<td><?php echo esc($field->getDefaultValue()); ?></td>
		</tr>
		<tr>
			<th>Buttons:</th>
			<td><?php 
			    // Get the buttons, related to this group
			    $buttons = $field->getButtons();
			    foreach ($buttons AS $button) {
		            echo esc($button->getQualifiedName());
		            echo ' (checked: ' . ($button->isChecked() ? 'Yes' : 'No');
		            echo '; export value: ' . $button->getExportValue();
                    echo ')<br />';
			    }
			?></td>
		</tr>
	<?php 
	    break;
	    
// List field
        case 'SetaPDF_FormFiller_Field_List':
	?>
		<tr>
			<th>Is multi-select:</th>
			<td><?php echo $field->isMultiSelect() ? 'Yes' : 'No'; ?></td>
		</tr>
		<tr>
			<th>Default Value:</th>
			<td><?php $defaultValue = $field->getDefaultValue();
			    if ($field->isMultiSelect()) {
    			    foreach ($defaultValue AS $_value) {
    			         echo esc($_value) . '<br />';   
    			    }
			    } else {
			        echo esc($defaultValue);
			    }   
			?></td>
		</tr>
		<tr>
			<th>Value:</th>
			<td><?php $value = $field->getValue();
                if ($field->isMultiSelect()) {
    			    foreach ($value AS $_value) {
    			         echo esc($_value) . '<br />';   
    			    }
			    } else {
			        echo esc($value);
			    }   
			?></td>
		</tr>
		<tr>
			<th>Visible Value:</th>
			<td><?php $visibleValue = $field->getVisibleValue();
			    if ($field->isMultiSelect()) {
    			    foreach ($visibleValue AS $_value) {
    			         echo esc($_value) . '<br />';   
    			    }
			    } else {
			        echo esc($visibleValue);
			    }   
			?></td>
		</tr>
		<tr>
			<th>Options:</th>
			<td><?php 
			    $options = $field->getOptions();
			    foreach ($options AS $option) {
                    echo esc($option['visibleValue']) . ' (Export value: ';
                    echo esc($option['exportValue']) . ')<br />';
			    }
			?></td>
		</tr>
		
	<?php 
	    break;
	    
// Combo Box / Select field
        case 'SetaPDF_FormFiller_Field_Combo':
	?>
		<tr>
			<th>Is editable:</th>
			<td><?php echo $field->isEditable() ? 'Yes' : 'No'; ?></td>
		</tr>
		<tr>
			<th>Default Value:</th>
			<td><?php echo esc($field->getDefaultValue()); ?></td>
		</tr>
		<tr>
			<th>Value:</th>
			<td><?php echo esc($field->getValue()); ?></td>
		</tr>
		<tr>
			<th>Visible Value:</th>
			<td><?php echo esc($field->getVisibleValue()); ?></td>
		</tr>
		<tr>
			<th>Options:</th>
			<td><?php 
			    $options = $field->getOptions();
			    foreach ($options AS $option) {
                    echo esc($option['visibleValue']) . ' (Export value: ';
                    echo esc($option['exportValue']) . ')<br />';
			    }
			?></td>
		</tr>
	<?php 
	    break;
	    
// Text field
        case 'SetaPDF_FormFiller_Field_Text':
	?>
		<tr>
			<th>Max Length:</th>
			<td><?php echo esc($field->getMaxLength()); ?></td>
		</tr>
		<tr>
			<th>Multiline:</th>
			<td><?php echo $field->isMultiline() ? 'Yes' : 'No'; ?></td>
		</tr>
		<tr>
			<th>Comb Field:</th>
			<td><?php echo $field->isCombField() ? 'Yes' : 'No'; ?></td>
		</tr>
		<tr>
			<th>Password Field:</th>
			<td><?php echo $field->isPasswordField() ? 'Yes' : 'No'; ?></td>
		</tr>
		<tr>
			<th>Is "DoNotSpellCheck" flag set:</th>
			<td><?php echo $field->isDoNotSpellCheckSet() ? 'Yes' : 'No'; ?></td>
		</tr>
		<tr>
			<th>Is "DoNotScroll" flag set:</th>
			<td><?php echo $field->isDoNotScrollSet() ? 'Yes' : 'No'; ?></td>
		</tr>
		<tr>
			<th>Default Value:</th>
			<td><?php echo nl2br(esc($field->getDefaultValue())); ?></td>
		</tr>
		<tr>
			<th>Value:</th>
			<td><?php echo nl2br(esc($field->getValue())); ?></td>
		</tr>
	<?php 
    }
    ?>
	</table>
<?php endforeach; ?>
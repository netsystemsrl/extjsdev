<?php
/**
 * This demo will get and output a documents outline and some informations about the items
 */ 
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
foreach ($files AS $path) {
    echo '<a href="Get.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a document
$document = SetaPDF_Core_Document::load($reader);

// get the outlines helper
$outlines = $document->getCatalog()->getOutlines();
// or
// $outlines = $document->getOutlines();

// get the recursive iterator
$iterator = $outlines->getIterator();

// let's save the information in this array 
$data = array();

// now iterate over the outline tree
foreach ($iterator AS $outlineItem) {
    // Get the item depth and..
    $depth = $iterator->getDepth();
    
    // is the item opened or closed:
    $open = $outlineItem->isOpen();
    $title = $outlineItem->getTitle();
    
    $destionationOrAction = '';
    // Get the destination of the outline item (if available)
    $destination = $outlineItem->getDestination($document);
    if ($destination !== false) {
        $destionationOrAction = 'Destination: Page ' . $destination->getPageNo($document);
    }
    
    // Get the action of the outline item (if available)
    $action = $outlineItem->getAction();
    if ($action !== false) {
        $destionationOrAction = $action->getType() . ' Action';
    	switch (1) {
    	    // Handle GoTo Actions
    	    case $action instanceof SetaPDF_Core_Document_Action_GoTo:
    	        $destination = $action->getDestination($document);
    	        $destionationOrAction .= ': Destination on Page ' . $destination->getPageNo($document);
    	        break;
    	        
	        // Handle Named Actions
    	    case $action instanceof SetaPDF_Core_Document_Action_Named:
    	        $destionationOrAction .= ': ' . $action->getName();
    	        break;
    	        
	        // Handle JavaScript actions
	        case $action instanceof SetaPDF_Core_Document_Action_JavaScript:
    	        $destionationOrAction .= ': ' . substr($action->getJavaScript(), 0, 100);
    	        break;
    	        
	        // Handle URI actions
	        case $action instanceof SetaPDF_Core_Document_Action_Uri:
	        	$destionationOrAction .= ': ' . $action->getUri();
	        	break;
    	}
    }
   
    // save item data
    $data[] = array(
        'depth' => $depth,
        'open' => $open,
        'title' => $title,
        'destinationOrAction' => $destionationOrAction
    );
}

?>

<table border="1" style="float:left;">
    <tr>
        <th>Depth</th>
        <th>Open</th>
        <th>Title</th>
        <th>Destination / Action</th>
    </tr>
    <?php foreach ($data AS $itemData): ?>
    <tr>
        <td><?php echo $itemData['depth']; ?></td>
        <td><?php if ($itemData['open'] !== null) { echo $itemData['open'] ? '-' : '+'; } ?></td>
        <td><?php echo str_repeat('&nbsp;', $itemData['depth'] * 4) . htmlspecialchars($itemData['title']); ?></td>
        <td><?php echo htmlspecialchars($itemData['destinationOrAction']); ?></td>
    </tr>
    <?php endforeach; ?>
</table>

<embed src="<?php echo $_GET['f']; ?>#pagemode=bookmarks" width="500" height="600" />
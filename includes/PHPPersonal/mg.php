<?php
//ritorna solo la prima chiave trovata
function recursive_array_search($needle,$haystack) {
    foreach($haystack as $key=>$value) {
        $current_key=$key;
        if($needle===$value OR (is_array($value) && recursive_array_search($needle,$value) !== false)) {
            return $current_key;
        }
    }
    return false;
}
//ritorna tutte le chiavi trovate
function recursive_array_search_retun_multi($needle,$haystack) {
	$keysFinded = [];
    foreach($haystack as $key=>$value) {
        $current_key=$key;
        if($needle===$value OR (is_array($value) && recursive_array_search_retun_multi($needle,$value) !== false)) {
			$keysFinded[] = $current_key;
            //return $current_key;
        }
    }
	if(!empty($keysFinded)){
		return $keysFinded;
	} else {
	    return false;
	}
}

/**
 * Recursively search an array for a given value. Returns the root element key if $needle
 * is found, or FALSE if $needle cannot be found.
 *
 * @param	mixed	$needle
 * @param	array	$haystack
 * @param	bool	$strict
 * @return	mixed|bool
 * @author  Joseph Wynn <joseph@wildlyinaccurate.com>
 */
/*però questa ritorna anche la key root se trova il valore nella chiave del array*/
$key = recursive_array_search(strtoupper($HeaderRecord[$colIndex]), $attributiArray);
function recursive_array_search($needle, $haystack, $strict = true) {
	$iterator = new RecursiveIteratorIterator(new RecursiveArrayIterator($haystack), RecursiveIteratorIterator::SELF_FIRST);

	while ($iterator->valid()) {
		if ($iterator->getDepth() === 0) {
			$current_key = $iterator->key();
		}

		if ($strict && $iterator->current() === $needle) {
			return $current_key;
		} elseif ($iterator->current() == $needle) {
			return $current_key;
		}
		$iterator->next();
	}
	return false;
}

//Valori Array tutti minuscoli
function nestedLowercase($value) {
    if (is_array($value)) {
        return array_map('nestedLowercase', $value);
    }
    return strtolower($value);
}
//Valori Array tutti MAIUSCOLI
function nestedUppecase($value) {
    if (is_array($value)) {
        return array_map('nestedUppecase', $value);
    }
    return strtoupper($value);
}

//ritorna cat ID da stringa es 'nonno/padre/categoria'
function getIDbyCatTreeString($catTreeStr){
	$catTreeArray = explode("/", $catTreeStr);
	$catTreeArrayLength = count($catTreeArray)-1;
	$parentCatStr = nestedUppecase($catTreeArray[$catTreeArrayLength-1]);
	$catStr = end($catTreeArray);
	//WFVALUETREEGETALLFILTER($table, $fieldId = 'ID', $fieldParent = 'ID_PARENT', $where)
	$treeArray = WFVALUETREEGETALLFILTER('SELECT * FROM angcategorie', 'ID', 'ID_PARENT', 'DESCRIZIONE LIKE "'.$catStr.'"');
	$keysFinded = recursive_array_search_retun_multi(nestedUppecase($catStr), $treeArray);
	foreach ($keysFinded as $key){
		$parentId = $treeArray[$key]['ID_PARENT'];
		$parentName = WFVALUEDLOOKUP('DESCRIZIONE','angcategorie',"ID = ".$parentId);
		if($parentName == $parentCatStr){
			return $treeArray[$key]['ID'];
		}
	}
	return false;
}

//i dati di input della form serializzati per ajax in array php
//esempio: $data = serializeToArray($_REQUEST['data']);
function serializeToArray($data){
	foreach ($data as $d) {
		if( substr($d["name"], -1) == "]" ){
			$d["name"] = explode("[", str_replace("]", "", $d["name"]));
			switch (sizeof($d["name"])) {
				case 2:
					$a[$d["name"][0]][$d["name"][1]] = $d["value"];
					break;
				case 3:
					$a[$d["name"][0]][$d["name"][1]][$d["name"][2]] = $d["value"];
					break;
				case 4:
					$a[$d["name"][0]][$d["name"][1]][$d["name"][2]][$d["name"][3]] = $d["value"];
					break;
			}
		}else{
			$a[$d["name"]] = $d["value"];
		} // if
	} // foreach
	return $a;
}
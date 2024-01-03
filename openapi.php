<?php

$url = "https://test.imprese.openapi.it/";
$username = "admin";
$password = "password";

//function to make cURL request
function call($method, $parameters, $url)
{
    ob_start();
    $curl_request = curl_init();

    curl_setopt($curl_request, CURLOPT_URL, $url);
    curl_setopt($curl_request, CURLOPT_POST, 1);
    curl_setopt($curl_request, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
    curl_setopt($curl_request, CURLOPT_HEADER, 1);
    curl_setopt($curl_request, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($curl_request, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl_request, CURLOPT_FOLLOWLOCATION, 0);

    $jsonEncodedData = json_encode($parameters);

    $post = array(
         "method" => $method,
         "input_type" => "JSON",
         "response_type" => "JSON",
         "rest_data" => $jsonEncodedData
    );

    curl_setopt($curl_request, CURLOPT_POSTFIELDS, $post);
    $result = curl_exec($curl_request);
    curl_close($curl_request);

    $result = explode("\r\n\r\n", $result, 2);
    $response = json_decode($result[1]);
    ob_end_flush();

    return $response;
}

//login -------------------------------------------------------------------------------------------

$login_parameters = array(
     "user_auth"=>array(
          "user_name"=>$username,
          "password"=>md5($password),
          "version"=>"1"
     ),
     "application_name"=>"RestTest",
     "name_value_list"=>array(),
);

$login_result = call("login", $login_parameters, $url);

/*
echo "<pre>";
print_r($login_result);
echo "</pre>";
*/

//get session id
$session_id = $login_result->id;

//retrieve records -------------------------------------------------------------------------------

$get_entries_parameters = array(

     //session id
     'session' => $session_id,

     //The name of the module from which to retrieve records
     'module_name' => 'Accounts',

     //An array of SugarBean IDs
     'ids' => array(
         '20328809-9d0a-56fc-0e7c-4f7cb6eb1c83',
         '328b22a6-d784-66d9-0295-4f7cb59e8cbb',
     ),

     //Optional. The list of fields to be returned in the results
     'select_fields' => array(
        'name',
        'billing_address_state',
        'billing_address_country'
     ),

     //A list of link names and the fields to be returned for each link name
     'link_name_to_fields_array' => array(
     ),
);

$get_entries_result = call("get_entries", $get_entries_parameters, $url);

echo "<pre>";
print_r($get_entries_result);
echo "</pre>";

?>
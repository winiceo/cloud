<?php

require 'vendor/autoload.php';

use Parse\ParseObject;
use Parse\ParseQuery;
use Parse\ParseACL;
use Parse\ParsePush;
use Parse\ParseUser;
use Parse\ParseInstallation;
use Parse\ParseException;
use Parse\ParseAnalytics;
use Parse\ParseFile;
use Parse\ParseCloud;
use Parse\ParseClient;
//use Parse\ParseObject;

$app_id="71an.com";
$rest_key="71an.com";

$master_key="71an.com";

ParseClient::initialize( $app_id, $rest_key, $master_key );

// Users of Parse Server will need to point ParseClient at their remote URL:
ParseClient::setServerURL('http://115.29.146.23:8043/parse');


$object = ParseObject::create("TestObject");
$objectId = $object->getObjectId();
$php = $object->get("elephant");

// Set values:
$object->set("elephant", "php");
$object->set("today", new DateTime());
$object->setArray("mylist", [1, 2, 3]);
$object->setAssociativeArray(
    "languageTypes", array("php" => "awesome", "ruby" => "wtf")
);

// Save:
$object->save();

 

// Signup
$user = new ParseUser();
$user->setUsername("leven");
$user->setPassword("56os.com");
try {
    $user->signUp();
} catch (ParseException $ex) {
    // error in $ex->getMessage();
}

// Login
try {
    $user = ParseUser::logIn("leven", "56os.com");
} catch(ParseException $ex) {
    // error in $ex->getMessage();
}

// Current user
$user = ParseUser::getCurrentUser();

echo "<pre>";
//var_dump($user);

// Access only by the ParseUser in $user
$userACL = ParseACL::createACLWithUser($user);

// Access only by master key
$restrictedACL = new ParseACL();

// Set individual access rights
$acl = new ParseACL();
$acl->setPublicReadAccess(true);
$acl->setPublicWriteAccess(false);
$acl->setUserWriteAccess($user, true);
$acl->setRoleWriteAccessWithName("PHPFans", true);



$query = new ParseQuery("TestObject");

// Get a specific object:
//$object = $query->get("PnNXt2XD4Y");

//$query->limit(10); // default 100, max 1000

// All results:
$results = $query->find();

// Just the first result:
// $first = $query->first();

// var_dump($first);
// exit;
// Process ALL (without limit) results with "each".
// Will throw if sort, skip, or limit is used.
$query->each(function($obj) {
    echo $obj->getObjectId()."<br>";
});

//exit;


$results = ParseCloud::run("hello");

// var_dump($results);
// exit;


// // Get from a Parse Object:
// $file = $aParseObject->get("aFileColumn");
// $name = $file->getName();
// $url = $file->getURL();
// // Download the contents:
// $contents = $file->getData();
$contents="adfasdf";
// Upload from a local file:
$file = ParseFile::createFromFile(
    "/now/leven/php/index.php", "Parse.txt", "text/plain"
);

// Upload from variable contents (string, binary)
$file = ParseFile::createFromData($contents, "Parse.txt", "text/plain");

 


$data = array("alert" => "Hi!");

// // Push to Channels
// ParsePush::send(array(

//     "channels" => ["PHPFans"],
//     "data" => $data
// ));








$APPLICATION_ID = "71an.com";
$REST_API_KEY = "71an.com";

$url = 'http://localhost:4040/parse/push';
$data = array(
    'channel' => 'News',
    'type' => 'ios',
    'expiry' => 1451606400,
    'master_ey'=>"71an.com",
    'data' => array(
        'alert' => 'Test Push',
        'sound' => 'push.caf',
    ),
);
$_data = json_encode($data);
$headers = array(
    'X-Parse-Application-Id: ' . $APPLICATION_ID,
    'X-Parse-REST-API-Key: ' . $REST_API_KEY,
    'X-Parse-Master-Key: ' . $REST_API_KEY,

    'Content-Type: application/json',
    'Content-Length: ' . strlen($_data),
);

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_POSTFIELDS, $_data);
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
curl_exec($curl);

exit;
// Push to Query
$query = ParseInstallation::query();
$query->equalTo("design", "rad");
ParsePush::send(array(
    "where" => $query,
    "data" => $data
),"71an.com");

// Parse Server requires the master key for sending push.  Pass true as the second parameter.
ParsePush::send($data, true);
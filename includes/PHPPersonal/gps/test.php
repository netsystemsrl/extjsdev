<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//echo 'ciao da test';

include('vendor/autoload.php');

use Location\Coordinate;
use Location\Distance\Vincenty;
use Location\Polygon;

$coordinate1 = new Coordinate(19.820664, -155.468066); // Mauna Kea Summit
$coordinate2 = new Coordinate(20.709722, -156.253333); // Haleakala Summit

$calculator = new Vincenty();

echo $calculator->getDistance($coordinate1, $coordinate2);

$geofence = new Polygon();

$geofence->addPoint(new Coordinate(-12.085870,-77.016261));
$geofence->addPoint(new Coordinate(-12.086373,-77.033813));
$geofence->addPoint(new Coordinate(-12.102823,-77.030938));
$geofence->addPoint(new Coordinate(-12.098669,-77.006476));

$outsidePoint = new Coordinate(-12.075452, -76.985079);
$insidePoint = new Coordinate(-12.092542, -77.021540);

var_dump($geofence->contains($outsidePoint)); // returns bool(false) the point is outside the polygon
var_dump($geofence->contains($insidePoint)); // returns bool(true) the point is inside the polygon
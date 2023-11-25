<?php 
/* *****************************************************************************
	qPurpleAir-v2.php

	(c) Steven dos Remedios										25 November 2023
	
	Query AirNow air quality index for specific sensors; categorize into
	level 1, 2, or 3; then notify IFTTT to update status of Echo Glow color
	(based on an Alexa Routine)

/* *****************************************************************************
	Air Quality Index Scale
	0-50	Good			1
	51-100	Moderate		2
	101-150	Sensitive		3
	151-200	Unhealthy		4
	201-300	Very unhealthy	4
	301-500 Hazardous		4
/* *****************************************************************************

	Legacy url
	Purple air JSON https://www.purpleair.com/json?show=64489
	
*/
$URL ='https://api.purpleair.com/v1/sensors?fields=name%2Cchannel_state%2Cchannel_flags%2Cpm2.5_10minute&location_type=0&show_only=64489%2C65787&api_key=EFFF1049-7DF4-11EB-8C3A-42010A800259';
	
$IFTTT = 'https://maker.ifttt.com/trigger/{EVENT}/with/key/cYpaTd6piFZzdQpHxucnJS';

$AQI = getLevel($URL);
/*
echo 'Level = ' . $AQI . '<br/>';
*/
if ($AQI >= 0) {
	$event = 'Air_Quality_';
	switch ($AQI) {
	case 1:
		$event .= 'Good';
		break;
	case 2:
		$event .= 'Fair';
		break;
	case 3:
		$event .= 'Poor';
		break;
		default:
		$event .= 'Unhealthy';
	}
	
	$url = str_replace('{EVENT}',$event,$IFTTT);
	file_get_contents($url);
}
/* *****************************************************************************

{
  "api_version" : "V1.0.6-0.0.9",
  "time_stamp" : 1615059586,
  "data_time_stamp" : 1615059570,
  "location_type" : 0,
  "max_age" : 604800,
  "fields" : [
    "sensor_index",
    "name",
    "channel_state",
    "channel_flags",
    "pm2.5_10minute"
  ],
  "channel_states" : ["No PM", "PM-A", "PM-B", "PM-A+PM-B"],
  "channel_flags" : ["Normal", "A-Downgraded", "B-Downgraded", "A+B-Downgraded"],
  "data" : [
    [64489,"Redwood Hills",3,0,1.0],
    [65787,"Purple Haze",3,0,0.3]
  ]
}
*/
function getLevel($url) {
	$NAME = '';
	$AQI  = 0;
	
	$data = json_decode(file_get_contents($url),false);
	
	for ($i = 0; $i < count($data->data); $i++) {
		$sensor = $data->data[$i];
		if ($sensor[2] > 0) {
			$AQI = aqiFromPM($sensor[4]);
			/*
			echo 'PM2.5 = ' . $sensor[4] . '<br/>';
			echo 'AQI   = ' . $AQI . '<br/>';
			*/
			if ($AQI <= 50) return 1;
			if ($AQI <= 100) return 2;
			if ($AQI <= 150) return 3;
			return 4;
		}
	}
	return 4;
};
/* *****************************************************************************
Good                               0 - 50     0.0 - 15.0     0.0 – 12.0
Moderate                          51 - 100  >15.0 - 40      12.1 – 35.4
Unhealthy for Sensitive Groups   101 – 150    >40 – 65      35.5 – 55.4
Unhealthy                        151 – 200   > 65 – 150     55.5 – 150.4
Very Unhealthy                   201 – 300   >150 – 250    150.5 – 250.4
Hazardous                        301 – 400   >250 – 350    250.5 – 350.4
Hazardous                        401 – 500   >350 – 500    350.5 – 500
/* ****************************************************************************/

function aqiFromPM($pm) {
	if (!is_numeric($pm)) return "-"; 
	if (!isset($pm)) return "-";
	if ($pm < 0) return $pm; 
	if ($pm > 1000) return "-"; 
	if ($pm > 350.5) {
		return calcAQI($pm, 500, 401, 500, 350.5);
	} else if ($pm > 250.5) {
		return calcAQI($pm, 400, 301, 350.4, 250.5);
	} else if ($pm > 150.5) {
		return calcAQI($pm, 300, 201, 250.4, 150.5);
	} else if ($pm > 55.5) {
		return calcAQI($pm, 200, 151, 150.4, 55.5);
	} else if ($pm > 35.5) {
		return calcAQI($pm, 150, 101, 55.4, 35.5);
	} else if ($pm > 12.1) {
		return calcAQI($pm, 100, 51, 35.4, 12.1);
	} else if ($pm >= 0) {
		return calcAQI($pm, 50, 0, 12, 0);
	} else {
		return "-";
	}
}

function calcAQI($Cp, $Ih, $Il, $BPh, $BPl) {
	$a = ($Ih - $Il);
	$b = ($BPh - $BPl);
	$c = ($Cp - $BPl);
	return round(($a/$b) * $c + $Il);
}

?>

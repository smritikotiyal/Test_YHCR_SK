<?php
$data = $_POST['data'];
console.log('Here 4');
$file = '../static/data/data.txt';
$existing = file_get_contents($file);
 $jsonLog = json_encode($data);
 $output = $existing . $jsonLog;
 
 $ret = file_put_contents($file, $output);
 echo($ret);
?>
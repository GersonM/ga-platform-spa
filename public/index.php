<?php
$tenantNames = array(
        'platform.fbgroup.pe' => 'FB Group',
        'fireworks.geekadvice.pe' => 'Fireworks',
        'villa-primavera.geekadvice.pe' => 'Villa Primavera',
        'localhost:5173' => 'Villa Primavera',
        'country-club.geekadvice.pe' => 'Country Club La Villa',
);
$host = $_SERVER['HTTP_HOST'];
$dir = scandir('./assets');

$title = 'Geek Advice';
$jsFile = '';
$cssFile = '';

$indexHtml = file_get_contents('index.html');
str_replace('<title>Geek Advice</title>', '<title>' . $title . '</title>', $indexHtml);
echo $indexHtml;


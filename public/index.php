<?php
$tenantNames = array(
    'platform.fbgroup.pe' => 'FB Group',
    'fireworks.geekadvice.pe' => 'Fireworks',
);
$host = $_SERVER['HTTP_HOST'];
$dir = scandir('./assets');

$title = 'Geek Advice';
$jsFile = '';
$cssFile = '';

if(isset($tenantNames[$host])) {
  $title = $tenantNames[$host];
}

foreach ($dir as $filename) {
  if (str_contains($filename, 'index')) {
    if (str_contains($filename, 'css')) {
      $cssFile = $filename;
    }
    if (str_contains($filename, 'js')) {
      $jsFile = $filename;
    }
  }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <link rel="icon" type="image/png" href="/assets/logo_square-0cukfj_4.png"/>
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Maven+Pro:wght@500;600&display=swap"
        rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title><?php echo $title ?></title>
  <script type="module" crossorigin src="/assets/<?php echo $jsFile; ?>"></script>
  <link rel="stylesheet" crossorigin href="/assets/<?php echo $cssFile ?>">
</head>
<body>
<div id="root"></div>
</body>
</html>

<?php
$host = $_SERVER['HTTP_HOST'];
$uri = $_SERVER['REQUEST_URI'];

$tenantCode = match ($host) {
  //'platform.fbgroup.pe' => 'FB Group',
  //'fireworks.geekadvice.pe' => 'Fireworks',
  //'villa-primavera.geekadvice.pe' => 'Villa Primavera',
  'localhost:5173' => 'app',
  //'country-club.geekadvice.pe' => 'Country Club La Villa',
  default => explode('.', $host)[0],
};

$tenantNames = match ($host) {
  'platform.fbgroup.pe' => 'FB Group',
  'fireworks.geekadvice.pe' => 'Fireworks',
  'villa-primavera.geekadvice.pe' => 'Villa Primavera',
  'localhost:5173' => 'Villa Primavera',
  'country-club.geekadvice.pe' => 'Country Club La Villa',
  default => 'Geek Advice',
};

$indexHtml = file_get_contents('index.html');

str_replace('<title>Geek Advice</title>', '<title>' . $tenantNames . '</title>', $indexHtml);

if (str_contains($uri, 'storage/files/')) {
  $uuid = explode('storage/files/', $uri)[1];
  str_replace(
          '{{og:image}}',
          'https://platform.geekadvice.pe/' . $tenantCode . '/storage/file-management/files/' . $uuid . '/thumbnail',
          $indexHtml
  );

  str_replace('{{og:title}}', $tenantNames, $indexHtml);
  str_replace('{{og:url}}', 'https://platform.geekadvice.pe/' . $tenantCode . '/storage/file-management/files/' . $uuid . '/view', $indexHtml);
}
echo $indexHtml;

<?php

$host = $_SERVER['HTTP_HOST'];
$uri = $_SERVER['REQUEST_URI'];

$tenantCode = match ($host) {
  'localhost:5173' => 'app',
  'manager.cobrify.lat' => 'cobrify',
  default => explode('.', $host)[0],
};

$tenantNames = match ($host) {
  'platform.fbgroup.pe' => 'FB Group',
  'cobrify.geekadvice.pe' => 'Alma Quinta',
  'manager.cobrify.lat' => 'Alma Quinta',
  'fireworks.geekadvice.pe' => 'Fireworks',
  'villa-primavera.geekadvice.pe' => 'Villa Primavera',
  'localhost:5173' => 'Geek Advice',
  'publiefectiva.geekadvice.pe' => 'Publi Efectiva',
  'country-club.geekadvice.pe' => 'Country Club La Villa - Ilo',
  'country-moquegua.geekadvice.pe' => 'Country Club La Villa - Moquegua',
  default => 'Geek Advice',
};

$tenantDescriptions = match ($host) {
  'cobrify.geekadvice.pe' => 'Alma Quinta',
  'manager.cobrify.lat' => 'La perfección web es nuestro día a día',
  default => 'Plataforma de gestión empresarial',
};
$favicon = '/src/Assets/GeekAdvice_favicon.webp';
$whiteLogo = null;
try {
  $tenantInfo = json_decode(file_get_contents('https://platform-v2.geekadvice.pe/' . $tenantCode . '/api/v1/version'));
  $favicon = $tenantInfo->favicon;
  $whiteLogo = $tenantInfo->white_logo;
} catch (exception $e) {

}
$indexHtml = file_get_contents('index.html');

$indexHtml = str_replace('<title>Geek Advice</title>', '<title>' . $tenantNames . '</title>', $indexHtml);
$indexHtml = str_replace('{{og:title}}', $tenantNames, $indexHtml);
$indexHtml = str_replace('{{og:description}}', $tenantDescriptions, $indexHtml);
$indexHtml = str_replace('{{img:favicon}}', $favicon, $indexHtml);

if (str_contains($uri, 'storage/files/')) {
  $uuid = explode('storage/files/', $uri)[1];
  $indexHtml = str_replace(
    '{{og:image}}',
    'https://platform.geekadvice.pe/' . $tenantCode . '/storage/file-management/files/' . $uuid . '/thumbnail',
    $indexHtml
  );
  $indexHtml = str_replace('{{og:url}}', 'https://platform-v2.geekadvice.pe/' . $tenantCode . '/storage/file-management/files/' . $uuid . '/view', $indexHtml);
} else {
  $indexHtml = str_replace(
    '{{og:image}}',
    $whiteLogo,
    $indexHtml
  );
  $indexHtml = str_replace('{{og:url}}', $uri, $indexHtml);
}
echo $indexHtml;

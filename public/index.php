<?php

$host = $_SERVER['HTTP_HOST'];
$uri = $_SERVER['REQUEST_URI'];

$tenantCode = match ($host) {
  'localhost:5173' => 'app',
  'manager.cobrify.lat' => 'cobrify',
  'oficina.candares.com' => 'candares',
  default => explode('.', $host)[0],
};

$excludedNames = [
  'connect-dev',
  'connect-staging',
  'losportales',
  'manager',
  'dev-core',
  'sf',
  'oficina',
  'inmobiliaria',
  'connect',
  'fernando',
  'clientes',
  'carrera-avon',
  'drivers',
  'smart7bus',
  'galilea',
  'tienda',
  'webdisk',
  'core',
];

$tenantDescriptions = match ($host) {
  'cobrify.geekadvice.pe' => 'Alma Quinta',
  'manager.cobrify.lat' => 'La perfección web es nuestro día a día',
  default => 'Plataforma de gestión empresarial',
};

$tenantNames = null;
$favicon = '/src/Assets/GeekAdvice_favicon.webp';
$whiteLogo = null;
$coverImage = null;
try {
  if (!in_array($tenantCode, $excludedNames)) {
    $tenantInfo = json_decode(file_get_contents('https://platform-v2.geekadvice.pe/' . $tenantCode . '/api/v1/version?referer='.urlencode($host.'/'.$uri)));
    $tenantNames = $tenantInfo->config->name;
    $favicon = $tenantInfo->favicon;
    $whiteLogo = $tenantInfo->white_logo;
    $coverImage = $tenantInfo->cover_image;
  }else{
    header('Location: https://geekadvice.pe/platform');
  }
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
    $coverImage ?: $whiteLogo,
    $indexHtml
  );
  $indexHtml = str_replace('{{og:url}}', $uri, $indexHtml);
}
echo $indexHtml;

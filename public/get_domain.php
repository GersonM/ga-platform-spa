<?php
// Detectar el dominio
$domain = $_SERVER['HTTP_HOST'];

// Extraer el nombre del dominio para el título
$title = ucwords(str_replace('.', ' ', $domain));

// Crear un array con los datos
$data = array(
        'domain' => $domain,
);

// Convierte el array a formato JSON
$json_data = json_encode($data);

// Imprimir los datos como respuesta
header('Content-Type: application/json');
echo $json_data;

?>

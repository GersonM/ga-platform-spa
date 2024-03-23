<?php
// Array de dominios y nombres de empresa
$domains_and_names = array(
        'geekadvice.com' => 'Geek Advice',
);

$domain = $_SERVER['HTTP_HOST'];

// Inicializar el nombre de la empresa como desconocido
$company_name = "Desconocido";

// Buscar el nombre de la empresa basado en el dominio
if (isset($domains_and_names[$domain])) {
  $company_name = $domains_and_names[$domain];
}

// Guardar el nombre de la empresa en una variable
$nombre_empresa = $company_name;
?>

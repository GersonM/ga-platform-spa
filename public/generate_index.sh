#!/bin/bash

# Obtener el dominio utilizando el script PHP
nombre_empresa=$(php get_domain.php)

# Generar el contenido del archivo index.html
cat <<EOF > index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/src/Assets/logo_square.png" />
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Maven+Pro:wght@500;600&display=swap" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>$nombre_empresa</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

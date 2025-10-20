<?php
require_once __DIR__ . '/load_env.php';
loadEnv(__DIR__ . '/../.env');

$driver = getenv('DB_DRIVER') ?: 'pgsql';
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'product_system';
$user = getenv('DB_USER') ?: 'tu_usuario';
$password = getenv('DB_PASSWORD') ?: 'tu_contraseña';

try {
    $pdo = new PDO("$driver:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error al conectar a la base de datos: " . $e->getMessage());
}
?>

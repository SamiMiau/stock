<?php
header('Content-Type: application/json');
require_once 'load_env.php';

// Load environment variables
loadEnv(__DIR__ . '/../.env');

$driver = getenv('DB_DRIVER') ?: 'pgsql';
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'product_system';
$user = getenv('DB_USER') ?: 'tu_usuario';
$password = getenv('DB_PASSWORD') ?: 'tu_contraseña';

echo "=== PRUEBA DE CONEXIÓN A BASE DE DATOS ===\n";
echo "Driver: $driver\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "User: $user\n";
echo "Password: " . (empty($password) ? '(vacío)' : '***configurado***') . "\n\n";

try {
    $pdo = new PDO("$driver:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ CONEXIÓN EXITOSA!\n\n";
    
    // Test basic query
    $stmt = $pdo->query("SELECT version()");
    $version = $stmt->fetchColumn();
    echo "Versión de PostgreSQL: $version\n\n";
    
    // Check if tables exist
    echo "=== VERIFICANDO TABLAS ===\n";
    $stmt = $pdo->query("
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    ");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "❌ No hay tablas en la base de datos\n";
        echo "Necesitas ejecutar el archivo create_tables.sql\n";
    } else {
        echo "✅ Tablas encontradas:\n";
        foreach ($tables as $table) {
            echo "  - $table\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR DE CONEXIÓN: " . $e->getMessage() . "\n";
    echo "\nPosibles soluciones:\n";
    echo "1. Verifica que PostgreSQL esté ejecutándose\n";
    echo "2. Revisa las credenciales en tu archivo .env\n";
    echo "3. Asegúrate de que la base de datos 'product_system' existe\n";
    echo "4. Verifica que el usuario tenga permisos\n";
}
?>

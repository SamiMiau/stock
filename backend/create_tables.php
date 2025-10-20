<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    // Read the SQL file
    $sqlFile = __DIR__ . '/../sql/create_tables.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Archivo SQL no encontrado: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    if ($sql === false) {
        throw new Exception("No se pudo leer el archivo SQL");
    }
    
    // Remove comments before splitting to avoid dropping valid statements
    // Remove block comments /* ... */
    $sqlNoBlockComments = preg_replace('#/\*.*?\*/#s', '', $sql);
    // Remove single-line comments starting with --
    $sqlNoComments = preg_replace('/^\s*--.*$/m', '', $sqlNoBlockComments);

    // Split SQL into individual statements
    $rawStatements = array_map('trim', explode(';', $sqlNoComments));
    $statements = array_values(array_filter($rawStatements, function($stmt) {
        return $stmt !== '';
    }));
    
    $pdo->beginTransaction();
    
    $executed = 0;
    $errors = [];
    
    foreach ($statements as $statement) {
        if (empty(trim($statement))) continue;
        
        try {
            $pdo->exec($statement);
            $executed++;
            echo "✅ Ejecutado: " . substr($statement, 0, 50) . "...\n";
        } catch (Exception $e) {
            $errors[] = "Error en: " . substr($statement, 0, 50) . "... - " . $e->getMessage();
        }
    }
    
    if (empty($errors)) {
        $pdo->commit();
        echo "\n🎉 ¡TABLAS CREADAS EXITOSAMENTE!\n";
        echo "Se ejecutaron $executed sentencias SQL.\n\n";
        
        // Verify tables were created
        $stmt = $pdo->query("
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        ");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "Tablas creadas:\n";
        foreach ($tables as $table) {
            echo "  - $table\n";
        }
        
    } else {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo "\n❌ ERRORES ENCONTRADOS:\n";
        foreach ($errors as $error) {
            echo "  - $error\n";
        }
    }
    
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "❌ ERROR GENERAL: " . $e->getMessage() . "\n";
}
?>

<?php
header('Content-Type: application/json');
require_once 'db.php';

echo "=== PRUEBA DE INSERCIÓN DE DATOS ===\n\n";

try {
    // Test 1: Insert a material
    echo "1. Insertando material de prueba...\n";
    $stmt = $pdo->prepare("INSERT INTO materials (code, description) VALUES (:code, :description) RETURNING id");
    $stmt->execute([
        ':code' => 'TEST01',
        ':description' => 'Material Test'
    ]);
    $materialId = $stmt->fetchColumn();
    echo "✅ Material creado con ID: $materialId\n\n";
    
    // Test 2: Insert a product
    echo "2. Insertando producto de prueba...\n";
    $stmt = $pdo->prepare("INSERT INTO products (code, name, price) VALUES (:code, :name, :price) RETURNING id");
    $stmt->execute([
        ':code' => 'PROD01',
        ':name' => 'Producto Test',
        ':price' => 19.99
    ]);
    $productId = $stmt->fetchColumn();
    echo "✅ Producto creado con ID: $productId\n\n";
    
    // Test 3: Associate material with product
    echo "3. Asociando material con producto...\n";
    $stmt = $pdo->prepare("INSERT INTO product_materials (product_id, material_id) VALUES (:product_id, :material_id)");
    $stmt->execute([
        ':product_id' => $productId,
        ':material_id' => $materialId
    ]);
    echo "✅ Asociación creada\n\n";
    
    // Test 4: Verify data
    echo "4. Verificando datos insertados...\n";
    
    // Check materials
    $stmt = $pdo->query("SELECT COUNT(*) FROM materials");
    $materialCount = $stmt->fetchColumn();
    echo "   - Materiales en BD: $materialCount\n";
    
    // Check products
    $stmt = $pdo->query("SELECT COUNT(*) FROM products");
    $productCount = $stmt->fetchColumn();
    echo "   - Productos en BD: $productCount\n";
    
    // Check associations
    $stmt = $pdo->query("SELECT COUNT(*) FROM product_materials");
    $associationCount = $stmt->fetchColumn();
    echo "   - Asociaciones en BD: $associationCount\n\n";
    
    // Show sample data
    echo "5. Datos de muestra:\n";
    $stmt = $pdo->query("
        SELECT p.code, p.name, p.price, m.description as material
        FROM products p
        JOIN product_materials pm ON p.id = pm.product_id
        JOIN materials m ON pm.material_id = m.id
        WHERE p.id = $productId
    ");
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo "   - Producto: {$data['code']} - {$data['name']} - \${$data['price']}\n";
        echo "   - Material: {$data['material']}\n";
    }
    
    echo "\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!\n";
    echo "Tu base de datos está funcionando correctamente.\n";
    
} catch (Exception $e) {
    echo "❌ ERROR EN PRUEBA: " . $e->getMessage() . "\n";
    echo "\nPosibles causas:\n";
    echo "1. Las tablas no fueron creadas correctamente\n";
    echo "2. Problemas de permisos en la base de datos\n";
    echo "3. Restricciones de integridad\n";
}
?>

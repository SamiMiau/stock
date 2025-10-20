<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
    exit;
}

$product_id = isset($data['product_id']) ? (int)$data['product_id'] : 0;
$material_ids = isset($data['material_ids']) ? $data['material_ids'] : [];

// Validaciones
$errors = [];

if ($product_id <= 0) {
    $errors[] = 'ID de producto inválido';
}

if (!is_array($material_ids) || empty($material_ids)) {
    $errors[] = 'Debe proporcionar al menos un material';
}

// Validar que todos los material_ids sean enteros positivos
foreach ($material_ids as $material_id) {
    if (!is_numeric($material_id) || (int)$material_id <= 0) {
        $errors[] = 'IDs de materiales inválidos';
        break;
    }
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'error' => implode('. ', $errors)]);
    exit;
}

try {
    // Verificar que el producto existe
    $stmt = $pdo->prepare("SELECT id FROM products WHERE id = :product_id");
    $stmt->execute([':product_id' => $product_id]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Producto no encontrado']);
        exit;
    }

    // Verificar que todos los materiales existen
    $placeholders = str_repeat('?,', count($material_ids) - 1) . '?';
    $stmt = $pdo->prepare("SELECT id FROM materials WHERE id IN ($placeholders)");
    $stmt->execute($material_ids);
    $existing_materials = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($existing_materials) !== count($material_ids)) {
        echo json_encode(['success' => false, 'error' => 'Uno o más materiales no existen']);
        exit;
    }

    // Iniciar transacción
    $pdo->beginTransaction();

    // Eliminar asociaciones existentes para este producto
    $stmt = $pdo->prepare("DELETE FROM product_materials WHERE product_id = :product_id");
    $stmt->execute([':product_id' => $product_id]);

    // Insertar nuevas asociaciones
    $stmt = $pdo->prepare("INSERT INTO product_materials (product_id, material_id) VALUES (:product_id, :material_id)");
    $inserted_count = 0;
    
    foreach ($material_ids as $material_id) {
        try {
            $stmt->execute([
                ':product_id' => $product_id,
                ':material_id' => (int)$material_id
            ]);
            $inserted_count++;
        } catch (Exception $e) {
            // Si hay duplicados, continuar (aunque no debería pasar)
            continue;
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Se asociaron $inserted_count materiales al producto",
        'product_id' => $product_id,
        'material_ids' => $material_ids
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

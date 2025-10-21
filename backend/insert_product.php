<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
    exit;
}

$code = isset($data['code']) ? trim($data['code']) : '';
$name = isset($data['name']) ? trim($data['name']) : '';
$price = isset($data['price']) ? (float)$data['price'] : 0;
$currencyId = isset($data['currency_id']) ? (int)$data['currency_id'] : 0;
$description = isset($data['description']) ? trim($data['description']) : '';

// Validaciones según la estructura de create_tables.sql
$errors = [];

// code: 5-15 chars, alfanumérico y debe contener al menos una letra y un número
if ($code === ''
    || strlen($code) < 5
    || strlen($code) > 15
    || !preg_match('/^[A-Za-z0-9]+$/', $code)
    || !preg_match('/[A-Za-z]/', $code)
    || !preg_match('/[0-9]/', $code)
) {
    $errors[] = 'Código inválido: 5-15 caracteres, alfanumérico y debe incluir letra y número';
}

// name: 2-50 chars
if ($name === '' || strlen($name) < 2 || strlen($name) > 50) {
    $errors[] = 'Nombre inválido: longitud entre 2 y 50 caracteres';
}

// price: > 0
if (!is_numeric($price) || $price <= 0) {
    $errors[] = 'Precio inválido: debe ser mayor a 0';
}

// description: 10-1000 chars
if ($description === '' || strlen($description) < 10 || strlen($description) > 1000) {
    $errors[] = 'Descripción inválida: longitud entre 10 y 1000 caracteres';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'error' => implode('. ', $errors)]);
    exit;
}

try {
    // Pre-insert uniqueness check for product code
    $stmt = $pdo->prepare("SELECT 1 FROM products WHERE code = :code LIMIT 1");
    $stmt->execute([':code' => $code]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'El código ya existe']);
        exit;
    }

    // Validar currency existente
    if ($currencyId <= 0) {
        echo json_encode(['success' => false, 'error' => 'Moneda inválida']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT id FROM currencies WHERE id = :cid");
    $stmt->execute([':cid' => $currencyId]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Moneda no encontrada']);
        exit;
    }

    // Insertar en products; PostgreSQL permite RETURNING para obtener el id
    $stmt = $pdo->prepare("INSERT INTO products (code, name, price, currency_id, description) VALUES (:code, :name, :price, :currency_id, :description) RETURNING id, created_at");
    $stmt->execute([
        ':code' => $code,
        ':name' => $name,
        ':price' => $price,
        ':currency_id' => $currencyId,
        ':description' => $description,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'success' => true,
        'id' => $row['id'] ?? null,
        'created_at' => $row['created_at'] ?? null,
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

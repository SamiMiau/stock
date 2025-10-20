<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
    exit;
}

$code = isset($data['code']) ? trim($data['code']) : '';
$description = isset($data['description']) ? trim($data['description']) : '';

// Validaciones según la estructura de create_tables.sql
$errors = [];

// code: 5-15 chars, alfanumérico
if ($code === ''
    || strlen($code) < 5
    || strlen($code) > 15
    || !preg_match('/^[A-Za-z0-9]+$/', $code)
) {
    $errors[] = 'Código de material inválido: 5-15 caracteres alfanuméricos';
}

// description: 1-20 chars
if ($description === '' || strlen($description) < 1 || strlen($description) > 20) {
    $errors[] = 'Descripción inválida: longitud entre 1 y 20 caracteres';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'error' => implode('. ', $errors)]);
    exit;
}

try {
    // Insertar en materials
    $stmt = $pdo->prepare("INSERT INTO materials (code, description) VALUES (:code, :description) RETURNING id");
    $stmt->execute([
        ':code' => $code,
        ':description' => $description,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'success' => true,
        'id' => $row['id'] ?? null,
        'message' => 'Material creado exitosamente'
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>

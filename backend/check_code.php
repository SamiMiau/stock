<?php
header('Content-Type: application/json');
require_once 'db.php';

$code = isset($_GET['code']) ? trim($_GET['code']) : '';

if (empty($code)) {
    echo json_encode([
        'success' => false,
        'error' => 'Código no proporcionado'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM products WHERE code = :code");
    $stmt->execute([':code' => $code]);
    $existing = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'available' => !$existing
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

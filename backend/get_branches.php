<?php
header('Content-Type: application/json');
require_once 'db.php';

$warehouse_id = isset($_GET['warehouse_id']) ? (int)$_GET['warehouse_id'] : 0;

if ($warehouse_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'ID de bodega inválido'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, description AS name FROM branches WHERE warehouse_id = :wid ORDER BY description");
    $stmt->execute([':wid' => $warehouse_id]);
    $branches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'branches' => $branches
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

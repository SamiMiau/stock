<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    // Read warehouses from database
    $stmt = $pdo->query("SELECT id, description AS name FROM warehouses ORDER BY description");
    $warehouses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'warehouses' => $warehouses
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = $pdo->prepare("SELECT id, code, description FROM materials ORDER BY description");
    $stmt->execute();
    $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'materials' => $materials
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

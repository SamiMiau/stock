<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    $pdo->beginTransaction();

    // Contar registros antes de eliminar para reporte
    $countProducts = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $countProductMaterials = $pdo->query("SELECT COUNT(*) FROM product_materials")->fetchColumn();

    // Eliminar asociaciones de productos con materiales primero
    // (debido a la clave foránea)
    $deleteProductMaterials = $pdo->prepare("DELETE FROM product_materials");
    $deleteProductMaterials->execute();
    $deletedMaterials = $deleteProductMaterials->rowCount();

    // Eliminar todos los productos
    $deleteProducts = $pdo->prepare("DELETE FROM products");
    $deleteProducts->execute();
    $deletedProducts = $deleteProducts->rowCount();

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Datos de productos eliminados exitosamente',
        'deleted' => [
            'products' => $deletedProducts,
            'product_materials' => $deletedMaterials
        ],
        'summary' => "Se eliminaron $deletedProducts productos y $deletedMaterials asociaciones de materiales"
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
?>

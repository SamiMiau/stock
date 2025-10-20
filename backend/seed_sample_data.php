<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    $pdo->beginTransaction();

    // Insert currencies
    $insertCurrency = $pdo->prepare("INSERT INTO currencies (name, symbol) VALUES (:name, :symbol)
        ON CONFLICT (name) DO NOTHING");
    $currencies = [
        ['name' => 'Peso Chileno', 'symbol' => 'CLP'],
        ['name' => 'Dólar Americano', 'symbol' => 'USD'],
        ['name' => 'Euro', 'symbol' => 'EUR'],
    ];
    foreach ($currencies as $c) {
        $insertCurrency->execute([':name' => $c['name'], ':symbol' => $c['symbol']]);
    }

    // Insert warehouses
    $insertWarehouse = $pdo->prepare("INSERT INTO warehouses (description) VALUES (:desc)
        ON CONFLICT (description) DO NOTHING");
    $warehouses = ['Bodega Central', 'Bodega Norte', 'Bodega Sur'];
    foreach ($warehouses as $w) {
        $insertWarehouse->execute([':desc' => $w]);
    }

    // Fetch warehouse ids
    $stmt = $pdo->query("SELECT id, description FROM warehouses");
    $warehouseRows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // id => description not ideal; re-fetch differently
    // Build description => id map
    $stmt = $pdo->query("SELECT id, description FROM warehouses");
    $warehouseMap = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $warehouseMap[$row['description']] = (int)$row['id'];
    }

    // Insert branches per warehouse
    $insertBranch = $pdo->prepare("INSERT INTO branches (description, warehouse_id) VALUES (:desc, :wid)
        ON CONFLICT (warehouse_id, description) DO NOTHING");

    $branchesByWarehouse = [
        'Bodega Central' => ['Sucursal Centro', 'Sucursal Plaza'],
        'Bodega Norte'   => ['Sucursal Norte', 'Sucursal Universidad'],
        'Bodega Sur'     => ['Sucursal Sur', 'Sucursal Industrial'],
    ];

    foreach ($branchesByWarehouse as $wDesc => $branches) {
        if (!isset($warehouseMap[$wDesc])) continue;
        $wid = $warehouseMap[$wDesc];
        foreach ($branches as $bDesc) {
            $insertBranch->execute([':desc' => $bDesc, ':wid' => $wid]);
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Datos de prueba insertados: currencies, warehouses y branches'
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>



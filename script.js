// Global variables
let materials = [];
let warehouses = [];
let currencies = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadInitialData();
    setupEventListeners();
});

// Load initial data from backend
async function loadInitialData() {
    try {
        await Promise.all([
            loadMaterials(),
            loadWarehouses(),
            loadCurrencies()
        ]);
    } catch (error) {
        showMessage('Error cargando datos iniciales: ' + error.message, 'error');
    }
}

// Load materials from backend
async function loadMaterials() {
    try {
        const response = await fetch('backend/get_materials.php');
        const data = await response.json();
        
        if (data.success) {
            materials = data.materials;
            renderMaterials();
        } else {
            throw new Error(data.error || 'Error cargando materiales');
        }
    } catch (error) {
        document.getElementById('materials-container').innerHTML = 
            '<span class="error">Error cargando materiales: ' + error.message + '</span>';
    }
}

// Load warehouses from backend
async function loadWarehouses() {
    try {
        const response = await fetch('backend/get_warehouses.php');
        const data = await response.json();
        
        if (data.success) {
            warehouses = data.warehouses;
            renderWarehouses();
        } else {
            throw new Error(data.error || 'Error cargando bodegas');
        }
    } catch (error) {
        showMessage('Error cargando bodegas: ' + error.message, 'error');
    }
}

// Load currencies from backend
async function loadCurrencies() {
    try {
        const response = await fetch('backend/get_currencies.php');
        const data = await response.json();
        
        if (data.success) {
            currencies = data.currencies;
            renderCurrencies();
        } else {
            throw new Error(data.error || 'Error cargando monedas');
        }
    } catch (error) {
        showMessage('Error cargando monedas: ' + error.message, 'error');
    }
}

// Render materials as checkboxes
function renderMaterials() {
    const container = document.getElementById('materials-container');
    
    if (materials.length === 0) {
        container.innerHTML = '<span class="error">No hay materiales disponibles</span>';
        return;
    }
    
    const checkboxGroup = document.createElement('div');
    checkboxGroup.className = 'checkbox-group';
    
    materials.forEach(material => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        
        checkboxItem.innerHTML = `
            <input type="checkbox" id="material-${material.id}" value="${material.id}" name="materials">
            <label for="material-${material.id}">${material.description} (${material.code})</label>
        `;
        
        checkboxGroup.appendChild(checkboxItem);
    });
    
    container.innerHTML = '';
    container.appendChild(checkboxGroup);
}

// Render warehouses in select
function renderWarehouses() {
    const select = document.getElementById('warehouse');
    select.innerHTML = '<option value=""></option>';
    
    warehouses.forEach(warehouse => {
        const option = document.createElement('option');
        option.value = warehouse.id;
        option.textContent = warehouse.name;
        select.appendChild(option);
    });
}

// Render currencies in select
function renderCurrencies() {
    const select = document.getElementById('currency');
    select.innerHTML = '<option value=""></option>';
    
    currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.id;
        option.textContent = `${currency.name} (${currency.symbol})`;
        select.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('productForm');
    const warehouseSelect = document.getElementById('warehouse');
    
    form.addEventListener('submit', handleFormSubmit);
    warehouseSelect.addEventListener('change', handleWarehouseChange);
    
    // Real-time validation
    document.getElementById('code').addEventListener('blur', validateCode);
    document.getElementById('name').addEventListener('blur', validateName);
    document.getElementById('price').addEventListener('blur', validatePrice);
    document.getElementById('description').addEventListener('blur', validateDescription);
}

// Handle warehouse selection change
async function handleWarehouseChange() {
    const warehouseId = document.getElementById('warehouse').value;
    const branchSelect = document.getElementById('branch');
    
    if (!warehouseId) {
        branchSelect.disabled = true;
        branchSelect.innerHTML = '<option value=""></option>';
        return;
    }
    
    try {
        branchSelect.disabled = true;
        branchSelect.innerHTML = '<option value=""></option>';
        
        const response = await fetch(`backend/get_branches.php?warehouse_id=${warehouseId}`);
        const data = await response.json();
        
        if (data.success) {
            branchSelect.innerHTML = '<option value=""></option>';
            data.branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                branchSelect.appendChild(option);
            });
            branchSelect.disabled = false;
        } else {
            throw new Error(data.error || 'Error cargando sucursales');
        }
    } catch (error) {
        branchSelect.innerHTML = '<option value="">Error cargando sucursales</option>';
        // Keep first blank option
        branchSelect.insertAdjacentHTML('afterbegin', '<option value=""></option>');
        showMessage('Error cargando sucursales: ' + error.message, 'error');
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = getFormData();
    
    try {
        // First, create the product
        const productResponse = await fetch('backend/insert_product.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: formData.code,
                name: formData.name,
                price: formData.price
            })
        });
        
        const productResult = await productResponse.json();
        
        if (!productResult.success) {
            throw new Error(productResult.error || 'Error creando producto');
        }
        
        // Then, associate materials
        if (formData.materials.length > 0) {
            const materialsResponse = await fetch('backend/associate_materials.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productResult.id,
                    material_ids: formData.materials
                })
            });
            
            const materialsResult = await materialsResponse.json();
            
            if (!materialsResult.success) {
                console.warn('Producto creado pero error asociando materiales:', materialsResult.error);
            }
        }
        
        showMessage('Producto registrado exitosamente', 'success');
        form.reset();
        document.getElementById('branch').disabled = true;
        document.getElementById('branch').innerHTML = '<option value=""></option>';
        
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Get form data
function getFormData() {
    const selectedMaterials = Array.from(document.querySelectorAll('input[name="materials"]:checked'))
        .map(checkbox => parseInt(checkbox.value));
    
    return {
        code: document.getElementById('code').value.trim(),
        name: document.getElementById('name').value.trim(),
        warehouse: document.getElementById('warehouse').value,
        branch: document.getElementById('branch').value,
        currency: document.getElementById('currency').value,
        price: document.getElementById('price').value.trim(),
        materials: selectedMaterials,
        description: document.getElementById('description').value.trim()
    };
}

// Validate entire form
function validateForm() {
    let isValid = true;
    
    isValid &= validateCode();
    isValid &= validateName();
    isValid &= validateWarehouse();
    isValid &= validateBranch();
    isValid &= validateCurrency();
    isValid &= validatePrice();
    isValid &= validateMaterials();
    isValid &= validateDescription();
    
    return isValid;
}

// Validate product code
async function validateCode() {
    const code = document.getElementById('code').value.trim();
    const errorElement = document.getElementById('code-error');
    const inputElement = document.getElementById('code');
    
    // Clear previous error
    errorElement.textContent = '';
    inputElement.classList.remove('error');
    
    if (!code) {
        showFieldError('code', 'El código es obligatorio');
        return false;
    }
    
    if (code.length < 5 || code.length > 15) {
        showFieldError('code', 'El código debe tener entre 5 y 15 caracteres');
        return false;
    }
    
    if (!/^[A-Za-z0-9]+$/.test(code)) {
        showFieldError('code', 'El código solo puede contener letras y números');
        return false;
    }
    
    if (!/[A-Za-z]/.test(code)) {
        showFieldError('code', 'El código debe contener al menos una letra');
        return false;
    }
    
    if (!/[0-9]/.test(code)) {
        showFieldError('code', 'El código debe contener al menos un número');
        return false;
    }
    
    // Check uniqueness in database
    try {
        const response = await fetch(`backend/check_code.php?code=${encodeURIComponent(code)}`);
        const data = await response.json();
        
        if (!data.success) {
            showFieldError('code', 'Error verificando código: ' + data.error);
            return false;
        }
        
        if (!data.available) {
            showFieldError('code', 'Este código ya existe');
            return false;
        }
    } catch (error) {
        showFieldError('code', 'Error verificando código: ' + error.message);
        return false;
    }
    
    return true;
}

// Validate product name
function validateName() {
    const name = document.getElementById('name').value.trim();
    
    if (!name) {
        showFieldError('name', 'El nombre es obligatorio');
        return false;
    }
    
    if (name.length < 2 || name.length > 50) {
        showFieldError('name', 'El nombre debe tener entre 2 y 50 caracteres');
        return false;
    }
    
    clearFieldError('name');
    return true;
}

// Validate warehouse
function validateWarehouse() {
    const warehouse = document.getElementById('warehouse').value;
    
    if (!warehouse) {
        showFieldError('warehouse', 'Debe seleccionar una bodega');
        return false;
    }
    
    clearFieldError('warehouse');
    return true;
}

// Validate branch
function validateBranch() {
    const branch = document.getElementById('branch').value;
    
    if (!branch) {
        showFieldError('branch', 'Debe seleccionar una sucursal');
        return false;
    }
    
    clearFieldError('branch');
    return true;
}

// Validate currency
function validateCurrency() {
    const currency = document.getElementById('currency').value;
    
    if (!currency) {
        showFieldError('currency', 'Debe seleccionar una moneda');
        return false;
    }
    
    clearFieldError('currency');
    return true;
}

// Validate price
function validatePrice() {
    const price = document.getElementById('price').value.trim();
    
    if (!price) {
        showFieldError('price', 'El precio es obligatorio');
        return false;
    }
    
    const priceNum = parseFloat(price);
    
    if (isNaN(priceNum) || priceNum <= 0) {
        showFieldError('price', 'El precio debe ser un número positivo');
        return false;
    }
    
    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        showFieldError('price', 'El precio debe tener máximo 2 decimales');
        return false;
    }
    
    clearFieldError('price');
    return true;
}

// Validate materials
function validateMaterials() {
    const selectedMaterials = document.querySelectorAll('input[name="materials"]:checked');
    
    if (selectedMaterials.length < 2) {
        showFieldError('materials', 'Debe seleccionar al menos 2 materiales');
        return false;
    }
    
    clearFieldError('materials');
    return true;
}

// Validate description
function validateDescription() {
    const description = document.getElementById('description').value.trim();
    
    if (!description) {
        showFieldError('description', 'La descripción es obligatoria');
        return false;
    }
    
    if (description.length < 10 || description.length > 1000) {
        showFieldError('description', 'La descripción debe tener entre 10 y 1000 caracteres');
        return false;
    }
    
    clearFieldError('description');
    return true;
}

// Show field error
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    errorElement.textContent = message;
    inputElement.classList.add('error');
}

// Clear field error
function clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    errorElement.textContent = '';
    inputElement.classList.remove('error');
}

// Show message
function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = type;
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = '';
        }, 5000);
    }
}

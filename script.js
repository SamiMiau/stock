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
            <label for="material-${material.id}">${material.description}</label>
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
    
    // Real-time validation removed - alerts only on form submission
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
    
    // Validate form first
    if (!validateForm()) {
        return;
    }
    
	// Ensure code is unique before submitting
	const codeValue = document.getElementById('code').value.trim();
	try {
		const uniqueResp = await fetch(`backend/check_code.php?code=${encodeURIComponent(codeValue)}`);
		const uniqueData = await uniqueResp.json();
		if (!uniqueData.success) {
			showFieldError('code', 'Error verificando código: ' + (uniqueData.error || 'desconocido'));
			return;
		}
		if (!uniqueData.available) {
			alert('El código del producto ya está registrado.');
			const codeInput = document.getElementById('code');
			if (codeInput) codeInput.focus();
			return;
		}
	} catch (err) {
		showFieldError('code', 'Error verificando código: ' + err.message);
		return;
	}
	
    const formData = getFormData();
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Disable submit button to prevent double submission
    submitButton.disabled = true;
    submitButton.textContent = 'Guardando...';
    
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
                price: formData.price,
                currency_id: formData.currency
            })
        });
        
        if (!productResponse.ok) {
            throw new Error(`Error del servidor: ${productResponse.status}`);
        }
        
		const productResult = await productResponse.json();
		
		if (!productResult.success) {
			const errMsg = productResult.error || 'Error creando producto';
			// If backend reports duplicate code, show the required alert and stop
			if (/c[oó]digo ya existe/i.test(errMsg) || /duplicate key|unique constraint/i.test(errMsg)) {
				alert('El código del producto ya está registrado.');
				return;
			}
			throw new Error(errMsg);
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
            
            if (!materialsResponse.ok) {
                throw new Error(`Error del servidor: ${materialsResponse.status}`);
            }
            
            const materialsResult = await materialsResponse.json();
            
            if (!materialsResult.success) {
                console.warn('Producto creado pero error asociando materiales:', materialsResult.error);
                showMessage('Producto creado pero hubo problemas asociando materiales', 'error');
                return;
            }
        }
        
        // Success!
        showMessage('Producto registrado exitosamente', 'success');
        resetForm();
        
	} catch (error) {
		console.error('Error:', error);
		if (/c[oó]digo ya existe/i.test(error.message) || /duplicate key|unique constraint/i.test(error.message)) {
			alert('El código del producto ya está registrado.');
		} else {
			showMessage('Error: ' + error.message, 'error');
		}
	} finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar Producto';
    }
}

// Reset form after successful submission
function resetForm() {
    const form = document.getElementById('productForm');
    form.reset();
    
    // Reset branch select
    const branchSelect = document.getElementById('branch');
    branchSelect.disabled = true;
    branchSelect.innerHTML = '<option value=""></option>';
    
    // Clear all error states
    clearAllFieldErrors();
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
    let errorMessages = [];
    
    // Clear all previous errors
    clearAllFieldErrors();
    
    // Validate each field
    if (!validateName()) {
        isValid = false;
        errorMessages.push('• Nombre del producto');
    }
    
    if (!validateWarehouse()) {
        isValid = false;
        errorMessages.push('• Bodega');
    }
    
    if (!validateBranch()) {
        isValid = false;
        errorMessages.push('• Sucursal');
    }
    
    if (!validateCurrency()) {
        isValid = false;
        errorMessages.push('• Moneda');
    }
    
    if (!validatePrice()) {
        isValid = false;
        errorMessages.push('• Precio');
    }
    
    if (!validateMaterials()) {
        isValid = false;
        errorMessages.push('• Materiales (mínimo 2)');
    }
    
    if (!validateDescription()) {
        isValid = false;
        errorMessages.push('• Descripción');
    }
    
    // Validate code last (async)
    if (!validateCodeSync()) {
        isValid = false;
        errorMessages.push('• Código del producto');
    }
    
    // Focus on first error field if validation fails
    if (!isValid) {
        const firstErrorField = document.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
    
    return isValid;
}

// Clear all field errors
function clearAllFieldErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    const inputElements = document.querySelectorAll('input, select, textarea');
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

// Validate product code (sync version for form validation)
function validateCodeSync() {
    const code = document.getElementById('code').value.trim();
    const errorElement = document.getElementById('code-error');
    const inputElement = document.getElementById('code');
    
    // Clear previous error
    errorElement.textContent = '';
    inputElement.classList.remove('error');
    
    if (!code) {
        alert('El código del producto no puede estar en blanco.');
        return false;
    }
    
    if (code.length < 5 || code.length > 15) {
        alert('El código del producto debe tener entre 5 y 15 caracteres.');
        return false;
    }
    
    if (!/^[A-Za-z0-9]+$/.test(code)) {
        alert('El código del producto debe contener letras y números');
        return false;
    }
    
    // Must contain at least one letter and one number; only alphanumeric
    if (!/[A-Za-z]/.test(code)) {
        alert('El código del producto debe contener letras y números');
        return false;
    }
    
    if (!/[0-9]/.test(code)) {
        alert('El código del producto debe contener letras y números');
        return false;
    }
    
    return true;
}

// Real-time validation removed - all validation now happens only on form submission

// Validate product name
function validateName() {
    const name = document.getElementById('name').value.trim();
    
    if (!name) {
        alert('El nombre del producto no puede estar en blanco');
        return false;
    }
    
    if (name.length < 2 || name.length > 50) {
        alert('El nombre del producto debe tener entre 2 y 50 caracteres');
        return false;
    }
    
    clearFieldError('name');
    return true;
}

// Validate warehouse
function validateWarehouse() {
    const warehouse = document.getElementById('warehouse').value;
    
    if (!warehouse) {
        alert('Debe seleccionar una bodega');
        return false;
    }
    
    clearFieldError('warehouse');
    return true;
}

// Validate branch
function validateBranch() {
    const branch = document.getElementById('branch').value;
    
    if (!branch) {
        alert('Debe seleccionar una sucursal para la bodega seleccionada');
        return false;
    }
    
    clearFieldError('branch');
    return true;
}

// Validate currency
function validateCurrency() {
    const currency = document.getElementById('currency').value;
    
    if (!currency) {
        alert('Debe seleccionar una moneda para el producto');
        return false;
    }
    
    clearFieldError('currency');
    return true;
}

// Validate price
function validatePrice() {
    const price = document.getElementById('price').value.trim();
    
    if (!price) {
        alert('El precio del producto no puede estar en blanco');
        return false;
    }
    
    const priceNum = parseFloat(price);
    
    if (isNaN(priceNum) || priceNum <= 0) {
        alert('El precio del producto debe ser un número positivo con hasta dos decimales');
        return false;
    }
    
    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        alert('El precio del producto debe ser un número positivo con hasta dos decimales');
        return false;
    }
    
    clearFieldError('price');
    return true;
}

// Validate materials
function validateMaterials() {
    const selectedMaterials = document.querySelectorAll('input[name="materials"]:checked');
    
    if (selectedMaterials.length < 2) {
        alert('Debe seleccionar al menos dos materiales para el producto');
        return false;
    }
    
    clearFieldError('materials');
    return true;
}

// Validate description
function validateDescription() {
    const description = document.getElementById('description').value.trim();
    
    if (!description) {
        alert('La descripción del producto no puede estar en blanco');
        return false;
    }
    
    if (description.length < 10 || description.length > 1000) {
        alert('La descripción del producto debe tener entre 10 y 1000 caracteres');
        return false;
    }
    
    clearFieldError('description');
    return true;
}

// Show field error
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

// Clear field error
function clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    if (inputElement) {
        inputElement.classList.remove('error');
    }
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

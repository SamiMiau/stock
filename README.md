# Sistema de Registro de Productos

Un sistema web para el registro y gestión de productos con validaciones personalizadas y base de datos PostgreSQL.

## 📋 Características

- ✅ Registro de productos con validaciones personalizadas
- ✅ Gestión de materiales, bodegas, sucursales y monedas
- ✅ Validación de códigos únicos con verificación en base de datos
- ✅ Interfaz responsive y moderna
- ✅ Validaciones con alertas personalizadas
- ✅ Base de datos PostgreSQL con restricciones de integridad

## 🛠️ Requisitos del Sistema

### Software Necesario
- **XAMPP** (Apache + PHP + MySQL/PostgreSQL)
- **PostgreSQL** 12 o superior
- **PHP** 7.4 o superior
- **Navegador web** moderno (Chrome, Firefox, Safari, Edge)

### Extensiones PHP Requeridas
- `pdo_pgsql` - Para conexión a PostgreSQL
- `json` - Para manejo de datos JSON
- `mbstring` - Para manejo de caracteres especiales

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd stock
```

### 2. Configurar XAMPP
1. Descargar e instalar [XAMPP](https://www.apachefriends.org/)
2. Iniciar Apache desde el panel de control de XAMPP
3. Copiar la carpeta del proyecto a `C:\xampp\htdocs\stock\`

### 3. Configurar PostgreSQL
1. Instalar PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/)
2. Crear una base de datos:
```sql
CREATE DATABASE product_system;
```

### 4. Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend/`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_system
DB_USER=tu_usuario
DB_PASS=tu_contraseña
```

### 5. Crear las Tablas
Acceder a: `http://localhost/stock/backend/create_tables.php`

O ejecutar manualmente el archivo SQL:
```bash
psql -U tu_usuario -d product_system -f sql/create_tables.sql
```

### 6. Insertar Datos de Prueba
Acceder a: `http://localhost/stock/backend/seed_sample_data.php`

## 📁 Estructura del Proyecto

```
stock/
├── backend/
│   ├── associate_materials.php    # Asociar materiales a productos
│   ├── check_code.php            # Verificar unicidad de códigos
│   ├── create_tables.php         # Crear tablas de la BD
│   ├── db.php                    # Conexión a base de datos
│   ├── get_branches.php          # Obtener sucursales
│   ├── get_currencies.php        # Obtener monedas
│   ├── get_materials.php         # Obtener materiales
│   ├── get_warehouses.php        # Obtener bodegas
│   ├── insert_material.php       # Insertar materiales
│   ├── insert_product.php        # Insertar productos
│   ├── load_env.php              # Cargar variables de entorno
│   ├── seed_sample_data.php      # Datos de prueba
│   ├── test_connection.php       # Probar conexión
│   └── test_inserts.php          # Probar inserciones
├── sql/
│   └── create_tables.sql         # Script de creación de tablas
├── index.html                    # Página principal
├── script.js                     # Lógica del frontend
├── style.css                     # Estilos CSS
├── adminer.php                   # Administrador de BD
└── README.md                     # Este archivo
```

## 🎯 Uso del Sistema

### Acceso a la Aplicación
1. Abrir navegador web
2. Navegar a: `http://localhost/stock/`
3. Completar el formulario de registro de productos

### Validaciones del Sistema

#### Código del Producto
- **Formato**: Al menos una letra y un número
- **Longitud**: Entre 5 y 15 caracteres
- **Caracteres**: Solo letras y números (A-Z, a-z, 0-9)
- **Unicidad**: Debe ser único en la base de datos

#### Nombre del Producto
- **Longitud**: Entre 2 y 50 caracteres
- **Obligatorio**: No puede estar vacío

#### Precio
- **Formato**: Número positivo con máximo 2 decimales
- **Ejemplo**: 123.45, 1000, 99.99

#### Descripción
- **Longitud**: Entre 10 y 1000 caracteres
- **Caracteres**: Cualquier carácter (espacios, saltos de línea, símbolos)

#### Materiales
- **Cantidad**: Mínimo 2 materiales por producto
- **Selección**: Múltiple mediante checkboxes

### Mensajes de Error Personalizados
El sistema muestra alertas específicas para cada tipo de error:
- Campo vacío
- Formato incorrecto
- Longitud incorrecta
- Código duplicado

## 🗄️ Base de Datos

### Tablas Principales
- **products**: Información de productos
- **materials**: Catálogo de materiales
- **currencies**: Monedas disponibles
- **warehouses**: Bodegas
- **branches**: Sucursales por bodega
- **product_materials**: Relación productos-materiales

### Administración de BD
Acceder a Adminer: `http://localhost/stock/adminer.php`

## 🔧 Desarrollo

### Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Base de Datos**: PostgreSQL
- **Servidor**: Apache (XAMPP)

### API Endpoints
- `GET /backend/get_materials.php` - Obtener materiales
- `GET /backend/get_warehouses.php` - Obtener bodegas
- `GET /backend/get_currencies.php` - Obtener monedas
- `GET /backend/get_branches.php?warehouse_id=X` - Obtener sucursales
- `GET /backend/check_code.php?code=X` - Verificar código
- `POST /backend/insert_product.php` - Crear producto
- `POST /backend/associate_materials.php` - Asociar materiales

### Estructura de Respuestas API
```json
{
  "success": true|false,
  "message": "Mensaje descriptivo",
  "data": {...},
  "error": "Mensaje de error si aplica"
}
```

## 🐛 Solución de Problemas

### Error de Conexión a BD
1. Verificar que PostgreSQL esté ejecutándose
2. Revisar credenciales en `.env`
3. Probar conexión: `http://localhost/stock/backend/test_connection.php`

### Error 500 - Internal Server Error
1. Verificar logs de Apache en XAMPP
2. Revisar permisos de archivos
3. Verificar sintaxis PHP

### Validaciones No Funcionan
1. Verificar que JavaScript esté habilitado
2. Revisar consola del navegador (F12)
3. Verificar que no hay errores en `script.js`

### Datos No Se Guardan
1. Verificar conexión a base de datos
2. Revisar restricciones de la BD
3. Verificar logs de PostgreSQL

## 📝 Notas de Desarrollo

### Validaciones
- Todas las validaciones se ejecutan solo al enviar el formulario
- No hay validación en tiempo real para mejor UX
- Mensajes de error personalizados con alertas

### Seguridad
- Validación tanto en frontend como backend
- Sanitización de datos de entrada
- Restricciones de integridad en base de datos

### Rendimiento
- Consultas optimizadas con índices
- Validación de unicidad eficiente
- Carga asíncrona de datos dependientes

## 📄 Licencia

Este proyecto es de uso interno y educativo.

## 👥 Contribución

Para contribuir al proyecto:
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- Revisar la sección de solución de problemas
- Verificar logs de error
- Contactar al equipo de desarrollo

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024

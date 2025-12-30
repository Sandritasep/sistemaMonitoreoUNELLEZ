import sqlite3

def setup_database():
    conn = sqlite3.connect('transporte_unellez.db')
    conn.execute("PRAGMA foreign_keys = ON")  # Habilitar foreign keys
    cursor = conn.cursor()
    
    # -- Tabla para tipos de usuario (rol)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rol (
            id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            activo INTEGER DEFAULT 1
        )''')

    # -- Tabla centralizada de usuarios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            cedula TEXT UNIQUE NOT NULL,
            id_rol INTEGER NOT NULL,
            nombre_completo TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            correo TEXT UNIQUE NOT NULL,
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
        )''')
    

    # -- Tabla de administradores
    cursor.execute(''' 
        CREATE TABLE IF NOT EXISTS administrador (
            id_administrador INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            FOREIGN KEY (id_administrador) REFERENCES usuario(id_usuario)
        )''')
    

    # -- Tabla de estudiantes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS estudiante (
            id_estudiante INTEGER PRIMARY KEY,
            carrera TEXT NOT NULL,
            FOREIGN KEY (id_estudiante) REFERENCES usuario(id_usuario)
        )''')
    

    # -- Tabla de empleados
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS empleado (
            id_empleado INTEGER PRIMARY KEY,
            condicion TEXT NOT NULL,
            cargo TEXT NOT NULL,
            FOREIGN KEY (id_empleado) REFERENCES usuario(id_usuario)
        )''')
    

    # -- Tabla de conductores
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conductor (
            id_conductor INTEGER PRIMARY KEY,
            condicion TEXT NOT NULL,
            cargo TEXT NOT NULL,
            dias TEXT,
            turno TEXT,
            estado TEXT DEFAULT 'ACTIVO',
            licencia TEXT NOT NULL,
            FOREIGN KEY (id_conductor) REFERENCES usuario(id_usuario)
        )''')
    

    # -- Tabla de unidades de transporte
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS unidad (
            id_unidad INTEGER PRIMARY KEY AUTOINCREMENT,
            placa TEXT UNIQUE NOT NULL,
            modelo TEXT NOT NULL,
            año INTEGER NOT NULL,
            capacidad_pasajeros INTEGER NOT NULL,
            kilometraje REAL DEFAULT 0,
            tipo_combustible TEXT NOT NULL,
            color TEXT,
            estado TEXT DEFAULT 'ACTIVO',
            fecha_adquisicion TEXT NOT NULL,
            observaciones TEXT
        )''')
    

    # -- Tabla de rutas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ruta (
            id_ruta INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_ruta TEXT NOT NULL UNIQUE,
            id_unidad_asignada INTEGER UNIQUE,
            descripcion_recorrido TEXT NOT NULL,
            estado TEXT DEFAULT 'ACTIVA',
            recorrido TEXT,
            FOREIGN KEY (id_unidad_asignada) REFERENCES unidad(id_unidad)
        )''')
    

    # -- Tabla para relación usuario-ruta
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuario_ruta (
            id_usuario_ruta INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_ruta INTEGER NOT NULL,
            tipo_usuario TEXT NOT NULL,
            fecha_asignacion TEXT NOT NULL,
            fecha_finalizacion TEXT,
            estado TEXT DEFAULT 'ACTIVO',
            FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
            FOREIGN KEY (id_ruta) REFERENCES ruta(id_ruta)
        )''')
    
    # -- Tabla para asignación de conductores a rutas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conductor_asignacion (
            id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
            id_conductor INTEGER NOT NULL,
            id_ruta INTEGER NOT NULL,
            dias_semana TEXT,
            turno TEXT NOT NULL,
            estado TEXT DEFAULT 'ACTIVO',
            FOREIGN KEY (id_conductor) REFERENCES conductor(id_conductor),
            FOREIGN KEY (id_ruta) REFERENCES ruta(id_ruta)
        )''')

    conn.commit()
    
    conn.close()
    print("Base de datos 'transporte_unellez.db' creada exitosamente.")
    print("Foreign keys habilitadas.")

def insert():
    conn = sqlite3.connect('transporte_unellez.db')
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Insertar algunos roles
    cursor.execute("INSERT OR IGNORE INTO rol (nombre) VALUES ('ADMINISTRADOR')")
    cursor.execute("INSERT OR IGNORE INTO rol (nombre) VALUES ('ESTUDIANTE')")
    cursor.execute("INSERT OR IGNORE INTO rol (nombre) VALUES ('EMPLEADO')")
    cursor.execute("INSERT OR IGNORE INTO rol (nombre) VALUES ('CONDUCTOR')")

    conn.commit()

    # Ver sqlite_sequence ahora
    cursor.execute("SELECT * FROM sqlite_sequence WHERE name='rol'")

    conn.close()
    print("exitoooo")

if __name__ == '__main__':
    insert()
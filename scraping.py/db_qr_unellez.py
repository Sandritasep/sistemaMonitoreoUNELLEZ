import sqlite3

def setup_database():
    conn = sqlite3.connect('db_qr_unellez.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS estudiantes (
        cedula INTEGER PRIMARY KEY,
        nombre_completo TEXT,
        carrera TEXT,
        fecha_nacimiento TEXT,
        ruta_elegida TEXT,
        user_name TEXT,
        password TEXT,
        email TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin(
        cedula INTEGER PRIMARY KEY,
        user_name TEXT UNIQUE,
        password TEXT
        ) ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS choferes(
        cedula INTEGER PRIMARY KEY,
        nombre_completo TEXT UNIQUE,
        user_name TEXT UNIQUE,
        password TEXT,
        ruta_asignada TEXT,
        horario_dias TEXT
        ) ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS profesores_trabajadores(
        cedula INTEGER PRIMARY KEY,
        nombre_completo TEXT,
        condicion TEXT,
        cargo TEXT,
        user_name TEXT UNIQUE,
        password TEXT,
        ruta_elegida TEXT,
        email TEXT
        ) ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS rutas(
        nombre_ruta TEXT PRIMARY KEY,
        recorrido TEXT,
        paradas TEXT,
        horario_H TEXT,
        unidad_bus TEXT
        ) ''')
    

    conn.commit()
    conn.close()
    print("Base de datos 'db_qr_unellez.db' creada/verificada con éxito.")
    print("Tablas 'admin', 'choferes', 'prof/trabajadores' y 'rutas' creadas con exito.")

def eliminar_user():
    # Conectar a la base de datos
    conn = sqlite3.connect('db_qr_unellez.db')
    cursor = conn.cursor()

    # ID del estudiante a eliminar
    id_a_eliminar = 30409477

    # Ejecutar la sentencia DELETE
    cursor.execute("DELETE FROM estudiantes WHERE cedula = ?", (id_a_eliminar,))

    # Guardar los cambios y cerrar la conexión
    conn.commit()
    conn.close()

    print("Registro eliminado correctamente.", id_a_eliminar)   

def agregar_tabla():
    conn = sqlite3.connect('db_qr_unellez.db')  # reemplaza con el nombre de tu BD
    cursor = conn.cursor()

    # Agregar la columna email a la tabla existente
    cursor.execute('''
        ALTER TABLE profesores_trabajadores 
        ADD COLUMN email TEXT
    ''')

    conn.commit()

    # Verificar que la columna se agregó correctamente
    cursor.execute("PRAGMA table_info(profesores_trabajadores)")
    columnas = cursor.fetchall()
    print("Columnas de la tabla:")
    for columna in columnas:
        print(f"Nombre: {columna[1]}, Tipo: {columna[2]}")

    # Cerrar la conexión
    conn.close()

if __name__ == '__main__':
    eliminar_user()
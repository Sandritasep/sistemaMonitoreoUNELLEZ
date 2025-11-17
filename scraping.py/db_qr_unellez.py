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
        ruta_elegida TEXT
    )
    ''')
    conn.commit()
    conn.close()
    print("Base de datos 'db_qr_unellez.db' creada/verificada con éxito.")

if __name__ == '__main__':
    setup_database()
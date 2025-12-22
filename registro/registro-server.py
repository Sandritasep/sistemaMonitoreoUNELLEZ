from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import time
import bcrypt
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DB_NAME = 'db_qr_unellez.db'

temp_student_data = {}
temp_worker_data = {}

# ==============================
# FUNCIONES DE SEGURIDAD PARA CONTRASEÑAS
# ==============================
def hash_password(password):
    """Convierte una contraseña de texto plano a hash seguro"""
    # Genera un salt y hashea la contraseña
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

def verify_password(plain_password, hashed_password):
    """Verifica si una contraseña en texto plano coincide con el hash"""
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)


def detectar_tipo_url(url):
    print(f"Analizando URL: {url}")

    if "/portal/index.php?qr" in url.lower():
        return "estudiante"
    elif "/consulta_estudiantes.php?" in url.lower():
        return "estudiante"
    
    elif "car_familiar.php" in url.lower():
        return "trabajador"
    else:
        print(f"URl no reconocida: {url}")
        return "desconocido"
    
def scraping_estudiante(driver):
    """Scraping para estudiantes (código existente)"""
    data = {}
    
    success_divs = driver.find_elements(By.CLASS_NAME, 'panel-success')
    
    if not success_divs:
        data['estado'] = 'ACCESO DENEGADO'
        data['motivo'] = 'Estudiante no inscrito o credenciales no válidas (alert-danger o no encontrado).'
        return data

    data['estado'] = 'ACCESO PERMITIDO'
    data['tipo'] = 'estudiante'
    dd_elements = driver.find_elements(By.TAG_NAME, 'dd')
    
    cedula_str = dd_elements[0].text.strip() if len(dd_elements) > 0 else None
    
    if not cedula_str or not cedula_str.isdigit():
         data['estado'] = 'ERROR'
         data['motivo'] = 'No se pudo extraer una cédula válida del HTML.'
         return data

    data['cedula'] = int(cedula_str)
    data['nombres_apellidos'] = dd_elements[1].text.strip() if len(dd_elements) > 1 else 'N/A'
    data['fecha_nacimiento'] = dd_elements[2].text.strip() if len(dd_elements) > 2 else 'N/A'

    # Carrera (Dentro de .panel-heading > b)
    try:
         carrera_element = driver.find_element(By.CSS_SELECTOR, 'div.panel-heading b')
         data['carrera'] = carrera_element.text.strip()[:-2]
    except:
         data['carrera'] = 'N/A'

    print('Datos estudiante: ', data['cedula'], data['nombres_apellidos'], data['carrera'], data['fecha_nacimiento'])
    return data

def scraping_trabajador(driver):
    """Scraping para trabajadores"""
    data = {}
    
    try:
        # Buscar el div con style='text-align: center'
        center_div = driver.find_element(By.CSS_SELECTOR, "div[style='text-align: center']")
        
        # Buscar todos los elementos h4 dentro del div
        h4_elements = center_div.find_elements(By.TAG_NAME, 'h4')

        # Extraer información de los h4
        data['estado'] = 'ACCESO PERMITIDO'
        data['tipo'] = 'trabajador'
        data['nombre_completo'] = h4_elements[0].text.strip() if h4_elements[0].text else 'N/A'
        data['cedula'] = h4_elements[1].text[5:-1] if h4_elements[1].text else 'N/A'
        data['condicion'] = h4_elements[2].text[17:] if h4_elements[2].text else 'N/A'
        data['cargo'] = h4_elements[3].text[8:] if h4_elements[3].text else 'N/A'

        print(data['cedula'])
        print(data['nombre_completo'],',',data['condicion'],',',data['cargo'])
        return data

    except Exception as e:
        data['estado'] = 'ERROR'
        data['motivo'] = f'Error en scraping de trabajador: {str(e)}'
        return data
    
def verificar_usuario_registrado(cedula, tipo):
    """Verifica si la cédula ya existe en la tabla correspondiente"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    existe = False
    try:
        if tipo == 'estudiante':
            cursor.execute('SELECT 1 FROM estudiantes WHERE cedula = ?', (cedula,))
        elif tipo == 'trabajador':
            cursor.execute('SELECT 1 FROM profesores_trabajadores WHERE cedula = ?', (cedula,))
            
        if cursor.fetchone():
            existe = True
            print("usuario ",cedula, " ya esta registrado ", tipo)
    except Exception as e:
        print(f"Error verificando registro: {e}")
    finally:
        conn.close()
        
    return existe

def analizar_qr_con_selenium(qr_content):
    
    url = qr_content
    
    options = Options()
    options.add_argument("--headless") 
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    data = {}
    
    try:
        driver.get(url)
        time.sleep(1.5)

        tipo = detectar_tipo_url(url)
        print(f"Tipo detectado: {tipo}")

        if tipo == "estudiante":
            data = scraping_estudiante(driver)
        elif tipo == "trabajador":
            data = scraping_trabajador(driver)
        else:
            data['estado'] = 'ERROR'
            data['motivo'] = 'Tipo de URL no reconocido'
        
        driver.quit()
        return data

    except Exception as e:
        print(f"Error durante el scraping: {e}")
        driver.quit()
        return {'estado': 'ERROR', 'motivo': str(e)}

def guardar_datos_estudiante(datos):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print('datos etudiante recibidos en guardar_datos: ',datos)
    
    try:
        cedula_int = int(datos.get('cedula'))
        
        # Hashear la contraseña antes de guardarla
        password_plain = datos.get('password')
        password_hashed = hash_password(password_plain)

        cursor.execute('''
        INSERT INTO estudiantes (cedula, nombre_completo, carrera, fecha_nacimiento, ruta_elegida, user_name, password, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            cedula_int,
            datos.get('nombres_apellidos'),
            datos.get('carrera'),
            datos.get('fecha_nacimiento'),
            datos.get('ruta_elegida'),
            datos.get('user_name'),
            password_hashed,
            datos.get('email')
        ))
        conn.commit()
        print(f"Datos de estudiante {cedula_int} guardados/actualizados en la base de datos.")
        
    except Exception as e:
        print(f"Error al guardar en la base de datos: {e}")
        raise e
    finally:
        conn.close()

def guardar_datos_trabajador(datos):
    """Guardar datos de trabajador en la base de datos"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print('Datos trabajador recibidos en guardar_datos: ', datos)
    
    try:
        cedula_int = int(datos.get('cedula'))  

        # Hashear la contraseña antes de guardarla
        password_plain = datos.get('password')
        password_hashed = hash_password(password_plain)

        cursor.execute('''
        INSERT INTO profesores_trabajadores (cedula, nombre_completo, condicion, cargo, user_name, password, ruta_elegida, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            cedula_int,
            datos.get('nombre_completo'),
            datos.get('condicion'),
            datos.get('cargo'),
            datos.get('user_name'),
            password_hashed,
            datos.get('ruta_elegida'),
            datos.get('email')
        ))
        conn.commit()
        print(f"Datos de trabajador {datos.get('cedula')} guardados/actualizados en la base de datos.")
        
    except Exception as e:
        print(f"Error al guardar trabajador en la base de datos: {e}")
        raise e
    finally:
        conn.close()

@app.route('/scan-result', methods=['POST'])
def handle_scan_result():
    global temp_student_data, temp_worker_data

    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    if not request.is_json:
        return jsonify({"message": "Falta JSON en la solicitud"}), 400

    data_from_js = request.get_json()
    qr_content = data_from_js.get('qr_result') 

    if not qr_content:
        return jsonify({"success": False, "message": "Falta el contenido del QR ('qr_result')"}), 400
        
    print(f"QR recibido: {qr_content}. Analizando...")
    
    analysis_result = analizar_qr_con_selenium(qr_content)

    if analysis_result['estado'] == 'ACCESO PERMITIDO':
        tipo = analysis_result.get('tipo', 'estudiante')
        cedula_key = analysis_result.get('cedula')

        ya_registrado = verificar_usuario_registrado(cedula_key, tipo)
        
        # Si ya está registrado, devolvemos un flag especial pero NO error
        if ya_registrado:
             print("enviando usuario ya registrado", cedula_key)
             return _corsify_actual_response(jsonify({
                "success": True,
                "access": "GRANTED",
                "isRegistered": True,  # <--- ESTA ES LA CLAVE
                "tipo": tipo,
                "cedula": cedula_key,
                "message": "El usuario ya se encuentra registrado en el sistema."
            })), 200
        
        if tipo == 'estudiante':
            nombres = analysis_result.get('nombres_apellidos', 'N/A').split(' ')
            
            user_data = {
                "tipo": "estudiante", 
                "nombres": nombres,
                "cedula": str(cedula_key), 
                "fechaNac": analysis_result.get('fecha_nacimiento', 'N/A'),
                "carrera": analysis_result.get('carrera', 'N/A'),
                "estudianteActivo": True 
            }

            temp_student_data[qr_content] = user_data

            cedula_key_str = str(cedula_key)
            
            if not cedula_key_str:
                 return jsonify({"success": False, "access": "ERROR", "message": "Fallo interno: Cédula no extraída del HTML."}), 500

            return _corsify_actual_response(jsonify({
                "success": True, 
                "access": "GRANTED",
                "tipo": "estudiante",
                "message": "Acceso permitido. Datos de estudiante cargados.",
                "cedula": qr_content, 
                "userData": user_data 
            })), 200
            
        elif tipo == 'trabajador':
            # Preparar datos para trabajador
            user_data = {
                "tipo": "trabajador",
                "nombre_completo": analysis_result.get('nombre_completo'),
                "cedula": analysis_result.get('cedula'),
                "condicion": analysis_result.get('condicion', 'N/A'),
                "cargo": analysis_result.get('cargo', 'N/A')
            }

            temp_worker_data[qr_content] = user_data

            return _corsify_actual_response(jsonify({
                "success": True, 
                "access": "GRANTED",
                "tipo": "trabajador",
                "message": "Acceso permitido. Datos de trabajador cargados.",
                "cedula": qr_content, 
                "userData": user_data 
            })), 200
    
    elif analysis_result['estado'] == 'ACCESO DENEGADO':
        return _corsify_actual_response(jsonify({
            "success": True,
            "access": "DENIED",
            "message": f"Acceso denegado: {analysis_result['motivo']}",
        })), 200
    else:
        return _corsify_actual_response(jsonify({
            "success": False,
            "access": "ERROR",
            "message": f"Error interno de análisis: {analysis_result['motivo']}",
        })), 500


@app.route('/select-route', methods=['POST'])
def select_route_and_save():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    global temp_student_data, temp_worker_data
    
    if not request.is_json:
        return jsonify({"message": "Falta JSON en la solicitud"}), 400

    data_from_js = request.get_json()
    cedula = data_from_js.get('cedula')
    ruta_elegida = data_from_js.get('ruta_elegida')
    tipo = data_from_js.get('tipo', 'estudiante')

    print('cedula: ' ,cedula)
    print('ruta: ', ruta_elegida)
    print('tipo: ', tipo)

    if tipo == 'estudiante':
        student_data = temp_student_data.get(cedula)
        if not student_data:
            return jsonify({"success": False, "message": "Datos de estudiante no encontrados. Escanee de nuevo."}), 400

        # Guardar la ruta temporalmente
        student_data['ruta_elegida'] = ruta_elegida
        temp_student_data[cedula] = student_data
        
    elif tipo == 'trabajador':
        worker_data = temp_worker_data.get(cedula)
        if not worker_data:
            return jsonify({"success": False, "message": "Datos de trabajador no encontrados. Escanee de nuevo."}), 400

        # Guardar la ruta temporalmente
        worker_data['ruta_elegida'] = ruta_elegida
        temp_worker_data[cedula] = worker_data
        
    else:
        return jsonify({"success": False, "message": "Tipo de usuario no válido."}), 400

    print('Ruta elegida: ', ruta_elegida)
    
    return _corsify_actual_response(jsonify({
        "success": True,
        "message": f"Ruta '{ruta_elegida}' Seleccionada para C.I. {cedula}.",
    })), 200
    
@app.route('/complete-registration', methods=['POST'])
def complete_registration():

    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    

    global temp_student_data, temp_worker_data
    if not request.is_json:
        return jsonify({"message": "Falta JSON en la solicitud"}), 400

    data = request.get_json()
    cedula = data.get('cedula')
    user_name = data.get('user_name')
    password = data.get('password')
    email = data.get('email')
    tipo = data.get('tipo', 'estudiante')

    if not cedula or not user_name or not password or not email:
        return jsonify({"success": False, "message": "Faltan datos para completar el registro."}), 400

    try:
        if tipo == 'estudiante':
            student_data = temp_student_data.get(cedula)
            if not student_data or 'ruta_elegida' not in student_data:
                return jsonify({"success": False, "message": "Datos incompletos. Seleccione ruta antes de registrar."}), 400
            
            # Preparar datos para guardar
            data_to_save = {
                'cedula': student_data['cedula'],
                'nombres_apellidos': ' '.join(student_data.get('nombres', [])) if 'nombres' in student_data else student_data.get('nombres_apellidos'),
                'carrera': student_data['carrera'],
                'fecha_nacimiento': student_data['fechaNac'],
                'ruta_elegida': student_data['ruta_elegida'],
                'user_name': user_name,
                'password': password,
                'email': email
            }
            
            print("Intentando guardar datos de estudiante:", data_to_save)
            guardar_datos_estudiante(data_to_save)

            # Limpiar datos temporales
            if cedula in temp_student_data:
                del temp_student_data[cedula]
                
        elif tipo == 'trabajador':
            worker_data = temp_worker_data.get(cedula)
            if not worker_data or 'ruta_elegida' not in worker_data:
                return jsonify({"success": False, "message": "Datos incompletos. Seleccione ruta antes de registrar."}), 400
            
            # Preparar datos para guardar
            data_to_save = {
                'cedula': worker_data['cedula'],
                'nombre_completo': worker_data['nombre_completo'],
                'condicion': worker_data['condicion'],
                'cargo': worker_data['cargo'],
                'ruta_elegida': worker_data['ruta_elegida'],
                'user_name': user_name,
                'password': password,
                'email': email
            }
            
            print("Intentando guardar datos de trabajador:", data_to_save)
            guardar_datos_trabajador(data_to_save)

            # Limpiar datos temporales
            if cedula in temp_worker_data:
                del temp_worker_data[cedula]
        else:
            return jsonify({"success": False, "message": "Tipo de usuario no válido."}), 400

        return _corsify_actual_response(jsonify({
            "success": True,
            "message": "Registro completado y guardado.",
            "preview": data_to_save
        })), 200
        
    except Exception as e:
        print(f"Error en complete_registration: {e}")
        return _corsify_actual_response(jsonify({
            "success": False,
            "message": f"Error al guardar en la base de datos: {str(e)}"
        })), 500


# Funciones auxiliares para CORS
def _build_cors_preflight_response():
    response = jsonify()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == '__main__':
    print("Iniciando servidor Flask (tres Fases de Comunicación)...")
    app.run(debug=True, port=5000)
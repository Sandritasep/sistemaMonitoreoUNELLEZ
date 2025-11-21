from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DB_NAME = 'db_qr_unellez.db'

temp_student_data = {}

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
        success_divs = driver.find_elements(By.CLASS_NAME, 'panel-success')
        
        if not success_divs:
            data['estado'] = 'ACCESO DENEGADO'
            data['motivo'] = 'Estudiante no inscrito o credenciales no válidas (alert-danger o no encontrado).'
            driver.quit()
            return data

        data['estado'] = 'ACCESO PERMITIDO'
        dd_elements = driver.find_elements(By.TAG_NAME, 'dd')
        
        cedula_str = dd_elements[0].text.strip() if len(dd_elements) > 0 else None
        
        if not cedula_str or not cedula_str.isdigit():
             data['estado'] = 'ERROR'
             data['motivo'] = 'No se pudo extraer una cédula válida del HTML.'
             driver.quit()
             return data
        
        data['cedula'] = int(cedula_str)
        data['nombres_apellidos'] = dd_elements[1].text.strip() if len(dd_elements) > 1 else 'N/A'
        data['fecha_nacimiento'] = dd_elements[2].text.strip() if len(dd_elements) > 2 else 'N/A'

        # 4. Carrera (Dentro de .panel-heading > b)
        try:
             # Buscamos el elemento <b> dentro del div con clase 'panel-heading'
             carrera_element = driver.find_element(By.CSS_SELECTOR, 'div.panel-heading b')
             data['carrera'] = carrera_element.text.strip()[:-2]
        except:
             data['carrera'] = 'N/A'

        print('datos: ',data['cedula'], data['nombres_apellidos'], data['carrera'], data['fecha_nacimiento'])
        driver.quit()
        return data

    except Exception as e:
        print(f"Error durante el scraping: {e}")
        driver.quit()
        return {'estado': 'ERROR', 'motivo': str(e)}

def guardar_datos(datos):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print('datos recibidos en guardar_datos: ',datos)
    
    try:
        cedula_int = int(datos.get('cedula'))
        
        cursor.execute('''
        INSERT OR REPLACE INTO estudiantes (cedula, nombre_completo, carrera, fecha_nacimiento, ruta_elegida, user_name, password, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            cedula_int,
            datos.get('nombres_apellidos'),
            datos.get('carrera'),
            datos.get('fecha_nacimiento'),
            datos.get('ruta_elegida'),
            datos.get('user_name'),
            datos.get('password'),
            datos.get('email')
        ))
        conn.commit()
        print(f"Datos de {cedula_int} guardados/actualizados en la base de datos.")
        
    except Exception as e:
        print(f"Error al guardar en la base de datos: {e}")
        raise e
    finally:
        conn.close()


@app.route('/scan-result', methods=['POST'])
def handle_scan_result():
    global temp_student_data 

    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    if not request.is_json:
        return jsonify({"message": "Falta JSON en la solicitud"}), 400

    data_from_js = request.get_json()
    qr_content = data_from_js.get('qr_result') 

    if not qr_content:
        return jsonify({"success": False, "message": "Falta el contenido del QR ('qr_result')"}), 400
        
    print(f"QR (Cédula) recibido: {qr_content}. Analizando inscripción...")
    
    analysis_result = analizar_qr_con_selenium(qr_content)

    cedula_key = analysis_result.get('cedula')
    
    if analysis_result['estado'] == 'ACCESO PERMITIDO':
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
            "message": "Acceso permitido. Datos de estudiante cargados.",
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
    
    global temp_student_data
    
    if not request.is_json:
        return jsonify({"message": "Falta JSON en la solicitud"}), 400

    data_from_js = request.get_json()
    cedula = data_from_js.get('cedula')
    ruta_elegida = data_from_js.get('ruta_elegida')

    print('cedula: ' ,cedula)
    print('ruta: ', ruta_elegida)

    if not cedula or not ruta_elegida:
        return jsonify({"success": False, "message": "Faltan cédula o ruta elegida."}), 400
        
    student_data = temp_student_data.get(cedula)
    
    if not student_data:
        return jsonify({"success": False, "message": "Datos de estudiante no encontrados. Escanee de nuevo."}), 400

    try:
        # Guardar la ruta temporalmente
        student_data['ruta_elegida'] = ruta_elegida
        temp_student_data[cedula] = student_data
        
        print('Ruta elegida: ', ruta_elegida)
        
        return _corsify_actual_response(jsonify({
            "success": True,
            "message": f"Ruta '{ruta_elegida}' Selecionada para C.I. {cedula}.",
        })), 200
        
    except Exception as e:
        return _corsify_actual_response(jsonify({
            "success": False,
            "message": f"Error de conexion: {str(e)}",
        })), 500
    
@app.route('/complete-registration', methods=['POST'])
def complete_registration():

    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    

    global temp_student_data
    if not request.is_json:
        return jsonify({"message": "Falta JSON en la solicitud"}), 400

    data = request.get_json()
    cedula = data.get('cedula')
    user_name = data.get('user_name')
    password = data.get('password')
    email = data.get('email')

    if not cedula or not user_name or not password or not email:
        return jsonify({"success": False, "message": "Faltan datos para completar el registro."}), 400

    student_data = temp_student_data.get(cedula)
    if not student_data or 'ruta_elegida' not in student_data:
        return jsonify({"success": False, "message": "Datos incompletos. Seleccione ruta antes de registrar."}), 400
    
    try:
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
        
        print("Intentando guardar datos:", data_to_save)
        guardar_datos(data_to_save)

        # Limpiar datos temporales
        if cedula in temp_student_data:
            del temp_student_data[cedula]

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
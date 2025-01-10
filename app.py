from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import pandas as pd
import os
from PIL import Image
import io
import tempfile
import subprocess
import re  # For regular expression matching

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
@app.route('/', methods=['GET'])
def get_data():
    return jsonify({"message": "API is Running"})
@app.route('/measurements', methods=['POST'])
def extract_measurements():
    try:
        # Check if an image is provided in the request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file found in the request'}), 400

        image_file = request.files['image']

        if image_file.filename == '':
            return jsonify({'error': 'No selected image file'}), 400

        # Save the uploaded image temporarily
        temp_image_path = tempfile.mktemp(suffix=".jpeg")
        image = Image.open(io.BytesIO(image_file.read()))
        image.save(temp_image_path)

        # Get the height from the request or use default (72)
        height = request.form.get('height', 72)

        # Define paths
        inference_script_path = 'inference.py'  # Same folder as app.py
        input_folder = 'sample_data/input'
        final_image_path = os.path.join(input_folder, os.path.basename(temp_image_path))
        os.makedirs(input_folder, exist_ok=True)
        os.rename(temp_image_path, final_image_path)  # Move the image to sample_data/input

        # Use the full path of the Python executable in the virtual environment
        python_executable = 'myenv/Scripts/python'  # Windows
        # python_executable = 'myenv/bin/python'  # macOS/Linux

        command = f'"{python_executable}" "{inference_script_path}" -i "{final_image_path}" -ht {height}'
        print(command)  # For debugging

        # Run the command with subprocess
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        # If an error occurs during inference
        if process.returncode != 0:
            error_message = stderr.decode('utf-8')
            print(f'Error running inference: {error_message}')  # For debugging
            return jsonify({'error': f'Error running inference: {error_message}'})

        # Extract measurements from the result
        result_message = stdout.decode('utf-8')
        print(f'Result from inference: {result_message}') # For debugging
        
        # Use regular expressions to extract measurements
        measurements = {}
        try:
            # Example regex patterns, adjust according to your output format
            measurements['height'] = float(re.search(r'height:\s*([\d.]+)', result_message).group(1))
            measurements['waist'] = float(re.search(r'waist:\s*([\d.]+)', result_message).group(1))
            measurements['hips'] = float(re.search(r'hips:\s*([\d.]+)', result_message).group(1))
            measurements['chest'] = float(re.search(r'chest:\s*([\d.]+)', result_message).group(1))
        except AttributeError as e:
            print(f'Error parsing measurements: {str(e)}')
            return jsonify({'error': 'Failed to parse measurements from the result'}), 500
        print(measurements)
        measurements['height_cm'] = measurements['height'] * 2.54
        result = {
            'height': int(measurements['height_cm']),
            'waist': int(measurements['waist']),
            'chest': int(measurements['chest']),
            'hips': int(measurements['hips'])
        }
        print(result)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'An error occurred while processing the image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)

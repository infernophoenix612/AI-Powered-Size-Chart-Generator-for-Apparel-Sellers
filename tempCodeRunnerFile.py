from flask import Flask, request, jsonify, send_from_directory
import joblib
import numpy as np

app = Flask(__name__, static_folder='build', static_url_path='')

# Load the pre-trained models
kmeans_male_top = joblib.load('kmeans_male_top.pkl')
kmeans_male_bottom = joblib.load('kmeans_male_bottom.pkl')
kmeans_female_top = joblib.load('kmeans_female_top.pkl')
kmeans_female_bottom = joblib.load('kmeans_female_bottom.pkl')

# Define size labels for mapping clusters to sizes
male_top_size_labels = {0: 'S', 1: 'M', 2: 'L', 3: 'XL'}
male_bottom_size_labels = {0: 'S', 1: 'M', 2: 'L', 3: 'XL'}
female_top_size_labels = {0: 'XS', 1: 'S', 2: 'M', 3: 'L'}
female_bottom_size_labels = {0: 'XS', 1: 'S', 2: 'M', 3: 'L'}

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    # Validate input
    gender = data.get('gender')
    measurements = data.get('measurements')

    if gender not in ['Male', 'Female']:
        return jsonify({'error': 'Invalid gender'}), 400

    if not isinstance(measurements, list) or len(measurements) != 6:
        return jsonify({'error': 'Invalid measurements data'}), 400

    new_data = np.array(measurements).reshape(1, -1)

    if gender == 'Male':
        top_prediction = kmeans_male_top.predict(new_data)[0]
        bottom_prediction = kmeans_male_bottom.predict(new_data)[0]

        top_size = male_top_size_labels.get(top_prediction, 'Unknown')
        bottom_size = male_bottom_size_labels.get(bottom_prediction, 'Unknown')

    elif gender == 'Female':
        top_prediction = kmeans_female_top.predict(new_data)[0]
        bottom_prediction = kmeans_female_bottom.predict(new_data)[0]

        top_size = female_top_size_labels.get(top_prediction, 'Unknown')
        bottom_size = female_bottom_size_labels.get(bottom_prediction, 'Unknown')

    return jsonify({'top_size': top_size, 'bottom_size': bottom_size})

if __name__ == '__main__':
    app.run(port=5000, debug=True)

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
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
UPLOAD_FOLDER = 'uploads'
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)
def assign_size_labels(centroids, size_labels):
    feature_index = 0
    feature_values = centroids[:, feature_index]
    sorted_indices = sorted(range(len(feature_values)), key=lambda i: feature_values[i])
    size_mapping = {i: size_labels[idx] for i, idx in enumerate(sorted_indices)}
    return size_mapping

def map_cup_size(cup_size):
    cup_size_mapping = {
        'AA': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'DD': 6, 'E': 7, 'F': 8, 'G': 9, 'H': 10
    }
    return cup_size_mapping.get(cup_size, 0)
def map_num_to_cup_size(cup_size):
    cup_size_mapping = {
        '1': 'AA', '2': 'A', '3': 'B', '4': 'C', '5': 'D', '6': 'DD', '7': 'E', '8': 'F', '9': 'G', '10': 'H'
    }
    return cup_size_mapping.get(cup_size, '')

def calculate_accuracy(confidence_score):
    max_distance = 10
    accuracy_percentage = max(0, (1 - (confidence_score / max_distance)) * 100)
    return round(accuracy_percentage, 2)

# Load pre-trained models and scalers
kmeans_male_top = joblib.load('kmeans_male_top.pkl')
kmeans_male_bottom = joblib.load('kmeans_male_bottom.pkl')
kmeans_female_top = joblib.load('kmeans_female_top.pkl')
kmeans_female_bottom = joblib.load('kmeans_female_bottom.pkl')

scaler_male_top = joblib.load('scaler_male_top.pkl')
scaler_male_bottom = joblib.load('scaler_male_bottom.pkl')
scaler_female_top = joblib.load('scaler_female_top.pkl')
scaler_female_bottom = joblib.load('scaler_female_bottom.pkl')

male_top_size_labels = assign_size_labels(kmeans_male_top.cluster_centers_, ['S', 'M', 'L', 'XL'])
male_bottom_size_labels = assign_size_labels(kmeans_male_bottom.cluster_centers_, ['S', 'M', 'L', 'XL'])
female_top_size_labels = assign_size_labels(kmeans_female_top.cluster_centers_, ['XS', 'S', 'M', 'L'])
female_bottom_size_labels = assign_size_labels(kmeans_female_bottom.cluster_centers_, ['XS', 'S', 'M', 'L'])

@app.route('/', methods=['GET'])
def get_data():
    return jsonify({"message": "API is Running"})

@app.route("/upload", methods=['POST'])
def upload():
    try:
        name = request.form.get('name')
        age = request.form.get('age')
        gender = request.form.get('gender')
        height = int((request.form.get('height', 0)))
        weight = int((request.form.get('weight', 0)))
        chest = int((request.form.get('chest', 0)))
        waist = int((request.form.get('waist', 0)))
        hips = int((request.form.get('hips', 0)))
        cupSize = map_cup_size(request.form.get('cupSize', ''))
        bodyShapeIndex = int(request.form.get('bodyShapeIndex', 0))
        clothingType = request.form.get('clothingType')

        size_labels = None
        confidence_scores = None
        print(height)
        print(weight)
        print(chest)
        if gender == 'male':
            if clothingType == 'topWear':
                features = np.array([height, weight, chest]).reshape(1, -1)
                features_scaled_top = scaler_male_top.transform(features)
                male_top_predictions = kmeans_male_top.predict(features_scaled_top)
                size_labels = [male_top_size_labels[cluster] for cluster in male_top_predictions]
                distances = cdist(features_scaled_top, kmeans_male_top.cluster_centers_)
                confidence_scores = distances.min(axis=1).tolist()
            elif clothingType == 'bottomWear':
                features = np.array([height, weight, waist, hips]).reshape(1, -1)
                features_scaled_bottom = scaler_male_bottom.transform(features)
                male_bottom_predictions = kmeans_male_bottom.predict(features_scaled_bottom)
                size_labels = [male_bottom_size_labels[cluster] for cluster in male_bottom_predictions]
                distances = cdist(features_scaled_bottom, kmeans_male_bottom.cluster_centers_)
                confidence_scores = distances.min(axis=1).tolist()
        elif gender == 'female':
            if clothingType == 'topWear':
                features = np.array([height, weight, chest, cupSize]).reshape(1, -1)
                features_scaled_top = scaler_female_top.transform(features)
                female_top_predictions = kmeans_female_top.predict(features_scaled_top)
                size_labels = [female_top_size_labels[cluster] for cluster in female_top_predictions]
                distances = cdist(features_scaled_top, kmeans_female_top.cluster_centers_)
                confidence_scores = distances.min(axis=1).tolist()
            elif clothingType == 'bottomWear':
                features = np.array([height, weight, waist, hips]).reshape(1, -1)
                features_scaled_bottom = scaler_female_bottom.transform(features)
                female_bottom_predictions = kmeans_female_bottom.predict(features_scaled_bottom)
                size_labels = [female_bottom_size_labels[cluster] for cluster in female_bottom_predictions]
                distances = cdist(features_scaled_bottom, kmeans_female_bottom.cluster_centers_)
                confidence_scores = distances.min(axis=1).tolist()
        else:
            return jsonify({'error': 'Invalid gender or clothing type'})

        accuracy_percentage = [calculate_accuracy(score) for score in confidence_scores]

        return jsonify({'Prediction': size_labels, 'Confidence_Scores': confidence_scores, 'Accuracy_Percentages': accuracy_percentage})

    except Exception as e:
        return jsonify({'error': f'An error occurred while processing the request: {str(e)}'})

EXCEL_FILE_PATH = './feedback_data.xlsx'

@app.route('/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        feedback_options = data.get('feedbackOptions', {})
        feedback = "loose"  # Default value
        
        # Check the feedback options using dictionary access
        if feedback_options.get('loose'):
            feedback = "Loose"
        elif feedback_options.get('fit'):
            feedback = "Perfect Fit"
        elif feedback_options.get('tight'):
            feedback = "Tight"
        feedback_data = {
            'Gender': data.get('gender', ''),
            'Height': data.get('height', ''),
            'Weight': data.get('weight', ''),
            'Chest': data.get('chest', ''),
            'Waist': data.get('waist', ''),
            'Hips': data.get('hips', ''),
            'Clothing_Type': data.get('clothingType', ''),
            'Cup Size': map_num_to_cup_size(data.get('cupSize', '')),
            'Body Shape Index': data.get('bodyShapeIndex', ''),
            'Predicted Size': data.get('size',[''])[0],
            'Feedback': feedback
        }
        feedback_df = pd.DataFrame([feedback_data])
        print(data.get('feedbackOptions', {}))
        print(feedback_data)

        if os.path.exists(EXCEL_FILE_PATH):
            existing_df = pd.read_excel(EXCEL_FILE_PATH, sheet_name='Feedback', engine='openpyxl')
            combined_df = pd.concat([existing_df, feedback_df], ignore_index=True)
        else:
            combined_df = feedback_df

        with pd.ExcelWriter(EXCEL_FILE_PATH, engine='openpyxl') as writer:
            combined_df.to_excel(writer, sheet_name='Feedback', index=False)

        return jsonify({'message': 'Feedback data received and saved successfully'})
    except Exception as e:
        return jsonify({'error': f'An error occurred while processing the feedback data: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True,port=5000)




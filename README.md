# AI-Powered Size Recommendation System

This repository contains the implementation of an AI-powered size recommendation system. The project integrates machine learning, computer vision, and web technologies to recommend accurate apparel sizes based on body measurements. It leverages k-means clustering for size prediction, Flask for the backend, React for the frontend, and an existing OpenCV-TensorFlow model for extracting dimensions from images.

## Features

- **AI-Driven Size Prediction:** Utilizes k-means clustering to generate size labels (S, M, L, XL, etc.) from body measurement data.
- **Image-Based Dimension Extraction:** Employs a pre-trained OpenCV-TensorFlow model to analyze uploaded images and determine key body measurements.
- **Interactive Frontend:** A responsive React-based interface for user interactions.
- **Backend Integration:** Flask API for data processing, prediction, and communication with the frontend.
- **Comprehensive Size Chart:** Generates a detailed size chart for sellers based on the body measurement dataset and clustering results.

## Project Workflow

1. **Data Preprocessing:**
   - Dataset contains features like gender, height, weight, waist, bust/chest, hips, and cup size.
   - Features are normalized, and categorical variables (e.g., gender and cup size) are converted to numerical representations.

2. **Clustering:**
   - K-means clustering is applied to group body measurements into size categories.
   - Clusters are labeled using popular brand size charts.

3. **Image Analysis:**
   - Users can upload images.
   - The OpenCV-TensorFlow model extracts dimensions such as height, waist, bust, and hips.

4. **Size Prediction:**
   - Extracted measurements are mapped to the closest cluster.
   - The system recommends an apparel size.

5. **User Feedback:**
   - Collects user feedback to improve model accuracy over time.

## Technologies Used

- **Frontend:** React, Tailwind CSS
- **Backend:** Flask, Python
- **Machine Learning:** Scikit-learn (for k-means clustering)
- **Computer Vision:** OpenCV, TensorFlow (pre-trained model for image processing)
- **Deployment:** Docker (optional), AWS/Heroku (optional)

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or Yarn

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_folder>/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask server:
   ```bash
   flask run
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd <repository_folder>/frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Connecting Frontend and Backend
Ensure the Flask backend is running on `http://localhost:5000` and update the API URL in the React app as needed.

## Usage
- Access the web application via the React frontend.
- Upload a picture for size prediction or manually input body measurements.
- View recommended sizes based on uploaded data.
- Sellers can generate and download comprehensive size charts.

## Dataset
The project uses a body measurement dataset containing the following features:
- Gender
- Height (converted to cm)
- Weight (kg)
- Waist (inches)
- Bust/Chest (inches)
- Hips (inches)
- Cup Size (numerical values for females)
- Body Shape Index

Clusters generated from k-means are labeled using external brand size charts.

## Pre-trained Model
The image analysis functionality in this project uses a pre-trained OpenCV-TensorFlow model from [this repository](https://github.com/farazBhatti/Human-Body-Measurements-using-Computer-Vision/tree/master). This model extracts dimensions such as height, waist, bust, and hips from uploaded images.

## Future Enhancements
- Real-time feedback loop to improve clustering accuracy.
- Support for additional garment types.
- Enhanced privacy measures for uploaded images.

## Acknowledgements
- OpenCV and TensorFlow communities for pre-trained models.
- [Faraz Bhatti's Repository](https://github.com/farazBhatti/Human-Body-Measurements-using-Computer-Vision/tree/master) for the pre-trained model.
- Popular apparel brands for size chart references.

Feel free to contribute or raise issues to improve the project!


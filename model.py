import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import joblib
import numpy as np
# Function to convert height from feet and inches to centimeters
def height_to_cm(height_str):
    parts = height_str.split("'")
    feet = int(parts[0].strip())
    inches = int(parts[1].strip().replace('\"', ''))
    total_inches = (feet * 12) + inches
    return total_inches * 2.54

# Function to convert cup sizes to numerical values
def cup_size_to_numeric(cup_size):
    cup_size_mapping = {
        'AA': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'DD': 6, 'E': 7, 'F': 8
    }
    return cup_size_mapping.get(cup_size, 0)  # Default to 0 if unknown cup size

# Load your dataset
data = pd.read_csv('./body_measurements_dataset.csv')

# Convert height to cm
data['Height_cm'] = data['Height'].apply(height_to_cm)
data = data.drop(columns=['Height'])

# Convert cup sizes to numerical values
data['Cup_Size_Num'] = data['Cup Size'].apply(cup_size_to_numeric)

# Split the dataset by gender
data_male = data[data['Gender'] == 'Male'].copy()
data_female = data[data['Gender'] == 'Female'].copy()

# Define features for top and bottom for males
male_top_features = ['Height_cm', 'Weight', 'Bust/Chest']
male_bottom_features = ['Height_cm', 'Weight', 'Waist', 'Hips']

# Define features for top and bottom for females
female_top_features = ['Height_cm', 'Weight', 'Bust/Chest', 'Cup_Size_Num']
female_bottom_features = ['Height_cm', 'Weight', 'Waist', 'Hips']

# Process and cluster for males
male_top = data_male[male_top_features]
male_bottom = data_male[male_bottom_features]

# Process and cluster for females
female_top = data_female[female_top_features]
female_bottom = data_female[female_bottom_features]

# Standardize data
scaler = StandardScaler()
male_top_scaled = scaler.fit_transform(male_top)
male_bottom_scaled = scaler.fit_transform(male_bottom)
female_top_scaled = scaler.fit_transform(female_top)
female_bottom_scaled = scaler.fit_transform(female_bottom)

# Apply k-means clustering
kmeans_male_top = KMeans(n_clusters=4, random_state=0).fit(male_top_scaled)
kmeans_male_bottom = KMeans(n_clusters=4, random_state=0).fit(male_bottom_scaled)
kmeans_female_top = KMeans(n_clusters=4, random_state=0).fit(female_top_scaled)
kmeans_female_bottom = KMeans(n_clusters=4, random_state=0).fit(female_bottom_scaled)
# Define size labels
def assign_size_labels(centroids, size_labels, feature_index):
    # feature_index = 0  # Adjust this index based on which feature to use for sorting
    feature_values = centroids[:, feature_index]
    sorted_indices = sorted(range(len(feature_values)), key=lambda i: feature_values[i])
    size_mapping = {i: size_labels[idx] for i, idx in enumerate(sorted_indices)}
    return size_mapping

# Assign size labels based on centroids
male_top_size_labels = assign_size_labels(kmeans_male_top.cluster_centers_, ['S', 'M', 'L', 'XL'],2)
male_bottom_size_labels = assign_size_labels(kmeans_male_bottom.cluster_centers_, ['S', 'M', 'L', 'XL'],2)
female_top_size_labels = assign_size_labels(kmeans_female_top.cluster_centers_, ['XS', 'S', 'M', 'L'],2)
female_bottom_size_labels = assign_size_labels(kmeans_female_bottom.cluster_centers_, ['XS', 'S', 'M', 'L'],2)

# Add cluster labels and size labels to the original data using .loc to avoid SettingWithCopyWarning
data_male.loc[:, 'Top_Cluster'] = kmeans_male_top.labels_
data_male.loc[:, 'Bottom_Cluster'] = kmeans_male_bottom.labels_
data_male.loc[:, 'Top_Size'] = data_male['Top_Cluster'].map(male_top_size_labels)
data_male.loc[:, 'Bottom_Size'] = data_male['Bottom_Cluster'].map(male_bottom_size_labels)
data_female.loc[:, 'Top_Cluster'] = kmeans_female_top.labels_
data_female.loc[:, 'Bottom_Cluster'] = kmeans_female_bottom.labels_
data_female.loc[:, 'Top_Size'] = data_female['Top_Cluster'].map(female_top_size_labels)
data_female.loc[:, 'Bottom_Size'] = data_female['Bottom_Cluster'].map(female_bottom_size_labels)

# Save clustered data to Excel
with pd.ExcelWriter('./clustered_data.xlsx') as writer:
    data_male.to_excel(writer, sheet_name='Male', index=False)
    data_female.to_excel(writer, sheet_name='Female', index=False)

# Optional: Dimensionality reduction and 3D plotting
def plot_clusters_3d(data, labels, centroids, title='3D Clustering Plot'):
    pca = PCA(n_components=3)
    data_3d = pca.fit_transform(data)
    centroids_3d = pca.transform(centroids)

    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111, projection='3d')

    scatter = ax.scatter(data_3d[:, 0], data_3d[:, 1], data_3d[:, 2], c=labels, cmap='viridis', marker='o', s=50, alpha=0.6, edgecolor='w')
    ax.scatter(centroids_3d[:, 0], centroids_3d[:, 1], centroids_3d[:, 2], c='red', marker='x', s=200, label='Centroids')

    ax.set_xlabel('PC1')
    ax.set_ylabel('PC2')
    ax.set_zlabel('PC3')
    ax.set_title(title)
    plt.legend()
    plt.show()

# Plotting the clusters in 3D
plot_clusters_3d(data=male_top_scaled, labels=kmeans_male_top.labels_, centroids=kmeans_male_top.cluster_centers_, title='3D Plot for Male Top Clustering')
plot_clusters_3d(data=male_bottom_scaled, labels=kmeans_male_bottom.labels_, centroids=kmeans_male_bottom.cluster_centers_, title='3D Plot for Male Bottom Clustering')
plot_clusters_3d(data=female_top_scaled, labels=kmeans_female_top.labels_, centroids=kmeans_female_top.cluster_centers_, title='3D Plot for Female Top Clustering')
plot_clusters_3d(data=female_bottom_scaled, labels=kmeans_female_bottom.labels_, centroids=kmeans_female_bottom.cluster_centers_, title='3D Plot for Female Bottom Clustering')
joblib.dump(kmeans_male_top, 'kmeans_male_top.pkl')

# Save male bottom model
joblib.dump(kmeans_male_bottom, 'kmeans_male_bottom.pkl')

# Save female top model
joblib.dump(kmeans_female_top, 'kmeans_female_top.pkl')

# Save female bottom model
joblib.dump(kmeans_female_bottom, 'kmeans_female_bottom.pkl')
# Load male top model
kmeans_male_top = joblib.load('kmeans_male_top.pkl')

# Load male bottom model
kmeans_male_bottom = joblib.load('kmeans_male_bottom.pkl')

# Load female top model
kmeans_female_top = joblib.load('kmeans_female_top.pkl')

# Load female bottom model
kmeans_female_bottom = joblib.load('kmeans_female_bottom.pkl')
# New data for prediction
new_male_data = np.array([
    [175, 110, 42],  # Male 1
    [130, 85, 34],  # Male 2
    [180, 120, 34],  # Male 3
    [165, 75, 33],  # Male 4
    [195, 90, 42],
    [185, 20, 25],
    [185, 70, 24] 
])
new_female_data = np.array([
    [165, 55, 28,2],  # Female 1
    [170, 65, 30,3],  # Female 2
    [160, 50, 26,1],  # Female 3
    [175, 70, 32,4],  # Female 4
    [180, 75, 34,5]   # Female 5
])

new_male_data = scaler.fit_transform(new_male_data)
new_female_data = scaler.fit_transform(new_female_data)
# Predict male sizes

male_top_predictions = kmeans_male_top.predict(new_male_data)
# male_bottom_predictions = kmeans_male_bottom.predict(new_male_data)

# Predict female sizes
female_top_predictions = kmeans_female_top.predict(new_female_data)
# female_bottom_predictions = kmeans_female_bottom.predict(new_female_data)

# Map clusters to size labels
male_top_sizes = [male_top_size_labels[cluster] for cluster in male_top_predictions]
# male_bottom_sizes = [male_bottom_size_labels[cluster] for cluster in male_bottom_predictions]

female_top_sizes = [female_top_size_labels[cluster] for cluster in female_top_predictions]
# female_bottom_sizes = [female_bottom_size_labels[cluster] for cluster in female_bottom_predictions]

print("Predicted Male Top Sizes:", male_top_sizes)
# print("Predicted Male Bottom Sizes:", male_bottom_sizes)

print("Predicted Female Top Sizes:", female_top_sizes)
# print("Predicted Female Bottom Sizes:", female_bottom_sizes)


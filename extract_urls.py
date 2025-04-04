import pandas as pd

# Load the dataset
df = pd.read_csv("dataset.csv")

# Ensure correct column names
url_column = "URL"  # Adjust this if needed
label_column = "label"  # Adjust this if needed

# Convert label column to integer (if it's not already)
df[label_column] = pd.to_numeric(df[label_column], errors="coerce")

# Extract phishing URLs (label == 1)
phishing_urls = df[df[label_column] == 1][url_column].head(5).tolist()

# Extract safe URLs (label == 0)
safe_urls = df[df[label_column] == 0][url_column].head(5).tolist()

# Print results
print("Phishing URLs:", phishing_urls)
print("Safe URLs:", safe_urls)



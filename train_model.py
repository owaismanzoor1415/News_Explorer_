import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("news.csv")

df["label"] = df["label"].astype(str).str.lower().str.strip()
df = df[df["label"].isin(["fake", "real"])]

X = df["title"].astype(str)
y = df["label"].map({"fake": 0, "real": 1})

vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_vec = vectorizer.fit_transform(X)

model = LogisticRegression(max_iter=1000)
model.fit(X_vec, y)

with open("model.pkl", "wb") as f:
    pickle.dump((model, vectorizer), f)

print("Model trained on FULL dataset")

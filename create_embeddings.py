import pandas as pd
import faiss
import pickle
import re
from sentence_transformers import SentenceTransformer

def clean_title(text):
    text = str(text).lower()
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\|.*", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    return text.strip()

df = pd.read_csv("news.csv")
df["clean_title"] = df["title"].apply(clean_title)

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(df["clean_title"].tolist(), show_progress_bar=True)

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

faiss.write_index(index, "vector.index")

with open("news.pkl", "wb") as f:
    pickle.dump(df, f)

print("Embeddings created for FULL dataset")

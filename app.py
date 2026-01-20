from flask import Flask, render_template, request, jsonify
import pickle, faiss, numpy as np, re
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

# Load models
embedder = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("vector.index")

with open("news.pkl", "rb") as f:
    df = pickle.load(f)

with open("model.pkl", "rb") as f:
    clf, vectorizer = pickle.load(f)

# ---------- Helper ----------
def clean_title(text):
    text = str(text).lower()
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\|.*", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    return text.strip()

# ---------- Routes ----------
@app.route("/")
def home():
    return render_template("chat.html")

@app.route("/chat", methods=["POST"])
def chat():
    raw_title = request.json["query"]
    title = clean_title(raw_title)

    # Semantic search
    q_emb = embedder.encode([title])
    distances, indices = index.search(np.array(q_emb), k=3)

    matched_rows = df.iloc[indices[0]]
    top_match = matched_rows.iloc[0]

    matched_title = top_match["title"]
    matched_label = top_match["label"]
    matched_text = (
        top_match["text"]
        if "text" in top_match.index
        else "No article text available."
    )

    # -------- Decision logic --------
    if distances[0][0] < 0.8:
        label = matched_label.upper()
        confidence = 95.0
        reason = "Strong match found in dataset"
    else:
        vec = vectorizer.transform([title])
        prob = clf.predict_proba(vec)[0]

        real_prob = prob[1]
        fake_prob = prob[0]
        confidence = round(max(prob) * 100, 2)

        if real_prob > 0.6:
            label = "REAL"
        elif fake_prob > 0.6:
            label = "FAKE"
        else:
            label = "LIKELY REAL (Opinion / Article)"

        reason = "Predicted using ML + semantic similarity"

    return jsonify({
        "label": label,
        "confidence": confidence,
        "reason": reason,
        "matched_title": matched_title,
        "matched_text": matched_text
    })

if __name__ == "__main__":
    app.run(debug=True)

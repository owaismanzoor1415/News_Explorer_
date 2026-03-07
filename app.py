from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
import time

load_dotenv()

app = Flask(__name__)

# API keys
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Hugging Face model endpoint
HF_API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"

headers = {
    "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
    "Content-Type": "application/json"
}



# ---------------- Fetch News ----------------
def get_news(query):

    url = f"https://newsapi.org/v2/everything?q={query}&language=en&sortBy=publishedAt&apiKey={NEWS_API_KEY}"

    try:
        response = requests.get(url)
        data = response.json()

        articles = []

        if data.get("status") == "ok":

            for article in data.get("articles", [])[:10]:

                articles.append({
                    "title": article.get("title", "No title available"),
                    "source": article.get("source", {}).get("name", "Unknown source"),
                    "url": article.get("url", "#")
                })

        return articles

    except Exception as e:
        print("News API error:", e)
        return []


# ---------------- AI Summary (Hugging Face) ----------------
def generate_summary(news):

    if not news:
        return "No news available."

    try:

        text = " ".join([article["title"] for article in news])

        payload = {
            "inputs": text,
            "parameters": {
                "max_length": 150,
                "min_length": 80
            }
        }

        response = requests.post(HF_API_URL, headers=headers, json=payload)

        data = response.json()

        print("HF response:", data)   # debugging

        # successful response
        if isinstance(data, list):
            return data[0]["summary_text"]

        # model loading
        if "error" in data and "loading" in data["error"].lower():
            return "AI model is starting. Please try again in a few seconds."

        # other error
        return "AI summary unavailable."

    except Exception as e:
        print("HuggingFace error:", e)
        return "AI summary unavailable."

# ---------------- Routes ----------------
@app.route("/")
def home():
    return render_template("chat.html")


@app.route("/chat", methods=["POST"])
def chat():

    query = request.json.get("query")

    if not query:
        return jsonify({
            "news": [],
            "summary": "Please enter a topic."
        })

    news = get_news(query)

    summary = generate_summary(news)

    return jsonify({
        "news": news,
        "summary": summary
    })


# ---------------- Run ----------------
if __name__ == "__main__":
    app.run(debug=True)
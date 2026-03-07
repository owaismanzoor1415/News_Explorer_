async function searchNews() {

    const query = document.getElementById("query").value;
    const resultsDiv = document.getElementById("results");

    if (!query) {
        resultsDiv.innerHTML = "<p>Please enter a topic.</p>";
        return;
    }

    resultsDiv.innerHTML = "<p>Loading news...</p>";

    try {

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();

        resultsDiv.innerHTML = "";

        if (data.news.length === 0) {
            resultsDiv.innerHTML = "<p>No news found.</p>";
            return;
        }

        data.news.forEach(article => {

            const card = `
            <div class="news-card">
                <h3>${article.title}</h3>
                <p class="source">Source: ${article.source}</p>
                <a href="${article.url}" target="_blank">Read full article</a>
            </div>
            `;

            resultsDiv.innerHTML += card;
        });

    } catch (error) {
        resultsDiv.innerHTML = "<p>Error fetching news.</p>";
    }
}
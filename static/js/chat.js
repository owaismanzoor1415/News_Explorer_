let history = JSON.parse(localStorage.getItem("history")) || [];

// Mobile sidebar toggle
function toggleSidebar(){

const sidebar = document.getElementById("sidebar");

sidebar.classList.toggle("active");

/* push history state so back button can close sidebar */
if(sidebar.classList.contains("active")){
history.pushState({sidebar:true}, "");
}

}

// Render search history
function renderHistory(){

const h = document.getElementById("history");

h.innerHTML = `

<div style="display:flex;justify-content:space-between;align-items:center;">
<h3>Recent Searches</h3>
<button onclick="clearHistory()" class="clear-btn">Clear</button>
</div>
`;

history.slice().reverse().forEach((item,index)=>{

h.innerHTML += `

<div class="history-item">

<span onclick="reuse('${item.replace(/'/g,"\'")}')">
${item} </span>

<i class="fa-solid fa-xmark delete-icon"
onclick="deleteItem(${history.length-1-index})"></i>

</div>
`;

});

}

// Delete single history item
function deleteItem(index){

history.splice(index,1);

localStorage.setItem("history",JSON.stringify(history));

renderHistory();

}

// Clear all history
function clearHistory(){

history = [];

localStorage.removeItem("history");

renderHistory();

}

// Reuse search
function reuse(text){
document.getElementById("query").value=text;
}

// Clear chat
function newChat(){
document.getElementById("messages").innerHTML="";
}

// Send query
function send(){

let q = document.getElementById("query").value;

if(!q) return;

// Save search
if(!history.includes(q)){
history.push(q);
localStorage.setItem("history",JSON.stringify(history));
renderHistory();
}

const messages = document.getElementById("messages");

// User message
messages.innerHTML += `

<div class="message user">
${q}
</div>
`;

// Loading
messages.innerHTML += `

<div class="message bot loading">
<i class="fa-solid fa-spinner fa-spin"></i> Fetching latest news...
</div>
`;

fetch("/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({query:q})
})

.then(res=>res.json())

.then(data=>{

document.querySelector(".loading").remove();

let newsHTML="";

data.news.forEach(article=>{

newsHTML += `

<div class="news-card">

<h4>${article.title}</h4>

<p>${article.source}</p>

<a href="${article.url}" target="_blank">
Read full article
</a>

</div>
`;

});

messages.innerHTML += `

<div class="message bot">

<b>AI Summary</b>

<p>${data.summary}</p>

<hr>

${newsHTML}

</div>
`;

messages.scrollTop = messages.scrollHeight;

})

.catch(() => {

document.querySelector(".loading").remove();

messages.innerHTML += `

<div class="message bot">
Error fetching news.
</div>
`;

});

document.getElementById("query").value="";

}

// Load history on start
renderHistory();


/* Handle mobile back button */

window.addEventListener("popstate", function () {

const sidebar = document.getElementById("sidebar");

if(sidebar.classList.contains("active")){
sidebar.classList.remove("active");
}

});
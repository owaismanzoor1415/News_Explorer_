let history = JSON.parse(localStorage.getItem("history")) || [];

function toggleSidebar(){

const sidebar=document.getElementById("sidebar");
const overlay=document.getElementById("overlay");

sidebar.classList.toggle("active");
overlay.classList.toggle("active");

if(sidebar.classList.contains("active")){
window.history.pushState({sidebar:true},"");
}

}

function closeSidebar(){

document.getElementById("sidebar").classList.remove("active");
document.getElementById("overlay").classList.remove("active");

}

document.getElementById("overlay").onclick=closeSidebar;

window.addEventListener("popstate",()=>{

const sidebar=document.getElementById("sidebar");

if(sidebar.classList.contains("active")){
closeSidebar();
}

});

let touchStartX=0;

document.addEventListener("touchstart",e=>{
touchStartX=e.touches[0].clientX;
});

document.addEventListener("touchmove",e=>{

let touchEndX=e.touches[0].clientX;

if(touchStartX-touchEndX>80){
closeSidebar();
}

});

function renderHistory(){

const h=document.getElementById("history");

h.innerHTML=`<h3>Recent Searches</h3>`;

history.slice().reverse().forEach((item,index)=>{

h.innerHTML+=`

<div class="history-item">

<span onclick="reuse('${item}')">${item}</span>

<i class="fa-solid fa-xmark delete-icon"
onclick="deleteItem(${history.length-1-index})"></i>

</div>
`;

});

}

function deleteItem(index){

history.splice(index,1);

localStorage.setItem("history",JSON.stringify(history));

renderHistory();

}

function reuse(text){
document.getElementById("query").value=text;
}

function newChat(){
document.getElementById("messages").innerHTML="";
}

function quickSearch(topic){

document.getElementById("query").value=topic;

send();

}

function send(){

let q=document.getElementById("query").value;

if(!q) return;

if(!history.includes(q)){
history.push(q);
localStorage.setItem("history",JSON.stringify(history));
renderHistory();
}

const messages=document.getElementById("messages");

messages.innerHTML+=`

<div class="message user">
${q}
</div>
`;

messages.innerHTML+=`

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

newsHTML+=`

<div class="news-card">

<h4>${article.title}</h4>

<p>${article.source}</p>

<a href="${article.url}" target="_blank">
Read full article
</a>

</div>
`;

});

messages.innerHTML+=`

<div class="message bot">

<b>AI Summary</b>

<p id="typing"></p>

<hr>

${newsHTML}

</div>
`;

typeText(data.summary);

messages.scrollTop=messages.scrollHeight;

});

document.getElementById("query").value="";

}

function typeText(text){

let i=0;

const el=document.getElementById("typing");

function typing(){

if(i<text.length){

el.innerHTML+=text.charAt(i);

i++;

setTimeout(typing,15);

}

}

typing();

}

renderHistory();
console.log("Content script chargé");

let startX=0;
let startY=0;
let selectionBox=null;
let selectedModel = null;

let analysisMode = null;
let interactionActive = false;
let interactionInterval = null;
let interactionResults = [];
let interactionStartTime = null;
let interactionRect = null;


chrome.runtime.onMessage.addListener((message)=>{
    console.log("message reçu :", message);
    if (message.action === "listDivs") {
        listDivs();
    }
    if(message.action==="activateSelection"){
        selectedModel = SCREEN_MODELS[message.model];
        analysisMode =message.mode;
        activateSelection();
    }
    if(message.action==="processImage"){
        processImage(message.image,message.rect,message.mode);
    }
    if (message.action === "analyseDiv") {
        selectedModel = SCREEN_MODELS[message.model];
        analyseDiv(message.divId);
    }
    if (message.action === "startInteraction") {
        selectedModel = SCREEN_MODELS[message.model];
        startInteraction(message.divId);
    }

    if (message.action === "stopInteraction") {
        stopInteraction();
    }
});


function activateSelection(){
    document.addEventListener("mousedown",mouseDown);
}
function mouseDown(e){
    startX=e.clientX;
    startY=e.clientY;
    selectionBox=document.createElement("div");
    selectionBox.id="pixel-selection-box";
    selectionBox.style.left=startX+"px";
    selectionBox.style.top=startY+"px";
    document.body.appendChild(selectionBox);
    document.addEventListener("mousemove",mouseMove);
    document.addEventListener("mouseup",mouseUp);
}
function mouseMove(e){

    selectionBox.style.width=Math.abs(e.clientX-startX)+"px";
    selectionBox.style.height=Math.abs(e.clientY-startY)+"px";
    selectionBox.style.left=Math.min(startX,e.clientX)+"px";
    selectionBox.style.top=Math.min(startY,e.clientY)+"px";

}
function mouseUp(e){
    let rect={
        x:Math.min(startX,e.clientX),
        y:Math.min(startY,e.clientY),
        width:Math.abs(e.clientX-startX),
        height:Math.abs(e.clientY-startY)

    };
    interactionRect = rect;

    chrome.runtime.sendMessage({action:"capture",rect:rect});
    selectionBox.remove();
    document.removeEventListener("mousemove",mouseMove);
    document.removeEventListener("mouseup",mouseUp);

//     if (analysisMode ==="image") {
//         chrome.runtime.sendMessage({action:"capture",rect:rect});
//     }


//     if (analysisMode === "interaction") {
//         startInteraction(rect);
//   }
}

function processImage(image,rect,mode){
    if (!image) {
        console.warn("Capture reçue sans image");
        return;
    }
    let img=new Image();
    img.onload=()=>{
        let canvas=document.createElement("canvas");
        let ctx=canvas.getContext("2d");
        canvas.width=img.width;
        canvas.height=img.height;
        ctx.drawImage(img,0,0);
        let data=ctx.getImageData(rect.x,rect.y,rect.width,rect.height);
        let result=analyzePixels(data,selectedModel);
        if (mode ==="capture"){
           console.log("RESULTATS",result); 
        }
        if (mode ==="captureInteraction") {
            interactionResults.push(result);
        }
    };

    img.src=image;

}
function analyseDiv(divId) {



    const element = document.getElementById(divId);

    if (!element) {
        alert("Aucun élément avec l'ID \"" +divId );
        return;
    }

    const rect = element.getBoundingClientRect();

    console.log("Élément trouvé :", element);
    console.log("Rectangle :", rect);

    const captureRect = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };


    chrome.runtime.sendMessage({action: "capture",rect: captureRect});

}
function startInteraction(divId) {

    const element = document.getElementById(divId);

    if (!element) {
        alert("Aucun élément avec l'ID");
        return;
    }

    if (interactionActive) {
        return;
    }


    interactionActive = true;
    interactionResults = [];
    interactionStartTime = performance.now();
    createInteractionControls();
    interactionInterval = setInterval(() => {
        if (!interactionActive) {return;}
        const rect = element.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {return;}

        const captureRect = {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };

        chrome.runtime.sendMessage({
            action: "captureInteraction",
            rect: captureRect
        });

    }, 200);

}


function stopInteraction() {

    if (!interactionActive) {return;}

    interactionActive = false;
    clearInterval(interactionInterval);
    interactionInterval = null;
    const controls =document.getElementById("pixel-interaction-controls");

    if (controls) {controls.remove();}
    const duration = performance.now() - interactionStartTime;

    console.log("Interaction terminée");

    console.log("Durée :",duration / 1000,"secondes");
    const statistics = analyzeInteractionResults();
    console.log(
        "Résultats :",
        statistics
    );

}


function createInteractionControls() {

    let controls = document.createElement("div");

    controls.id = "pixel-interaction-controls";

    controls.innerHTML = `
        <div id="pixel-interaction-info">
            Interaction en cours
        </div>
        <button id="pixel-interaction-stop">
            Arrêter
        </button>
    `;

    controls.style.position = "fixed";
    controls.style.top = "20px";
    controls.style.right = "20px";
    controls.style.zIndex = "2147483647";
    controls.style.padding = "10px";
    controls.style.background = "white";
    controls.style.border = "1px solid black";
    controls.style.borderRadius = "5px";
    controls.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";

    document.body.appendChild(controls);

    document.getElementById("pixel-interaction-stop").addEventListener("click", () => {
        stopInteraction();
    });

}

function listDivs() {

    const divs = document.querySelectorAll("div");
    const result = [];

    divs.forEach((div) => {
        if (!div.id) {return;}

        result.push({
            id: div.id
        });

    });
 

    chrome.runtime.sendMessage({
        action: "divList",
        divs: result
    });

}
function analyzeInteractionResults() {

    if (interactionResults.length === 0) {
        return;
    }

    const frames = interactionResults.length;

    const pixelCounts = interactionResults.map(result => result.pixelCount);

    const totalPowers = interactionResults.map(result => result.energy.p_total_ecran);

    const pixelPowers = interactionResults.map(result => result.energy.p_pixel  );

    const meanRatios = interactionResults.map(result => result.energy.mean_ratio);

    const redMeans = interactionResults.map(result => result.rgb.red.mean);

    const greenMeans = interactionResults.map(result => result.rgb.green.mean);

    const blueMeans = interactionResults.map(result => result.rgb.blue.mean);

    const luminanceMeans = interactionResults.map(result => result.luminance.mean);

    const statistics = {
        frames: frames,
        pixels: {
            mean: average(pixelCounts),
            std: standardDeviation(pixelCounts)
        },

        power: {
            p_total__ecran_Mean: average(totalPowers),
            p_total_ecran_Std: standardDeviation(totalPowers),

            p_pixel_Mean: average(pixelPowers),
            p_pixel_Std: standardDeviation(pixelPowers),

            ratioMean: average(meanRatios),
            ratioStd: standardDeviation(meanRatios)
        },

        rgb: {
            redMean: average(redMeans),
            redStd: standardDeviation(redMeans),

            greenMean: average(greenMeans),
            greenStd: standardDeviation(greenMeans),

            blueMean: average(blueMeans),
            blueStd: standardDeviation(blueMeans)
        },

        luminance: {
            mean: average(luminanceMeans),
            std: standardDeviation(luminanceMeans)
        }

    };

    console.log("STATISTIQUES INTERACTION");
    console.log(statistics);

    return statistics;
}
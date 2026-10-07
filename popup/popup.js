console.log("popup chargé");
const modelSelect = document.getElementById("screenModel");


for (const modelId in SCREEN_MODELS) {
  const model = SCREEN_MODELS[modelId];

  const option = document.createElement("option");

  option.value = modelId;
  option.textContent = model.name;

  modelSelect.appendChild(option);
}


document.getElementById("start").addEventListener("click",async ()=>{

    console.log("start");
    const tab = await chrome.tabs.query({
        active:true,
        currentWindow:true
    });
      const selectedModel =modelSelect.value;

    console.log("Envoi du message au content script");
    chrome.tabs.sendMessage(tab[0].id,{
        action:"activateSelection",
        model: selectedModel,
        mode: "image"
    });
    console.log(tab[0].url);

    //window.close();

});
document.getElementById("analyseDiv").addEventListener("click", async () => {

    const divId = document.getElementById("divId").value.trim();

    if (!divId) {
        alert("Veuillez renseigner l'ID du div.");
        return;
    }

    const tab = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });


    chrome.tabs.sendMessage(tab[0].id, {
        action: "analyseDiv",
        model: modelSelect.value,
        mode: "image",
        divId: divId
    });

});


document.getElementById("startInteraction").addEventListener("click", async () => {

    const divId = document.getElementById("divId").value.trim();

    const model = document.getElementById("screenModel").value;

    const tab = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(tab[0].id, {
        action: "startInteraction",
        divId: divId,
        model: model
    });
    window.close()

});
// document.getElementById("stopInteraction").addEventListener("click", async () => {

//     const tab = await chrome.tabs.query({
//         active: true,
//         currentWindow: true
//     });

//     console.log("stop");

//     chrome.tabs.sendMessage(tab[0].id, {
//         action: "stopInteraction"
//     });

// });

document.getElementById("listDivs").addEventListener("click", async () => {
    console.log('1')
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, {
        action: "listDivs"
    });

});

chrome.runtime.onMessage.addListener((message) => {


    if (message.action === "divList") {
        console.log("Liste des divs reçue :", message.divs);
        const select = document.getElementById("divList");
        select.innerHTML = `
            <option value="">
                -- Sélectionner un div --
            </option>
        `;

        message.divs.forEach((div) => {
            const option = document.createElement("option");

            option.value = div.id;
            option.textContent =
                "#" + div.id;

            select.appendChild(option);

        });

    }

});

document.getElementById("divList").addEventListener("change", () => {

    const selectedId =document.getElementById("divList").value;

    if (selectedId) {document.getElementById("divId").value = selectedId;}

});
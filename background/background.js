console.log("Extension chargée");

chrome.runtime.onMessage.addListener((message, sender)=>{
    if(message.action==="capture" || message.action === "captureInteraction") {
        chrome.tabs.captureVisibleTab(null,{},(image)=>{
            chrome.tabs.sendMessage(sender.tab.id,
                {
                    action:"processImage",
                    image:image,
                    mode: message.action,
                    rect:message.rect
                }
            );
        });
    }
    
});
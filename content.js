
// content.js
function getJobTitle() {
    // Vous devez modifier ce sélecteur en fonction du site web cible
    let jobTitleElement = document.querySelector('.job-title-selector'); 
    return jobTitleElement ? jobTitleElement.textContent : 'Job title not found';
}
  
// Écoute les messages du popup pour envoyer le titre de l'offre d'emploi
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "getJobTitle") {
        const jobTitle = await extractJobTitle(document.documentElement.outerHTML);
        sendResponse({ jobTitle: jobTitle });
    }
});

export async function extractJobTitle(html) {
        let extractJobTitlePrompt = 'Depuis ce code html je veux que tu me retourne le titre du poste recherché. Si tu ne trouves pas tu ne dois pas en inventer et retourner NO_JOB_TITLE_FOUND. {{data}}';

        extractJobTitlePrompt = extractJobTitlePrompt.replace('{{data}}', html);
        console.log(extractJobTitlePrompt);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPEN_AI_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o', // Utilisez le modèle que vous souhaitez
                    messages: [{ role: 'user', content: extractJobTitlePrompt }],
                }),
                textContent: extractJobTitlePrompt
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            //document.getElementById('response').textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API ChatGPT:', error);
            document.getElementById('response').textContent = 'Erreur lors de l\'appel à l\'API';
        }

}
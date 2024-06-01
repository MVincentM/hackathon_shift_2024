
document.getElementById("extractButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    // Get the job title
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getHTMLContent,
      },
      async (results) => {
        const html = results[0].result;

        const extractor = new HTMLExtractor(html);
        await extractor.extractJobTitle();

        return;
      }
    );
  });

  return;
});


document.getElementById("getDataButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {

    const search = document.getElementById('JobTitleInput').value;

    await new DataExtractor(search).extractData();
  });

  return;
});


/*document.getElementById("extractButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    // Get the job title
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getHTMLContent,
      },
      async (results) => {
        const html = results[0].result;

        const extractor = new HTMLExtractor(html);
        await extractor.extractJobTitle();

        return;
      }
    );
  });

  return;
});*/

function getHTMLContent() {
  return document.documentElement.outerHTML;
}

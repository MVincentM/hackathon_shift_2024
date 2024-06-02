

document.getElementById("getDataButton").addEventListener("click", async () => {
  /*document.getElementById("searchBlock").style.display = 'none'
  document.getElementById("searchLoadingBlock").style.display = 'block'

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {

    const search = document.getElementById('JobTitleInput').value;

    await new DataExtractor(search).extractData();
  });

  return;*/
  search();
});

document.getElementById("JobTitleInput").addEventListener("keyup", async (e) => {

  console.log(e);
  if (e.key === 'Enter') {
    search();
  }


});


function search() {
  document.getElementById("searchBlock").style.display = 'none'
  document.getElementById("searchLoadingBlock").style.display = 'block'

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {

    const search = document.getElementById('JobTitleInput').value;

    await new DataExtractor(search).extractData();
  });

  return;
}

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

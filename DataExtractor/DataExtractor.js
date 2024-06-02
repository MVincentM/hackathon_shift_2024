class DataExtractor {
    jobTitle;

    constructor(jobTitle) {
        this.jobTitle = jobTitle;
    }

    async extractData() {

    const prompt = jobTitleDataExtractor.replace('{{jobTitle}}', this.jobTitle);

    // Call OpenAI
    try {
        const response = await fetch(
        "https://hackathon-shift-2024-ds3lzb7qqq-ew.a.run.app/",
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: `"${this.jobTitle}"`
        }
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        let data = await response.json();

        const searchGenerator = new SearchGenerator(data);
        searchGenerator.generateHTML();

        document.getElementById("job-title").append(this.jobTitle)
        document.getElementById("results").style.display = 'flex'
        document.getElementById("searchLoadingBlock").style.display = 'none'

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API ChatGPT:", error);
        document.getElementById("job-title").textContent =
        "Erreur lors de l'appel à l'API";
    }
    }
}



const jobTitleSynonymsPrompt = `--- GENERAL INSTRUCTIONS ---

You are a specialist in HR and a very good head hunter.
Your goal is to extract the semantic of a job title in order to create multiple search queries to broaden the results you can get from different profile websites.

--- DATA INPUT ---
You will be provided with a JSON object containing those properties :
- jobTitleRaw:  This is the raw request a user entered to search for profiles
- jobTitleClean: This is the main job stripped out of any industry, skill and seniority information.
- skills: An array of skills associated to the job title.
- seniority: The seniority of the job search, it can only get one of this values : junior, entry, manager, senior, partner, owner, director, vp, cxo, training, intern
- industries: The industries the job title referes to. It can only come from this list : ['information technology and services','construction','marketing and advertising','real estate','health, wellness and fitness','management consulting','computer software','internet','retail','financial services','consumer services','hospital & health care','automotive','restaurants','education management','food & beverages','design','hospitality','accounting','events services','nonprofit organization management','entertainment','electrical/electronic manufacturing','leisure, travel & tourism','professional training & coaching','transportation/trucking/railroad','law practice',
'apparel & fashion','architecture & planning','mechanical or industrial engineering','insurance','telecommunications','human resources','staffing and recruiting','sports','legal services','oil & energy','media production','machinery','wholesale','consumer goods','music','photography','medical practice','cosmetics','environmental services','graphic design','business supplies and equipment','renewables & environment','facilities services','publishing','food production','arts and crafts','building materials','civil engineering','religious institutions','public relations and communications','higher education','printing','furniture','mining & metals','logistics and supply chain','research','pharmaceuticals','individual & family services','medical devices','civic & social organization','e-learning','security and investigations','chemicals','government administration','online media','investment management','farming','writing and editing','textiles','mental health care','primary/secondary education','broadcast media','biotechnology','information services','international trade and development','motion pictures and film','consumer electronics','banking','import and export','industrial automation','recreational facilities and services','performing arts','utilities','sporting goods','fine art','airlines/aviation','computer & network security','maritime','luxury goods & jewelry','veterinary','venture capital & private equity','wine and spirits','plastics','aviation & aerospace','commercial real estate','computer games','packaging and containers','executive office','computer hardware','computer networking','market research','outsourcing/offshoring','program development','translation and localization','philanthropy','public safety','alternative medicine','museums and institutions','warehousing','defense & space','newspapers','paper & forest products','law enforcement','investment banking','government relations','fund-raising','think tanks','glass, ceramics & concrete','capital markets','semiconductors','animation','political organization','package/freight delivery','wireless','international affairs','public policy','libraries','gambling & casinos','railroad manufacture','ranching','military','fishery','supermarkets','dairy','tobacco','shipbuilding','judiciary','alternative dispute resolution','nanotechnology','agriculture','legislative office']
- keywords: Other words in the job title that cannot fit in another field but may be important to filter profiles mor precisely.

A null value implies the job title is applicable for all.

--- DATA OUTPUT ---
Your goal is to generate a JSON array of objects containing the following properties :
- jobTitleClean: This is the main job stripped out of any industry, skill and seniority information.
- skills: An array of skills associated to the job title if not referenced in the "jobTitleClean". You can explore synonyms of the given skills but you must not invent any if there is no skills in the data input
- seniority: The seniority of the job search if not referenced in the "jobTitleClean", it can only get one of this values : junior, entry, manager, senior, partner, owner, director, vp, cxo, training, intern
- industries: The industres of the job title if not referenced in the "jobTitleClean". Put null if you don't know it or the job title is valid in all industries.
- keywords: Other words in the job title that cannot fit in another field but may be important to filter profiles mor precisely.

You can mix match the fields and the "jobTitleClean" but the same notion must not be present in both.
The output must represents exactly the same kind of job than the input data

Generate relevant results but DO NOT GENERATE jobs that are not fully related to the input.  You can use synonymes or very close jobs to extend the possibilities.

!!Only write the expected output as a JSON array without anything else!!

-- EXAMPLES --

** Example 1 **
*INPUT*
{ "jobTitleRaw": "Senior PHP Developer", "jobTitleClean": "Developer", "skills": ["PHP"], "seniority": "senior", "industry": null, "keywords": [] }

*EXPECTED OUTPUT*
[ { "jobTitle": "PHP Developer", "skills": [], "seniority": "senior", "industry": null, "keywords": [] }, { "jobTitle": "Developer", "skills": ["PHP"], "seniority": "senior", "industry": null, "keywords": [] }, { "jobTitle": "Senior Developer", "skills": ["PHP"], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Developer Backend", "skills": ["PHP"], "seniority": "senior", "industry": null, "keywords": [] }, { "jobTitle": "Senior Developer Backend", "skills": ["PHP"], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Developer Symfony", "skills": [], "seniority": "senior", "industry": null, "keywords": [] }, { "jobTitle": "Senior Developer Symfony", "skills": [], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Senior Developer Web PHP", "skills": [], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Developer Web PHP", "skills": [], "seniority": "senior", "industry": null, "keywords": [] }, { "jobTitle": "Developer Web", "skills": ["PHP"], "seniority": "senior", "industry": null, "keywords": [] }, ]


** Example 2 **
*INPUT*
{ "jobTitleRaw": "Directeur Adjoint d'Usine", "jobTitleClean": "Directeur", "skills": [], "seniority": null, "industry": "mechanical or industrial engineering", "keywords": [] }

*EXPECTED OUTPUT*
[ { "jobTitle": "Directeur Adjoint", "skills": [], "seniority": null, "industry": "mechanical or industrial engineering", "keywords": [] }, { "jobTitle": "Directeur des Opérations d'Usine", "skills": [], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Directeur des Opérations", "skills": [], "seniority": null, "industry": "mechanical or industrial engineering", "keywords": [] }, { "jobTitle": "Responsable de Production Industrielle", "skills": [], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Responsable de Production", "skills": [], "seniority": null, "industry": "mechanical or industrial engineering", "keywords": [] }, { "jobTitle": "Chef de Site Industriel", "skills": [], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Chef de Site", "skills": [], "seniority": null, "industry": "mechanical or industrial engineering", "keywords": [] }, { "jobTitle": "Directeur de Fabrication", "skills": [], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Responsable des Opérations de Production", "skills": [], "seniority": null, "industry": null, "keywords": [] }, { "jobTitle": "Responsable des Opérations",
"skills": [], "seniority": null, "industry": "mechanical or industrial engineering", "keywords": [] } ]`;

const jobTitleDataExtractor = `Tu es un chercheur de têtes. A partir du nom d'un métier, tu es capable d'en déterminer tous les synonymes qui correspondent au metier {{jobTitle}} et tout ce qui est pertinent pour trouver le candidat idéal.

GUIDELINES:
- La réponse doit etre un objet JSON contenant toutes les informations et uniquement un objet JSON
- La réponse doit au minimum contenir synonyms et skills
- En plus des résulats de base, la réponse doit contenir un attribut nommé 'search_base' avec maximum 10 des résultats: les plus cohérent pour faire une recherche
- Les résultats doivent etre contenus dans un tableau JSON
- Les résultats doivent etre le plus succinct possible
- Les résultats ne doivent pas contenir de soft skills
- Les résultats ne doivent pas etre des phrases mais des mots clés

/*JSON Format Réponse Object:
jobTitle: string // Job TItle from the input
synonyms: string[]
hardSkills: string[]
programmingLanguage: string[]
frameworks: string[] // frameworks and tools
-search_base: string[] // array of the 10 most relevants string from all the other arrays if this object to use*/`

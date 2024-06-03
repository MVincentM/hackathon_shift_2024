const extractJobTitlePrompt = `Depuis ce code html je veux que tu me retourne le titre du poste recherché. Si tu ne trouves pas tu ne dois pas en inventer et retourner NO_JOB_TITLE_FOUND. 
                {{data}}
                
                GUIDELINES:
                - Tu dois retourner uniquement le nom du poste ou NO_JOB_TITLE_FOUND
                - Tu dois retourner uniquement le nom du poste sans les infos pertinentes (ex: développeur JAVA H/F 25455552 devient développeur JAVA)
                `;

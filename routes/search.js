const express = require('express');
const axios = require('axios');
const config = require('config')
var router = express.Router();

// API call to get last 100 public repos
const RepoAPICall = async date => {
    const accessToken = config.get('token.github');
    return await axios.get(
        'https://api.github.com/search/repositories?q=is:public%20created:%3E'+date.toISOString()+'&page=0&per_page=100', (accessToken && accessToken !== '') ? {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        } : null // if token be then use it, else don't
    );
}

// API call to get languages stats for a repo
const LangAPICall = async url => {
    const accessToken = config.get('token.github');
    return await axios.get(
        url, (accessToken && accessToken !== "") ? {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        } : null // if token be then use it, else don't
    );
}

// whole query and results process wrapped in a func
const searchGitHubAPI = async query => {
    let dateFrom = new Date();
    dateFrom.setHours(dateFrom.getHours() - 2); // gotta specify, else it fetches stuff from ages ago
    let repoList = (await RepoAPICall(dateFrom)).data.items;

    // filter by query
    let res = [];
    for (let i = 0; i < repoList.length; i++) {
        if (repoList[i].language && repoList[i].language.toLowerCase() === query.toLowerCase()) {
            let lgs = (await LangAPICall(repoList[i].languages_url)).data; // fetching stats only for relevants repos
            res.push({
                name: repoList[i].full_name,
                url: repoList[i].clone_url,
                lang: repoList[i].language,
                langln: lgs[repoList[i].language],
                languages: lgs
            });
        }
    }

    return res.sort((a, b) => { // sorting from the biggest number of lines to the smallest
        if (a.langln < b.langln) return 1;
        if (a.langln > b.langln) return -1;
        return 0;
    });
}

/* GET search page. */
router.get('/', async (req, res) => {
    const searchQuery = req.query.q;
    let repos = await searchGitHubAPI(searchQuery);
    return res.render('search', {
        title: `Résultats de la recherche pour "${searchQuery}"`,
        searchResults: {
            hits: repos,
            nbHits: repos.length
        },
        searchQuery: searchQuery
    });
})

module.exports = router;
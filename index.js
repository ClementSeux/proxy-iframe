const express = require("express");
const axios = require("axios"); // Pour effectuer des requêtes HTTP
const https = require("https");
const fs = require("fs");
const { type } = require("os");

const app = express();
const PORT = process.env.PORT || 3004;

const httpsOptions = {
    key: fs.readFileSync(
        "/etc/letsencrypt/live/save.back.clementseux.me/privkey.pem"
    ),
    cert: fs.readFileSync(
        "/etc/letsencrypt/live/save.back.clementseux.me/fullchain.pem"
    ),
};

// Middleware pour gérer les requêtes vers /shop
app.get("/", async (req, res) => {
    try {
        console.log("requete reçue");
        // recupere l'attribut link dans l'url
        // Exemple: /shop?link=https://www.shopmium.com
        const link = req.query.link;
        console.log("link", link);
        // Effectuer une requête GET vers www.shopmium.com
        const response = await axios.get(link, {
            headers: {
                // Supprimer l'en-tête X-Frame-Options
                "X-Frame-Options": undefined,
            },
        });
        console.log("response received");
        console.log("type:", typeof response.data);
        let oldHTML = response.data;
        let str = "test de string";
        str = str.replace("test", "test2");
        console.log("str:", str);

        // remple les liens par "https://www.save.back.me:3004/?link=lien"
        oldHTML = oldHTML.replace(/href="([^"]*)"/g, function (match, p1) {
            return (
                'href="https://www.save.back.clementseux.me:3004/?link=' +
                link +
                p1 +
                '"'
            );
        });

        // remple les liens par "https://www.save.back.me:3004/?link=lien"
        oldHTML = oldHTML.replace(/src="([^"]*)"/g, function (match, p1) {
            return (
                'src="https://www.save.back.clementseux.me:3004/?link=' +
                link +
                p1 +
                '"'
            );
        });

        // oldHTML = oldHTML.replace(
        //     "</body>",
        //     '<div id="logDiv" style="position: fixed; top: 0; right: 0; background-color: white; z-index: 10000; padding: 10px; border: 1px solid black;"></div></body>'
        // );

        // oldHTML = oldHTML.replace(
        //     "</body>",
        //     '<script type="text/javascript">window.onload = function() { function handleURLChange(event) {event.preventDefault();console.log("URL has changed!");}window.addEventListener("hashchange", handleURLChange); window.addEventListener("popstate", handleURLChange);};window.console.log = function(message) {var logDiv = document.getElementById("logDiv");logDiv.innerHTML += message + "<br>";</script></body>'
        // );
        // // Renvoyer le contenu HTML, CSS et JavaScript
        console.log("response modifiée");
        console.log(oldHTML);
        res.send(oldHTML);
    } catch (error) {
        console.error(
            "Erreur lors de la requête vers " + req.query.link + ":",
            error.message
        );
        res.status(500).send("Erreur lors de la récupération du contenu.");
    }
});

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});

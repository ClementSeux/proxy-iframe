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

        oldHTML = oldHTML.replace(
            "</body>",
            '<script>window.onload = function() { function handleURLChange() { console.log("URL has changed!");}window.addEventListener("hashchange", handleURLChange); window.addEventListener("popstate", handleURLChange);};</script></body>'
        );
        // Renvoyer le contenu HTML, CSS et JavaScript
        console.log("response modifiée");
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

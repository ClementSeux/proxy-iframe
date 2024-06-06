const express = require("express");
const axios = require("axios"); // Pour effectuer des requêtes HTTP
const https = require("https");
const fs = require("fs");

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
        response.data.replace(
            "</body>",
            ```
            <script>
            window.onload = function() {
              // Function to be executed when the URL changes
              function handleURLChange() {
                // Your code here
                console.log("URL has changed!");
              }
          
              // Check for URL changes every time the iframe loads a new page
              window.addEventListener("hashchange", handleURLChange);
              window.addEventListener("popstate", handleURLChange);
            };
          </script>
          </body>
          ```
        );
        // Renvoyer le contenu HTML, CSS et JavaScript
        res.send(response.data);
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

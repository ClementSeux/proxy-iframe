const express = require("express");
const axios = require("axios"); // Pour effectuer des requêtes HTTP

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware pour gérer les requêtes vers /shop
app.get("/shop", async (req, res) => {
    try {
        // Effectuer une requête GET vers www.shopmium.com
        const response = await axios.get("https://www.shopmium.com/fr/", {
            headers: {
                // Supprimer l'en-tête X-Frame-Options
                "X-Frame-Options": undefined,
            },
        });
        // replace all href= with localhost:3004/shop
        response.data = response.data.replace(
            'href="https://www.shopmium.com/fr/',
            'href="http:/172.232.32.176:3004/shop/'
        );

        // Renvoyer le contenu HTML, CSS et JavaScript
        res.send(response.data);
    } catch (error) {
        console.error(
            "Erreur lors de la requête vers Shopmium :",
            error.message
        );
        res.status(500).send("Erreur lors de la récupération du contenu.");
    }
});

app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});

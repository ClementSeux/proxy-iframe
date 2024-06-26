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

async function handleRequest(req, res, verb) {
    try {
        console.log("requete reçue");
        // recupere l'attribut link dans l'url
        // Exemple: /shop?link=https://www.shopmium.com
        console.log(req.url);
        const link = req.query.link;
        console.log("link", link);
        // Extrait le nom de domaine de l'URL ex: https://www.google.com/search => https://www.google.com
        const baseSite =
            link.match(/(https?:\/\/[^/]+)/)[1] ||
            link.match(/(http?:\/\/[^/]+)/)[1] ||
            link.match(/(www\.[^/]+)/)[1];

        console.log("baseSite", baseSite);

        let response;

        // Effectuer une requête GET vers www.shopmium.com
        if (verb === "POST") {
            response = await axios.post(link, {
                headers: {
                    // Supprimer l'en-tête X-Frame-Options
                    "X-Frame-Options": undefined,
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } else {
            response = await axios.get(link, {
                headers: {
                    // Supprimer l'en-tête X-Frame-Options
                    "X-Frame-Options": undefined,
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }
        let oldHTML = response.data;

        // target window.location = '/account/sign-in';
        oldHTML = oldHTML.replace(
            /window.location = '([^']*)'/g,
            function (match, p1) {
                return "window.location = '/shop?link=" + baseSite + p1 + "'";
            }
        );

        // remple les liens par "https://www.save.back.me:3004/?link=lien"
        oldHTML = oldHTML.replace(/href="([^"]*)"/g, function (match, p1) {
            if (p1.startsWith("http")) {
                return 'href="' + p1 + '"';
            }
            if (p1.startsWith("www")) {
                return 'href="' + p1 + '"';
            }
            if (p1.startsWith("#")) {
                return 'href="' + p1 + '"';
            }

            return (
                'href="https://www.save.back.clementseux.me:3004/?link=' +
                baseSite +
                p1 +
                '"'
            );
        });

        // remple les liens par "https://www.save.back.me:3004/?link=lien"
        oldHTML = oldHTML.replace(/src="([^"]*)"/g, function (match, p1) {
            if (p1.startsWith("http")) {
                return 'src="' + p1 + '"';
            }
            if (p1.startsWith("www")) {
                return 'src="' + p1 + '"';
            }
            if (p1.startsWith("#")) {
                return 'src="' + p1 + '"';
            }

            return (
                'src="https://www.save.back.clementseux.me:3004/?link=' +
                baseSite +
                p1 +
                '"'
            );
        });

        oldHTML = oldHTML.replace(/url\(([^)]*)\)/g, function (match, p1) {
            if (p1.startsWith("http")) {
                return "url(" + p1 + ")";
            }
            if (p1.startsWith("www")) {
                return "url(" + p1 + ")";
            }
            if (p1.startsWith("#")) {
                return "url(" + p1 + ")";
            }

            return (
                "url(https://www.save.back.clementseux.me:3004/?link=" +
                baseSite +
                p1 +
                ")"
            );
        });

        oldHTML = oldHTML.replace(/app.shopmium.com/g, function (match, p1) {
            return (
                "www.save.back.clementseux.me:3004/?link=" + baseSite + p1 + ")"
            );
        });
        // search for "/cwoffers/clip_fr" and replace it with "www.save.back.clementseux.me:3004/?link=https://www.couponnetwork.fr/cwoffers/clip_fr"
        oldHTML = oldHTML.replace(/\/cwoffers\/clip_fr/g, function (match, p1) {
            return "www.save.back.clementseux.me:3004/?link=https://www.couponnetwork.fr/cwoffers/clip_fr";
        });

        res.set("X-Frame-Options", "ALLOWALL");
        res.set("Access-Control-Allow-Origin", "*");
        res.send(oldHTML);
    } catch (error) {
        console.error(
            "Erreur lors de la requête vers " + req.query.link + ":",
            error.message
        );
        res.status(500).send("Erreur lors de la récupération du contenu.");
    }
}

// Middleware pour gérer les requêtes vers /shop
app.get("/*", async (req, res) => {
    await handleRequest(req, res);
});

app.post("/*", async (req, res) => {
    await handleRequest(req, res);
});

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});

/**
 * CESI Calendar Exporter - Background Script
 * Gère l'authentification OAuth2 pour Google Calendar API
 */

(function() {
    'use strict';

    console.log('[CESI Exporter Background] Service worker initialisé');

    /**
     * Obtient un token d'authentification Google OAuth2
     * @returns {Promise<string>} Le token d'accès
     */
    async function getGoogleAuthToken() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    console.error('[CESI Exporter Background] Erreur OAuth:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (!token) {
                    reject(new Error('Aucun token reçu'));
                    return;
                }

                console.log('[CESI Exporter Background] Token obtenu avec succès');
                resolve(token);
            });
        });
    }

    /**
     * Révoque le token d'authentification actuel
     * Utile pour forcer une nouvelle authentification
     * @param {string} token - Le token à révoquer
     * @returns {Promise<void>}
     */
    async function revokeGoogleAuthToken(token) {
        return new Promise((resolve, reject) => {
            chrome.identity.removeCachedAuthToken({ token }, () => {
                if (chrome.runtime.lastError) {
                    console.error('[CESI Exporter Background] Erreur révocation:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                console.log('[CESI Exporter Background] Token révoqué');
                resolve();
            });
        });
    }

    /**
     * Vérifie si le token est valide en faisant un appel test
     * @param {string} token - Le token à vérifier
     * @returns {Promise<boolean>}
     */
    async function isTokenValid(token) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token);
            return response.ok;
        } catch (error) {
            console.error('[CESI Exporter Background] Erreur validation token:', error);
            return false;
        }
    }

    /**
     * Obtient un token valide, en révoquant l'ancien si nécessaire
     * @returns {Promise<string>}
     */
    async function getValidToken() {
        try {
            // Essayer d'obtenir un token
            let token = await getGoogleAuthToken();

            // Vérifier s'il est valide
            const valid = await isTokenValid(token);

            if (!valid) {
                console.log('[CESI Exporter Background] Token invalide, révocation...');
                await revokeGoogleAuthToken(token);
                token = await getGoogleAuthToken();
            }

            return token;
        } catch (error) {
            console.error('[CESI Exporter Background] Erreur obtention token valide:', error);
            throw error;
        }
    }

    /**
     * Écoute les messages des autres scripts
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getAuthToken') {
            console.log('[CESI Exporter Background] Demande de token reçue');

            getValidToken()
                .then(token => {
                    sendResponse({ success: true, token });
                })
                .catch(error => {
                    sendResponse({ success: false, error: error.message });
                });

            return true; // Indique qu'on va répondre de manière asynchrone
        }

        if (request.action === 'revokeAuthToken') {
            console.log('[CESI Exporter Background] Demande de révocation reçue');

            revokeGoogleAuthToken(request.token)
                .then(() => {
                    sendResponse({ success: true });
                })
                .catch(error => {
                    sendResponse({ success: false, error: error.message });
                });

            return true;
        }
    });

})();

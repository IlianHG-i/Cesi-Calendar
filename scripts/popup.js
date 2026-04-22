/**
 * CESI Calendar Exporter - Popup Script
 * Gère l'interface utilisateur et la génération des fichiers iCal
 */

(function() {
    'use strict';

    // Éléments DOM
    const exportIcsBtn = document.getElementById('exportIcsBtn');
    const exportTwoWeeksBtn = document.getElementById('exportTwoWeeksBtn');
    const exportThreeWeeksBtn = document.getElementById('exportThreeWeeksBtn');
    const exportPngBtn = document.getElementById('exportPngBtn');
    const exportGoogleBtn = document.getElementById('exportGoogleBtn');
    const statusDiv = document.getElementById('status');
    const statusMessage = statusDiv.querySelector('.status-message');
    const infoDiv = document.getElementById('info');
    const weekTitle = infoDiv.querySelector('.week-title');
    const eventCount = infoDiv.querySelector('.event-count');
    const errorDiv = document.getElementById('error');
    const errorMessage = errorDiv.querySelector('.error-message');
    const instructionsDiv = document.getElementById('instructions');
    const helpBox = document.getElementById('helpBox');

    /**
     * Affiche un message de statut
     */
    function showStatus(type, message) {
        statusDiv.className = `status ${type}`;
        statusMessage.textContent = message;
        statusDiv.classList.remove('hidden');
    }

    /**
     * Cache le statut
     */
    function hideStatus() {
        statusDiv.classList.add('hidden');
    }

    /**
     * Affiche une erreur
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    /**
     * Cache l'erreur
     */
    function hideError() {
        errorDiv.classList.add('hidden');
    }

    /**
     * Affiche les informations sur la semaine
     */
    function showInfo(title, count) {
        weekTitle.textContent = title || 'Emploi du temps CESI';
        eventCount.textContent = `${count} événement${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;
        infoDiv.classList.remove('hidden');
    }

    /**
     * Cache les informations
     */
    function hideInfo() {
        infoDiv.classList.add('hidden');
    }

    /**
     * Affiche le bloc d'instructions d'import.
     */
    function showInstructions() {
        instructionsDiv.classList.remove('hidden');
    }

    /**
     * Affiche la boîte d'aide
     */
    function showHelpBox() {
        if (helpBox) {
            helpBox.style.display = 'block';
        }
    }

    /**
     * Cache la boîte d'aide
     */
    function hideHelpBox() {
        if (helpBox) {
            helpBox.style.display = 'none';
        }
    }

    /**
     * Active/désactive les boutons d'export
     */
    function setButtonsState(enabled) {
        exportIcsBtn.disabled = !enabled;
        exportTwoWeeksBtn.disabled = !enabled;
        exportThreeWeeksBtn.disabled = !enabled;
        exportPngBtn.disabled = !enabled;
        // exportGoogleBtn reste désactivé en permanence (en travaux)
    }

    /**
     * Change le texte d'un bouton spécifique
     */
    function setButtonText(button, text) {
        const btnText = button.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = text;
        }
    }

    /**
     * Vérifie que nous sommes sur la bonne page
     */
    async function checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error('Impossible de détecter l\'onglet actif');
            }

            if (!tab.url.includes('ent.cesi.fr/mon-emploi-du-temps')) {
                throw new Error('Veuillez ouvrir la page "Mon emploi du temps" sur ent.cesi.fr');
            }

            return tab;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Extrait les événements depuis la page
     */
    async function extractEvents(tabId, format, weeks = 1) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { action: 'extractEvents', format: format, weeks: weeks }, (response) => {
                if (chrome.runtime.lastError) {
                    const errorMsg = chrome.runtime.lastError.message;

                    // Message plus clair pour l'erreur de connexion
                    if (errorMsg.includes('Could not establish connection') || errorMsg.includes('Receiving end does not exist')) {
                        reject(new Error('Extension non chargée sur cette page.\n\n🔄 Solution : Rechargez la page (F5) puis réessayez.\n\nSi le problème persiste :\n1. Rechargez l\'extension dans chrome://extensions/\n2. Rechargez la page emploi du temps\n3. Vérifiez la console (F12) pour les logs verts'));
                    } else {
                        reject(new Error('Erreur de communication : ' + errorMsg));
                    }
                    return;
                }

                if (!response) {
                    reject(new Error('Aucune réponse du content script.\n\nRechargez la page (F5) puis réessayez.'));
                    return;
                }

                if (!response.success) {
                    reject(new Error(response.error || 'Erreur inconnue'));
                    return;
                }

                resolve(response);
            });
        });
    }

    /**
     * Génère et télécharge le fichier iCal
     */
    function generateAndDownload(events, weekTitleText) {
        const generator = new ICSGenerator();

        // Convertir les événements (les dates sont déjà des objets Date)
        const icsEvents = events.map(event => ({
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end),
            location: event.location,
            description: event.description
        }));

        generator.addEvents(icsEvents);

        // Générer le nom du fichier avec la date
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `emploi-du-temps-cesi-${dateStr}.ics`;

        generator.download(filename);

        return filename;
    }

    /**
     * Gère le clic sur un bouton d'export
     * @param {string} format - Format d'export: 'ics' ou 'google'
     * @param {number} weeks - Nombre de semaines à exporter (default 1)
     */
    async function handleExport(format, weeks = 1) {
        try {
            hideError();
            hideInfo();
            hideHelpBox(); // Cacher la help-box si elle était affichée
            setButtonsState(false);

            // Messages selon le format
            const formatLabels = {
                'ics': 'iCal',
                'png': 'image PNG',
                'google': 'Google Calendar'
            };
            const formatLabel = formatLabels[format] || format;

            const scopeLabel = weeks > 1 ? ` (${weeks} semaines)` : '';
            showStatus('loading', `Extraction de l'emploi du temps${scopeLabel}...`);

            // Vérifier l'onglet actif
            const tab = await checkCurrentTab();

            // Extraire les événements avec le format demandé
            const response = await extractEvents(tab.id, format, weeks);

            if (!response.events || response.events.length === 0) {
                throw new Error('Aucun événement trouvé dans l\'emploi du temps');
            }

            // Pour iCal, le téléchargement est géré par le content script
            // Pour Google, l'export est fait directement par l'API

            // Afficher le succès
            hideStatus();
            if (format === 'google') {
                showStatus('success', `Événements exportés vers Google Calendar !`);
            } else {
                showStatus('success', `Fichier ${formatLabel} téléchargé avec succès !`);
            }
            showInfo(response.weekTitle, response.count);

            // Afficher les instructions seulement pour iCal
            if (format === 'ics') {
                showInstructions();
            }

            setButtonsState(true);

            // Cacher le message de succès après 5 secondes
            setTimeout(() => {
                hideStatus();
            }, 5000);

        } catch (error) {
            console.error('[CESI Exporter] Erreur:', error);
            hideStatus();
            showError(error.message);
            setButtonsState(true);

            // Afficher la help-box si c'est une erreur de connexion
            if (error.message.includes('Extension non chargée') || error.message.includes('Rechargez la page')) {
                showHelpBox();
            }
        }
    }

    /**
     * Initialisation
     */
    async function init() {
        console.log('[CESI Exporter] Popup initialisé');

        // Vérifier si nous sommes sur la bonne page
        try {
            await checkCurrentTab();
            setButtonsState(true);
        } catch (error) {
            showError(error.message);
            setButtonsState(false);
        }

        // Écouter les clics sur les boutons
        exportIcsBtn.addEventListener('click', () => handleExport('ics', 1));
        exportTwoWeeksBtn.addEventListener('click', () => handleExport('ics', 2));
        exportThreeWeeksBtn.addEventListener('click', () => handleExport('ics', 3));
        exportPngBtn.addEventListener('click', () => handleExport('png', 1));
        // exportGoogleBtn en travaux, pas de handler
    }

    // Démarrer quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

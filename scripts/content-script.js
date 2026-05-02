/**
 * CESI Calendar Exporter - Content Script (Auto Mode)
 * Extrait automatiquement toute la semaine et génère le fichier iCal
 */

(function() {
    'use strict';

    console.log('%c[CESI Exporter] ✅ Content script chargé avec succès', 'color: green; font-size: 16px; font-weight: bold');
    console.log('%c[CESI Exporter] Version: 2.0 - Mode automatique activé', 'color: blue; font-size: 12px');

    // Détection Firefox : seul navigateur où le souci de sidebar + vue jour
    // se produit. Chrome n'a pas de sidebar_action, on ne touche pas la page là.
    const IS_FIREFOX = typeof navigator !== 'undefined' && /Firefox\//.test(navigator.userAgent);

    // Sur Firefox uniquement : injecte un script qui s'exécute dans le contexte
    // de la page (accès à jQuery + instance FullCalendar) pour forcer la vue semaine.
    if (IS_FIREFOX) {
        try {
            const inject = document.createElement('script');
            inject.src = chrome.runtime.getURL('scripts/inject.js');
            inject.onload = function() { this.remove(); };
            (document.head || document.documentElement).appendChild(inject);
        } catch (e) {
            console.warn('[CESI Exporter] Impossible d\'injecter inject.js:', e);
        }
    }

    /**
     * Replie la barre de navigation CESI à gauche pour libérer de l'espace
     * (utile quand la sidebar de l'extension prend de la place).
     */
    function collapseCesiNav() {
        const btn = document.querySelector('.hautDePage__navigation__masquer.active');
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    }

    // Configuration
    const CONFIG = {
        EXPORT_DELAY_HOURS: 1, // Ne pas réexporter si déjà fait il y a moins de X heures
        LOAD_DELAY_MS: 800,     // Délai d'attente après navigation
        MAX_RETRIES: 2,         // Nombre de tentatives max par jour
        DAYS_TO_EXPORT: 6       // Lundi à Samedi
    };

    // État global
    let allEvents = [];
    let currentDayIndex = 0;
    let notificationElement = null;

    /**
     * Crée une notification visuelle sur la page
     */
    function createNotification() {
        if (notificationElement) return notificationElement;

        const notification = document.createElement('div');
        notification.id = 'cesi-exporter-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            min-width: 250px;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);
        notificationElement = notification;
        return notification;
    }

    /**
     * Met à jour le message de la notification
     */
    function updateNotification(message, type = 'info') {
        const notification = createNotification();

        const colors = {
            info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            success: 'linear-gradient(135deg, #1CB841 0%, #0e8c2a 100%)',
            error: 'linear-gradient(135deg, #CA3C3C 0%, #a12828 100%)'
        };

        notification.style.background = colors[type] || colors.info;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 20px;">${type === 'success' ? '✓' : type === 'error' ? '✕' : '⏳'}</div>
                <div>${message}</div>
            </div>
        `;
    }

    /**
     * Supprime la notification après un délai
     */
    function hideNotification(delay = 3000) {
        setTimeout(() => {
            if (notificationElement) {
                notificationElement.style.opacity = '0';
                setTimeout(() => {
                    notificationElement?.remove();
                    notificationElement = null;
                }, 300);
            }
        }, delay);
    }

    /**
     * Vérifie si un export récent a déjà été fait
     */
    function shouldExport() {
        try {
            const lastExport = localStorage.getItem('cesi_last_export');
            if (!lastExport) return true;

            const lastExportDate = new Date(parseInt(lastExport));
            const now = new Date();
            const hoursSinceExport = (now - lastExportDate) / (1000 * 60 * 60);

            return hoursSinceExport >= CONFIG.EXPORT_DELAY_HOURS;
        } catch (error) {
            console.error('[CESI Exporter] Erreur vérification localStorage:', error);
            return true;
        }
    }

    /**
     * Enregistre la date du dernier export
     */
    function recordExport() {
        try {
            localStorage.setItem('cesi_last_export', Date.now().toString());
        } catch (error) {
            console.error('[CESI Exporter] Erreur enregistrement localStorage:', error);
        }
    }

    /**
     * Attend que le calendrier soit chargé
     */
    function waitForCalendar() {
        return new Promise((resolve, reject) => {
            const maxAttempts = 50;
            let attempts = 0;

            const checkCalendar = setInterval(() => {
                attempts++;
                const calendar = document.querySelector('.fc-view');
                const hasEvents = document.querySelectorAll('.fc-time-grid-event').length > 0;
                const eventContainer = document.querySelector('.fc-event-container');

                if (calendar && eventContainer) {
                    clearInterval(checkCalendar);
                    console.log('[CESI Exporter] Calendrier détecté');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkCalendar);
                    reject(new Error('Timeout: le calendrier n\'a pas pu être chargé'));
                }
            }, 200);
        });
    }

    /**
     * Parse un horaire au format "HH:MM" et retourne un objet Date
     */
    function parseTime(dateObj, timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const result = new Date(dateObj);
        result.setHours(hours, minutes, 0, 0);
        return result;
    }

    /**
     * Extrait tous les événements de la semaine depuis la vue agendaWeek
     * Tous les jours sont déjà présents dans le DOM, pas besoin de naviguer!
     */
    function extractAllWeekEvents() {
        const events = [];

        console.log('[CESI Exporter] Extraction directe depuis la vue semaine complète');

        // Récupérer toutes les dates de la semaine depuis la grille horaire uniquement
        const dayElements = document.querySelectorAll('.fc-time-grid > .fc-bg table tbody tr td.fc-day[data-date]');
        console.log(`[CESI Exporter] ${dayElements.length} jour(s) détecté(s) dans le DOM`);

        if (dayElements.length === 0) {
            console.error('[CESI Exporter] Aucun jour trouvé avec le sélecteur .fc-day[data-date]');
            return events;
        }

        // Récupérer toutes les colonnes d'événements depuis la grille horaire uniquement
        const eventRows = document.querySelectorAll('.fc-time-grid .fc-content-skeleton table tbody tr');
        if (eventRows.length === 0) {
            console.error('[CESI Exporter] Aucune ligne d\'événements trouvée');
            return events;
        }

        // Prendre la première ligne (il peut y avoir plusieurs lignes pour les événements qui se chevauchent)
        const eventColumns = eventRows[0].querySelectorAll('td');
        console.log(`[CESI Exporter] ${eventColumns.length} colonne(s) d'événements trouvée(s)`);

        // Parcourir chaque jour (ignorer la première colonne qui est fc-axis)
        for (let i = 0; i < dayElements.length; i++) {
            const dayElement = dayElements[i];
            const eventColumn = eventColumns[i + 1]; // +1 car index 0 = fc-axis

            if (!eventColumn) {
                console.warn(`[CESI Exporter] Colonne d'événements manquante pour le jour ${i}`);
                continue;
            }

            // Récupérer la date de ce jour
            const dateStr = dayElement.getAttribute('data-date');
            const currentDate = new Date(dateStr);
            const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'numeric' });

            // Trouver le conteneur d'événements pour cette colonne
            const eventContainer = eventColumn.querySelector('.fc-event-container');
            if (!eventContainer) {
                console.log(`[CESI Exporter] ${dayName}: Aucun événement`);
                continue;
            }

            // Extraire tous les événements de cette colonne
            const dayEvents = eventContainer.querySelectorAll('.fc-time-grid-event');
            console.log(`[CESI Exporter] ${dayName}: ${dayEvents.length} événement(s)`);

            dayEvents.forEach((eventEl) => {
                const titleEl = eventEl.querySelector('.fc-title');
                const timeEl = eventEl.querySelector('.fc-time');
                const salleEl = eventEl.querySelector('.fc-salles');

                if (!titleEl || !timeEl) return;

                const title = titleEl.textContent.trim();
                const timeFullAttr = timeEl.getAttribute('data-full');
                const salle = salleEl ? salleEl.textContent.trim() : '';

                if (timeFullAttr) {
                    const [startTime, endTime] = timeFullAttr.split(' - ').map(t => t.trim());
                    const startDateTime = parseTime(currentDate, startTime);
                    const endDateTime = parseTime(currentDate, endTime);

                    events.push({
                        title: title,
                        start: startDateTime,
                        end: endDateTime,
                        location: salle,
                        description: `Cours: ${title}${salle ? '\nSalle: ' + salle : ''}`
                    });

                    console.log(`[CESI Exporter]   - ${title} (${startTime} - ${endTime})${salle ? ' @ ' + salle : ''}`);
                }
            });
        }

        console.log(`[CESI Exporter] Total extrait: ${events.length} événement(s)`);
        return events;
    }

    /**
     * Extrait tous les événements de la semaine (lundi à samedi)
     * Version simplifiée: extraction directe depuis la vue agendaWeek
     */
    async function extractFullWeek() {
        updateNotification('Extraction de la semaine en cours...', 'info');

        // Extraction directe - pas besoin de naviguer!
        allEvents = extractAllWeekEvents();

        return allEvents;
    }

    /**
     * Clique sur un bouton de navigation FullCalendar et attend le rechargement
     * @param {string} selector - Sélecteur du bouton (.fc-next-button ou .fc-prev-button)
     */
    async function clickNavButton(selector) {
        const btn = document.querySelector(selector);
        if (!btn) {
            throw new Error(`Bouton de navigation introuvable: ${selector}`);
        }
        btn.click();
        // Attendre que la vue soit mise à jour
        await new Promise(r => setTimeout(r, CONFIG.LOAD_DELAY_MS + 400));
        await waitForCalendar();
    }

    /**
     * Extrait plusieurs semaines consécutives en cliquant sur "semaine suivante".
     * Revient à la semaine de départ une fois terminé.
     * @param {number} count - Nombre de semaines à extraire (semaine courante + N-1 suivantes)
     * @returns {Promise<{events: Array, weekNumbers: string[]}>}
     */
    async function extractMultipleWeeks(count) {
        const multiWeekEvents = [];
        const weekNumbers = [];

        for (let w = 0; w < count; w++) {
            updateNotification(`Extraction semaine ${w + 1}/${count}...`, 'info');

            const weekTitle = document.querySelector('.fc-title-header')?.textContent.trim() || '';
            const weekNumber = weekTitle.match(/S(\d+)/)?.[1];
            if (weekNumber) weekNumbers.push(weekNumber);

            const weekEvents = extractAllWeekEvents();
            multiWeekEvents.push(...weekEvents);

            if (w < count - 1) {
                await clickNavButton('.fc-next-button');
            }
        }

        // Revenir au point de départ
        updateNotification('Retour à la semaine de départ...', 'info');
        for (let w = 0; w < count - 1; w++) {
            await clickNavButton('.fc-prev-button');
        }

        allEvents = multiWeekEvents;
        return { events: multiWeekEvents, weekNumbers };
    }

    /**
     * Génère le contenu iCal au format RFC 5545
     */
    function generateICS(events) {
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//CESI Calendar Exporter//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:Emploi du temps CESI',
            'X-WR-TIMEZONE:Europe/Paris'
        ];

        /**
         * Formate une date au format iCal (YYYYMMDDTHHMMSS)
         */
        function formatICalDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}${month}${day}T${hours}${minutes}${seconds}`;
        }

        /**
         * Échappe les caractères spéciaux pour iCal
         */
        function escapeICalText(text) {
            if (!text) return '';
            return text
                .replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,')
                .replace(/\n/g, '\\n');
        }

        // Ajouter chaque événement
        events.forEach(event => {
            const uid = `${formatICalDate(event.start)}-${event.title.replace(/\s+/g, '-')}@cesi.fr`;
            const now = new Date();

            lines.push('BEGIN:VEVENT');
            lines.push(`UID:${uid}`);
            lines.push(`DTSTAMP:${formatICalDate(now)}`);
            lines.push(`DTSTART:${formatICalDate(event.start)}`);
            lines.push(`DTEND:${formatICalDate(event.end)}`);
            lines.push(`SUMMARY:${escapeICalText(event.title)}`);

            if (event.location) {
                lines.push(`LOCATION:${escapeICalText(event.location)}`);
            }

            if (event.description) {
                lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
            }

            lines.push('STATUS:CONFIRMED');
            lines.push('TRANSP:OPAQUE');
            lines.push('END:VEVENT');
        });

        lines.push('END:VCALENDAR');

        return lines.join('\r\n');
    }

    /**
     * Télécharge le fichier iCal (.ics)
     */
    function downloadICS(icsContent, filename) {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Rend la grille hebdomadaire (Lun-Sam, 8h-19h) sur un canvas créé par le content
     * script et déclenche le téléchargement via chrome.downloads. Pas de capture DOM,
     * donc pas de tainting, pas d'iframe, marche sur Chrome ET Firefox.
     */
    async function renderAndDownloadCalendarPNG(events, filename) {
        updateNotification('Génération de l\'image...', 'info');

        // Trouver bornes horaires (min start, max end), arrondi à l'heure entière.
        const startHours = events.map(e => new Date(e.start).getHours());
        const endHours = events.map(e => {
            const d = new Date(e.end);
            return d.getMinutes() > 0 ? d.getHours() + 1 : d.getHours();
        });
        const hStart = Math.max(7, Math.min(8, ...startHours));
        const hEnd = Math.min(20, Math.max(19, ...endHours));
        const hourCount = hEnd - hStart;

        // Grouper par jour (clé = YYYY-MM-DD)
        const days = new Map();
        for (const e of events) {
            const d = new Date(e.start);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!days.has(key)) days.set(key, { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), events: [] });
            days.get(key).events.push(e);
        }
        // Ordonner les jours, ajouter jours manquants Lun-Sam dans la plage min/max
        const dayList = [...days.values()].sort((a, b) => a.date - b.date);
        if (dayList.length === 0) throw new Error('Aucun événement à dessiner');
        // Étendre du lundi (de la semaine du premier event) au samedi
        const first = dayList[0].date;
        const monday = new Date(first);
        const dow = (monday.getDay() + 6) % 7; // 0 = lundi
        monday.setDate(monday.getDate() - dow);
        const cols = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            cols.push({ date: d, events: days.get(key)?.events || [] });
        }

        // Dimensions (en CSS px). On render en 2x pour la netteté.
        const SCALE = 2;
        const W_TIME = 70;
        const W_DAY = 200;
        const H_HEADER = 60;
        const H_HOUR = 60;
        const widthCss = W_TIME + W_DAY * cols.length;
        const heightCss = H_HEADER + H_HOUR * hourCount;

        const canvas = document.createElement('canvas');
        canvas.width = widthCss * SCALE;
        canvas.height = heightCss * SCALE;
        const ctx = canvas.getContext('2d');
        ctx.scale(SCALE, SCALE);
        ctx.textBaseline = 'top';
        // Police générique : pas de fonts cross-origin, pas de tainting.
        const FONT = '-apple-system, system-ui, sans-serif';

        // Fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, widthCss, heightCss);

        // En-tête : jours
        const dayNames = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(0, 0, widthCss, H_HEADER);
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.font = `bold 16px ${FONT}`;
        cols.forEach((c, i) => {
            const x = W_TIME + i * W_DAY;
            ctx.fillStyle = '#222';
            ctx.fillText(dayNames[i], x + W_DAY / 2, 12);
            ctx.font = `14px ${FONT}`;
            ctx.fillText(`${c.date.getDate()}/${c.date.getMonth() + 1}`, x + W_DAY / 2, 34);
            ctx.font = `bold 16px ${FONT}`;
        });

        // Grille horaire
        ctx.textAlign = 'right';
        ctx.font = `13px ${FONT}`;
        ctx.fillStyle = '#666';
        for (let h = 0; h < hourCount; h++) {
            const y = H_HEADER + h * H_HOUR;
            ctx.strokeStyle = '#e0e0e0';
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(widthCss, y);
            ctx.stroke();
            ctx.fillText(`${String(hStart + h).padStart(2, '0')}:00`, W_TIME - 8, y + 4);
        }
        // Bordures verticales
        ctx.strokeStyle = '#cccccc';
        for (let i = 0; i <= cols.length; i++) {
            const x = W_TIME + i * W_DAY;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, heightCss);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(W_TIME, 0);
        ctx.lineTo(W_TIME, heightCss);
        ctx.stroke();
        // Bordure bas du header
        ctx.beginPath();
        ctx.moveTo(0, H_HEADER);
        ctx.lineTo(widthCss, H_HEADER);
        ctx.stroke();

        // Helper : wrap texte
        function wrapText(text, maxWidth) {
            const words = text.split(/\s+/);
            const lines = [];
            let line = '';
            for (const w of words) {
                const test = line ? line + ' ' + w : w;
                if (ctx.measureText(test).width > maxWidth && line) {
                    lines.push(line);
                    line = w;
                } else {
                    line = test;
                }
            }
            if (line) lines.push(line);
            return lines;
        }

        // Événements (style FullCalendar CESI : fond orange #f4b942, texte blanc)
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        cols.forEach((c, i) => {
            for (const ev of c.events) {
                const s = new Date(ev.start);
                const e = new Date(ev.end);
                const sH = s.getHours() + s.getMinutes() / 60;
                const eH = e.getHours() + e.getMinutes() / 60;
                const top = H_HEADER + (sH - hStart) * H_HOUR;
                const height = (eH - sH) * H_HOUR;
                const left = W_TIME + i * W_DAY + 2;
                const width = W_DAY - 4;
                // Boîte
                ctx.fillStyle = '#f4b942';
                ctx.fillRect(left, top, width, height);
                ctx.strokeStyle = '#d99d20';
                ctx.strokeRect(left, top, width, height);
                // Texte (titre, horaire, lieu)
                ctx.fillStyle = '#ffffff';
                const pad = 6;
                let cy = top + pad;
                ctx.font = `bold 13px ${FONT}`;
                const titleLines = wrapText(ev.title || '', width - pad * 2);
                for (const ln of titleLines.slice(0, 3)) {
                    if (cy + 16 > top + height - 2) break;
                    ctx.fillText(ln, left + pad, cy);
                    cy += 16;
                }
                ctx.font = `12px ${FONT}`;
                const fmt = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                const time = `${fmt(s)} - ${fmt(e)}`;
                if (cy + 14 <= top + height - 2) { ctx.fillText(time, left + pad, cy); cy += 14; }
                if (ev.location && cy + 14 <= top + height - 2) {
                    const loc = wrapText(ev.location, width - pad * 2)[0] || '';
                    ctx.fillText(loc, left + pad, cy);
                }
            }
        });

        // Cadre extérieur
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, widthCss - 1, heightCss - 1);

        // Canvas dessiné par nous-mêmes : jamais tainté. toBlob + blob URL + link.click()
        // marchent sur Chrome ET Firefox content scripts (pas de SecurityError).
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Échec de la conversion en PNG');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * Exporte les événements directement vers Google Calendar via API
     * @param {Array} events - Tableau d'événements à exporter
     * @returns {Promise<Object>} Résultat de l'export
     */
    async function exportToGoogleCalendar(events) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('[CESI Exporter] Démarrage export vers Google Calendar');
                updateNotification('Connexion à Google Calendar...', 'info');

                // Demander le token d'authentification au background script
                chrome.runtime.sendMessage({ action: 'getAuthToken' }, async (response) => {
                    if (!response || !response.success) {
                        const errorMsg = response?.error || 'Impossible d\'obtenir le token d\'authentification';
                        console.error('[CESI Exporter] Erreur auth:', errorMsg);
                        updateNotification(`Erreur d'authentification: ${errorMsg}`, 'error');
                        hideNotification(5000);
                        reject(new Error(errorMsg));
                        return;
                    }

                    const token = response.token;
                    console.log('[CESI Exporter] Token obtenu, export en cours...');

                    // Compteurs
                    let successCount = 0;
                    let errorCount = 0;
                    const total = events.length;

                    // Exporter chaque événement
                    for (let i = 0; i < events.length; i++) {
                        const event = events[i];

                        try {
                            // Mise à jour de la progression
                            updateNotification(
                                `Export vers Google Calendar (${i + 1}/${total})...`,
                                'info'
                            );

                            // Formater l'événement pour l'API Google Calendar
                            const googleEvent = {
                                summary: event.title,
                                location: event.location || '',
                                description: event.description || '',
                                start: {
                                    dateTime: event.start.toISOString(),
                                    timeZone: 'Europe/Paris'
                                },
                                end: {
                                    dateTime: event.end.toISOString(),
                                    timeZone: 'Europe/Paris'
                                },
                                reminders: {
                                    useDefault: false,
                                    overrides: [
                                        { method: 'popup', minutes: 15 }
                                    ]
                                }
                            };

                            // Envoyer à l'API Google Calendar
                            const apiResponse = await fetch(
                                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(googleEvent)
                                }
                            );

                            if (apiResponse.ok) {
                                successCount++;
                                console.log(`[CESI Exporter] Événement ${i + 1}/${total} exporté:`, event.title);
                            } else {
                                errorCount++;
                                const errorData = await apiResponse.json();
                                console.error(`[CESI Exporter] Échec événement ${i + 1}:`, errorData);
                            }

                            // Petit délai pour éviter de surcharger l'API
                            if (i < events.length - 1) {
                                await new Promise(r => setTimeout(r, 100));
                            }

                        } catch (error) {
                            errorCount++;
                            console.error(`[CESI Exporter] Erreur événement ${i + 1}:`, error);
                        }
                    }

                    // Résultat final
                    const resultMsg = `Export terminé ! ${successCount}/${total} événement${total > 1 ? 's' : ''} ajouté${total > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} erreur${errorCount > 1 ? 's' : ''})` : ''}`;

                    console.log('[CESI Exporter]', resultMsg);
                    updateNotification(resultMsg, successCount > 0 ? 'success' : 'error');
                    hideNotification(5000);

                    resolve({
                        success: true,
                        total,
                        successCount,
                        errorCount
                    });
                });

            } catch (error) {
                console.error('[CESI Exporter] Erreur export Google Calendar:', error);
                updateNotification(`Erreur: ${error.message}`, 'error');
                hideNotification(5000);
                reject(error);
            }
        });
    }

    /**
     * Fonction principale - Lance l'export automatique ou manuel
     * @param {boolean} forceExport - Si true, bypass la vérification de temps (pour export manuel)
     * @param {string} format - Format d'export: 'ics' ou 'google'
     * @param {number} weeks - Nombre de semaines à exporter (1 = semaine courante uniquement)
     */
    async function autoExport(forceExport = false, format = 'ics', weeks = 1) {
        try {
            const exportType = forceExport ? 'manuel' : 'automatique';
            console.log(`[CESI Exporter] Démarrage de l'export ${exportType} (format: ${format}, semaines: ${weeks})`);

            // Vérifier si un export récent existe déjà (sauf si forcé par l'utilisateur)
            if (!forceExport && !shouldExport()) {
                console.log('[CESI Exporter] Export déjà effectué récemment, annulation');
                updateNotification('Export déjà effectué récemment', 'info');
                hideNotification(2000);
                return;
            }

            // Attendre que le calendrier soit chargé
            await waitForCalendar();

            // Extraire une ou plusieurs semaines
            let events;
            let weekNumbers = [];
            if (weeks > 1) {
                const result = await extractMultipleWeeks(weeks);
                events = result.events;
                weekNumbers = result.weekNumbers;
            } else {
                events = await extractFullWeek();
                const weekTitle = document.querySelector('.fc-title-header')?.textContent.trim() || '';
                const wn = weekTitle.match(/S(\d+)/)?.[1];
                if (wn) weekNumbers = [wn];
            }

            if (events.length === 0 && format !== 'png') {
                updateNotification('Aucun événement trouvé', 'error');
                hideNotification(3000);
                return;
            }

            // Construire le suffixe du nom de fichier
            const fileSuffix = weekNumbers.length > 1
                ? `semaines-S${weekNumbers[0]}-S${weekNumbers[weekNumbers.length - 1]}`
                : `semaine-${weekNumbers[0] || new Date().getWeek()}`;

            // Exporter selon le format demandé
            if (format === 'ics') {
                // Export iCal
                updateNotification('Génération du fichier iCal...', 'info');
                const icsContent = generateICS(events);
                const filename = `emploi-du-temps-cesi-${fileSuffix}.ics`;
                downloadICS(icsContent, filename);

                // Notification de succès
                updateNotification(`✓ Fichier iCal téléchargé ! ${events.length} événement${events.length > 1 ? 's' : ''}`, 'success');
                hideNotification(4000);

            } else if (format === 'google') {
                // Export vers Google Calendar via API
                await exportToGoogleCalendar(events);
                // Les notifications sont gérées dans exportToGoogleCalendar()

            } else if (format === 'png') {
                // Export image PNG : rendu manuel canvas (pas html2canvas, qui plante
                // sur Firefox content scripts via toIFrame).
                if (events.length === 0) {
                    updateNotification('Aucun événement à exporter en image', 'error');
                    hideNotification(3000);
                    return;
                }
                const filename = `emploi-du-temps-cesi-${fileSuffix}.png`;
                await renderAndDownloadCalendarPNG(events, filename);
                updateNotification(`✓ Image PNG téléchargée !`, 'success');
                hideNotification(4000);

            } else {
                throw new Error(`Format d'export inconnu: ${format}`);
            }

            // Enregistrer le succès (sauf pour Google qui gère déjà ça)
            if (format !== 'google') {
                recordExport();
            }

            console.log('[CESI Exporter] Export terminé avec succès:', events.length, 'événements');

        } catch (error) {
            console.error('[CESI Exporter] Erreur lors de l\'export:', error);
            updateNotification(`Erreur : ${error.message}`, 'error');
            hideNotification(5000);
            throw error;
        }
    }

    /**
     * Écoute les messages du popup (pour export manuel)
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractEvents') {
            // Récupérer le format demandé (par défaut: 'ics')
            const format = request.format || 'ics';
            const weeks = Math.max(1, parseInt(request.weeks, 10) || 1);

            // Forcer l'export (true) pour bypass la restriction de temps
            autoExport(true, format, weeks)
                .then(() => {
                    sendResponse({
                        success: true,
                        events: allEvents,
                        count: allEvents.length,
                        weekTitle: document.querySelector('.fc-title-header')?.textContent.trim(),
                        format: format
                    });
                })
                .catch(error => {
                    sendResponse({
                        success: false,
                        error: error.message
                    });
                });
            return true;
        }

        if (request.action === 'collapseCesiNav') {
            const collapsed = collapseCesiNav();
            sendResponse({ success: true, collapsed });
            return true;
        }
    });

    // Helper pour obtenir le numéro de semaine
    Date.prototype.getWeek = function() {
        const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    };

    /**
     * Crée un badge visuel pour indiquer que l'extension est active
     */
    function createActiveBadge() {
        const badge = document.createElement('div');
        badge.id = 'cesi-exporter-badge';
        badge.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            opacity: 0.8;
            transition: opacity 0.3s;
            cursor: pointer;
        `;
        badge.textContent = '✓ CESI Exporter actif';
        badge.title = 'CESI Calendar Exporter est actif sur cette page';

        badge.addEventListener('mouseenter', () => badge.style.opacity = '1');
        badge.addEventListener('mouseleave', () => badge.style.opacity = '0.8');

        document.body.appendChild(badge);

        // Faire disparaître le badge après 5 secondes
        setTimeout(() => {
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 300);
        }, 5000);
    }

    // Pas d'export automatique : l'extension attend un clic sur un bouton du popup.
    // Le badge visuel confirme simplement que l'extension est active sur la page.
    try {
        createActiveBadge();
    } catch (error) {
        console.error('[CESI Exporter] Erreur création badge:', error);
    }

    console.log('%c[CESI Exporter] ✅ Extension prête — cliquez sur l\'icône pour exporter', 'color: green; font-weight: bold');

})();

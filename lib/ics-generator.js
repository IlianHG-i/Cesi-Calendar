/**
 * Générateur iCal simple pour créer des fichiers .ics
 */

class ICSGenerator {
    constructor() {
        this.events = [];
    }

    /**
     * Formate une date au format iCal (YYYYMMDDTHHMMSS)
     */
    static formatDate(date) {
        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    }

    /**
     * Échappe les caractères spéciaux pour iCal
     */
    static escapeText(text) {
        if (!text) return '';
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
    }

    /**
     * Génère un UID unique pour un événement
     */
    static generateUID(event) {
        const timestamp = event.start.getTime();
        const title = event.title.replace(/\s/g, '-');
        return `${timestamp}-${title}@cesi-calendar-exporter`;
    }

    /**
     * Ajoute un événement
     */
    addEvent(event) {
        this.events.push(event);
    }

    /**
     * Ajoute plusieurs événements
     */
    addEvents(events) {
        this.events.push(...events);
    }

    /**
     * Génère le contenu iCal complet
     */
    generate() {
        const now = new Date();
        const timestamp = ICSGenerator.formatDate(now);

        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//CESI Calendar Exporter//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:Emploi du temps CESI',
            'X-WR-TIMEZONE:Europe/Paris',
            'X-WR-CALDESC:Emploi du temps exporté depuis ENT CESI'
        ];

        // Ajouter chaque événement
        this.events.forEach(event => {
            const uid = ICSGenerator.generateUID(event);
            const dtstart = ICSGenerator.formatDate(event.start);
            const dtend = ICSGenerator.formatDate(event.end);
            const summary = ICSGenerator.escapeText(event.title);
            const description = ICSGenerator.escapeText(event.description || '');
            const location = ICSGenerator.escapeText(event.location || '');

            icsContent.push('BEGIN:VEVENT');
            icsContent.push(`UID:${uid}`);
            icsContent.push(`DTSTAMP:${timestamp}`);
            icsContent.push(`DTSTART:${dtstart}`);
            icsContent.push(`DTEND:${dtend}`);
            icsContent.push(`SUMMARY:${summary}`);

            if (description) {
                icsContent.push(`DESCRIPTION:${description}`);
            }

            if (location) {
                icsContent.push(`LOCATION:${location}`);
            }

            icsContent.push('STATUS:CONFIRMED');
            icsContent.push('SEQUENCE:0');
            icsContent.push('END:VEVENT');
        });

        icsContent.push('END:VCALENDAR');

        return icsContent.join('\r\n');
    }

    /**
     * Télécharge le fichier iCal
     */
    download(filename = 'emploi-du-temps-cesi.ics') {
        const icsContent = this.generate();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Libérer l'URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Réinitialise les événements
     */
    reset() {
        this.events = [];
    }
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ICSGenerator;
}

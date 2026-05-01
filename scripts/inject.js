/**
 * Script injecté dans le contexte de la page CESI.
 * Force la vue 'cesiagendaWeek' (semaine) sur le FullCalendar et empêche
 * le passage en vue 'cesiagendaDay' (jour) lié au responsive de la page.
 *
 * S'exécute dans le world de la page (a accès à jQuery et l'instance FullCalendar).
 */
(function() {
    'use strict';

    if (window.__cesiExporterForceWeek) return;
    window.__cesiExporterForceWeek = true;

    const TARGET_VIEW = 'cesiagendaWeek';
    const FALLBACK_VIEW = 'cesiagendaDay';

    let isFixing = false;

    function getCalendar() {
        if (typeof window.jQuery !== 'function') return null;
        const $cal = window.jQuery('.calendar.js-calendar');
        if (!$cal.length || typeof $cal.fullCalendar !== 'function') return null;
        return $cal;
    }

    function forceWeekView() {
        if (isFixing) return;
        const $cal = getCalendar();
        if (!$cal) return;
        let view;
        try {
            view = $cal.fullCalendar('getView');
        } catch (e) {
            return;
        }
        if (!view) return;
        const name = view.name || (view.type) || '';
        if (name === FALLBACK_VIEW || name.includes('Day')) {
            isFixing = true;
            try {
                $cal.fullCalendar('changeView', TARGET_VIEW);
            } catch (e) {
                console.warn('[CESI Exporter inject] changeView failed:', e);
            }
            setTimeout(function() { isFixing = false; }, 300);
        }
    }

    function startObserving() {
        const container = document.querySelector('.fc-view-container');
        if (!container) return false;

        forceWeekView();

        const observer = new MutationObserver(function(mutations) {
            for (const m of mutations) {
                if (m.type === 'attributes' || m.type === 'childList') {
                    forceWeekView();
                    break;
                }
            }
        });
        observer.observe(container, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['class']
        });
        return true;
    }

    let attempts = 0;
    const initInterval = setInterval(function() {
        attempts++;
        if (startObserving() || attempts > 40) {
            clearInterval(initInterval);
        }
    }, 250);

    let resizeTimer = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(forceWeekView, 200);
    });
})();

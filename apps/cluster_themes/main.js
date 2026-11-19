'use strict';
/**
 * Cluster Themes: redraws the iDrive 7 instrument cluster (the 1920x720 "panel" target) through cluster-render.
 *
 * The center screen is the app's own page (shared/page.js, a canvas screen): the themes with their
 * pictures, which drive mode shows which, and the settings. Each choice is saved in the app's data/settings.json
 * by the kit; the shared engine (hud.js) listens and redraws at once. It keeps running after the page is
 * closed (OAP apps stay up in the background), so the page is only needed for changes. The kit's own
 * settings list stays one tap away (the bar's All settings).
 */
const mgu = require('./kit/mgu');
const HudApp = require('./hud');
const Page = require('./page');

mgu.run({
    start(ctx) {
        let hud;
        try {
            hud = new HudApp(ctx);
        } catch (e) {
            // nothing drawn, but stay up: an exit here would count as a crash on the car
            ctx.log.error('Cluster failed to start: ' + (e && e.stack || e));
            return;
        }
        ['hudLayout', 'inSport', 'inComfort', 'inEco'].forEach((key) => {
            const saved = ctx.settings.get(key);
            if (saved === 'gt3' || saved === 'minimal') ctx.settings.set(key, 'vector');
            else if (['track', 'dyno', 'srinivas', 'retro80s'].indexOf(saved) >= 0) ctx.settings.set(key, key === 'hudLayout' ? 'sport' : 'off');
        });
        hud.start();
        new Page(ctx, hud, {
            title: ctx.spec.title, what: 'cluster',
            look: { name: 'Themes', style: 'hero', tags: { m: 'M8 style', mview: 'M3 / M5 look', vector: 'sport tach', sport: 'Live Cockpit', track: 'tyres + temps', drag: 'G-force and revs', rally: 'circuit tach', supersport: 'speed and RPM wings', cruise: 'twin RPM scales', dyno: 'safety tiles', ribbon: 'M track display' } },
            tabs: ['look', 'readouts', 'badge', 'map', 'alerts', 'gmeter', 'settings'],
            settings: ['eqSportPalette', 'redSportBackground', 'redSportColor', 'redSportHue', 'units', 'clock', 'timeZone', 'tankLitres', 'redline', 'shiftBefore', 'coldGuard', 'showBoost', 'nightDim', 'cameraNotch', 'keepFactoryStrip', 'holiday', 'demo'],
            // the drive mode check's candidates this app's app.json listens to (issue #8; shared/hud.js modeDiagLines)
            modeCheck: ['HMI', 'MDrive', 'Engine', 'Sport2'],
        }).start();
        process.on('exit', () => { try { hud.stop(); } catch (e) { /* exiting anyway */ } });
    },
});

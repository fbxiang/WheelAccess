const ExtensionImports = imports.misc.extensionUtils.getCurrentExtension().imports;
const Sector = ExtensionImports.sector;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Tweener = imports.ui.tweener;

const WheelPopup = new Lang.Class({
    Name: 'WheelPopup',

    _init: function(icons, commands) {
        this.actor = new Clutter.Actor({
            reactive: true,
            visible: false
        });
        let [width, height] = this._getSize();
        this.actor.set_size(width, height);
        this.actor.set_background_color(new Clutter.Color({red: 0, green: 0, blue: 0, alpha: 100}));
        this.hasModal = false;
        this.selected = -1;

        this. sectors = [];
        this.total = icons.length;
        for (let i = 0; i < this.total; i++) {
            this.sectors.push(new Sector.Sector(
                200, 400, 10, i,this.total, icons[i], commands[i]
            ));
        }
        this.sectors.forEach(s => this.actor.add_actor(s.actor));

        this.actor.connect('key-press-event', Lang.bind(this, this._keyPress));
        this.actor.connect('key-release-event', Lang.bind(this, this._keyRelease));
        this.actor.connect('motion-event', Lang.bind(this, this._motion));
        Main.uiGroup.add_actor(this.actor);
    },

    _getSize: function() {
        let primary = Main.layoutManager.primaryMonitor;
        return [primary.width, primary.height];
    },

    show: function() {
        this.actor.opacity = 255;
        if (!this.hasModal) {
            if (!Main.pushModal(this.actor)) {
                if (!Main.pushModal(this.actor, { options: Meta.ModalOptions.POINTER_ALREADY_GRABBED })) {
                    return;
                }
            }
            this.hasModal = true;
        }
        this.actor.show();
    },

    hide: function() {
        if (this.hasModal) {
            Main.popModal(this.actor);
            this.hasModal = false;
        }

        Tweener.addTween(this.actor,
                         { opacity: 0,
                           time: 0.2,
                           transition: 'easeOutQuad',
                           onComplete: () => {this.actor.hide();}
                         });
    },

    destroy: function() {
        this.actor.destroy();
    },

    _keyPress: function(actor, event) {
        let keysym = event.get_key_symbol();
        let action = global.display.get_keybinding_action(event.get_key_code(), event.get_state());
        if (keysym == Clutter.w) {
            this._nextSelection();
        } else if (keysym == Clutter.Escape)
            this.hide();
        return Clutter.EVENT_STOP;
    },

    _keyRelease: function(actor, event) {
        let keysym = event.get_key_symbol();
        if (keysym == 65515) {
            this.hide();
            if (this.selected >= 0) {
                Util.spawnCommandLine(this.sectors[this.selected].command);
            }
        } 
    },

    _motion: function(actor, event) {
        let [x, y] = event.get_coords();
        this.selected = -1;
        this.sectors.forEach((s, i) => {
            if (s.testPoint(x, y)) {
                this.selected = i;
                s.highlight();
            } else {
                s.removeHighlight();
            }
        });
    },

    _nextSelection: function() {
        this.selected  = (this.selected + 1) % this.total;
        this.sectors.forEach((s, i) => {
            if (this.selected == i) {
                s.highlight();
            } else {
                s.removeHighlight();
            }
        });
    }
});

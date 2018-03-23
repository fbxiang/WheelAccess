const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Pango = imports.gi.Pango;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ExtensionImports = Me.imports;
const Convenience = ExtensionImports.convenience;

const SettingWidget = new GObject.Class({
    Name: 'WheelAccess.Prefs.Widget',
    GTypeName: 'WheelAccessExtensionPrefsWidget',
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);
        this.orientation = Gtk.Orientation.VERTICAL;
        this._settings = Convenience.getSettings();

        let title = '<b>' + "Wheel Access Preference" + '</b>';
        this.pack_start(new Gtk.Label({ label: title,
                                        use_markup: true,
                                        halign: Gtk.Align.START,
                                        valign: Gtk.Align.CENTER }),
                        1, 1, 5);

        let iconEntries = [];
        let commandEntries = [];
        for (let i = 0; i < 8; i++) {
            let icon = new Gtk.Entry(); 
            let command = new Gtk.Entry(); 
            iconEntries.push(icon);
            commandEntries.push(command);
            let actionBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
            actionBox.pack_start(new Gtk.Label({ label: 'Action ' + (i+1) }), 0, 0, 5);
            actionBox.pack_start(new Gtk.Label({ label: 'icon:' }), 0, 0, 5);
            actionBox.pack_start(icon, 0, 0, 5);
            actionBox.pack_start(new Gtk.Label({ label: 'Command:' + (i+1) }), 0, 0, 5);
            actionBox.pack_start(command, 1, 1, 5);
            this.pack_start(actionBox, 1, 1, 5);

            icon.set_text(this._settings.get_string('icon' + (i+1)));
            command.set_text(this._settings.get_string('command' + (i+1)));
        }

        let actionBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        let confirmButton = new Gtk.Button({ label: 'Confirm' });
        actionBox.pack_end(confirmButton, 0, 0, 5);
        this.pack_start(actionBox, 1, 1, 5);

        confirmButton.connect('clicked', () => {
            for (let i = 0; i < 8; i++) {
                this._settings.set_string('icon' + (i+1), iconEntries[i].get_text());
                this._settings.set_string('command' + (i+1), commandEntries[i].get_text());
            }
            this.get_toplevel().destroy();
        });
    }
});

function init() {}

function buildPrefsWidget() {
    const widget = new SettingWidget();
    widget.show_all();
    return widget;
}

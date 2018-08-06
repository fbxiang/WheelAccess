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

        let title = '<b>Wheel Access Preference</b>';
        this.pack_start(new Gtk.Label({ label: title,
                                        use_markup: true,
                                        halign: Gtk.Align.START,
                                        valign: Gtk.Align.CENTER }),
                        1, 1, 5);

        let iconEntries = [];
        let commandEntries = [];
        let buttons = [];
        for (let i = 0; i < 8; i++) {
            let icon = new Gtk.Entry(); 
            let command = new Gtk.Entry(); 
            let iconName = 'icon' + (i+1);
            let commandName = 'command' + (i+1);
            let button = new Gtk.Button({label: 'select...'});

            iconEntries.push(icon);
            commandEntries.push(command);
            buttons.push(button);

            let actionBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
            actionBox.pack_start(new Gtk.Label({ label: 'Action ' + (i+1) }), 0, 0, 5);
            actionBox.pack_start(new Gtk.Label({ label: 'icon:' }), 0, 0, 5);
            actionBox.pack_start(icon, 0, 0, 5);
            actionBox.pack_start(button, 0, 0, 5);
            actionBox.pack_start(new Gtk.Label({ label: 'Command:' + (i+1) }), 0, 0, 5);
            actionBox.pack_start(command, 1, 1, 5);
            this.pack_start(actionBox, 1, 1, 5);

            icon.set_text(this._settings.get_string(iconName));
            command.set_text(this._settings.get_string(commandName));
            icon.connect('focus-out-event', () => { this._settings.set_string(iconName, icon.get_text()); });
            command.connect('focus-out-event', () => { this._settings.set_string(commandName, command.get_text()); });
            button.connect('clicked', () => {
                let chooser = new Gtk.FileChooserDialog({title: "Choose File",
                                                         action: Gtk.FileChooserAction.OPEN
                                                        });
                chooser.add_button(Gtk.STOCK_CANCEL, 0);
                chooser.add_button(Gtk.STOCK_OPEN, 1);
                chooser.set_default_response(1);

                let filter = new Gtk.FileFilter();
                filter.add_pixbuf_formats();
                chooser.filter = filter;

                let filename;
                if (chooser.run() == 1) {
                    filename = chooser.get_filename();
                    icon.set_text(filename);
                }
                chooser.destroy();
                if (filename) {
                    this._settings.set_string(iconName, filename);
                }
            });
        }



        let sliderBox1 = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        let label1 = new Gtk.Label({ label: 'Wheel Size'});
        label1.set_width_chars(14);
        sliderBox1.pack_start(label1, 0, 0, 5);
        let outerSlider = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 0, 1, 0.1);
        outerSlider.set_draw_value(false);
        sliderBox1.pack_start(outerSlider, 1, 1, 5);
        this.pack_start(sliderBox1, 1, 1, 5);
        outerSlider.set_value(this._settings.get_double('outer-radius'));
        outerSlider.connect('focus-out-event', () => {this._settings.set_double('outer-radius', outerSlider.get_value());});

        let sliderBox2 = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
        let label2 = new Gtk.Label({ label: 'Inner Ratio'});
        label2.set_width_chars(14);
        sliderBox2.pack_start(label2, 0, 0, 5);
        let innerSlider = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 0, 1, 0.1);
        innerSlider.set_draw_value(false);
        sliderBox2.pack_start(innerSlider, 1, 1, 5);
        this.pack_start(sliderBox2, 1, 1, 5);
        innerSlider.set_value(this._settings.get_double('inner-radius'));
        innerSlider.connect('focus-out-event', () => {this._settings.set_double('inner-radius', innerSlider.get_value());});
    }
});

function init() {}

function buildPrefsWidget() {
    const widget = new SettingWidget();
    widget.show_all();
    return widget;
}

const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Cairo = imports.cairo;
const Gdk = imports.gi.Gdk;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const ExtensionImports = imports.misc.extensionUtils.getCurrentExtension().imports;
const Sector = ExtensionImports.sector;
const Wheel = ExtensionImports.wheel;
const Convenience = ExtensionImports.convenience;
const Icon = ExtensionImports.icon;
const Util = imports.misc.util;

const WHEEL_KEY = "wheel-access";

const ICON_OPACITY = 200;
const ICON_OPACITY_ACTIVE = 255;

let settings;
let button;
let wheel = null;

function _bindKey(key, handler) {
    if (Main.wm.addKeybinding && Shell.ActionMode) {
        Main.wm.addKeybinding(
            key,
            settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL,
            handler
        );
    }
    else if (Main.wm.addKeybinding && Shell.KeyBindingMode) {
        Main.wm.addKeybinding(
            key,
            settings,
            Meta.KeyBindingFlags.NONE,
            Shell.KeyBindingMode.NORMAL | Shell.KeyBindingMode.MESSAGE_TRAY,
            handler
        );
    }
    else {
        global.display.add_keybinding(
            key,
            settings,
            Meta.KeyBindingFlags.NONE,
            handler
        );
    }
}

function _unbindKey(key) {
    if (Main.wm.removeKeybinding) {
        Main.wm.removeKeybinding(key);
    }
    else {
        global.display.remove_keybinding(key);
    }
}

function bindKeys() {
    _bindKey(WHEEL_KEY, function() {
        wheel.show();
    });
}

function unbindKeys() {
    _unbindKey(WHEEL_KEY);
}

function updateSettings() {
    unbindKeys();
    settings = Convenience.getSettings();
    settings.connect('changed::command8', () => reinit()); // listen for any of the commands
    bindKeys();
}

function init() {
    updateSettings();
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });

    let icon = Icon.loadIcon('wheel-icon.png', 16);
    icon.opacity = ICON_OPACITY;
    button.set_child(icon);
    reinitWheel();
    button.connect('button-press-event', () => Util.spawn(['gnome-shell-extension-prefs', 'wheelaccess@fbxiang.outlook.com']));
    button.connect('enter-event', () => icon.opacity=ICON_OPACITY_ACTIVE);
    button.connect('leave-event', () => icon.opacity=ICON_OPACITY);
}

function enable() {
    updateSettings();
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    unbindKeys();
    Main.panel._rightBox.remove_child(button);
}

function reinitWheel() {
    if (wheel) {
        wheel.destroy();
        wheel = null;
    }

    let icons = [];
    let commands = [];
    for (let i = 1; i <= 8; i++) {
        let icon = settings.get_string('icon' + i);
        let command = settings.get_string('command' + i);
        if (icon != "" || command != "") {
            icons.push(icon);
            commands.push(command);
        }
    }
    wheel = new Wheel.WheelPopup(icons, commands);
}

function reinit() {
    updateSettings();
    reinitWheel();
}

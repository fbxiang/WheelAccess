const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const St = imports.gi.St;

function loadIcon(path, size=64) {
    if (path[0] != '/') {
        path = Me.path + '/icons/' + path;
    }
    let gicon = Gio.icon_new_for_string(path);
    return new St.Icon({gicon: gicon, icon_size: size});
}

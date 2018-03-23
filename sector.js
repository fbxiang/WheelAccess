const Clutter = imports.gi.Clutter;
const Cairo = imports.cairo;
const Main = imports.ui.main;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Icon = imports.misc.extensionUtils.getCurrentExtension().imports.icon;

const Sector = new Lang.Class({
    Name: 'Sector',
    _init: function(innerRadius, outerRadius, gap, index, total, iconPath="", command="") {
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.width = 2 * outerRadius;
        this.height = 2 * outerRadius;
        this.gap = gap;
        this.index = index;
        this.total = total;
        this.iconPath = iconPath;
        this.iconSize = this.outerRadius / 3;
        this.command = command;
        this._initActor();
        this._initIcon();
    },

    _initActor: function() {
        this.canvas = new Clutter.Canvas();
        this.actor = new Clutter.Actor();
        this.canvas.set_size(this.width, this.height);
        this.actor.set_size(this.width, this.height);
        this.actor.set_content(this.canvas);
        this.canvas.connect('draw', (canvas, cr, width, height) => { this._drawActor(cr); return true; });
        this.canvas.invalidate();

        let [centerX, centerY] = this._getCenter();
        this.actor.set_position(centerX - this.width / 2, centerY - this.height / 2);
        this.actor.opacity = 128;
    },

    _initIcon: function() {
        this.icon = Icon.loadIcon(this.iconPath, this.iconSize);
        this.iconBox = new St.Bin();
        this.iconBox.add_actor(this.icon);
        this.iconBox.width = Math.floor(this.iconSize);
        this.iconBox.height = Math.floor(this.iconSize);
        this.actor.add_actor(this.iconBox);

        let theta = 2 * Math.PI * this.index / this.total;
        let r = (this.innerRadius + this.outerRadius) / 2;
        let iconX = Math.floor(r * Math.cos(theta));
        let iconY = Math.floor(r * Math.sin(theta));
        this.iconBox.set_position(this.width / 2 - this.iconBox.width / 2 + iconX,
                                  this.height / 2 - this.iconBox.height / 2 + iconY);
    },

    _drawActor: function(cr) {
        cr.save();
        cr.setOperator(Cairo.Operator.CLEAR);
        cr.paint();
        cr.restore();

        let halfAngle = Math.PI / this.total;
        let halfInnerAngle = halfAngle - Math.asin(this.gap / this.innerRadius / 2);
        let halfOuterAngle = halfAngle - Math.asin(this.gap / this.outerRadius / 2);

        cr.save();
        cr.setOperator(Cairo.Operator.OVER);
        cr.setSourceRGBA(0.7, 0.7, 0.7, 1);

        cr.translate(this.width / 2, this.height / 2);
        cr.rotate(2 * Math.PI * this.index / this.total);

        cr.arcNegative(0, 0, this.innerRadius, halfInnerAngle, -halfInnerAngle);
        cr.arc(0, 0, this.outerRadius, -halfOuterAngle, halfOuterAngle);
        cr.closePath();
        cr.fill();
        cr.restore();
    },

    _getCenter: function() {
        let monitor = Main.layoutManager.primaryMonitor;
        return [monitor.x + Math.floor(monitor.width / 2),
                monitor.y + Math.floor(monitor.height / 2)];
    },

    highlight: function() {
        this.actor.opacity = 218;
    },

    removeHighlight: function() {
        this.actor.opacity = 128;
    },

    testPoint: function(x, y) {
        let [centerX, centerY] = this._getCenter();

        let dy = y - centerY;
        let dx = x - centerX;
        if (dy * dy + dx * dx < this.innerRadius * this.innerRadius) {
            return false;
        }
        
        let testAngle = Math.atan2(y - centerY, x - centerX);

        let angle = 2 * Math.PI / this.total;
        let midAngle = this.index * angle;

        let diffAngle = midAngle - testAngle;
        while (diffAngle >= Math.PI) {
            diffAngle -= 2 * Math.PI;
        }
        while (diffAngle < -Math.PI) {
            diffAngle += 2 * Math.PI;  
        } 

        return Math.abs(diffAngle) < angle / 2;
    }
});

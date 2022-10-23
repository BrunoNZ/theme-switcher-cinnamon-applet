const Applet = imports.ui.applet;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Tooltips = imports.ui.tooltips;
const PopupMenu = imports.ui.popupMenu;

const DESKTOP_INTERFACE_SCHEMA = 'org.cinnamon.desktop.interface';
const KEY_GTK_THEME = 'gtk-theme';
const KEY_ICON_THEME = 'icon-theme';

const WM_PREFERENCES_SCHEMA = 'org.cinnamon.desktop.wm.preferences';
const KEY_WM_THEME = 'theme';

const GTK_THEME_LIGHT = 'Mint-Y-Blue';
const GTK_THEME_DARK = 'Mint-Y-Dark-Blue';
const ICON_THEME_LIGHT = 'Mint-Y-Blue';
const ICON_THEME_DARK = 'Mint-Y-Dark-Blue';

class ThemeSwitcherAppletIcon {
    constructor(applet) {
        this._applet = applet;
        this.icon_name = 'theme-switcher';
        this.darkTheme = false;
    }

    setAppletIcon() {
        this._applet.set_applet_icon_symbolic_name(this.getAppletIcon());
    }

    getAppletIcon() {
        let appletIcon = this.icon_name;
        if (this.darkTheme) {
            appletIcon += '-dark';
        }
        return appletIcon;
    }

    toggleDarkThemeStatus(status) {
        this.darkTheme = status;
        this.setAppletIcon();
    }
}

class ThemeSwitcherHelper {
    constructor() {
        this.settings = new Gio.Settings({ schema_id: DESKTOP_INTERFACE_SCHEMA });
        this.settingsWM = new Gio.Settings({ schema_id: WM_PREFERENCES_SCHEMA });
    }

    themeSettingsAreWriteable() {
        return this.settings.is_writable(KEY_GTK_THEME)
                && this.settings.is_writable(KEY_ICON_THEME)
                && this.settingsWM.is_writable(KEY_WM_THEME);
    }

    setThemeVariation(enabled) {
        if (enabled) {
            this.settings.set_string(KEY_GTK_THEME, GTK_THEME_DARK);
            this.settings.set_string(KEY_ICON_THEME, ICON_THEME_DARK);
            // settingsWM.set_string(KEY_WM_THEME, HIGH_CONTRAST_THEME);
        } else {
            this.settings.set_string(KEY_GTK_THEME, GTK_THEME_LIGHT);
            this.settings.set_string(KEY_ICON_THEME, ICON_THEME_LIGHT);
            // settingsWM.set_string(KEY_WM_THEME, wmTheme);
        }
    }
}

class ThemeSwitcherApplet extends Applet.IconApplet {
    constructor(metadata, orientation, panel_height, instanceId) {
        super(orientation, panel_height, instanceId);

        this.metadata = metadata;

        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        this.icon = new ThemeSwitcherAppletIcon(this);
        this.icon.setAppletIcon();
        this.set_applet_tooltip(_("Inhibit applet"));

        this.ThemeSwitcherHelper = new ThemeSwitcherHelper();

        let darkThemeEnabled = false;
        this.darkSwitch = new PopupMenu.PopupSwitchMenuItem(_("Notifications"), darkThemeEnabled);

        this.darkSwitch.connect('toggled', Lang.bind(this, function () {
            this.ThemeSwitcherHelper.setThemeVariation(this.darkSwitch.state);
            this.icon.toggleDarkThemeStatus(this.darkSwitch.state);
        }));
        this.menu.addMenuItem(this.darkSwitch);
    }

    on_applet_clicked(event) {
        this.menu.toggle();
    }
}

function main(metadata, orientation, panel_height, instanceId) {
    return new ThemeSwitcherApplet(metadata, orientation, panel_height, instanceId);
}

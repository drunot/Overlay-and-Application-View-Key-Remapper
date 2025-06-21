import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Overview from "resource:///org/gnome/shell/ui/overview.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import Shell from "gi://Shell";
import Meta from "gi://Meta";

export default class StartOverlayInAppViewExtension extends Extension {
  originalToggle;

  constructor(metadata) {
    super(metadata);

    this.originalToggle = Overview.Overview.prototype.toggle;
  }

  _toggle_overview() {
    if (Main.overview.visible) {
      Main.overview.hide();
    } else {
      Main.overview.show();
    }
  }

  _enableKeybinding() {
    Main.wm.addKeybinding(
      "remapper-toggle-overview-key",
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode
        ? Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW
        : Shell.KeyBindingMode.NORMAL | Shell.KeyBindingMode.OVERVIEW,
      this._toggle_overview.bind(this)
    );
  }

  _disableKeybinding() {
    Main.wm.removeKeybinding("remapper-toggle-overview-key");
  }

  _onSettingsChanged(settings, key) {
    switch (key) {
      case "remapper-toggle-overview-key-enabled":
        if (settings.get_boolean(key)) {
          this._enableKeybinding();
        } else {
          this._disableKeybinding();
        }
        break;
    }
  }

  enable() {
    this._settings = this.getSettings();
    this._settingsChangedId = this._settings.connect(
      "changed",
      this._onSettingsChanged.bind(this)
    );

    Overview.Overview.prototype.toggle = function () {
      if (this.isDummy) return;

      if (this._visible) this.hide();
      else this.showApps();
    };

    if (this._settings.get_boolean("remapper-toggle-overview-key-enabled")) {
      this._enableKeybinding();
    }
  }

  disable() {
    Overview.Overview.prototype.toggle = this.originalToggle;
    this._settings.disconnect(this._settingsChangedId);
    if (this._settings.get_boolean("remapper-toggle-overview-key-enabled")) {
      this._disableKeybinding();
    }
    this._settings = null;
    this._settingsChangedId = null;
  }
}

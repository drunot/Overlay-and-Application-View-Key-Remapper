import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";
import Adw from "gi://Adw";
import GObject from "gi://GObject";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const keyvalIsForbidden$1 = (keyval) => {
  return [
    Gdk.KEY_Home,
    Gdk.KEY_Left,
    Gdk.KEY_Up,
    Gdk.KEY_Right,
    Gdk.KEY_Down,
    Gdk.KEY_Page_Up,
    Gdk.KEY_Page_Down,
    Gdk.KEY_End,
    Gdk.KEY_Tab,
    Gdk.KEY_KP_Enter,
    Gdk.KEY_Return,
    Gdk.KEY_Mode_switch,
  ].includes(keyval);
};

const isValidAccel$1 = (mask, keyval) => {
  return (
    Gtk.accelerator_valid(keyval, mask) ||
    (keyval === Gdk.KEY_Tab && mask !== 0)
  );
};

const isValidBinding$1 = (mask, keycode, keyval) => {
  return !(
    mask === 0 ||
    (mask === Gdk.ModifierType.SHIFT_MASK &&
      keycode !== 0 &&
      ((keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z) ||
        (keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z) ||
        (keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9) ||
        (keyval >= Gdk.KEY_kana_fullstop &&
          keyval <= Gdk.KEY_semivoicedsound) ||
        (keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun) ||
        (keyval >= Gdk.KEY_Serbian_dje &&
          keyval <= Gdk.KEY_Cyrillic_HARDSIGN) ||
        (keyval >= Gdk.KEY_Greek_ALPHAaccent &&
          keyval <= Gdk.KEY_Greek_omega) ||
        (keyval >= Gdk.KEY_hebrew_doublelowline &&
          keyval <= Gdk.KEY_hebrew_taf) ||
        (keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao) ||
        (keyval >= Gdk.KEY_Hangul_Kiyeog &&
          keyval <= Gdk.KEY_Hangul_J_YeorinHieuh) ||
        (keyval === Gdk.KEY_space && mask === 0) ||
        keyvalIsForbidden$1(keyval)))
  );
};

export default class ExamplePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    // Create a preferences page, with a single group
    const page = new Adw.PreferencesPage({
      title: _("General"),
      icon_name: "dialog-information-symbolic",
    });
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: _("New Overview Keybinding"),
      description: _("Configure the overview keybinding of the extension"),
    });
    page.add(group);

    // Create a new preferences row
    const row = new Adw.SwitchRow({
      title: _("Overview keyboard shortcut"),
      subtitle: _(
        "Enable or disable the keyboard shortcut to hide/view the GNOME window overview."
      ),
    });
    group.add(row);

    // Create a settings object and bind the row to the `show-indicator` key
    window._settings = this.getSettings();
    window._settings.bind(
      "remapper-toggle-overview-key-enabled",
      row,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    // Create a keybinding row for the toggle overview key
    const keybindingRow = createKeybindingRow(
      page,
      window._settings,
      "remapper-toggle-overview-key",
      "Toggle Overview Key",
      "Set the keybinding to toggle the GNOME overview.",
      "This keybinding will be used to show or hide the GNOME overview when the extension is active.",
      "Press a key combination to set the toggle overview keybinding."
    );
    group.add(keybindingRow);
  }
}

function createKeybindingRow(
  page,
  settings,
  key,
  title,
  subtitle,
  tooltop = "",
  disabled_text = ""
) {
  let adwrow = new Adw.ActionRow({
    title: _(title),
    subtitle: _(subtitle),
  });
  adwrow.set_tooltip_text(_(tooltop));
  //row7
  const shortcutLabel = new Gtk.ShortcutLabel({
    disabled_text: _(disabled_text),
    accelerator: settings.get_strv(key)[0],
    valign: Gtk.Align.CENTER,
    halign: Gtk.Align.CENTER,
  });
  settings.connect(`changed::${key}`, () => {
    shortcutLabel.set_accelerator(settings.get_strv(key)[0]);
  });
  adwrow.connect("activated", () => {
    const ctl = new Gtk.EventControllerKey();
    const content = new Adw.StatusPage({
      title: _("New hotkey"),
      icon_name: "preferences-desktop-keyboard-shortcuts-symbolic",
    });
    const editor = new Adw.Window({
      modal: true,
      transient_for: page.get_root(),
      hide_on_close: true,
      width_request: 320,
      height_request: 240,
      resizable: false,
      content,
    });
    editor.add_controller(ctl);
    ctl.connect("key-pressed", (_, keyval, keycode, state) => {
      let mask = state & Gtk.accelerator_get_default_mod_mask();
      mask &= ~Gdk.ModifierType.LOCK_MASK;
      if (!mask && keyval === Gdk.KEY_Escape) {
        editor.close();
        return Gdk.EVENT_STOP;
      }
      if (
        !isValidBinding$1(mask, keycode, keyval) ||
        !isValidAccel$1(mask, keyval)
      ) {
        return Gdk.EVENT_STOP;
      }
      settings.set_strv(key, [
        Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask),
      ]);
      editor.destroy();
      return Gdk.EVENT_STOP;
    });
    editor.present();
  });
  adwrow.add_suffix(shortcutLabel);
  adwrow.activatable_widget = shortcutLabel;

  return adwrow;
}

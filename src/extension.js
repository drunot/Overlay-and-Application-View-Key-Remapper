/**
 * @file extension.js
 *
 * GNOME Shell extension that remaps the overview key.
 *
 * Copyright (C) 2025 Anton Vigen Smolarz
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Overview from "resource:///org/gnome/shell/ui/overview.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { HotCorner } from "resource:///org/gnome/shell/ui/layout.js";
import GLib from "gi://GLib";
import Shell from "gi://Shell";
import Meta from "gi://Meta";

function toggleOverview() {
  if (this.isDummy) return;

  if (this._visible) this.hide();
  else this.show();
}

const OVERVIEW_ACTIVATION_TIMEOUT = 0.5;

// This is a reimplementation of the original
// Overview.Overview.shouldToggleByCornerOrButton
function shouldToggleByCornerOrButton() {
  if (this._animationInProgress) return false;
  if (this._inItemDrag || this._inWindowDrag) return false;
  if (
    !this._activationTime ||
    GLib.get_monotonic_time() / GLib.USEC_PER_SEC - this._activationTime >
      OVERVIEW_ACTIVATION_TIMEOUT
  )
    return true;
  return false;
}

// Unfortunately, activities button class is not exported,
// so to give it normal functionality we have to
// reimplement Overview.Overview.shouldToggleByCornerOrButton
// and have it call toggleOverview instead of letting the if statements
// do it in the original function. this.toggled is used to prevent the
// intercepted toggle from being called once.
function fooShouldToggleByCornerOrButton() {
  if (this._animationInProgress) return false;
  if (this._inItemDrag || this._inWindowDrag) return false;
  if (
    !this._activationTime ||
    GLib.get_monotonic_time() / GLib.USEC_PER_SEC - this._activationTime >
      OVERVIEW_ACTIVATION_TIMEOUT
  ) {
    toggleOverview.call(this);
    this.toggled = true;
    return true;
  }
  return false;
}


// This is a reimplementation of the original
// HotCorner._toggleOverview
function toggleOverviewHotCorners() {
  if (this._monitor.inFullscreen && !Main.overview.visible) return;

  if (shouldToggleByCornerOrButton.call(Main.overview)) {
    toggleOverview.call(Main.overview);
    if (Main.overview.animationInProgress)
      this._ripples.playAnimation(this._x, this._y);
  }
}

// This is a reimplementation of the original
// HotCorner._toggleOverview, but it does call
// Overview.Overview.toggle, instead of our own
// implementation. THis function will therefore
// show the apps view instead of the overview.
function toggleOverviewHotCornersNormalToggle() {
  if (this._monitor.inFullscreen && !Main.overview.visible) return;

  if (shouldToggleByCornerOrButton.call(Main.overview)) {
    Main.overview.toggle();
    if (Main.overview.animationInProgress)
      this._ripples.playAnimation(this._x, this._y);
  }
}

export default class StartOverlayInAppViewExtension extends Extension {
  originalToggle;
  originalShouldToggleByCornerOrButton;
  originalHotCornerToggleOverview;

  constructor(metadata) {
    super(metadata);

    this.originalToggle = Overview.Overview.prototype.toggle;
    this.originalShouldToggleByCornerOrButton =
      Overview.Overview.prototype.shouldToggleByCornerOrButton;
    this.originalHotCornerToggleOverview = HotCorner.prototype._toggleOverview;
  }

  _enableKeybinding() {
    Main.wm.addKeybinding(
      "remapper-toggle-overview-key",
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode
        ? Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW
        : Shell.KeyBindingMode.NORMAL | Shell.KeyBindingMode.OVERVIEW,
      this.originalToggle.bind(Main.overview) // Use the original toggle function
    );
  }

  _disableKeybinding() {
    Main.wm.removeKeybinding("remapper-toggle-overview-key");
  }

  _updateHotCornersAndActivitiesButton(settings) {
    if (
      settings.get_boolean("remapper-override-hot-corner-enabled") &&
      settings.get_boolean("remapper-override-activity-button-enabled")
    ) {
      // If both overrides are enabled, we use the original toggle
      // function for hot corners and the original shouldToggleByCornerOrButton
      // since the toggle function in the overview will always be overridden
      // when this extension is enabled.
      HotCorner.prototype._toggleOverview =
        this.originalHotCornerToggleOverview;
      Overview.Overview.prototype.shouldToggleByCornerOrButton =
        this.originalShouldToggleByCornerOrButton;
    } else if (
      settings.get_boolean("remapper-override-activity-button-enabled")
    ) {
      // If only the activities button override is enabled, we use the
      // toggleOverviewHotCorners function for hot corners so it will
      // not use the overridden toggle function in the overview.
      HotCorner.prototype._toggleOverview = toggleOverviewHotCorners;
      Overview.Overview.prototype.shouldToggleByCornerOrButton =
        this.originalShouldToggleByCornerOrButton;
    } else if (settings.get_boolean("remapper-override-hot-corner-enabled")) {
      // If only the hot corners override is enabled, we use the
      // toggleOverviewHotCornersNormalToggle function for hot corners
      // so it will use the overridden toggle function in the overview.
      // This does not use the overridden shouldToggleByCornerOrButton
      // that is used by the activities button to show the normal view.
      HotCorner.prototype._toggleOverview =
        toggleOverviewHotCornersNormalToggle;
      Overview.Overview.prototype.shouldToggleByCornerOrButton =
        fooShouldToggleByCornerOrButton;
    } else {
      // If neither override is enabled, we use the toggleOverviewHotCorners
      // function for hot corners so it will show the overview and not the apps view.
      // We also use fooShouldToggleByCornerOrButton to show the overview
      // when the activities button is clicked.
      HotCorner.prototype._toggleOverview = toggleOverviewHotCorners;
      Overview.Overview.prototype.shouldToggleByCornerOrButton =
        fooShouldToggleByCornerOrButton;
    }
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
      case "remapper-toggle-overview-key":
        if (settings.get_boolean("remapper-toggle-overview-key-enabled")) {
          this._disableKeybinding();
          this._enableKeybinding();
        }
        break;
      case "remapper-override-hot-corner-enabled":
      case "remapper-override-activity-button-enabled":
        this._updateHotCornersAndActivitiesButton(settings);
        Main.layoutManager._updateHotCorners();
        break;
    }
  }

  enable() {

    // Set up the settings and the settings event handler.
    this._settings = this.getSettings();
    this._settingsChangedId = this._settings.connect(
      "changed",
      this._onSettingsChanged.bind(this)
    );

    // Override the toggle function in Overview.Overview
    Overview.Overview.prototype.toggle = function () {
      // If toggled is true, it means that the toggle function
      // was called by the hot corner or activities button, so we
      // do not want to call it again.
      if (this.toggled || false) {
        this.toggled = false;
        return;
      }
      if (this.isDummy) return;

      if (this._visible) this.hide();
      else this.showApps();
    };

    // Update the activities button and hot corners based on settings.
    this._updateHotCornersAndActivitiesButton(this._settings);
    Main.layoutManager._updateHotCorners();

    // Enable the keybinding if it is enabled in settings.
    if (this._settings.get_boolean("remapper-toggle-overview-key-enabled")) {
      this._enableKeybinding();
    }
  }

  disable() {

    // Restore the original toggle function in Overview.Overview
    Overview.Overview.prototype.toggle = this.originalToggle;
    Overview.Overview.prototype.shouldToggleByCornerOrButton =
      this.originalShouldToggleByCornerOrButton;

    // Restore the original toggle function in HotCorner
    HotCorner.prototype._toggleOverview = this.originalHotCornerToggleOverview;
    Main.layoutManager._updateHotCorners();

    // Disconnect the settings changed handler and clean up.
    this._settings.disconnect(this._settingsChangedId);
    if (this._settings.get_boolean("remapper-toggle-overview-key-enabled")) {
      this._disableKeybinding();
    }
    this._settings = null;
    this._settingsChangedId = null;
  }
}

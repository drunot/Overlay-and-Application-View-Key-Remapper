# Overlay and Application View Keyboard Shortcut Remapper for Gnome 48:

When activating overview (Super button), the application view is shown instead of the view with the windows. This is a fork of David Hexcz extension, that is an updated version of the extension Start Overlay in Application View created by tmk (https://extensions.gnome.org/accounts/profile/tmk). Tested on Gnome 48. It probably works on other versions, but since it messes with a lot of gnome implementations I have not added them to the meta file.

The original version by David Hexcz can be found [here](https://github.com/Hexcz/Start-Overlay-in-Application-View-for-Gnome-40-).

## Expected behavior:

This extension is changing the behavior for when the following two views are shown in gnome.

The overview or activities view: (It is called both by Gnome)\
![Overview](https://i.imgur.com/7ron9Po.png)

The application view:\
![Application view](https://i.imgur.com/CKpmBQk.png)

Normally when hitting the `Super key` the overview will show. This extension changes things around so the application view is shown instead.

By default a new keyboard shortcut for showing the overview is added to `Super key + D`. This can both be disabled and configured to a different key.

When doing this change normally the activities button and the hot corner in the upper left corner will also change to show the app view.
Their normal functionality is restored and by default they show the overview. It can be enabled that they should show the application view instead.

## Installation
The extension can be installed from [Gnome Extensions here](https://extensions.gnome.org/extension/8257/). 

## Manual installation

For manual installation, just run the following command:

```bash
$ make install
```

## License

The code in this repository is released under the GPLv3 license.

Some of the code is taken from [Gnome Shell](https://gitlab.gnome.org/GNOME/gnome-shell) which is licensed under GPLv2.

The code for remapping keys is adapted from from Kyle Robbertze's extension [Shortcuts Gnome Extension](https://gitlab.com/paddatrapper/shortcuts-gnome-extension/) which is licensed under GPLv3.

All the code from the original extension by David Hexcz, JustPerfection and TMK is unfortunately without a specific license but is relicensed here under GPLv3.

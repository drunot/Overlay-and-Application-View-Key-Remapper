# Overlay and Application View Keyboard Shortcut Remapper for Gnome 40+:
When activating overview (Super button), the application view is shown instead of the view with the windows. This is a updated version of the extension Start Overlay in Application View created by tmk (https://extensions.gnome.org/accounts/profile/tmk), also i'd like to thanks user JustPerfection (https://extensions.gnome.org/accounts/profile/JustPerfection) for helping me on this extension. Tested on Gnome 42, didn't had time to test on 40 and 41 versions but it should work (let me know if it don't please).

## Expected behavior:
After hitting `Super key`, instead of display overview:\
![Overview](https://i.imgur.com/7ron9Po.png)

Applications view is displayed in it's place:\
![Application view](https://i.imgur.com/CKpmBQk.png)

When hitting `Super key + D` the display overview is still accessible.

## Manual instalation:
For manual installation, just paste the folder containing the `extension.js`, `metadata.js`, and `schemas` entires at `.local/share/gnome-shell/extensions` folder, then restart your gnome-shell (on X11 press alt+f2, type r in the command box) or simply log in and out of your account. After that the extension should appear on extensions manager. Do *not* rename the folder.

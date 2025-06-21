#=============================================================================
UUID=app-window-view-key-remapper@antonvigensmolarz.dk
SRCDIR=src
BUILDDIR=build
EXTENSIONDIR=~/.local/share/gnome-shell/extensions
SCHEMADIR=schemas
SCHEMACOMPILEER=glib-compile-schemas
#=============================================================================
.PHONY: all build clean move zip install uninstall debug_install

all: zip

build: move
	$(SCHEMACOMPILEER) $(BUILDDIR)/$(UUID)/$(SCHEMADIR)

clean:
	rm -rf $(BUILDDIR)

move: clean
	mkdir -p $(BUILDDIR)
	cp -r $(SRCDIR) $(BUILDDIR)/$(UUID)

zip: build
	cd $(BUILDDIR)/$(UUID) && zip -r $(UUID).zip * && mv $(UUID).zip ../

install: uninstall build
	mkdir -p $(EXTENSIONDIR)/$(UUID)
	cp -r $(BUILDDIR)/$(UUID) $(EXTENSIONDIR)/

uninstall:
	rm -rf $(EXTENSIONDIR)/$(UUID)

debug_install: uninstall
	ln -s "$(realpath ./)/$(SRCDIR)" $(UUID)
	mv $(UUID) $(EXTENSIONDIR)
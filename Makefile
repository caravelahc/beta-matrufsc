include config.mak

default: install

all: capim.js index.html

SRC:=json2.js \
     utils.js \
     compat.js \
     persistence.js \
     dconsole.js \
     combinacoes.js \
     materias.js \
     display.js \
     combobox.js \
     database.js \
     state.js \
     versao.js \
     widgets.js \
     ui_sobre_popup.js \
     ui_avisos.js \
     ui_campus.js \
     ui_combinacoes.js \
     ui_horario.js \
     ui_logger.js \
     ui_materias.js \
     ui_planos.js \
     ui_saver.js \
     ui_turmas.js \
     ui_updates.js \
     main.js


.PHONY: install


SRC:=$(addprefix js/,$(SRC))

%.gz: %
	gzip --best --no-name -c frontend/$< > frontend/$@

ifeq ($(RELEASE),1)
	sed_RELEASE=-e "s/if(0)/if(1)/"
endif

index.html: html/capim.html html/sobre.html
	sed -e "/include_sobre/r html/sobre.html" -e "/include_sobre/d" ${sed_RELEASE} html/capim.html | tee $@ > /dev/null

capim.js: $(SRC)
ifeq ($(RELEASE),1)
	closure --compilation_level=SIMPLE_OPTIMIZATIONS $(addprefix --js=,$(SRC)) --js_output_file=$@
else
	cat $^ > $@
endif

clean::
	rm -rf capim.js index.html
	rm -rf ${SITE_PATH}
	rm -f $(addsuffix /*~,. c db html js py) .htaccess~ .gitignore~
	rm -f capim.css.gz capim.js.gz index.html.gz

distclean: clean
	rm -f .htaccess
	rm -f config.mak

install-gz:: install capim.css.gz capim.js.gz index.html.gz
	@echo "Installing GZ files..."
ifndef SITE_PATH
	@echo "Please, set SITE_PATH variable to output directory."
	@exit 1
endif

install:: all
	@echo "Installing..."
ifndef SITE_PATH
	@echo "Please, set SITE_PATH variable to output directory."
	@exit 1
endif
	mkdir -p ${SITE_PATH}
	cp favicon.ico capim.css ${SITE_PATH}/
	mv capim.js index.html ${SITE_PATH}/
	cp .htaccess ${SITE_PATH}/

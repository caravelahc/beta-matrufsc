#!/usr/bin/env python2
# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
from xml.etree import ElementTree as ET
from StringIO import StringIO
import cookielib
import urllib2
import urllib
import gzip
import sys

if len(sys.argv) < 1:
    print('usage: %s [semestre]' % sys.argv[0])
    sys.exit(1)

try:
    semestre = sys.argv[1]
except IndexError:
    semestre = '20182'

jar = cookielib.CookieJar()
opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(jar), urllib2.HTTPSHandler(debuglevel=0))

print('Semestre: %s' % semestre)
#Comentado pois foi encontrado uma forma de acessar as turmmas sem o login
##print('- Acessando pagina de login')
#resp = opener.open('https://cagr.sistemas.ufsc.br/modules/aluno')
#soup = BeautifulSoup(resp)
#try:
#    url_action = soup.form['action']
#    login_form = {}
#    for input in soup.findAll('input'):
#        try:
#            login_form[input['name']] = input['value']
#        except KeyError:
#            pass
#except KeyError:
#    print 'k-gay'
#login_form['username'] = sys.argv[1]
#login_form['password'] = sys.argv[2]
#
##print('- Fazendo login')
#resp = opener.open('https://sistemas.ufsc.br' + url_action, urllib.urlencode(login_form))
#

#print('- Acessando Cadastro de Turmas')
resp = opener.open('https://cagr.sistemas.ufsc.br/modules/comunidade/cadastroTurmas/')
soup = BeautifulSoup(resp)
viewState = soup.find('input', {'name':'javax.faces.ViewState'})['value']

#print('- Pegando banco de dados')
request = urllib2.Request('https://cagr.sistemas.ufsc.br/modules/comunidade/cadastroTurmas/index.xhtml')
request.add_header('Accept-encoding', 'gzip')
page_form = {
'AJAXREQUEST': '_viewRoot',
'formBusca:selectSemestre': semestre,
'formBusca:selectDepartamento': '',
'formBusca:selectCampus': '1',
'formBusca:selectCursosGraduacao': '0',
'formBusca:codigoDisciplina': '',
'formBusca:j_id135_selection': '',
'formBusca:filterDisciplina': '',
'formBusca:j_id139': '',
'formBusca:j_id143_selection': '',
'formBusca:filterProfessor': '',
'formBusca:selectDiaSemana': '0',
'formBusca:selectHorarioSemana': '',
'formBusca': 'formBusca',
'autoScroll': '',
'javax.faces.ViewState': viewState,
'formBusca:dataScroller1': '1',
'AJAX:EVENTS_COUNT': '1',
        }

def find_id(xml, id):
    for x in xml:
        if x.get('id') == id:
            return x
        else:
            y = find_id(x, id)
            if y is not None:
                return y
    return None
def go_on(xml):
    scroller = find_id(xml, 'formBusca:dataScroller1_table')
    if scroller is None:
        return False
    for x in scroller[0][0]:
        onclick = x.get('onclick')
        if onclick is not None and 'next' in onclick:
            return True
    return False

campus_str = [ 'EaD', 'FLO', 'JOI', 'CBS', 'ARA' ]
if semestre >= '20141':
    campus_str.append('BLN')
for campus in range(1, len(campus_str)):
    print('campus ' + campus_str[campus])
    outfile = open(semestre + '_' + campus_str[campus] + '.xml', 'w')
    page_form['formBusca:selectCampus'] = campus
    pagina = 1
    while 1:
        page_form['formBusca:dataScroller1'] = pagina
        resp = opener.open(request, urllib.urlencode(page_form))
        if resp.info().get('Content-Encoding') == 'gzip':
            buf = StringIO(resp.read())
            f = gzip.GzipFile(fileobj=buf)
            data = f.read()
        else:
            data = resp.read()
        outfile.write(data)
        parser = ET.XMLParser()
        parser.entity.update({
            'aacute': 'á',
            'atilde': 'ã',
            'ccedil': 'ç',
            'eacute': 'é',
            'ecirc': 'ê',
            'Aacute': 'Á',
            'Atilde': 'Ã',
            'Ccedil': 'Ç',
            'Eacute': 'É',
            'Ecirc': 'Ê',
        })
        xml = ET.XML(data, parser=parser)
        if not go_on(xml):
            break
        pagina = pagina + 1
    outfile.close()

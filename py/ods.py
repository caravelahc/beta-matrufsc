#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import StringIO
import json
import odslib


def run(json_in):
    data = json.loads(json_in)

    sheet = odslib.ODS()

    sheet.content.getCell(0, 0).stringValue('MatrUFSC').setBold(True)
    sheet.content.getCell(1, 0).stringValue('Segunda')
    sheet.content.getCell(2, 0).stringValue('Terça')
    sheet.content.getCell(3, 0).stringValue('Quarta')
    sheet.content.getCell(4, 0).stringValue('Quinta')
    sheet.content.getCell(5, 0).stringValue('Sexta')
    sheet.content.getCell(6, 0).stringValue('Sábado')

    sheet.content.getCell(0,  1).stringValue('07:30 - 08:20')
    sheet.content.getCell(0,  2).stringValue('08:20 - 09:10')
    sheet.content.getCell(0,  3).stringValue('09:10 - 10:00')
    sheet.content.getCell(0,  4).stringValue('10:10 - 11:00')
    sheet.content.getCell(0,  5).stringValue('11:00 - 11:50')
    sheet.content.getCell(0,  6).stringValue('13:30 - 14:20')
    sheet.content.getCell(0,  7).stringValue('14:20 - 15:10')
    sheet.content.getCell(0,  8).stringValue('15:10 - 16:00')
    sheet.content.getCell(0,  9).stringValue('16:20 - 17:10')
    sheet.content.getCell(0, 10).stringValue('17:10 - 18:00')
    sheet.content.getCell(0, 11).stringValue('18:30 - 19:20')
    sheet.content.getCell(0, 12).stringValue('19:20 - 20:10')
    sheet.content.getCell(0, 13).stringValue('20:20 - 21:10')
    sheet.content.getCell(0, 14).stringValue('21:10 - 22:00')

    for i, day in enumerate(data['horarios']):
        for j, credit in enumerate(day):
            if credit:
                cell = sheet.content.getCell(i + 1, j + 1)
                cell.stringValue(credit['codigo']).setCellColor(credit['cor'])

    sheet.content.getCell(0, 15).stringValue('Código')
    sheet.content.getCell(1, 15).stringValue('Turma')
    sheet.content.getCell(2, 15).stringValue('Nome')

    for i, class_ in enumerate(data['turmas'], start=16):
        for j, info in enumerate(['codigo', 'class_', 'nome']):
            cell = sheet.content.getCell(j, i)
            cell.stringValue(info).setCellColor(class_['cor'])
            sheet.content.mergeCells(2, i, 5, 1)

    output = StringIO.StringIO()
    sheet.save(output)
    return output.getvalue()

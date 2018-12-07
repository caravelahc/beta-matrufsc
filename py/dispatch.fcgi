#!/usr/bin/env python3
# -*- coding: utf8 -*-

import capim
import datetime
import os
import time
import traceback

LOGS_PREFIX = '$BASE_PATH/logs/'


RESPONSE_404_BODY = '''
<!DOCTYPE html>
<html>
<head>
    <title>404</title>
</head>
<body>
    <center>404 - Arquivo não encontrado</center>
</body>
</html>
'''


def capim_mtime():
    return time.ctime(os.path.getmtime('capim.py'))


last_mtime = capim_mtime()


def dispatch(environ, start_response):
    global last_mtime
    new_mtime = capim_mtime()

    if last_mtime != new_mtime:
        reload(capim)  # Who the fuck commited a non-existent function call?
        last_mtime = new_mtime

    try:
        return capim.run(environ, start_response)
    except IOError:
        now = datetime.datetime.now()
        filename = f'{LOGS_PREFIX}{now.year}_{now.month}_{now.day}.log'
        with open(filename, 'a') as fp:
            fp.write(
                f'{"="*60}\n'
                f'{now}\n'
                f'{environ}\n'
            )
            traceback.print_exc(file=fp)
        start_response(
            '404 Not Found',
            [('Content-Type', 'text/html; charset=UTF-8')]
        )
        return [RESPONSE_404_BODY]


if __name__ == '__main__':
    ext = __file__.split('.')[-1]
    if ext == 'fcgi':
        from flup.server.fcgi_fork import WSGIServer
        WSGIServer(dispatch).run()
    else:
        from wsgiref.handlers import CGIHandler
        CGIHandler().run(dispatch)

import sqlite3

from doto.const import SQLITE_PATH

# Create the DB dir if necessary
if not SQLITE_PATH.is_file() and not SQLITE_PATH.parent.is_dir():
    SQLITE_PATH.parent.mkdir(mode=0o750, parents=True)
print('Opening DB at {}'.format(SQLITE_PATH))


def get_conn():
    return sqlite3.connect(SQLITE_PATH, isolation_level=None)

import re
import time
from datetime import datetime

from doto.data.conn import get_conn

synced = False

ALL_TABLES = ['task']


def create_schema(c=get_conn(), tables=ALL_TABLES):
    """ Create the schema """

    if 'task' in tables:
        c.execute("""CREATE TABLE task (
            task_id integer primary key,
            priority integer default 30,
            name varchar unique not null,
            notes text,
            added integer not null,
            deadline integer default null,
            completed integer default null
        );""")


def sync(func):
    global synced
    """ Check if the tables exist, if not create them """
    def wrapper(*args, **kwargs):
        global synced
        if synced:
            return func(*args, **kwargs)

        tables_to_create = []

        conn = get_conn()
        cur = conn.cursor()

        for tbl in ALL_TABLES:
            cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?;", (tbl,))
            res = cur.fetchall()
            print('rowcount', len(res))
            if len(res) < 1:
                tables_to_create.append(tbl)

        if len(tables_to_create) > 0:
            create_schema(tables=tables_to_create)

        synced = True

        return func(*args, **kwargs)

    return wrapper


def datetime_to_timestamp(v):
    return time.mktime(v.timetuple())


def timestamp_to_datetime(v):
    if type(v) == str:
        v = int(v)
    return datetime.fromtimestamp(v)


def is_intstr(v):
    """ Check if the value is a string representing an integer """
    return re.match(r'^[0-9]+$', v) is not None


def jstimestamp_to_int(v):
    """ Take a JS int string and turn it into an int timestamp """
    if not is_intstr(v):
        raise ValueError('Deadline is invalid value')
    # don't care about ms
    return int(v[:-3])


def datetime_to_string(v):
    return v.isoformat()


def string_to_datetime(v):
    return datetime.fromisoformat(v)


def date_db_to_json(v):
    return datetime_to_string(timestamp_to_datetime(v))


def date_json_to_db(v):
    return datetime_to_timestamp(string_to_datetime(v))

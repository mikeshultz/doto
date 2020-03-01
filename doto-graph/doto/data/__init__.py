from datetime import datetime

from doto.data.conn import get_conn
# noqa: F401
from doto.data.utils import sync, datetime_to_timestamp, timestamp_to_datetime, date_json_to_db
from doto.data.objects import Task
# noqa: F401
from doto.data.calendar import (
    authorize_user_step1,
    authorize_user_step2,
    get_calendars,
    get_all_calendars,
    get_calendar_ids,
    get_events,
)
from doto.data.weather import get_forecast


@sync
def get_tasks():
    tasks = []
    conn = get_conn()
    curs = conn.cursor()
    curs.execute("""SELECT task_id, priority, name, notes, added, deadline, completed
        FROM task
        ORDER BY priority, deadline DESC, added DESC;
        """)
    for row in curs.fetchall():
        deadline = None
        completed = None

        if row[5]:
            deadline = timestamp_to_datetime(row[5])

        if row[6]:
            completed = timestamp_to_datetime(row[6])

        t = Task(
            task_id=row[0],
            priority=row[1],
            name=row[2],
            notes=row[3],
            added=timestamp_to_datetime(row[4]),
            deadline=deadline,
            completed=completed,
        )

        tasks.append(t)

    curs.close()
    return tasks


@sync
def get_task(task_id):
    conn = get_conn()
    curs = conn.cursor()
    curs.execute("""SELECT task_id, priority, name, notes, added, deadline,
        completed
        FROM task WHERE task_id=?;""", (task_id, ))
    row = curs.fetchone()

    if not row:
        return None

    task_id = row[0]
    priority = row[1]
    name = row[2]
    notes = row[3]
    added = timestamp_to_datetime(row[4])
    deadline = row[5]
    completed = row[6]

    if deadline:
        deadline = timestamp_to_datetime(deadline)

    if completed:
        completed = timestamp_to_datetime(completed)

    task = Task(
        task_id,
        priority,
        name,
        notes,
        added,
        deadline,
        completed,
    )
    curs.close()
    return task


@sync
def create_task(priority, name, notes, added=None, deadline=None, completed=None):
    """ Create a teask """
    conn = get_conn()
    curs = conn.cursor()
    added = datetime_to_timestamp(added or datetime.now())
    if deadline:
        deadline = date_json_to_db(deadline)
    if completed:
        completed = date_json_to_db(completed)
    curs.execute(
        """INSERT INTO task 
        (priority, name, notes, added, deadline, completed)
        VALUES (?, ?, ?, ?, ?, ?);""", (
            priority, name, notes, added, deadline, completed
        )
    )
    print('create_task curs.rowcount', curs.rowcount)
    if curs.rowcount < 1:
        return None

    # This is totally a race condition and I don't think there's a reasonable
    # way out here.  Could maybe do some checks to make sure only one task_id
    # has been added(get max before and after INSERT) but all that will tell us
    # is if something *may have* gone wrong.
    curs.execute('SELECT last_insert_rowid();')
    res = curs.fetchone()
    return res[0]


@sync
def delete_task(task_id):
    """ Create a teask """
    conn = get_conn()
    curs = conn.cursor()
    curs.execute('DELETE FROM task WHERE task_id=?;', (task_id,))
    print('delete_task curs.rowcount', curs.rowcount)
    return curs.rowcount > 0


@sync
def complete_task(task_id):
    """ Create a teask """
    when = datetime_to_timestamp(datetime.now())
    conn = get_conn()
    curs = conn.cursor()
    curs.execute('UPDATE task SET completed = ? WHERE task_id=?;', (when, task_id))
    print('complete_task curs.rowcount', curs.rowcount)
    return curs.rowcount > 0


@sync
def update_task(task_id, priority, name, notes, deadline=None, completed=None):
    """ Create a teask """
    conn = get_conn()
    curs = conn.cursor()
    if deadline:
        deadline = date_json_to_db(deadline)
    if completed:
        completed = date_json_to_db(completed)
    curs.execute(
        """UPDATE task 
        SET priority=?,
        name=?,
        notes=?,
        deadline=?,
        completed=?
        WHERE task_id=?;""", (
            priority, name, notes, deadline, completed, task_id
        )
    )
    print('update_task curs.rowcount', curs.rowcount)
    return curs.rowcount >= 1

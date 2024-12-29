from datetime import datetime

# noqa: F401
from doto.data.calendar import (
    authorize_user_step1,
    authorize_user_step2,
    get_all_calendars,
    get_calendar_ids,
    get_calendars,
    get_events,
)
from doto.data.conn import get_conn
from doto.data.devices import (
    DeviceNotFound,
    device_off,
    device_on,
    device_toggle,
    get_devices,
)
from doto.data.objects import Task

# noqa: F401
from doto.data.utils import (
    date_json_to_db,
    datetime_to_timestamp,
    sync,
    timestamp_to_datetime,
)
from doto.data.weather import get_forecast


@sync
def get_tasks(task_filter):
    tag_filter = None
    tasks = []
    conn = get_conn()
    curs = conn.cursor()

    if task_filter:
        if "tag" in task_filter:
            tag_filter = "%{}%".format(task_filter.get("tag"))

    if tag_filter is not None:
        curs.execute(
            """SELECT task_id, priority, name, notes, added, deadline, completed, tags
            FROM task
            WHERE tags LIKE ?
            ORDER BY priority, deadline DESC, added DESC;
            """,
            (tag_filter,),
        )
    else:
        curs.execute("""SELECT task_id, priority, name, notes, added, deadline, completed, tags
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
            tags=row[7],
        )

        tasks.append(t)

    curs.close()
    return tasks


@sync
def get_task(task_id):
    conn = get_conn()
    curs = conn.cursor()
    curs.execute(
        """SELECT task_id, priority, name, notes, added, deadline,
        completed, tags
        FROM task WHERE task_id=?;""",
        (task_id,),
    )
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
    tags = row[7]

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
        tags,
    )
    curs.close()
    return task


@sync
def create_task(priority, name, notes, tags, added=None, deadline=None, completed=None):
    """Create a teask"""
    conn = get_conn()
    curs = conn.cursor()
    added = datetime_to_timestamp(added or datetime.now())
    if deadline:
        deadline = date_json_to_db(deadline)
    if completed:
        completed = date_json_to_db(completed)
    curs.execute(
        """INSERT INTO task 
        (priority, name, notes, added, deadline, completed, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?);""",
        (priority, name, notes, added, deadline, completed, tags),
    )
    print("create_task curs.rowcount", curs.rowcount)
    if curs.rowcount < 1:
        return None

    # This is totally a race condition and I don't think there's a reasonable
    # way out here.  Could maybe do some checks to make sure only one task_id
    # has been added(get max before and after INSERT) but all that will tell us
    # is if something *may have* gone wrong.
    curs.execute("SELECT last_insert_rowid();")
    res = curs.fetchone()
    return res[0]


@sync
def delete_task(task_id):
    """Create a teask"""
    conn = get_conn()
    curs = conn.cursor()
    curs.execute("DELETE FROM task WHERE task_id=?;", (task_id,))
    print("delete_task curs.rowcount", curs.rowcount)
    return curs.rowcount > 0


@sync
def complete_task(task_id):
    """Create a teask"""
    when = datetime_to_timestamp(datetime.now())
    conn = get_conn()
    curs = conn.cursor()
    curs.execute("UPDATE task SET completed = ? WHERE task_id=?;", (when, task_id))
    print("complete_task curs.rowcount", curs.rowcount)
    return curs.rowcount > 0


@sync
def update_task(task_id, priority, name, notes, tags, deadline=None, completed=None):
    """Create a teask"""
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
        completed=?,
        tags=?
        WHERE task_id=?;""",
        (priority, name, notes, deadline, completed, tags, task_id),
    )
    print("update_task curs.rowcount", curs.rowcount)
    return curs.rowcount >= 1


@sync
def get_tags():
    tags = set()
    conn = get_conn()
    curs = conn.cursor()

    curs.execute("""SELECT tags FROM task WHERE completed IS NULL;""")

    for row in curs.fetchall():
        row_tags = row[0]
        for t in row_tags.split(","):
            if t:
                tags.add(t)

    curs.close()
    return tags

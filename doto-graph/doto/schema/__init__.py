import sys
from graphene import ID, Schema, ObjectType, Field, List

from doto.data import (
    get_task,
    get_tasks,
    get_calendars,
    get_calendar_ids,
    get_calendar,
)
from doto.schema.mutations import (
    CreateTask,
    CompleteTask,
    UpdateTask,
    DeleteTask,
    GoogleAuth,
)
from doto.schema.objects import Task, Calendar


class Query(ObjectType):
    task = Field(Task, task_id=ID(required=True))
    tasks = List(Task)
    calendars = List(Calendar, calendar_id=ID())

    def resolve_task(root, info, task_id):
        return get_task(task_id)

    def resolve_tasks(root, info):
        return get_tasks()

    def resolve_calendars(root, info, calendar_id=None):
        calendars = []
        calendar_ids = get_calendar_ids()
        for id in calendar_ids:
            if id is None:
                print('calendar_id is None?', file=sys.stderr)
                continue
            calendars.extend(get_calendar(id))
        return calendars


class Mutation(ObjectType):
    create_task = CreateTask.Field()
    complete_task = CompleteTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    google_auth = GoogleAuth.Field()


schema = Schema(query=Query, mutation=Mutation)

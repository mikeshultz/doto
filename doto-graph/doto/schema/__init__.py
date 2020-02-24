import sys
from graphene import ID, Schema, ObjectType, Field, List, Int, String

from doto.data import (
    get_task,
    get_tasks,
    get_calendars,
    get_calendar_ids,
    get_calendar,
    get_forecast,
)
from doto.const import DEFAULT_ZIP, DEFAULT_COUNTRY_CODE
from doto.schema.mutations import (
    CreateTask,
    CompleteTask,
    UpdateTask,
    DeleteTask,
    GoogleAuth,
)
from doto.schema.objects import Task, Calendar, OWMForecast


class Query(ObjectType):
    task = Field(Task, task_id=ID(required=True))
    tasks = List(Task)
    calendars = List(Calendar, calendar_id=ID())
    forecast = Field(OWMForecast, zip=Int(), country_code=String())

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

    def resolve_forecast(root, info, zip=DEFAULT_ZIP, country_code=DEFAULT_COUNTRY_CODE):
        return get_forecast(zip, country_code)


class Mutation(ObjectType):
    create_task = CreateTask.Field()
    complete_task = CompleteTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    google_auth = GoogleAuth.Field()


schema = Schema(query=Query, mutation=Mutation)

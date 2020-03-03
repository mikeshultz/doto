from graphene import ID, Schema, ObjectType, Field, List, Int, String

from doto.data import (
    get_task,
    get_tasks,
    get_calendar_ids,
    get_calendars,
    get_forecast,
    get_events,
)
from doto.const import DEFAULT_ZIP, DEFAULT_COUNTRY_CODE
from doto.schema.mutations import (
    CreateTask,
    CompleteTask,
    UpdateTask,
    DeleteTask,
    GoogleAuth,
)
from doto.schema.objects import Task, GoogleCalendar, GoogleEvent, OWMForecast
from doto.utils import uniq


class Query(ObjectType):
    task = Field(Task, task_id=ID(required=True))
    tasks = List(Task)
    calendars = List(GoogleCalendar, calendar_id=ID())
    events = List(GoogleEvent, calendar_id=ID(required=False))
    forecast = Field(OWMForecast, zip=Int(), country_code=String())

    def resolve_task(root, info, task_id):
        return get_task(task_id)

    def resolve_tasks(root, info):
        return get_tasks()

    def resolve_calendars(root, info, calendar_id=None):
        calendars = []
        calendar_ids = [calendar_id]
        if calendar_id is None:
            calendar_ids = get_calendar_ids()
        for cal_id in calendar_ids:
            returned = get_calendars(cal_id)
            if type(returned) == str:
                raise Exception('Authorization required: {}'.format(returned))
            else:
                calendars.extend(returned)

        # Keep getting duplicates with these calls for some reason
        return uniq(calendars, lambda o: o.get('id'))

    def resolve_events(root, info, calendar_id=None):
        returned = get_events(calendar_id)
        if type(returned) == str:
            raise Exception('Authorization required: {}'.format(returned))
        return returned

    def resolve_forecast(root, info, zip=DEFAULT_ZIP, country_code=DEFAULT_COUNTRY_CODE):
        return get_forecast(zip, country_code)


class Mutation(ObjectType):
    create_task = CreateTask.Field()
    complete_task = CompleteTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    google_auth = GoogleAuth.Field()


schema = Schema(query=Query, mutation=Mutation)

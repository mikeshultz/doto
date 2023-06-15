from graphene import ID, Schema, InputObjectType, ObjectType, Field, List, Int, String

from doto.data import (
    get_task,
    get_tasks,
    get_calendar_ids,
    get_calendars,
    get_forecast,
    get_events,
    get_tags,
    get_devices,
)
from doto.const import DEFAULT_ZIP, DEFAULT_COUNTRY_CODE
from doto.schema.mutations import (
    CreateTask,
    CompleteTask,
    UpdateTask,
    DeleteTask,
    GoogleAuth,
    DeviceOn,
    DeviceOff,
)
from doto.schema.objects import (
    Task,
    GoogleCalendar,
    GoogleEvent,
    OWMForecast,
    Device,
)
from doto.utils import uniq


class TaskFilter(InputObjectType):
    tag = String()


class Query(ObjectType):
    task = Field(Task, task_id=ID(required=True))
    tasks = List(Task, task_filter=TaskFilter())
    tags = List(String)
    calendars = List(GoogleCalendar, calendar_id=ID())
    events = List(GoogleEvent, calendar_id=ID())
    forecast = Field(OWMForecast, zip=Int(), country_code=String())
    devices = List(Device, mac=ID())

    def resolve_task(root, info, task_id):
        return get_task(task_id)

    def resolve_tasks(root, info, task_filter=None):
        return get_tasks(task_filter)

    def resolve_tags(root, info):
        return get_tags()

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
        print('resolve_calendars calendars', calendars)
        # Keep getting duplicates with these calls for some reason
        return uniq(calendars, lambda o: o.get('id'))

    def resolve_events(root, info, calendar_id=None):
        returned = get_events(calendar_id)
        if type(returned) == str:
            raise Exception('Authorization required: {}'.format(returned))
        return returned

    def resolve_forecast(root, info, zip=DEFAULT_ZIP, country_code=DEFAULT_COUNTRY_CODE):
        return get_forecast(zip, country_code)

    def resolve_devices(root, info, mac=None):
        return get_devices(mac)


class Mutation(ObjectType):
    create_task = CreateTask.Field()
    complete_task = CompleteTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    google_auth = GoogleAuth.Field()
    device_on = DeviceOn.Field()
    device_off = DeviceOff.Field()


schema = Schema(query=Query, mutation=Mutation)

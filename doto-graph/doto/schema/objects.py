import sys
import arrow
from datetime import datetime, timedelta
from ics import Calendar as iCal
from graphene import ID, ObjectType, String, Int, DateTime, List, Float, Field
from doto.data.weather import parse_owm_date


class Task(ObjectType):
    id = ID()
    task_id = ID()
    priority = Int()
    name = String()
    notes = String()
    added = DateTime()
    deadline = DateTime()
    completed = DateTime()

    def resolve_id(parent, info):
        return parent.task_id

    def resolve_task_id(parent, info):
        return parent.task_id

    def resolve_priority(parent, info):
        return parent.priority

    def resolve_name(parent, info):
        return f"{parent.name}"

    def resolve_notes(parent, info):
        return parent.notes

    def resolve_added(parent, info):
        return parent.added

    def resolve_deadline(parent, info):
        return parent.deadline

    def resolve_completed(parent, info):
        return parent.completed


class Event(ObjectType):
    id = ID()
    event_id = ID()
    url = ID()
    canonical_url = String()
    name = String()
    description = String()
    duration = String()
    location = String()
    organizer = String()
    status = String()
    begin = String()

    def resolve_id(parent, info):
        return parent.url

    def resolve_event_id(parent, info):
        return parent.url

    def resolve_url(parent, info):
        return parent.url

    def resolve_name(parent, info):
        return parent.name

    def resolve_description(parent, info):
        return parent.description

    def resolve_duration(parent, info):
        return parent.duration

    def resolve_location(parent, info):
        return parent.location

    def resolve_organizer(parent, info):
        return parent.organizer

    def resolve_status(parent, info):
        return parent.status

    def resolve_begin(parent, info):
        return parent.begin


class Calendar(ObjectType):
    id = ID()
    calendar_id = ID()
    url = String()
    name = String()
    events = List(Event)

    def resolve_id(parent, info):
        return parent.url

    def resolve_calendar_id(parent, info):
        return parent.url

    def resolve_url(parent, info):
        return parent.url

    def resolve_name(parent, info):
        return parent.name

    def resolve_events(parent, info, start=datetime.now(), end=None):
        events = []

        if start is None:
            start = arrow.get(datetime.now())
        else:
            start = arrow.get(start)

        if end is None:
            end = arrow.get(start + timedelta(days=2))
        else:
            end = arrow.get(end)

        print('date_search start: ', start)
        print('date_search end: ', end)
        for p in parent.date_search(start, end):
            try:
                c = iCal(p.data)
                if c.events is not None:
                    for ev in c.events:
                        ev.url = p.url
                        print('dv: ', dir(ev))
                        print('ev.begin: ', ev.begin)
                        print('ev.end: ', type(ev.end))
                        print('ev.time_equals: ', ev.time_equals)
                        # caldav filtering seems to be wrong?
                        if ev.begin >= start and ev.begin <= end:
                            events.append(ev)
            except Exception as err:
                # TODO: Do something about these?
                print(err, file=sys.stderr)
        return events


class Coordinates(ObjectType):
    lat = Float()
    long = Float()

    def resolve_lat(parent, info):
        return parent.get('lat')

    def resolve_long(parent, info):
        return parent.get('long')


class OWMCity(ObjectType):
    name = String()
    coord = Field(Coordinates)
    country = String()

    def resolve_name(parent, info):
        return parent.get('name')

    def resolve_coord(parent, info):
        return parent.get('coord')

    def resolve_country(parent, info):
        return parent.get('country')


class OWMPointMain(ObjectType):
    temp = Float()
    temp_min = Float()
    temp_max = Float()
    pressure = Float()
    sea_level = Float()
    grnd_level = Float()
    humidity = Float()
    temp_kf = Float()

    def resolve_temp(parent, info):
        return parent.get('temp')

    def resolve_temp_min(parent, info):
        return parent.get('temp_min')

    def resolve_temp_max(parent, info):
        return parent.get('temp_max')

    def resolve_pressure(parent, info):
        return parent.get('pressure')

    def resolve_sea_level(parent, info):
        return parent.get('sea_level')

    def resolve_grnd_level(parent, info):
        return parent.get('grnd_level')

    def resolve_humidity(parent, info):
        return parent.get('humidity')

    def resolve_temp_kf(parent, info):
        return parent.get('temp_kf')


class OWMPointWeather(ObjectType):
    id = ID()
    main = String()
    description = String()
    icon = String()

    def resolve_main(parent, info):
        return parent.get('main')

    def resolve_description(parent, info):
        return parent.get('description')

    def resolve_icon(parent, info):
        return parent.get('icon')


class OWMPointClouds(ObjectType):
    all = String()

    def resolve_all(parent, info):
        return parent.get('all')


class OWMPointWind(ObjectType):
    speed = Float()
    deg = Float()

    def resolve_speed(parent, info):
        return parent.get('speed')

    def resolve_deg(parent, info):
        return parent.get('deg')


class OWMPointRain(ObjectType):
    id = ID()


class OWMPoint(ObjectType):
    dt = String()
    dt_txt = String()
    datetime = DateTime()
    main = Field(OWMPointMain)
    weather = List(OWMPointWeather)
    clouds = Field(OWMPointClouds)
    wind = Field(OWMPointWind)
    #rain = Field(OWMPointRain)
    #sys = Feild()

    def resolve_dt(parent, info):
        return parent.get('dt')

    def resolve_dt_txt(parent, info):
        return parent.get('dt_txt')

    def resolve_datetime(parent, info):
        return parse_owm_date(parent.get('dt_txt'))

    def resolve_main(parent, info):
        return parent.get('main')

    def resolve_weather(parent, info):
        return parent.get('weather')

    def resolve_clouds(parent, info):
        return parent.get('clouds')

    def resolve_wind(parent, info):
        return parent.get('wind')


class OWMForecast(ObjectType):
    points = List(OWMPoint)
    city = Field(OWMCity)

    def resolve_points(parent, info):
        return parent.get('list')

    def resolve_city(parent, info):
        return parent.get('city')

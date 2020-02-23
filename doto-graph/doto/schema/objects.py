import sys
import arrow
from datetime import datetime, timedelta
from ics import Calendar as iCal
from graphene import ID, ObjectType, String, Int, DateTime, List


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

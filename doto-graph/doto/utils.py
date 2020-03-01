import re
import sys
from datetime import date, datetime
from dateutil import tz
from dateutil.parser import parse

ENABLE_PYTHON_37 = False


def any_falsey(iterable):
    for element in iterable:
        if not element or element is None:
            return True
    return False


def uniq(iter, func):
    """ Remove duplicates from a list """
    nl = sorted(iter, key=func)
    for i in reversed(range(len(nl))):
        if i < len(nl):
            if func(nl[i]) == func(nl[i-1]):
                del nl[i]
    return nl


def iso_datetime_or_none(v):
    """ Parse an ISO 8601 string datetime or return None """
    if not v:
        return None

    return parse(v)


def is_date_or_none(v):
    """ Parse an ISO 8601 string date or return None """
    if not v:
        return None

    d = parse(v)
    if d:
        return d.date()

    return None

import re
import sys
from datetime import date, datetime

ENABLE_PYTHON_37 = False
ISO8601_DATE_PATTERN = r'^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$'


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
    try:
        return datetime.fromisoformat(v)
    except (ValueError, TypeError):
        return None


def is_date_or_none(v):
    if not v:
        return None

    # date.fromisoformat introduced in Python 3.7
    if sys.hexversion >= 0x3070000 and ENABLE_PYTHON_37:
        try:
            return date.fromisoformat(v)
        except (ValueError, TypeError):
            pass
    else:
        match = re.match(ISO8601_DATE_PATTERN, v)
        if match is not None:
            return date(match.group(1), match.group(2), match.group(3))

    return None

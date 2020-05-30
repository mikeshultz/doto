import re
import sys
from datetime import date, datetime
from dateutil import tz
from dateutil.parser import parse

ENABLE_PYTHON_37 = False
MAC_STANDARD_PATTERN = r'^[0-9A-F]{2}\:[0-9A-F]{2}\:[0-9A-F]{2}\:[0-9A-F]{2}\:[0-9A-F]{2}\:[0-9A-F]{2}$'
MAC_WEMO_PATTERN = r'^[0-9A-F]{12}$'


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


def normalize_mac_address(mac):
    assert type(mac) == str, "Invalid mac type: {}".format(type(mac))
    if re.match(MAC_STANDARD_PATTERN, mac):
        return mac
    elif re.match(MAC_WEMO_PATTERN, mac):
        parts = []
        for i in range(0, 12):
            if i > 0 and i % 2 == 0:
                parts.append(':')
            parts.append(mac[i])
        return ''.join(parts)
    else:
        raise ValueError("Unknown mac address format")

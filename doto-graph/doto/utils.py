from datetime import date, datetime


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
    try:
        return date.fromisoformat(v)
    except (ValueError, TypeError):
        return None

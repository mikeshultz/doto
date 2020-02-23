def any_falsey(iterable):
    for element in iterable:
        if not element or element is None:
            return True
    return False

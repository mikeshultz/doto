class GenericObject:
    def __init__(self, *args, **kwargs):
        args_count = len(args)
        if args_count > 0:
            for i in range(args_count):
                setattr(self, self.props[i], args[i])

        for prop in self.props:
            val = None
            if kwargs.get(prop) is not None:
                val = kwargs[prop]
                setattr(self, prop, val)
            elif not hasattr(self, prop):
                # Don't overwrite
                setattr(self, prop, None)


class Task(GenericObject):
    """ Generic Task object """
    props = ['task_id', 'priority', 'name', 'notes', 'added', 'deadline', 'completed', 'tags']

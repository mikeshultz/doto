from datetime import datetime
from graphene import Mutation, ID, ObjectType, Field, Boolean, String, Schema, List, Int, DateTime

from doto.data import create_task, update_task, delete_task, get_task, get_tasks, complete_task


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


class CreateTask(Mutation):
    class Arguments:
        priority = Int(required=True)
        name = String(required=True)
        notes = String()
        deadline = String()
        completed = String()

    ok = Boolean()
    task = Field(Task)

    def mutate(parent, info, priority, name, notes="", deadline=None, completed=None):
        ok = False
        # TODO: Validate
        added = datetime.now()
        task_id = create_task(priority, name, notes, added, deadline, completed)
        if task_id:
            ok = True
            task = Task(
                task_id=task_id,
                priority=priority,
                name=name,
                notes=notes,
                added=added,
                deadline=deadline,
                completed=completed
            )
        return CreateTask(task=task, ok=ok)


class CompleteTask(Mutation):
    class Arguments:
        task_id = ID(required=True)

    ok = Boolean()
    task = Field(Task)

    def mutate(parent, info, task_id):
        print('completing task #{}'.format(task_id))
        ok = complete_task(task_id)
        task = get_task(task_id)
        return CompleteTask(ok=ok, task=task)


class DeleteTask(Mutation):
    class Arguments:
        task_id = ID(required=True)

    ok = Boolean()

    def mutate(parent, info, task_id):
        print('deleting task #{}'.format(task_id))
        ok = delete_task(task_id)
        return DeleteTask(ok=ok)


class UpdateTask(Mutation):
    class Arguments:
        task_id = ID(required=True)
        priority = Int(required=True)
        name = String(required=True)
        notes = String()
        deadline = String()
        completed = String()

    ok = Boolean()
    task = Field(Task)

    def mutate(parent, info, task_id, priority, name, notes="", deadline=None, completed=None):
        print('updating task #{}'.format(task_id))
        ok = update_task(task_id, priority, name, notes, deadline, completed)
        task = get_task(task_id)
        return UpdateTask(ok=ok, task=task)


class Query(ObjectType):
    task = Field(Task, task_id=ID(required=True))
    tasks = List(Task)

    def resolve_task(root, info, task_id):
        return get_task(task_id)

    def resolve_tasks(root, info):
        return get_tasks()


class Mutation(ObjectType):
    create_task = CreateTask.Field()
    complete_task = CompleteTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()


schema = Schema(query=Query, mutation=Mutation)

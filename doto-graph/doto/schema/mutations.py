from datetime import datetime
from graphene import Mutation, ID, Field, Boolean, String, Int

from doto.data import (
    create_task,
    update_task,
    delete_task,
    get_task,
    complete_task,
    authorize_user_step1,
    authorize_user_step2
)
from doto.schema.objects import Task


class CreateTask(Mutation):
    class Arguments:
        priority = Int(required=True)
        name = String(required=True)
        notes = String()
        deadline = String()
        completed = String()
        tags = String()

    ok = Boolean()
    task = Field(Task)

    def mutate(parent, info, priority, name, notes="", tags="", deadline=None, completed=None):
        ok = False
        # TODO: Validate
        added = datetime.now()
        task_id = create_task(priority, name, notes, tags, added, deadline, completed)
        if task_id:
            ok = True
            task = Task(
                task_id=task_id,
                priority=priority,
                name=name,
                notes=notes,
                added=added,
                deadline=deadline,
                completed=completed,
                tags=tags,
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
        tags = String()

    ok = Boolean()
    task = Field(Task)

    def mutate(parent, info, task_id, priority, name, notes="", tags="", deadline=None, completed=None):
        print('updating task #{}'.format(task_id))
        ok = update_task(task_id, priority, name, notes, tags, deadline, completed)
        task = get_task(task_id)
        return UpdateTask(ok=ok, task=task)


class GoogleAuth(Mutation):
    class Arguments:
        calendar_id = ID(required=True)

    ok = Boolean()
    auth_url = String()

    def mutate(parent, info, calendar_id):
        auth_url = authorize_user_step1(calendar_id)
        return GoogleAuth(ok=True, auth_url=auth_url)

#/usr/bin/env python

from os import getenv
from json import load
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from api.models import Participant, Project, Work
from dataclasses import dataclass
from .utils.utils import same_keys
from fastapi_sqlalchemy import db

class Discord(BaseModel):
    code: str
    redirect: str


class WorkSchema(BaseModel):
    __keys__: list
    id: Optional[int]
    name: str
    description: Optional[str]
    userId: Optional[str]
    projectId: Optional[int]
    path: str
    index: Optional[int]
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]

    @staticmethod
    def convert(schema, work: Optional[Work] = None):
        schema: WorkSchema = schema
        if not work:
            work = Work()
        for [snake, camel] in WorkSchema.__keys__:
            setattr(work, snake, getattr(schema, camel))
        return work

    @staticmethod
    def create(work: Work):
        d = {}
        for [snake, camel] in WorkSchema.__keys__:
            d[camel] = getattr(work, snake)
        d["id"] = work.id
        return WorkSchema(**d)


class ProjectSchema(BaseModel):
    __keys__: list
    id: Optional[int]
    name: str
    description: Optional[str]
    thumbnail: Optional[str]
    userId: Optional[str]
    coowner: Optional[str]
    channelId: Optional[str]
    eventAt: Optional[str]
    startAt: Optional[str]
    deadline1: Optional[str]
    deadline2: Optional[str]
    deadline3: Optional[str]
    createdAt: Optional[str]
    updatedAt: Optional[str]
    participants: Optional[list[int]] = []
    works: Optional[list[WorkSchema]] = []

    @staticmethod
    def convert(schema, project: Optional[Project] = None):
        schema: ProjectSchema = schema
        if not project:
            project = Project()
        for [snake, camel] in ProjectSchema.__keys__:
            setattr(project, snake, getattr(schema, camel))
        project.event_at = str2date(schema.eventAt)
        project.start_at = str2date(schema.startAt)
        project.deadline1 = str2date(schema.deadline1)
        project.deadline2 = str2date(schema.deadline2)
        project.deadline3 = str2date(schema.deadline3)
        return project

    @staticmethod
    def create(project: Project):
        d = {}
        for [snake, camel] in ProjectSchema.__keys__:
            d[camel] = getattr(project, snake)
        d["id"] = project.id
        d["eventAt"] = date2str(project.event_at)
        d["startAt"] = date2str(project.start_at)
        d["deadline1"] = date2str(project.deadline1)
        d["deadline2"] = date2str(project.deadline2)
        d["deadline3"] = date2str(project.deadline3)
        d["updatedAt"] = date2str(project.updated_at)
        return ProjectSchema(**d)

    @staticmethod
    def json(user_id):
        project_list: list[ProjectSchema] = []
        projects: dict[str, ProjectSchema] = {}
        res = db.session.query(Project) \
            .order_by(Project.event_at).all()
        for project in res:
            project_schema = ProjectSchema.create(project)
            projects[project.id] = project_schema
            project_list.append(project_schema)

        for participant in db.session.query(Participant).all():
            projects[participant.project_id].participants.append(participant.user_id)

        res = db.session.query(Work, Project, Participant) \
            .join(Participant, Project.id == Participant.project_id) \
            .join(Work, Project.id == Work.project_id) \
            .filter(Participant.user_id == user_id) \
            .order_by(Work.index).all()
        for work, project, _ in res:
            projects[project.id].works.append(WorkSchema.create(work))
        return { "projects": project_list }


@dataclass
class Profile():
    id: str
    name: str
    avatar: str


PROFILES: dict[str, Profile] = {}
for id, profile in load(open(getenv("PROFILE_FILE"))).items():
    PROFILES[id] = Profile(
        id=id,
        name=profile["name"],
        avatar=profile["thumbnail"]
    )

WorkSchema.__keys__ = same_keys(Work, WorkSchema)
ProjectSchema.__keys__ = same_keys(Project, ProjectSchema)

def str2date(date):
    if date:
        return datetime.strptime(date, "%Y-%m-%d")
    else:
        return None

def date2str(date):
    if date:
        return format(date, "%Y-%m-%d")
    else:
        return None
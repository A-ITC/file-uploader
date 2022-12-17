#!/usr/bin/env python

from os import getenv, remove
from glob import glob
from uuid import uuid4
from .auth import auth, auth_token
from typing import Optional
from shutil import copyfileobj
from fastapi import APIRouter, Depends, UploadFile
from .models import Project, Participant, Work
from os.path import splitext, join
from sqlalchemy import func
from api.schema import PROFILES, ProjectSchema, WorkSchema
from .utils.utils import CustomError
from fastapi.responses import FileResponse
from fastapi_sqlalchemy import db

router = APIRouter()

@router.get('/init')
def init(user_id: str=Depends(auth)):
    return {
        "userId": user_id,
        "profiles": PROFILES,
        **ProjectSchema.json(user_id),
    }


@router.post("/upload")
def file_upload(file: UploadFile, user_id: str=Depends(auth), path: Optional[str]=None):
    uuid = splitext(file.filename)[0] if path else str(uuid4())
    file.file.seek(0, 2)
    if file.file.tell() > 100 * 1024 * 1024:
        raise CustomError(400, "ファイルサイズの上限（100MB）を超えています")
    else:
        file.file.seek(0)
    for fn in glob(join(getenv("FILE_DIR"), f"{uuid}.*")):
        remove(fn)
    path = join(getenv("FILE_DIR"),  f"{uuid}{splitext(file.filename)[1]}")
    copyfileobj(file.file, open(path, "wb"))
    return {"filename": uuid + splitext(file.filename)[1]}


def get_participant(project_id, user_id):
    return db.session.query(Participant) \
        .filter(Participant.project_id == project_id) \
        .filter(Participant.user_id == user_id)


@router.post("/projects")
def new_project(post: ProjectSchema, user_id: str=Depends(auth)):
    post.userId = user_id
    project = ProjectSchema.convert(post)
    db.session.add(project)
    db.session.commit()
    return ProjectSchema.json(user_id)


@router.post("/projects/{project_id}")
def update_project(post: ProjectSchema, project_id: int, user_id: str=Depends(auth)):
    project = db.session.query(Project).filter_by(id=project_id).one()
    if project.user_id != user_id or project.user_id2 != user_id:
        return {"error": "not allowed"}
    project = ProjectSchema.convert(post, project)
    db.session.commit()
    return ProjectSchema.json(user_id)


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, user_id: str=Depends(auth)):
    project = db.session.query(Project).filter_by(id=project_id).one()
    if project.user_id != user_id or project.user_id2 != user_id:
        return {"error": "not allowed"}
    work_paths = db.session.query(Work.path) \
        .filter(Work.project_id == project_id).all()
    for path in [*work_paths, *project.thumbnail]:
        remove(join(getenv("FILE_DIR"), path))
    db.session.query(Project) \
        .filter(Project.id == project_id).delete()
    db.session.query(Participant) \
        .filter(Participant.project_id == project_id).delete()
    db.session.query(Work) \
        .filter(Work.project_id == project_id).delete()
    return ProjectSchema.json(user_id)


@router.get("/projects/{project_id}/participants/{is_enable}")
def join_project(project_id: int, is_enable: bool, user_id: str=Depends(auth)):
    participant = get_participant(project_id, user_id).one_or_none()
    if participant and not is_enable:
        get_participant(project_id, user_id).delete()
    elif not participant and is_enable:
        db.session.add(Participant(user_id=user_id, project_id=project_id))
    db.session.commit()
    return ProjectSchema.json(user_id)


@router.post("/projects/{project_id}/works")
def new_work(post: WorkSchema, project_id: int, user_id: str=Depends(auth)):
    if not get_participant(project_id, user_id).one_or_none():
        return {"error": "not allowed"}
    work = WorkSchema.convert(post)
    work.user_id = user_id
    work.project_id = project_id
    (max_id,) = db.session.query(func.max(Work.index)).one_or_none()
    if max_id is None:
        work.index = 0
    else:
        work.index = max_id + 1
    db.session.add(work)
    db.session.commit()
    return ProjectSchema.json(user_id)


@router.post("/projects/{project_id}/works/{work_id}")
def update_work(post: WorkSchema, project_id: int, work_id: int, user_id: str=Depends(auth)):
    if not get_participant(project_id, user_id).one_or_none():
        return {"error": "not allowed"}
    work = db.session.query(Work.path) \
        .filter(Work.id == work_id).one()
    if work.user_id != user_id:
        return {"error": "not allowed"}
    work = WorkSchema.convert(post, work)
    db.session.commit()
    return ProjectSchema.json(user_id)


@router.delete("/projects/{project_id}/works/{work_id}")
def delete_work(project_id: int, work_id: int, user_id: str=Depends(auth)):
    if not get_participant(project_id, user_id).one_or_none():
        return {"error": "not allowed"}
    work = db.session.query(Work.path) \
        .filter(Work.id == work_id).one()
    if work.user_id != user_id:
        return {"error": "not allowed"}
    db.session.query(Work).filter(Work.id == work_id).delete()
    return ProjectSchema.json(user_id)


@router.get("/files/{filename:str}")
def downalod(filename: str, token: Optional[str] = None):
    auth_token(token)
    return FileResponse(join(getenv("FILE_DIR"), filename))


@router.post("/projects/{project_id}/works/sort")
def new_work(post: list[int], project_id: int, user_id: str=Depends(auth)):
    if not get_participant(project_id, user_id).one_or_none():
        return {"error": "not allowed"}
    works = db.session.query(Work.path) \
        .filter(Work.project_id == project_id).all()
    db.session.commit()
    return ProjectSchema.json(user_id)
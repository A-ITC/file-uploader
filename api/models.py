#!/usr/bin/env python

from os import getenv
from datetime import datetime
from sqlalchemy import ForeignKey, create_engine
from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import DateTime, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
engine = create_engine(getenv("DB_URL"))

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail = Column(String(255))
    user_id = Column(String(255), nullable=False)
    channel_id = Column(String(255), nullable=False)
    event_at = Column(DateTime, nullable=False)
    start_at = Column(DateTime, nullable=False)
    deadline1 = Column(DateTime, nullable=False)
    deadline2 = Column(DateTime, nullable=True)
    deadline3 = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.now)

class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    user_id = Column(String(255), nullable=False)

class Work(Base):
    __tablename__ = "works"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    user_id = Column(String(255), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    path = Column(String(255), nullable=True)
    index = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now)

Base.metadata.create_all(engine)
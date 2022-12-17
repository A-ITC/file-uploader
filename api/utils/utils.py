#!/usr/bin/env python

from re import sub
from os import makedirs
from json import dumps
from typing import Literal
from os.path import exists
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

class CustomError(Exception):
    def __init__(self, code=200, arg=""):
        self.arg = arg
        self.code = code
    
    def __str__(self):
        return str(self.arg)
    
    def __int__(self):
        return self.code if isinstance(self.code, int) else 500


class StatusOK(BaseModel):
    status: Literal["ok"]
    @staticmethod
    def json():
        return {"status": "ok"}


def mkdir(dirname):
    if not exists(dirname):
        makedirs(dirname)


def stringify(d):
    return dumps(d, ensure_ascii=False, separators=(",", ":"))


def jsonify(d, status_code):
    return JSONResponse(
        status_code=status_code,
        headers={"Access-Control-Allow-Origin": "*"},
        content=jsonable_encoder(d)
    )


def same_keys(model, schema):
    keys = []
    s = set(schema.__annotations__.keys())
    for column_name in [x.name for x in model.__table__.c]:
        if column_name == "id":
            continue
        camel_key = sub("_(.)",lambda x:x.group(1).upper(), column_name)
        if camel_key in s:
            keys.append([column_name, camel_key])
    return keys
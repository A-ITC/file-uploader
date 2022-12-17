#!/usr/bin/env python

import requests
from os import getenv
from jwt import encode, decode
from time import time
from json import dumps
from typing import Optional
from hashlib import blake2b
from fastapi import APIRouter, Cookie, Header
from .schema import Discord, PROFILES
from traceback import format_exc
from .utils.utils import CustomError
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/discord")
def auth_discord(post: Discord):
    try:
        res = None
        data = {
            'client_id': getenv("DISCORD_CLIENT_ID"),
            'client_secret': getenv("DISCORD_CLIENT_SECRET"),
            'grant_type': 'authorization_code',
            'code': post.code,
            'redirect_uri': post.redirect,
        }
        headers = { "Content-Type": "application/x-www-form-urlencoded", }
        url = 'https://discord.com/api/v8/oauth2/token'
        res = requests.post(url, data=data, headers=headers).json()

        headers = { "Authorization": f"Bearer {res['access_token']}" }
        url = "https://discordapp.com/api/users/@me"
        res = requests.get(url, headers=headers).json()
    except: 
        raise CustomError(500, dumps(res))
    else:
        id = id7(int(res["id"]))
        if id in PROFILES:
            session = encode({"iat": int(time()), "sub": id}, getenv("SESSION_PASSWORD"))
            response = JSONResponse(
                content={"status": "ok"},
            )
            response.set_cookie(
                key="sessionId",
                max_age=315360000,
                value=session,
                httponly=True
            )
            return response
        else:
            raise CustomError(401, "無効なユーザーです")


@router.get("/token")
def token(sessionId: Optional[str] = Cookie(None)):
    try:
        payload = decode(sessionId, getenv("SESSION_PASSWORD"), algorithms=["HS256"])
        assert "sub" in payload
        return {"token": encode({"iat": int(time()), "sub": payload["sub"]}, getenv("TOKEN_PASSWORD"))}
    except Exception as e:
        raise CustomError(401, f"無効なセッションです: {format_exc()}")


def auth(token: Optional[str] = Header(None)):
    return auth_token(token)


def auth_token(token):
    try:
        payload = decode(token, getenv("TOKEN_PASSWORD"), algorithms=["HS256"])
        assert "sub" in payload
        assert time() < payload["iat"] + 30*60
        return payload["sub"]
    except Exception as e:
        raise CustomError(401, f"無効なトークンです: {format_exc()}")


def id62(num):
    uid = ""
    A = [chr(i) for i in [*range(48, 58), *range(65, 91), *range(97, 123)]]
    while num:
        num, m = divmod(num, 62)
        uid = A[m] + uid
    return uid


def id7(num):
    return id62(int(blake2b(str(num).encode(), digest_size=5).hexdigest(), 16))


def blake(text):
    return id62(int(blake2b(text.encode(), digest_size=9).hexdigest(), 16))

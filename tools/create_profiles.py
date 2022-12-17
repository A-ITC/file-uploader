#!/usr/bin/env python

from csv import reader
from json import dumps
from api.auth import id7

cr = reader(open("all_members.csv"))
next(cr)
profiles = {}
for id, name, avatar in cr:
    profiles[id7(int(id))] = {"name": name, "avator": f"{id}/{avatar}"}
text = dumps(profiles, indent=4, ensure_ascii=False)
open(f"api/profiles.py", "wt").write(f"PROFILES = {text}")
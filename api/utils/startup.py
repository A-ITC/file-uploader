#!/usr/bin/env python

from os import getenv
from dotenv import load_dotenv
from .utils import mkdir
from logging import Formatter, StreamHandler, getLogger
from logging.handlers import TimedRotatingFileHandler

def init_env():
    load_dotenv(".env")
    mkdir(getenv("FILE_DIR"))
    mkdir("data/logs")

    base_dir = __name__.split(".")[0]
    logger = getLogger(base_dir)
    logger.setLevel("DEBUG")
    formatter = Formatter("[%(asctime)s] %(levelname)s: %(message)s")

    sh = StreamHandler()
    sh.setFormatter(formatter)
    logger.addHandler(sh)

    trfh = TimedRotatingFileHandler("data/logs/file-uploader.log", when="D", interval=1, backupCount=10)
    trfh.setFormatter(formatter)
    logger.addHandler(trfh)
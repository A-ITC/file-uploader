#!/usr/bin/env python

from time import sleep
from threading import Thread

class DeadlineManager:
    __instance = None

    def __new__(cls):
        if cls.__instance == None:
            cls.__instance = super().__new__(cls)
        return cls.__instance
    
    def start(self):
        self.__active = True
        self.__th = Thread(target=self.__start, daemon=True)
        self.__th.start()
    
    def stop(self):
        self.__active = False
        self.__th.join()
    
    def __start(self):
        while True:
            for _ in range(60):
                sleep(1)
                if not self.__active:
                    return
            pass
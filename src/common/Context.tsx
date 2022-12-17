import { createContext, ReactNode, useEffect, useState } from "react"
import request, { init } from "./Request"

export interface Profile {
    id: string
    name: string
    avatar: string
}

export interface Work {
    id: number
    name: string
    description?: string
    userId: string
    projectId: number
    path: string
    index?: number
    createdAt?: number
    updatedAt?: number
}

export interface Project {
    id: number
    name: string
    description?: string
    thumbnail?: string
    userId1: string
    userId2?: string
    channelId?: string
    eventAt?: string
    startAt?: string
    deadline1?: string
    deadline2?: string
    deadline3?: string
    updatedAt?: number
    participants?: string[]
    works?: Work[]
}

export interface State {
    profiles: { [key: string]: Profile }
    projects: Project[]
    userId: string
}

const initState: State = {
    profiles: {},
    projects: [],
    userId: ""
}

export interface Config { }

export const initConfig: Config = () => {
    const text = localStorage.getItem("file-uploader")
    const parsed = JSON.parse(text ?? "{}")
    return { ...parsed }
}

const Context = createContext({} as {
    cfg: Config
    state: State
    setCfg: (cfg: Config) => void
    setState: (state: State) => void
})

export function Provider(props: { children: ReactNode }) {
    const [cfg, _setCfg] = useState(initConfig)
    const [state, setState] = useState(initState)

    useEffect(() => {
        if (location.href.match("/auth")) return
        init().then(res => {
            if (res) {
                request("GET", "/init").then(res => {
                    setState(res)
                })
            }
        })
    }, [])

    function setCfg(cfg: Config) {
        localStorage.setItem("file-uploader", JSON.stringify(cfg))
        _setCfg(cfg)
    }

    return (
        <Context.Provider value={{ cfg, state, setCfg, setState }}>
            {state.userId && props.children}
        </Context.Provider>
    )
}

export default Context
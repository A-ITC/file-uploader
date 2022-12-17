import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { SortableContainer, SortableItem } from "../common/Sortable";
import Context, { Project, Work } from "../common/Context"
import { useContext, useState } from 'react';
import request, { Request } from "../common/Request";
import { useNavigate } from "react-router"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import { Button } from "../common/Style"
import EditIcon from '@mui/icons-material/Edit';
import { css } from '@emotion/react'

interface ProjectWindowProps {
    project: Project
}
export default function ProjectWindow(props: ProjectWindowProps) {
    const navigate = useNavigate()
    const { state, setState } = useContext(Context)
    const [works, setWorks] = useState<Work[]>(props.project.works ?? [])
    const joined = props.project.participants?.includes(state.userId)
    const editable = props.project.userId1 = state.userId

    function create() {
        navigate(`/files/${props.project.id}/works/create`)
    }

    function sortWorks(works: Work[]) {
        setWorks(works)
    }

    function join() {
        request("GET", `/projects/${props.project.id}/participants/1`)
            .then(res => setState({ ...state, projects: res.projects }))
    }

    function decline() {
        request("GET", `/projects/${props.project.id}/participants/0`)
            .then(res => setState({ ...state, projects: res.projects }))
    }

    return (
        <div>
            <div>
                {props.project.name}
                {joined ? (
                    <div>
                        <Button onClick={decline}>辞退</Button>
                        <Button onClick={create}>登録</Button>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            {props.project.participants?.includes(state.userId) ? (
                <SortableContainer
                    css={style.wrapper}
                    items={works}
                    setItems={sortWorks}>
                    {works.map((work, i) => (
                        <SortableItem
                            key={i}
                            css={[style.container]}
                            name={work.id}>
                            <WorkWindow
                                work={work}
                                projectId={work.projectId} />
                        </SortableItem>
                    ))}
                </SortableContainer>
            ) : (
                <Button onClick={join}>参加</Button>
            )}
        </div>
    )
}


interface WorkWindowProps {
    work: Work
    projectId: number
}
function WorkWindow(props: WorkWindowProps) {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)
    const { state } = useContext(Context)
    const own = state.userId === props.work.userId

    function edit() {
        navigate(`/files/${props.projectId}/works/${props.work.id}/edit`)
    }

    function onChange(e: React.SyntheticEvent, expanded: boolean) {
        setExpanded(expanded)
    }

    async function download() {
        const url = `/api/files/${props.work.path}?token=${Request.instance.token}`
        const blob = new Blob([await (await fetch(url)).blob()])
        const objUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = objUrl
        const ext = "." + props.work.path.split(".").pop() ?? ""
        link.download = props.work.name + ext
        link.click()
        setTimeout(() => window.URL.revokeObjectURL(objUrl), 250)
    }

    return (
        <Accordion expanded={expanded} onChange={onChange}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <div css={style.title}>
                    {props.work.name}
                </div>
                <div css={style.date}>
                    {props.work.updatedAt?.toString().replace("T", " ").substring(0, 19)}
                </div>
                <DownloadIcon onClick={download} />
                {own && (
                    <EditIcon onClick={edit} />
                )}
            </AccordionSummary>
            {expanded ? (
                <AccordionDetails>
                    <div>
                        {props.work.description}
                    </div>
                    <Media filename={props.work.path} />
                </AccordionDetails>
            ) : (
                <div css={style.whitebox} />
            )}
        </Accordion>
    )
}


interface MediaProps {
    filename: string
}
function Media(props: MediaProps) {
    const url = `/api/files/${props.filename}?token=${Request.instance.token}`

    const media = (() => {
        const ext = props.filename?.split(".").pop()
        if (ext?.match(/(jpg|png)/)) {
            return <img height={400} src={url} />
        } else if (ext?.match(/(mp3|m4a|wav|aif)/)) {
            return <audio preload="none" controls src={url} />
        } else if (ext?.match(/(mp4|mov)/)) {
            return <video preload="none" controls src={url} />
        } else if (ext === undefined) {
            return <></>
        } else {
            return <></>
        }
    })()

    return (<div>{media}</div>)
}


const style = {
    title: css({
        width: "15vw",
    }),

    date: css({
        width: "20vw",
    }),

    wrapper: css({
        padding: "0px 10px",
        borderRadius: "5px",
        display: "flex",
        flexFlow: "column",
        minWidth: "110px"
    }),

    whitebox: css({
        width: "100%",
        height: "300px",
    }),

    container: css({
        width: "100%",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        padding: "0px 10px",
        margin: "3px 10px",
        border: "1px solid gray",

        "&:hover": {
            backgroundColor: "#eee"
        }
    })
}
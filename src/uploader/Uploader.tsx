import { useNavigate } from "react-router";
import { useContext } from "react";
import ProjectWindow from "./ProjectWindow";
import { Button } from "../common/Style";
import Context from "../common/Context";
import { css } from '@emotion/react'
import Header from "../main/Header";

export default function Uploader() {
    const navigate = useNavigate()
    const { state } = useContext(Context)

    function create() {
        navigate("/files/create")
    }

    return (
        <div>
            <Header>
                <div css={style.right}>
                    <Button onClick={create}>新規作成</Button>
                </div>
            </Header>
            {state.projects.map(project =>
                <ProjectWindow
                    key={project.id}
                    project={project} />
            )}
        </div>
    )
}

const style = {
    right: css({
        display: "flex",
        padding: "2px 20px 0px 0px",
    })
}
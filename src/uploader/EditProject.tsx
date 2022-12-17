import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from "react-router";
import request, { fileUpload } from "../common/Request";
import { Button, styleValue } from "../common/Style";
import Context, { Project } from "../common/Context";
import { css } from '@emotion/react'
import Header from "../main/Header";

export default function Edit() {
    const params = useParams();
    const navigate = useNavigate()
    const { state, setState } = useContext(Context)
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Project>();
    const [file, setFile] = useState<File>()
    const [isRequesting, setIsRequesting] = useState(false)
    const [error, setError] = useState("")

    const onSubmit: SubmitHandler<Project> = async (data) => {
        try {
            console.log(data)
            setError("")
            setIsRequesting(true)
            if (file) {
                console.log(file)
                const project = state.projects
                    .filter(x => String(x.id) === params.projectId).pop()
                const res = await fileUpload(file, project?.thumbnail)
                data.thumbnail = res.filename
            }
            if (params.projectId) {
                const res = await request("POST", `/projects/${params.projectId}`, data)
                state.projects = res.projects
            } else {
                const res = await request("POST", "/projects", data)
                state.projects = res.projects
            }
            setState({ ...state })
            navigate("/files")
        } catch (e) {
            setError(String(e))
            setIsRequesting(false)
        }
    }

    useEffect(() => {
        console.log(params.projectId);
        const project = state.projects
            .filter(x => String(x.id) === params.projectId).pop()
        if (project) {
            setValue("id", project.id)
            setValue("name", project.name)
            setValue("description", project.description)
            setValue("thumbnail", project.thumbnail)
            setValue("userId1", project.userId1)
            setValue("userId2", project.userId2)
            setValue("channelId", project.channelId)
            setValue("eventAt", project.eventAt)
            setValue("startAt", project.startAt)
            setValue("deadline1", project.deadline1)
            setValue("deadline2", project.deadline2)
            setValue("deadline3", project.deadline3)
        }
    }, [])

    function fileChange(e: ChangeEvent<HTMLInputElement>) {
        const files = e.currentTarget?.files
        if (files && files[0]) {
            setFile(files[0])
        }
    }

    return (
        <div>
            <Header />
            <table>
                <tbody>
                    <tr>
                        <td>イベント名（必須）</td>
                        <td>
                            <input {...register("name", { required: true, maxLength: 60 })} />
                        </td>
                    </tr>
                    <tr>
                        <td>説明</td>
                        <td>
                            <textarea {...register("description", { maxLength: 300 })} />
                        </td>
                    </tr>
                    <tr>
                        <td>サムネイル画像</td>
                        <td>
                            <input type="file" onChange={fileChange} />
                        </td>
                    </tr>
                    <tr>
                        <td>共同主催者</td>
                        <td>
                            <select {...register("userId2")}>
                                <option value={""} key={-1}></option>
                                {Object.values(state.profiles).map((value, i) => (
                                    <option value={value.id} key={i}>
                                        {value.name}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>DiscordのチャンネルID</td>
                        <td>
                            <input {...register("channelId", { maxLength: 60 })} />
                        </td>
                    </tr>
                    <tr>
                        <td>イベント開催日（必須）</td>
                        <td>
                            <input {...register("eventAt", { required: true, maxLength: 60 })} type={"date"} />
                        </td>
                    </tr>
                    <tr>
                        <td>参加者募集締め切り（必須）</td>
                        <td>
                            <input {...register("startAt", { required: true, maxLength: 60 })} type={"date"} />
                        </td>
                    </tr>
                    <tr>
                        <td>一次締め切り（必須）</td>
                        <td>
                            <input {...register("deadline1", { required: true, maxLength: 60 })} type={"date"} />
                        </td>
                    </tr>
                    <tr>
                        <td>二次時締め切り</td>
                        <td>
                            <input {...register("deadline2", { maxLength: 60 })} type={"date"} />
                        </td>
                    </tr>
                    <tr>
                        <td>三次時締め切り</td>
                        <td>
                            <input {...register("deadline3", { maxLength: 60 })} type={"date"} />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style={{ color: "red" }}>{error}</div>
            <Button onClick={handleSubmit(onSubmit)}>確定</Button>
        </div>
    )
}

const style = {
    right: css({
        display: "flex",
        padding: "2px 20px 0px 0px",
    }),

    wrapper: css({
        background: styleValue.black2,
        border: "2px solid $black1",
        margin: "20px auto 0px",
        padding: "0 1em",
    }),

    side: css({
        verticalAlign: "top",
        width: "250px"
    })
}
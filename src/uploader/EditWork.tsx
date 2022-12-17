import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from "react-router";
import request, { fileUpload } from "../common/Request";
import { Button, styleValue } from "../common/Style";
import Context, { Project, Work } from "../common/Context";
import { css } from '@emotion/react'
import Header from "../main/Header";

export default function EditWork() {
    const params = useParams();
    const navigate = useNavigate()
    const { state, setState } = useContext(Context)
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Work>();
    const [file, setFile] = useState<File>()
    const [isRequesting, setIsRequesting] = useState(false)
    const [error, setError] = useState("")
    const project = useMemo(() => state.projects
        .filter(x => String(x.id) === params.projectId).pop(), [state])
    const work = useMemo(() => project?.works!
        .filter(x => String(x.id) === params.workId).pop(), [state])

    const onSubmit: SubmitHandler<Work> = async (data) => {
        try {
            console.log(data)
            setError("")
            setIsRequesting(true)
            if (file) {
                console.log(file)
                const res = await fileUpload(file, work?.path)
                data.path = res.filename
            }
            if (params.workId) {
                const res = await request("POST", `/projects/${params.projectId}/works/${params.workId}`, data)
                state.projects = res.projects
            } else {
                const res = await request("POST", `/projects/${params.projectId}/works`, data)
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
        if (work) {
            setValue("name", work.name)
            setValue("description", work.description)
        }
    }, [])

    function fileChange(e: ChangeEvent<HTMLInputElement>) {
        const files = e.currentTarget?.files
        if (files && files[0]) {
            setFile(files[0])
        }
    }

    function test() {
        request("POST", `/projects/${params.projectId}/works`, {
            "name": "aaaa",
            "description": "",
            "path": "48b87ea3-d7b5-4ab3-9958-5155fb58e4d5.png"
        })
    }

    return (
        <div>
            <Header />
            <table>
                <tbody>
                    <tr>
                        <td>
                            タイトル
                        </td>
                        <td>
                            <input {...register("name", { required: true, maxLength: 60 })} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            説明
                        </td>
                        <td>
                            <textarea {...register("description", { maxLength: 300 })} />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            ファイル
                        </td>
                        <td>
                            <input type="file" onChange={fileChange} />
                        </td>
                    </tr>
                </tbody>
            </table>
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
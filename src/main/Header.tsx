import { styleValue } from "../common/Style";
import { ReactNode } from "react";
import { css } from '@emotion/react'

interface HeaderProps {
    children?: ReactNode
}
export default function Header(props: HeaderProps) {
    return (
        <header css={style.header}>
            <div css={style.left}>
                <div css={style.title}>ITCOBKAI</div>
            </div>
            {props.children}
        </header>
    )
}

const style = {
    header: css({
        display: "flex",
        justifyContent: "space-between",
        width: "100",
        height: styleValue.paddingTop,
        borderBottom: "solid 1px #555",
        color: "white",
        boxShadow: "2px 2px 2px rgba(100, 100, 100, 0.6)",
    }),

    title: css({
        verticalAlign: "middle",
        fontSize: "28px",
        padding: "5px 10px 10px 20px",
        fontWeight: "bold",
        color: "#222"
    }),

    left: css({
        display: "flex"
    })
}
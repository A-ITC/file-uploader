import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";

export const styleValue = {
    muiPrimary: "#3f51b5",
    black3: "rgb(200, 198, 187)",
    black2: "rgb(206, 206, 201)",
    black1: "rgb(223, 221, 218)",
    white1: "#222",
    blue1: "#37c0ff",
    paddingTop: "50px",
    paddingBottom: "2em",
    splitLength: "30vw",
}

export default function GlobalStyle() {
    return (
        <Global
            styles={css({
                html: {
                    height: "100%",
                    width: "100%",
                },
                body: {
                    height: "100%",
                    width: "100%",
                    margin: 0,
                    overflow: "hidden",
                }
            })}
        />
    )
}

export const mixin = {
    scrollbar: {
        "&::-webkit-scrollbar": {
            width: "10px"
        },

        "&::-webkit-scrollbar-track": {
            background: styleValue.black3,
            borderLeft: "solid 1px $black2",
        },

        "&::-webkit-scrollbar-thumb": {
            borderRadius: "10px",
            background: "$black3",
            boxShadow: "inset 0 0 0 2px rgb(113, 113, 113)"
        }
    }
}

export const Button = styled.span({
    display: "inline-block",
    padding: "0.3em 1em",
    height: "1.4em",
    verticalAlign: "middle",
    textDecoration: "none",
    color: "white",
    backgroundColor: "rgb(70, 91, 247)",
    border: "solid 2px rgb(70, 91, 247)",
    borderRadius: "3px",
    margin: "5px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",

    "&:hover": {
        transition: "0.4s",
        background: styleValue.muiPrimary,
        color: "white",
    },

    "&:active": {
        transition: "0s",
        border: "solid 2px white",
    },

    "&--disable": {
        cursor: "auto",
        color: "#aaa",
        border: "solid 2px #aaa",

        display: "inline-block",
        padding: "0.3em 1em",
        height: "1.4em",
        verticalAlign: "middle",
        textDecoration: "none",
        borderRadius: "3px",
        margin: "5px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }
})
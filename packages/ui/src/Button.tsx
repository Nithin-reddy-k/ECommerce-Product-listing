import type React from "react";

export function Button(props: React.PropsWithChildren) {
    return (
        <button>
            {props.children}
        </button>
    )
}
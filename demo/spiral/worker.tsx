
/* IMPORT */

import type { JSX, Observable, ObservableReadonly } from 'voby/via'
import { $, render, untrack, For, If, useAnimationLoop, useMemo } from 'voby/via'

import type { ViaClass } from 'via'
const Via = self.Via
const via: ViaClass & Window & typeof globalThis & { audioContext?: AudioContext } = self.via

const document = via.document as Document

self.addEventListener("message", e => {
    if (e.data === "start") {
        Via.postMessage = (data => {
            try {
                self.postMessage(data)
            }
            catch (error) {
                console.error(error)
                debugger
            }
        })
        Start()
    }
    else {
        Via.onMessage(e.data)
    }
})


/* HELPERS */

const COUNT = 400
const LOOPS = 6

/* MAIN */

const Cursor = ({ big, label, x, y, color }: { big: Observable<boolean>, label: boolean, x: ObservableReadonly<number>, y: ObservableReadonly<number>, color?: ObservableReadonly<string> }): JSX.Element => {

    return (
        <div class={{ cursor: true, label, big }} style={{ left: x, top: y, borderColor: color }}>
            <If when={label}>
                <span class="label">{x},{y}</span>
            </If>
        </div>
    )

}

const Spiral = (): JSX.Element => {

    const x = $(0)
    const y = $(0)
    const big = $(false)
    const counter = $(0)

    document.onmousemove = ({ pageX, pageY }) => {
        (async () => {
            x(await get(pageX))
            y(await get(pageY))
        })()
    }

    // event not serializable
    // document.onmousemove = (e) => {
    //     (async () => {
    //         const evt = await get<{ pageX, pageY }>(e)
    //         x(evt.pageX)
    //         y(evt.pageY)
    //     })()
    // }


    document.onmousedown = () => {
        big(true)
    }

    document.onmouseup = () => {
        big(false)
    }

    useAnimationLoop(() => counter(counter() + 1))

    const max = useMemo(() => COUNT + Math.round(Math.sin(counter() / 90 * 2 * Math.PI) * COUNT * 0.5))

    const makeCursor = (i: number) => ({
        x: (): number => {
            const f = i / max() * LOOPS
            const θ = f * 2 * Math.PI
            const m = 20 + i
            return (untrack(x) + Math.sin(θ) * m) | 0
        },
        y: (): number => {
            const f = i / max() * LOOPS
            const θ = f * 2 * Math.PI
            const m = 20 + i
            return (untrack(y) + Math.cos(θ) * m) | 0
        },
        color: (): string => {
            const f = i / max() * LOOPS
            const hue = (f * 255 + untrack(counter) * 10) % 255
            return `hsl(${hue},100%,50%)`
        }
    })

    const cache = []
    const cursors = useMemo(() => Array(max()).fill(0).map((_, i) => cache[i] || (cache[i] = makeCursor(i))))

    return (
        <div id="main">
            <Cursor label={true} big={big} x={x} y={y} />
            <For values={cursors}>
                {({ x, y, color }) => {
                    return <Cursor big={big} label={false} x={x} y={y} color={color} />
                }}
            </For>
        </div>
    )

}

function Start() {
    render(<Spiral />, document.getElementById('app'))
}

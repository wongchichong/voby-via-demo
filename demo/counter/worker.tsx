
/* IMPORT */
import { render } from 'voby/via'
import { $ } from 'voby'
import type { JSX } from 'voby'

import type { ViaClass } from 'via'
const Via = self.Via
const via: ViaClass & Window & typeof globalThis & { audioContext?: AudioContext } = self.via
const get = self.get

const document = via.document

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

/* MAIN */

const Counter = (): JSX.Element => {

    const value = $(0)

    const increment = () => value(prev => prev + 1)
    const decrement = () => value(prev => prev - 1)

    return (
        <>
            <h1>Counter</h1>
            <p>{value}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
        </>
    )
}

function Start() {
    render(<Counter />, document.getElementById('app'))
}

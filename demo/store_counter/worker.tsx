
/* IMPORT */

import { render, store } from 'voby/via'
import type { JSX } from 'voby/via'
/* MAIN */

import type { ViaClass } from 'via'
const Via = self.Via
const via: ViaClass & Window & typeof globalThis & { audioContext?: AudioContext } = self.via

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


const Counter = (): JSX.Element => {

    const state = store({
        value: 0
    })

    const increment = () => state.value += 1
    const decrement = () => state.value -= 1

    return (
        <>
            <h1>Store Counter</h1>
            <p>{() => state.value}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
        </>
    )

}

function Start() {
    render(<Counter />, document.getElementById('app'))
}

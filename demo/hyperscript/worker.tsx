
/* IMPORT */

import { $, h, render } from 'voby/via'
import * as Voby from 'voby/via'
import type { JSX } from 'voby/via'
import { IgnoreSymbols, ViaClass } from 'via'

globalThis.Voby = Voby

const Via = self.Via
const via: ViaClass & Window & typeof globalThis & { audioContext?: AudioContext } = self.via

const document = via.document

const sym = Symbol()
IgnoreSymbols[sym] = sym

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

    return [
        h('h1', 'Counter'),
        h('p', value),
        h('button', { onClick: increment }, '+'),
        h('button', { onClick: decrement }, '-')
    ]

}

/* RENDER */

function Start() {
    render(Counter, document.getElementById('app'))
}

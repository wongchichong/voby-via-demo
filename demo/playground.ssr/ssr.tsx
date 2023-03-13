/** jsxImportSource voby/ssr */
/* IMPORT */

import { renderToString } from 'voby/ssr'
// import * as Voby from 'voby'
import type { JSX } from 'voby/ssr'
import { useResource, render } from 'voby/ssr'
import { $, } from 'voby/ssr'
// import { useEffect, useMemo } from 'voby'

const TEST_INTERVAL = 500 // Lowering this makes it easier to spot some memory leaks

const assert = (result: boolean, message?: string): void => {

    console.assert(result, message)

}

const random = (): number => { // It's important for testing that 0, 1 or reused numbers are never returned

    const value = Math.random()

    if (value === 0 || value === 1) return random()

    return value

}

const TestRenderToString = async (): Promise<void> => {
    const App = (): JSX.Element => {
        const o = $(123)
        return (
            <div>
                <h3>renderToString</h3>
                <p>{o}</p>
            </div>
        )
    }
    const expected = '<div><h3>renderToString</h3><p>123</p></div>'
    const actual = renderToString(<App />)
    assert(actual === expected, `[TestRenderToString]: Expected '${actual}' to be equal to '${expected}'`)
}

const TestRenderToStringSuspense = async (): void => {
    const App = (): JSX.Element => {
        const o = $(0)
        const Content = () => {
            useResource(() => {
                return new Promise<number>(resolve => {
                    setTimeout(() => {
                        resolve(o(123))
                    }, TEST_INTERVAL)
                })
            })
            return <p>{o}</p>
        }
        return (
            <div>
                <h3>renderToString - Suspense</h3>
                <Content />
            </div>
        )
    }

    const expected = '<div><h3>renderToString - Suspense</h3><p>123</p></div>'
    let actual = renderToString(<App />)
    assert(actual === expected, `[TestRenderToStringSuspense]: Expected '${actual}' to be equal to '${expected}'`)

    // useEffect(() => {
    //     console.log('app changed')

    //     let actual = renderToString(<App />)
    //     assert(actual === expected, `[TestRenderToStringSuspense]: Expected '${actual}' to be equal to '${expected}'`)
    // })
}

const Test = (): JSX.Element => {
    TestRenderToString()
    TestRenderToStringSuspense()
}

render(Test, document.getElementById('app'))

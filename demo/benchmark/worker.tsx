/// <reference path='../../../via/dist/controller/index.d.ts' />

/* IMPORT */

import { useMemo } from 'voby'
import { render, } from 'voby/via'
import { $, useSelector, For } from 'voby'
import type { FunctionMaybe, Observable, ObservableMaybe, JSX } from 'voby/via'
import type { IObservable } from 'oby'


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


/* TYPES */

type IDatum = {
    id: number,
    label: Observable<string>
}

/* HELPERS */

const rand = (max: number): number => {
    return Math.round(Math.random() * 1000) % max
}

const buildData = (() => {
    const adjectives = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive', 'cheap', 'expensive', 'fancy']
    const colors = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange']
    const nouns = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse', 'keyboard']
    let uuid = 1
    return (length: number): IDatum[] => {
        const data: IDatum[] = new Array(length)
        for (let i = 0; i < length; i++) {
            const id = uuid++
            const adjective = adjectives[rand(adjectives.length)]
            const color = colors[rand(colors.length)]
            const noun = nouns[rand(nouns.length)]
            const label = $(`${adjective} ${color} ${noun}`)
            const datum = { id, label }
            data[i] = datum
        };
        return data
    }
})()

/* MODEL */

const Model = new class {

    /* STATE */

    selected: Observable<number>
    data: Observable<IDatum[]>
    // page: Observable<Observable<IDatum[]>>;

    /* CONSTRUCTOR */

    constructor() {
        this.init()
    }

    /* API */

    init = (): void => {
        this.selected = $(-1)
        this.data = $<IDatum[]>([])
        // this.page = $( this.data );
    };

    // reset = (): void => {
    //   this.selected = $( -1 );
    //   this.data = $<IDatum[]>( [] );
    //   this.page ( () => this.data );
    // };

    run0 = (): void => {
        this.runWith(0)
    };

    run1000 = (): void => {
        this.runWith(1000)
    };

    run1 = (): void => {
        this.runWith(1)
    };


    run10000 = (): void => {
        this.runWith(10000)
    };

    runWith = (length: number): void => {
        // this.reset ();
        this.data(buildData(length))
    };

    add = (): void => {
        this.data(data => [...data, ...buildData(1000)])
    };

    update = (): void => {
        const data = this.data()
        for (let i = 0, l = data.length; i < l; i += 10) {
            data[i].label(label => label + ' !!!')
        }
    };

    swapRows = (): void => {
        const data = this.data().slice()
        if (data.length <= 998) return
        const datum1 = data[1]
        const datum998 = data[998]
        data[1] = datum998
        data[998] = datum1
        this.data(data)
    };

    remove = (id: number): void => {
        this.data(data => {
            const idx = data.findIndex(datum => datum.id === id)
            return [...data.slice(0, idx), ...data.slice(idx + 1)]
        })
    };

    select = (id: number): void => {
        this.selected(id)
    };

}

/* COMPONENTS */

const Button = ({ id, text, onClick }: { id: FunctionMaybe<string | number>, text: FunctionMaybe<string>, onClick: ObservableMaybe<((event: MouseEvent) => void)> }): JSX.Element => (
    <div class="col-sm-6 smallpad">
        <button id={id} class="btn btn-primary btn-block" type="button" onClick={onClick}>
            {text}
        </button>
    </div>
)

// const Row = template(({ id, label, className, onSelect, onRemove }: { id: FunctionMaybe<string | number>, label: FunctionMaybe<string>, className: FunctionMaybe<Record<string, FunctionMaybe<boolean>>>, onSelect: ObservableMaybe<((event: MouseEvent) => void)>, onRemove: ObservableMaybe<((event: MouseEvent) => void)> }): JSX.Element => (
//     <tr class={className}>
//         <td class="col-md-1">
//             {id}
//         </td>
//         <td class="col-md-4">
//             <a onClick={onSelect}>
//                 {label}
//             </a>
//         </td>
//         <td class="col-md-1">
//             <a onClick={onRemove}>
//                 <span class="glyphicon glyphicon-remove" ariaHidden={true} />
//             </a>
//         </td>
//         <td class="col-md-6" />
//     </tr>
// ))


const Row = ({ id, label, className, onSelect, onRemove }: { id: FunctionMaybe<string | number>, label: FunctionMaybe<string>, className: FunctionMaybe<Record<string, FunctionMaybe<boolean>>>, onSelect: ObservableMaybe<((event: MouseEvent) => void)>, onRemove: ObservableMaybe<((event: MouseEvent) => void)> }): JSX.Element => (
    <tr class={className}>
        <td class="col-md-1">
            {id}
        </td>
        <td class="col-md-4">
            <a onClick={onSelect}>
                {label}
            </a>
        </td>
        <td class="col-md-1">
            <a onClick={onRemove}>
                <span class="glyphicon glyphicon-remove" ariaHidden={true} />
            </a>
        </td>
        <td class="col-md-6" />
    </tr>
)

const Rows = ({ data, isSelected }: { data: FunctionMaybe<IDatum[]>, isSelected: (id: number) => FunctionMaybe<boolean> }): JSX.Element => {
    return <>
        {useMemo(() => {
            return (data as IObservable<IDatum[]>)().map(datum => {
                const { id, label } = datum
                const selected = isSelected(id)
                const className = { danger: selected }
                const onSelect = Model.select.bind(undefined, id)
                const onRemove = Model.remove.bind(undefined, id)
                const props = { id, label, className, onSelect, onRemove }
                return Row(props)
            })
        })}
    </>
    // return <For values={data}>
    //     {(datum: IDatum) => {
    //         const { id, label } = datum
    //         const selected = isSelected(id)
    //         const className = { danger: selected }
    //         const onSelect = Model.select.bind(undefined, id)
    //         const onRemove = Model.remove.bind(undefined, id)
    //         const props = { id, label, className, onSelect, onRemove }
    //         return Row(props)
    //     }}
    // </For>
}

// const RowsWithOptimizedCleanup = ({ page }: { page: () => FunctionMaybe<IDatum[]> }): JSX.Element => {
//   return (): JSX.Element => {
//     const data = page ();
//     const isSelected = useSelector ( Model.selected );
//     return useRoot ( () => resolve ( <Rows data={data} isSelected={isSelected} /> ) );
//   }
// };

const App = (): JSX.Element => (
    <div class="container">
        <div class="jumbotron">
            <div class="row">
                <div class="col-md-6">
                    <h1>Voby</h1>
                </div>
                <div class="col-md-6">
                    <div class="row">
                        <Button id="run" text="Create 1 rows" onClick={Model.run1} />
                        <Button id="run" text="Create 1,000 rows" onClick={Model.run1000} />
                        <Button id="runlots" text="Create 10,000 rows" onClick={Model.run10000} />
                        <Button id="add" text="Append 1,000 rows" onClick={Model.add} />
                        <Button id="update" text="Update every 10th row" onClick={Model.update} />
                        <Button id="clear" text="Clear" onClick={Model.run0} />
                        <Button id="swaprows" text="Swap Rows" onClick={Model.swapRows} />
                    </div>
                </div>
            </div>
        </div>
        <table class="table table-hover table-striped test-data">
            <tbody>
                <Rows data={Model.data} isSelected={useSelector(Model.selected)} />
                {/* <Rows data={() => Model.page ()()} isSelected={useSelector ( Model.selected )} /> */}
                {/* <RowsWithOptimizedCleanup page={Model.page} /> */}
            </tbody>
        </table>
        <span class="preloadicon glyphicon glyphicon-remove" ariaHidden={true} />
    </div>
)

/* RENDER */

function Start() {
    render(<App />, document.getElementById('app'))
}

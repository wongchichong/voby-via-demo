/// <reference path='../../../via/dist/controller/index.d.ts' />

/* IMPORT */
import { BoxBufferGeometry } from 'three/src/geometries/BoxGeometry'
import { DirectionalLight } from 'three/src/lights/DirectionalLight'
import { Mesh } from 'three/src/objects/Mesh'
import { MeshNormalMaterial } from 'three/src/materials/MeshNormalMaterial'
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera'
import { Scene } from 'three/src/scenes/Scene'
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer'

import { render, } from 'voby/via'
import { $, useAnimationLoop, useEffect, useMemo, usePromise } from 'voby'
import type { JSX, Observable, ObservableReadonly, } from 'voby/via'


/* IMPORT */

// import { createElement, Fragment, useMemo } from 'voby'
// import { render, template, } from 'voby/via'
// import { $, resolve, useRoot, useSelector, For } from 'voby'
// import type { FunctionMaybe, Observable, ObservableMaybe, JSX } from 'voby'
// import type { IObservable } from 'oby'


import type { ViaClass } from 'via'
const Via = self.Via
const via: ViaClass & Window & typeof globalThis & { audioContext?: AudioContext } = self.via
const get = self.get

declare global {
    interface Window {
        BoxBufferGeometry: typeof BoxBufferGeometry
        DirectionalLight: typeof DirectionalLight
        Mesh: typeof Mesh
        MeshNormalMaterial: typeof MeshNormalMaterial
        PerspectiveCamera: typeof PerspectiveCamera
        Scene: typeof Scene
        WebGLRenderer: typeof WebGLRenderer
    }
}
const document = via.document
const window = via.window

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

self.BoxBufferGeometry = BoxBufferGeometry
self.DirectionalLight = DirectionalLight
self.Mesh = Mesh
self.MeshNormalMaterial = MeshNormalMaterial
self.PerspectiveCamera = PerspectiveCamera
self.Scene = Scene
self.WebGLRenderer = WebGLRenderer

/* TYPES */

type Rotation = Observable<[number, number, number]>

/* HELPERS */

const COUNT_INITIAL = 100
const COUNT_MIN = 1
const COUNT_MAX = 10000
const SPEED = 0.01

/* MAIN */

const useIdleInput = (callback: ((event: Event) => void)) => {

    let pending = false

    return (event: Event): void => {

        if (pending) return

        pending = true

        setTimeout(() => {
            console.log("useIdleInput timeout")

            pending = false

            callback(event)

        }, 50)

    }

}

const useRotations = (count: Observable<number>): ObservableReadonly<Rotation[]> => {

    const getRandom = (): number => Math.random() * 360
    const getRotation = (): Rotation => $([getRandom(), getRandom(), getRandom()])
    const rotations = useMemo(() => Array(+count()).fill(0).map(getRotation))

    useAnimationLoop(() => {

        rotations().forEach(rotation => {
            const [x, y, z] = rotation()

            rotation([x + SPEED, y + SPEED, z + SPEED])

        })

    })

    return rotations

}

const ThreeScene = (camera: PerspectiveCamera, light: DirectionalLight, meshes: ObservableReadonly<Mesh[]>): HTMLCanvasElement => {

    const scene = new Scene()

    scene.add(light)

    const renderer = new WebGLRenderer({ antialias: true })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0xffffff)

    useEffect(() => {

        scene.remove.apply(scene, scene.children.slice(2))

        meshes().forEach(mesh => scene.add(mesh))

    })

    useAnimationLoop(() => {

        renderer.render(scene, camera)

    })

    useEffect(() => {

        (async () => {
            const onResize = async () => {
                const innerWidth = await get(window.innerWidth) as number
                const innerHeight = await get(window.innerHeight) as number
                camera.aspect = innerWidth / innerHeight
                camera.updateProjectionMatrix()

                renderer.setSize(innerWidth, innerHeight)

            }

            await onResize()

            window.addEventListener('resize', onResize)
        })()

        // return () => {

        //     window.removeEventListener('resize', onResize)

        // }

    })

    return renderer.domElement

}

const ThreePerspectiveCamera = async (location: [number, number, number]): Promise<PerspectiveCamera> => {
    const innerWidth = await get(window.innerWidth) as number
    const innerHeight = await get(window.innerHeight) as number
    const aspect = innerWidth / innerHeight

    const camera = new PerspectiveCamera(106, aspect, 1, 1000)

    camera.position.set(...location)

    return camera

}

const ThreeDirectionalLight = (direction: [number, number, number]): DirectionalLight => {

    const light = new DirectionalLight(0x000000)

    light.position.set(...direction)

    return light

}

const ThreeMesh = (rotation: Rotation): Mesh => {

    const material = new MeshNormalMaterial()
    const geometry = new BoxBufferGeometry(2, 2, 2)
    const mesh = new Mesh(geometry, material)

    useEffect(() => {

        mesh.rotation.set(...rotation())

    })

    return mesh

}

const Controls = ({ count, onInput }: { count: Observable<number>, onInput: ((event: Event) => void) }): JSX.Element => {

    return (
        <div class="controls">
            <input id="slider" type="range" onInput={onInput} min={COUNT_MIN} max={COUNT_MAX} step={1} />
            <label htmlFor="slider">{count}</label>
        </div>
    )

}

const Rotations = ({ rotations }: { rotations: ObservableReadonly<Rotation[]> }): JSX.Element => {

    const camera = usePromise(ThreePerspectiveCamera([0, 0, 3.2]))
    const light = ThreeDirectionalLight([-5, 0, -10])
    const meshes = useMemo(() => rotations().map(ThreeMesh))
    const scene = ThreeScene(camera().value, light, meshes)

    return (
        <div class="container">
            {scene}
        </div>
    )

}

const App = (): JSX.Element => {

    const count = $(COUNT_INITIAL)
    const rotations = useRotations(count)

    const onInput = useIdleInput(event => {
        count(parseInt((event.target as any).value))
    })

    return (
        <main>
            <Rotations rotations={rotations} />
            <Controls count={count} onInput={onInput} />
        </main>
    )

}

function Start() {
    render(<App />, document.getElementById('app'))
}

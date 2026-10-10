'use client'

import * as React from 'react'

/** Each open modal layer (Dialog, Drawer) marks its fixed root with its z-index. */
export const MODAL_LAYER_ATTRIBUTE = 'data-modal-layer'

function highestOpenLayer(base: number, self: Element | null): number {
  let z = base
  for (const layer of document.querySelectorAll<HTMLElement>(`[${MODAL_LAYER_ATTRIBUTE}]`)) {
    if (layer === self) continue
    z = Math.max(z, Number(layer.getAttribute(MODAL_LAYER_ATTRIBUTE)) || 0)
  }
  return z
}

/**
 * The z-index a modal layer opens at: its own `base`, or the highest modal
 * layer already open when that one is higher. Layers portal to <body> in the
 * order they open, so at an equal z-index the later one paints on top — the
 * same order Tab and Escape use to find the top layer. A Drawer (z-50) opened
 * from a Dialog (z-[58]) therefore opens at 58, above the Dialog, instead of
 * underneath it.
 */
export function useModalLayer<T extends HTMLElement>(open: boolean, base: number) {
  const ref = React.useRef<T>(null)
  const [z, setZ] = React.useState(base)
  React.useLayoutEffect(() => {
    setZ(open ? highestOpenLayer(base, ref.current) : base)
  }, [open, base])
  return {
    ref,
    z,
    /** Spread onto the layer's fixed root. */
    attributes: { 'data-modal-layer': z },
    /** Merge into the root's style: set only while the layer is raised above its base class. */
    style: z === base ? undefined : { zIndex: z },
  }
}

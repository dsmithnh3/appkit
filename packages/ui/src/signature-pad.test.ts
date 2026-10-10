import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SignaturePad } from './signature-pad'

test('the empty-pad hint is drawn in the stable ink, readable on the white pad in both themes', () => {
  const markup = renderToStaticMarkup(React.createElement(SignaturePad, { value: null, onChange: () => {} }))
  const hint = /<span class="([^"]*)">Sign here<\/span>/.exec(markup)
  assert.ok(hint, 'the empty pad shows its hint')
  // The pad's surface is `signature-surface`, white in every theme. A theme
  // foreground (`fg-muted`, `fg-subtle`) turns light in dark mode and fades
  // to about 2.6:1 there; `signature-ink` at 70% is 6.6:1 in both.
  assert.match(hint[1]!, /\btext-signature-ink\/70\b/)
})

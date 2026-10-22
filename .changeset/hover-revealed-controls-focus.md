---
"@braedonsaunders/appkit-dashboard": patch
"@braedonsaunders/appkit-forms": patch
"@braedonsaunders/appkit-workflows": patch
"@braedonsaunders/appkit-ui": patch
---

Controls that appear on hover now also appear when they take keyboard focus. The dashboard's Remove widget button, the workflow studio's rename and delete buttons, and the forms canvas toolbar were `opacity-0` until the mouse arrived, so a keyboard user tabbed onto controls they could not see; each now shows on focus and draws the token focus ring. `pnpm check:quality` fails any control hidden until hover that is not also shown on focus.

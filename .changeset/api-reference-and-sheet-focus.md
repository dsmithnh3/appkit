---
"@braedonsaunders/appkit-ui": patch
---

`ApiReference`'s copy button now appears when it takes keyboard focus (it stayed invisible until the mouse hovered the block) and both it and each endpoint row draw the token focus ring. An endpoint row reports whether it is open with `aria-expanded`. `SearchSelect`'s phone-sized sheet draws the ring on its Close button.

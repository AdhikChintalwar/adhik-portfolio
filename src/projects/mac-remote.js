// Everything shown on the Mac Remote project page lives in this file, so you can edit the words without touching the layout.
// It is taken from your own study guide for the project ("Mac Remote — explain it from A to Z"). Nothing here is invented.
// **double stars** make a phrase bold, `backticks` make it look like code.
// The page is a list of `sections`; each has an id, a label for the contents list, a two-part title (the first part is red) and `blocks`.

export const MAC_REMOTE = {
  slug: 'mac-remote',
  name: 'Mac Remote',
  title: ['Mac', ' Remote'],            // the big heading: the first part is shown in red
  eyebrow: 'Personal project · iPhone-to-Mac remote control',
  tagline: 'A remote for a Mac that runs in Safari on an iPhone, with no app to install.',
  intro: 'The phone is a trackpad, a keyboard and a media remote. A Python server on the Mac turns its gestures into real mouse, keyboard and media-key events, and a pairing token keeps everyone else on the network out.',

  // Paste the GitHub link between the quotes; while it is empty the page shows no source button.
  repo: '',

  // If the project is hosted somewhere people can try it, paste that address here to add an "Open live site" button.
  live: '',

  // One honest line under the buttons at the top of the page. Make it '' to remove it.
  heroNote: 'It controls a Mac on the same Wi-Fi by design, so there is no hosted demo.',

  // Screenshots and videos: put the files in public/projects/mac-remote/ and list them here. While this list is empty the page shows no gallery.
  //   { type: 'image', src: 'phone-trackpad.png', caption: 'The trackpad page in Safari on the iPhone' },
  //   { type: 'video', src: 'demo.mp4', caption: 'Moving the pointer, clicking, dragging and typing from the phone' },
  media: [],

  stack: ['Python', 'FastAPI', 'Uvicorn', 'WebSockets', 'PyObjC', 'Quartz', 'AppKit', 'Zeroconf', 'JavaScript'],

  facts: [
    { n: '0', label: 'apps to install on the phone' },
    { n: '120 Hz', label: 'cursor overlay refresh' },
    { n: '~60/s', label: 'pointer messages, one per frame' },
    { n: '16', label: 'displays handled at most' },
  ],

  codebase: 'Python server · static/ phone page · cursor_overlay.py',

  sections: [
    {
      id: 'overview', label: 'Overview', title: ['About', 'this project'],
      blocks: [
        { t: 'p', text: 'I built a remote control for a Mac that runs in Safari on an iPhone. The phone and the Mac stay on the same Wi-Fi. The phone is a trackpad, a keyboard and a media remote. A Python server on the Mac receives those commands over a WebSocket and turns them into real mouse, keyboard and media-key events, the same kind of events a physical mouse and keyboard produce.' },
        { t: 'p', text: 'A pairing token stops anyone else on the network from taking over the computer. When the phone connects, a small colored dot follows the Mac cursor so you can see exactly where you are pointing, including across multiple monitors.' },
        { t: 'p', text: 'It is a systems-and-networking project: gesture processing, a real-time socket, HID event injection and multi-display coordinate math.' },
      ],
    },
    {
      id: 'built', label: 'What I built', title: ['What', 'I built'],
      blocks: [
        {
          t: 'bullets', cls: 'pj-built', items: [
            'Built a local-network **Mac remote** that turns an iPhone browser into a trackpad, keyboard and media controller, with no native phone app.',
            'Streamed touch gestures over **WebSockets** to a Python server that injects mouse, keyboard, scroll and media-key events through macOS **Quartz**, so the system treats them as real hardware input.',
            'Drew a **120 Hz cursor overlay** that follows the system pointer across multiple monitors by converting between Quartz (top-left) and AppKit (bottom-left) coordinates.',
            'Gated control with a **persisted pairing token** checked in constant time, and advertised the Mac on the LAN with **Bonjour/mDNS** for zero-config discovery.',
          ],
        },
      ],
    },
    {
      id: 'problem', label: 'The problem', title: ['The', 'problem'],
      blocks: [
        { t: 'p', text: 'Sometimes you want to control a Mac from across the room (change a song, click a button on a projector, type a short message) without walking over and touching the keyboard.' },
        { t: 'p', text: 'A Mac already has screen sharing and Universal Control. Those are heavy: they mirror a whole desktop, or they need you to be sitting at another Apple device with a full setup. This project is the opposite. The phone does not show the Mac’s screen. It only sends input:' },
        {
          t: 'bullets', items: [
            'move the pointer',
            'click and drag',
            'scroll',
            'type',
            'press a few keys and shortcuts',
            'change volume, mute, play or pause',
            'lock the Mac',
          ],
        },
        { t: 'callout', text: 'That is enough to drive a computer you can already see (a TV, a projector, a desktop across the room), and it stays fast because almost no pixels are sent. Only tiny messages like “move 4 pixels right, 2 pixels down.”' },
      ],
    },
    {
      id: 'using', label: 'Using it', title: ['What a person', 'actually does'],
      blocks: [
        {
          t: 'steps', items: [
            'On the Mac, run `start.command`.',
            'The script creates a Python virtual environment if needed, installs dependencies, and starts the server.',
            'Terminal prints a link such as `http://192.168.1.20:8765` and a **pairing token**.',
            'On the iPhone, join the same Wi-Fi, open that link in Safari, and type the token.',
            'The trackpad appears. Moving one finger moves the Mac pointer, and a colored dot on the Mac shows where the pointer is.',
            'Press Control+C in Terminal to stop it.',
          ],
        },
        { t: 'p', text: 'The token is saved in a local file named `.pairing_token`, so the same code works the next time the server starts. The first run generates it with Python’s `secrets` module.' },
        { t: 'h3', text: 'What the phone page has' },
        {
          t: 'lists', items: [
            { title: 'Pointer', items: ['A big trackpad', 'Left click and right click buttons', 'Tap, press-and-hold drag and two-finger scroll gestures'] },
            { title: 'Keyboard', items: ['A text box that types into the focused app', 'Arrow keys', 'Copy, paste, select all and undo shortcuts'] },
            { title: 'Media and system', items: ['Volume up and down, and mute', 'Play and pause', 'Lock the Mac'] },
          ],
        },
        { t: 'p', text: 'The HTML also asks Safari to treat the page as a web app, so it can be added to the iPhone home screen and feel closer to a full-screen tool.' },
      ],
    },
    {
      id: 'architecture', label: 'Architecture', title: ['How it', 'fits together'],
      blocks: [
        {
          t: 'layers',
          rows: [
            { tag: 'iPhone · Safari', nodes: [{ b: 'Phone page', small: 'Touch gestures and buttons, measured in the browser and sent as tiny JSON messages.', em: 'static/index.html · app.js · style.css' }] },
            { wire: 'HTTP :8765 for the page · WebSocket for commands', tag: 'Mac · Python server', nodes: [
              { b: 'FastAPI and Uvicorn', small: 'Serves the web page and hosts the WebSocket endpoint.' },
              { b: 'Pairing token check', small: 'Constant-time comparison before the socket is accepted.' },
              { b: 'process_command()', small: 'Turns each JSON action into an input event.', em: 'server.py' },
            ] },
            { nodes: [{ b: 'Quartz CGEvent', small: 'Mouse, keyboard, scroll and media keys posted at the HID level. macOS treats them as real hardware input.', hot: true }] },
            { tag: 'Beside the server', nodes: [
              { b: 'Cursor overlay', small: 'A separate process: a floating dot at 120 Hz that ignores clicks.', em: 'cursor_overlay.py' },
              { b: 'Bonjour advertisement', small: 'Registers the Mac as a `_macremote._tcp` service for a future native client.', dim: true },
            ] },
          ],
          caption: 'There is no database, no user accounts and no cloud. The Mac is the whole backend. The phone is only a browser.',
        },
        { t: 'h3', text: 'How the phone finds the Mac' },
        {
          t: 'kv', rows: [
            ['The start script', 'Runs `ipconfig getifaddr en0` (Wi-Fi), falls back to `en1`, and prints `http://THAT_IP:8765`. A person types or taps that in Safari. This is what is used today.'],
            ['Bonjour', 'The server opens a Zeroconf advertiser on the Mac’s LAN IPv4 address and registers `_macremote._tcp.local.` with the Mac’s hostname, port 8765 and a few text records (version, device name and `hostname.local`). A native app could browse for it and connect to `Your-Mac.local` without anyone typing an address. Mobile Safari does not browse Bonjour by itself, so the phone page still uses the printed IP.'],
            ['Two routes', '`GET /` is the phone UI. `GET /health` returns status, hostname and port.'],
          ],
        },
      ],
    },
    {
      id: 'input', label: 'Finger to pointer', title: ['From a finger', 'to the pointer'],
      blocks: [
        { t: 'p', text: 'This is the story I tell when someone says “walk me through the code.”' },
        {
          t: 'chain', label: 'The path of one finger movement', items: [
            'Finger slides on the trackpad', 'touchmove', 'dx, dy (relative)', 'Speed-based gain', 'Smoothing', 'Buffer, flushed once per frame',
            'WebSocket JSON message', 'Server adds it to the cursor and clamps', 'CGEvent move or drag', 'Pointer moves, dot follows',
          ],
        },
        {
          t: 'stages', items: [
            { title: 'Relative movement, not a position', text: 'The browser fires `touchmove` and the page calls `preventDefault()` so Safari does not scroll the webpage instead. JavaScript subtracts the previous finger position from the new one, which gives `dx` and `dy` in CSS pixels. The phone does not know the Mac’s screen size and does not need to. A laptop trackpad works the same way.' },
            { title: 'Speed sets the gain', text: 'A slow finger is multiplied by about 1.35, a medium finger by 1.7 and a fast flick by 2.1. Slow movement stays precise, and a fast flick can cross a large monitor.' },
            { title: 'Smoothing', text: 'Each frame keeps 65% of the previous value and blends in 35% of the new one. That removes jitter from a noisy finger without adding much lag.' },
            { title: 'One message per frame', text: 'The smoothed deltas are added into a buffer, and `requestAnimationFrame` flushes it once per screen frame, usually 60 times a second, instead of once per raw touch event. The message looks like `{ "action": "move", "dx": 3.2, "dy": -1.1 }`. More messages would just queue up.' },
            { title: 'The Mac applies it', text: 'The server reads the current cursor with `CGEventGetLocation`, adds `dx` and `dy`, and clamps the result so the pointer cannot leave the combined rectangle of all connected displays. If a drag is in progress it posts a left-mouse-dragged event, otherwise a mouse-moved event. macOS moves the pointer, and the overlay process notices on its own timer and slides the colored dot to match.' },
          ],
        },
        { t: 'callout', text: 'Nothing in that path waits for a screenshot, a video frame or a round-trip acknowledgement. That is why it feels direct.' },
        { t: 'h3', text: 'Gestures on the trackpad' },
        {
          t: 'kv', rows: [
            ['One finger move', 'Relative pointer movement, with the gain and smoothing above.'],
            ['Tap', 'Finger down and up in under 220 milliseconds, having moved under 12 pixels, becomes a left click. A longer slide is a move, so you do not click by accident while aiming.'],
            ['Press and hold to drag', 'If one finger stays down for 350 milliseconds without moving more than 8 pixels, the phone sends `drag_start` and the server posts a left-mouse-down. Later moves are sent as drag events, which is how you highlight text or move a window. Lifting the finger sends `drag_end`. If the phone disconnects mid-drag, the server releases the button so the Mac does not get stuck holding the mouse.'],
            ['Two fingers, vertical', 'The page averages the two fingers’ Y positions, divides the change by 4 so it is not too sensitive, and sends a `scroll` action. The server builds a scroll-wheel event in pixel units and flips the sign so the direction matches a Mac trackpad. Two-finger scrolling also cancels a pending long-press, so a scroll never turns into a drag.'],
            ['Click buttons', 'Left Click and Right Click are explicit buttons, separate from the trackpad, because a right-click is awkward as a pure gesture on a phone.'],
          ],
        },
      ],
    },
    {
      id: 'keys', label: 'Keys and commands', title: ['Keys, media', 'and commands'],
      blocks: [
        {
          t: 'kv', rows: [
            ['Typing a sentence', 'The phone sends the whole string as `type_text`. The server walks each character, encodes it as UTF-16 and attaches it to a keyboard event with `CGEventKeyboardSetUnicodeString`. That types letters, spaces and punctuation without a giant key-code table.'],
            ['Special keys', 'Esc, Tab, Return, Backspace and the arrow keys are real Mac virtual key codes (Return is 36, Escape is 53, Left is 123). The server posts key-down and key-up.'],
            ['Shortcuts', 'Copy, paste, select all and undo are Command plus C, V, A and Z. The server also supports cut (Command+X); the phone page has no cut button yet.'],
            ['Lock', 'Control + Command + Q, the normal Mac lock shortcut.'],
            ['Volume, brightness and media', 'These are auxiliary media keys, not normal key codes. The server builds an `NSEvent` of type “other” with the aux-control-buttons subtype, packs the key and its pressed or released state into the data fields, converts it to a Quartz event and posts it. The phone page shows volume, mute and play/pause.'],
          ],
        },
        { t: 'h3', text: 'Commands the server understands beyond the phone buttons' },
        { t: 'p', text: 'The WebSocket protocol is a flat list of actions. The phone is one client of it. I shipped the gestures I use every day in the web UI and left the rest of the command set on the server, so a native client can call them without a new backend.' },
        {
          t: 'table', code: true, head: ['Action', 'What it does'], rows: [
            ['brightness_up / brightness_down', 'Display brightness via media keys'],
            ['next_track / previous_track', 'Media skip'],
            ['mission_control', 'Control + Up through System Events'],
            ['app_expose', 'Control + Down, the window overview for the current app'],
            ['show_desktop', 'The Show Desktop key'],
            ['spotlight', 'Command + Space'],
            ['app_switcher', 'Command + Tab'],
            ['screenshot', 'Runs the system screencapture tool and saves a timestamped PNG on the Desktop'],
            ['display_next / display_previous', 'Warps the cursor to the center of the next or previous monitor'],
            ['sleep', 'Tells System Events to sleep the Mac'],
            ['cursor_size', 'Restarts the overlay at small, medium, large or extra large'],
            ['cursor_color', 'Restarts the overlay in red, blue, green, yellow or orange'],
            ['double_click', 'A proper double click with click state 1 then 2'],
          ],
        },
      ],
    },
    {
      id: 'overlay', label: 'Cursor overlay', title: ['The cursor overlay', 'and multiple monitors'],
      blocks: [
        { t: 'p', text: 'Remote control has a visibility problem. You are not looking at a picture of the desktop on the phone, you are looking at the real Mac, and the normal cursor is small. So `cursor_overlay.py` draws a floating colored circle (a white ring with a dark center) and moves it to the real cursor position 120 times a second.' },
        { t: 'p', text: 'It is a separate process on purpose. AppKit’s `NSApplication.run()` is a blocking GUI loop, and inside the FastAPI process it would freeze the WebSocket server. So the server starts the overlay with `subprocess` when a phone connects and stops it when the phone disconnects. The window is borderless, not opaque with a clear background, floating above normal windows, and set to ignore mouse events so clicks pass through to whatever is underneath.' },
        { t: 'h3', text: 'Two coordinate systems' },
        {
          t: 'kv', rows: [
            ['Quartz', 'Measures the desktop from the top-left of the main display, with Y growing downward. Extra monitors can sit at negative X or negative Y if they are left of or above the main display.'],
            ['AppKit', 'Measures each screen from its own bottom-left, with Y growing upward.'],
          ],
        },
        { t: 'p', text: 'So the overlay works per display instead of assuming one screen:' },
        {
          t: 'steps', items: [
            'Ask Quartz for every active display and its global rectangle.',
            'Find which rectangle contains the cursor.',
            'Find the AppKit `NSScreen` with the same display ID (`NSScreenNumber`).',
            'Convert “pixels from the top of that display” into “points from the bottom of that screen”.',
            'Center the circle on that point with `setFrameOrigin_`.',
          ],
        },
        { t: 'p', text: 'Size and color come from the environment variables `CURSOR_POINTER_SIZE` and `CURSOR_POINTER_COLOR`, which the server sets before launching the process. Changing them means stopping the old overlay and starting a new one, which avoids building a second communication channel just for settings.' },
        { t: 'h3', text: 'Multiple monitors' },
        {
          t: 'bullets', items: [
            '`get_display_bounds()` asks Quartz for up to 16 active displays, records each origin and size, and sorts them left to right by center X.',
            'Pointer movement is **clamped to the union** of those rectangles, so a big swipe cannot throw the cursor into empty coordinate space.',
            '`display_next` and `display_previous` find the display that contains the cursor, pick the neighbor (wrapping around at the ends) and call `CGWarpMouseCursorPosition` to jump to that display’s center.',
          ],
        },
        { t: 'callout', lead: 'The hardest problem.', text: 'Keeping a click-through window glued to the cursor on more than one display. The cursor’s coordinate space and the window’s coordinate space do not share an origin or a Y direction, and a second monitor is not always to the right of the first.' },
      ],
    },
    {
      id: 'security', label: 'Security', title: ['Security,', 'said honestly'],
      blocks: [
        { t: 'p', text: 'This is a powerful program: it can click, type and lock the machine. The design assumes a home or office Wi-Fi you trust, plus one secret.' },
        { t: 'h3', text: 'What it does' },
        {
          t: 'bullets', items: [
            'Generates a random URL-safe token (`secrets.token_urlsafe(12)`) and stores it locally.',
            'Requires that token as a query parameter on the WebSocket.',
            'Compares it with `secrets.compare_digest`, which does not stop early when the first character is wrong, so a timing attack cannot guess the token one character at a time.',
            'Closes a bad connection with WebSocket code 1008, and the phone shows “Incorrect pairing token”.',
            'Only starts the cursor overlay after a valid connection.',
            'Needs the macOS **Accessibility** permission. Without it Quartz refuses to post input, which is an intentional system gate.',
          ],
        },
        { t: 'h3', text: 'What it does not do' },
        {
          t: 'bullets', items: [
            '**No HTTPS.** On a normal home Wi-Fi the traffic is `ws://`, not `wss://`, so someone already on that network who can sniff traffic could see the token and the commands.',
            'The web page itself is not password protected. Anyone who can open the URL sees the pairing form, but cannot move the mouse without the token.',
            'The server listens on all interfaces, not only localhost. The phone needs that, and it also means the port is open on the LAN while the server is running.',
            'The token is a long random string in a local file, not an account system, and there is no per-device revoke list. Deleting `.pairing_token` and restarting creates a new one.',
            'Drag state is one global flag, so it is built for one phone at a time.',
            'Stopping the server is how you turn the capability off. It is not a background login item.',
          ],
        },
        { t: 'quote', text: 'The threat model is a stranger on the same Wi-Fi, not a nation-state.' },
        { t: 'p', text: 'The token stops casual connections. I would add TLS and a tighter bind address before putting this anywhere but my own network.' },
        { t: 'h3', text: 'macOS permissions' },
        {
          t: 'kv', rows: [
            ['Accessibility', 'Required for synthetic mouse and keyboard events. The first click may do nothing until Terminal (or whatever app launched the server) is enabled in System Settings, then the server is restarted.'],
            ['The overlay', 'Needs no Screen Recording permission, because it never captures pixels. It reads the cursor coordinate and draws its own circle.'],
            ['Screenshots', 'The screenshot command calls the system `screencapture` tool, and macOS may prompt for Screen Recording the first time.'],
            ['AppleScript', 'A few navigation commands (Mission Control, sleep, show desktop) go through System Events, which can trigger an Automation permission prompt.'],
          ],
        },
      ],
    },
    {
      id: 'decisions', label: 'Design decisions', title: ['Design decisions', 'worth defending'],
      blocks: [
        {
          t: 'kv', rows: [
            ['Relative movement, not absolute', 'A phone trackpad should not be a map of the monitor. Absolute positioning feels bad when the finger area is small and the monitor is large. Relative movement plus speed-based gain is how laptop trackpads work.'],
            ['Batch once per animation frame', 'Touch events can fire faster than the display. Sending every one wastes the radio and makes the pointer stutter when the socket backs up. Coalescing deltas is the standard fix in remote-desktop input paths.'],
            ['Smooth, then send', 'Smoothing on the phone means the Mac receives a cleaner path, so the server stays simple: add the delta, clamp, post the event.'],
            ['Do not acknowledge every move', 'At 60 messages a second, replies would compete with the next move. Silence means success, and errors still come back.'],
            ['The overlay is its own process', 'A GUI run loop and an async network server do not want the same thread. A subprocess is a hard boundary, and killing it when the phone leaves makes the dot disappear.'],
            ['Unicode events for text, key codes for shortcuts', 'Typing “hello” should not need each character mapped to a physical key, especially across keyboard layouts. Command+C must be a real key combination, because the app on the Mac is listening for the shortcut, not for the letter C.'],
            ['HID media keys, not “set volume to 40”', 'Posting the same event the keyboard produces keeps the Mac’s own volume UI, mute state and Now Playing behavior. It presses the system’s buttons instead of fighting it.'],
            ['A custom Bonjour type', '`_macremote._tcp` will not collide with AirPlay or printers. Only a client that knows that name will list this Mac.'],
            ['A website instead of an iOS app', 'Safari is already on the phone. There is no install and no App Store review, and the Mac can serve the latest page itself. A native app would get Bonjour browsing and a better background story, which is why the server already advertises its service.'],
          ],
        },
      ],
    },
    {
      id: 'limits', label: 'Where it stands', title: ['Honest', 'limits'],
      blocks: [
        {
          t: 'bullets', items: [
            'Several server commands have no button in the phone UI yet.',
            'A few functions in `server.py` are defined twice (`play_pause`, `find_current_display`, `jump_to_display`). Python keeps the second one, and I would delete the dead copies.',
            'Display detection prints debug logs on every lookup. That was fine while building multi-monitor support and is noisy now.',
            'There is no automated test suite. The behavior depends on a logged-in Mac GUI session, which is awkward to unit test. I would extract the pure pieces (gesture classification, clamping, display picking) and test those.',
            'One token, one global drag flag, no TLS.',
            'Bonjour is advertised, but the shipped client still uses a typed IP address.',
          ],
        },
        { t: 'callout', lead: 'What it is not.', text: 'It does not stream the Mac’s screen to the phone (there is no video). It does not work over the internet, only on the same network, by design. It is not end-to-end encrypted, and it is not a native iOS app: the client is a web page, and Bonjour is ready for a native one. Input goes through Quartz directly.' },
        { t: 'callout', lead: 'The core result.', text: 'A phone can move, click, type and control media on the Mac in real time.' },
        { t: 'h3', text: 'What I would build next' },
        {
          t: 'bullets', items: [
            'Buttons for the commands the server already supports.',
            'A native client that discovers the Mac with Bonjour.',
            'TLS on the socket.',
            'Tests around gesture classification and display selection, and deleting the duplicate function definitions.',
          ],
        },
      ],
    },
    {
      id: 'stack', label: 'Tech stack', title: ['Tech', 'stack'],
      blocks: [
        {
          t: 'tech', rows: [
            ['Python', 'The Mac side has to call Apple APIs. Python plus PyObjC does that without a full Swift app.'],
            ['FastAPI', 'Serves the web page and hosts the WebSocket endpoint. Small, async and easy to run.'],
            ['Uvicorn', 'The server process. It listens on 0.0.0.0:8765, every network interface on the Mac, which is what lets the phone reach it.'],
            ['WebSockets', 'Mouse movement is a stream. One socket stays open and each gesture is one small JSON message.'],
            ['PyObjC and Quartz', 'CGEventPost to kCGHIDEventTap inserts an event at the HID level, so every app receives it as hardware input.'],
            ['AppKit', 'Builds the cursor overlay window and the special NSEvent objects macOS expects for volume, brightness and media keys.'],
            ['Zeroconf', 'Bonjour, Apple’s multicast DNS. Publishes the _macremote._tcp service.'],
            ['HTML, CSS and JavaScript', 'No framework. The phone page is one screen, so a framework would add a build step and no real benefit.'],
          ],
        },
        { t: 'h3', text: 'File map' },
        {
          t: 'table', code: true, head: ['File', 'What it is'], rows: [
            ['start.command', 'Double-clickable Mac launcher. Makes a virtualenv, installs packages, prints the Wi-Fi address, runs the server'],
            ['server.py', 'The whole backend: web server, WebSocket, token, Bonjour, mouse, keyboard, media keys, screenshots, multi-monitor jumps and the overlay process'],
            ['cursor_overlay.py', 'A tiny transparent macOS window with a circle that sticks to the real cursor'],
            ['static/index.html', 'The phone page: pairing box, trackpad and buttons'],
            ['static/app.js', 'Touch math, gesture detection and the WebSocket client'],
            ['static/style.css', 'Dark, phone-sized layout with large tap targets'],
            ['requirements.txt', 'FastAPI, Uvicorn, PyObjC (Quartz and Cocoa) and Zeroconf'],
            ['README.md', 'The original starter notes. Older than the current code, so the code is the source of truth'],
          ],
        },
        { t: 'p', text: 'The saved pairing token (`.pairing_token`) is created on the first run and is not something to commit or publish.' },
      ],
    },
  ],
};

// The card shown in the Projects section of the home page
export const MAC_REMOTE_CARD = {
  icon: 'remote',
  name: 'Mac Remote',
  desc: 'An iPhone-to-Mac remote with no phone app: a Safari trackpad sends gestures over WebSockets, and a Python server turns them into native macOS input, with pairing-token auth and a multi-monitor cursor overlay.',
  tags: ['Python', 'FastAPI', 'WebSockets', 'macOS Quartz', 'Bonjour'],
  href: '#/project/mac-remote',
};

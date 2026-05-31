This is a Javascript engine, so it is assumed that you know Javascript, basic HTML, how to host a local webpage (linux instuctions provided), and how to use a browser, but here we go anyway.

Minimum setup:

1. Create a directory.  In this directory:
2. place a copy the "engine" folder.
3. Create an HTML file (ie. index.html). This will reference the Javascript file that runs the simulation.
4. Create a Javascript file. This is where the simulation runs.
5. Reference the Javascript file from the HTML file.

HTML Example:

```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>SimObject Example</title>
</head>
<body>
</body>
<script type="module" src="./test.js"></script>
</html>
```

Javascript bare minimum:

```javascript
	import Main from './engine/main.js';
	let fps = 0;
	Main.run(fps);
```

All of the examples in this document should run in this file, unless otherwise stated.  You can, of course, import your own code into this file if you wish. 

In linux you can run a local webserver that only serves the directory you just created using:

```bash
cd ~/<path-to-your-folder>
python3 -m http.server 8080
```

Change 8080 to  any port not in use (generally anything over 7000 won't interfere with anything else).

Open your browser and go to:

```
http:\\localhost\index.html
```

Assuming you named the HTML file "index" you should be seeing a dark magenta web page (or a black one if you changed fps to a positive number).  When the engine is not running, the screen shows a color as a reminder not to expect it to interact with anything.
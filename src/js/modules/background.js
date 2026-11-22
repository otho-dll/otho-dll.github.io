import { debounce } from './motion.js';

// Procedural "dark agate" page background, drawn once with WebGL into a fixed <canvas>.
// It replaces a 1.4 MB background image. The canvas is only redrawn when its size changes,
// so the GPU is idle the rest of the time, and rendered frames are cached (see below).
// Without WebGL the plain CSS background on <body> stays visible (see style.css).

const MAX_PIXEL_RATIO = 1.5;

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
	gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 resolution;

// --- Value noise + fractal Brownian motion -------------------------------------------
float hash(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
		mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
		u.y
	);
}

const mat2 ROTATE = mat2(0.8, 0.6, -0.6, 0.8);

float fbm(vec2 p) {
	float value = 0.0;
	float amplitude = 0.5;
	for (int i = 0; i < 5; i++) {
		value += amplitude * noise(p);
		p = ROTATE * p * 2.02 + 17.0;
		amplitude *= 0.5;
	}
	return value;
}

// Fewer octaves: a smoother field, used for the long flowing bands.
float fbmSmooth(vec2 p) {
	float value = 0.0;
	float amplitude = 0.5;
	for (int i = 0; i < 3; i++) {
		value += amplitude * noise(p);
		p = ROTATE * p * 2.02 + 17.0;
		amplitude *= 0.5;
	}
	return value;
}

// --- Palette (sRGB 0..1), matched to the original photo ---------------------------
const vec3 BASE       = vec3(0.071, 0.075, 0.086);
const vec3 BAND_LIGHT = vec3(0.150, 0.157, 0.165);
const vec3 GOLD       = vec3(0.330, 0.225, 0.105);
const vec3 GOLD_LIGHT = vec3(0.560, 0.380, 0.160);
const vec3 COBALT     = vec3(0.075, 0.105, 0.215);

void main() {
	// Scale by the longer side so the pattern keeps its proportions on any screen.
	vec2 uv = gl_FragCoord.xy / max(resolution.x, resolution.y);
	vec2 p = uv * 3.0 + vec2(2.3, 7.1);

	// Domain warping: noise displaced by noise gives the flowing, layered look of agate.
	vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
	vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2)), fbm(p + 3.5 * q + vec2(8.3, 2.8)));
	float f = fbm(p + 3.0 * r);

	vec3 color = BASE;

	// Growth bands: a smooth field, stretched sideways and warped, cut into thin ridges.
	const float BAND_FREQUENCY = 170.0;
	vec2 pb = vec2(p.x * 0.45 + p.y * 0.25, p.y * 1.6);
	float g = fbmSmooth(pb + 1.4 * q);

	// Where bands get denser than a couple of pixels they alias into moiré; fade them out there.
	float pixel = 3.0 / max(resolution.x, resolution.y);
	float gx = fbmSmooth(vec2((p.x + pixel) * 0.45 + p.y * 0.25, p.y * 1.6) + 1.4 * q);
	float gy = fbmSmooth(vec2(p.x * 0.45 + (p.y + pixel) * 0.25, (p.y + pixel) * 1.6) + 1.4 * q);
	float bandsPerPixel = length(vec2(gx - g, gy - g)) * BAND_FREQUENCY / 6.2832;
	float antiAlias = 1.0 - smoothstep(0.25, 0.5, bandsPerPixel);

	float bandZone = smoothstep(0.3, 0.6, fbmSmooth(p * 0.8 + 11.0)) * antiAlias;
	float wave = sin(g * BAND_FREQUENCY) * 0.5 + 0.5;
	color = mix(color, BAND_LIGHT, pow(wave, 6.0) * 0.55 * bandZone);
	color *= 1.0 - 0.18 * (1.0 - wave) * bandZone;
	color *= 0.8 + 0.45 * smoothstep(0.25, 0.75, g);

	// Cobalt: grainy, dark patches where the second warp channel is high.
	float grain = noise(uv * 500.0);
	float cobalt = smoothstep(0.6, 0.8, r.y) * smoothstep(0.4, 0.65, q.x);
	color = mix(color, COBALT, cobalt * (0.35 + 0.5 * grain));

	// Gold: rusty blotches along one level of the warped field, with brighter veins inside.
	float veinMask = smoothstep(0.4, 0.62, fbm(p * 1.7 + 3.0));
	float level = abs(r.x - 0.52 + 0.1 * (noise(p * 7.0) - 0.5));
	float blotch = (1.0 - smoothstep(0.0, 0.07, level)) * smoothstep(0.45, 0.7, fbm(p * 4.0 + 4.0 * r));
	float vein = 1.0 - smoothstep(0.0, 0.012, level);
	color = mix(color, GOLD, blotch * veinMask * (0.45 + 0.4 * grain));
	color = mix(color, GOLD_LIGHT, vein * veinMask * 0.5);

	// Mineral speckles and a soft vignette.
	color += (hash(gl_FragCoord.xy) - 0.5) * 0.02;
	vec2 centered = gl_FragCoord.xy / resolution - 0.5;
	color *= 1.0 - 0.35 * dot(centered, centered);

	gl_FragColor = vec4(color, 1.0);
}
`;

// --- Cache of rendered frames ----------------------------------------------------------
// Compiling the shader can take a second or more on weaker GPUs, so every rendered frame is
// stored as an image (Cache Storage). Other pages and later visits show it instantly and
// never start WebGL. The cache name includes a hash of the shader, so editing it invalidates old frames.

const CACHE_ENTRIES = 3; // e.g. portrait + landscape on a phone
const cacheName = `anulab-bg-${hashString(FRAGMENT_SHADER + MAX_PIXEL_RATIO)}`;
const cacheKey = (width, height) => `/__background/${width}x${height}`;

function hashString(text) {
	let hash = 5381;
	for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
	return (hash >>> 0).toString(36);
}

async function readCachedFrame(width, height) {
	try {
		const response = await (await caches.open(cacheName)).match(cacheKey(width, height));
		return response ? await response.blob() : null;
	} catch {
		return null; // Cache Storage unavailable (e.g. private mode, http://)
	}
}

async function storeFrame(blob, width, height) {
	try {
		// Frames from older shader versions are useless.
		for (const name of await caches.keys()) {
			if (name.startsWith('anulab-bg-') && name !== cacheName) await caches.delete(name);
		}
		const cache = await caches.open(cacheName);
		await cache.put(cacheKey(width, height), new Response(blob, { headers: { 'Content-Type': blob.type } }));
		const keys = await cache.keys();
		for (const request of keys.slice(0, Math.max(0, keys.length - CACHE_ENTRIES))) await cache.delete(request);
	} catch {
		// Not cached; the shader simply runs again next time.
	}
}

// --- WebGL -------------------------------------------------------------------------------

function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

// Resolves with a ready-to-draw renderer. With KHR_parallel_shader_compile the browser compiles
// in the background and the page stays responsive; without it this blocks like a normal compile.
function createRenderer(canvas) {
	// alpha: true keeps the canvas transparent (showing the cached frame or CSS fallback) until drawn.
	const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false, depth: false, powerPreference: 'low-power' });
	if (!gl) return Promise.reject(new Error('WebGL unavailable'));

	const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);

	const parallel = gl.getExtension('KHR_parallel_shader_compile');

	return new Promise((resolve, reject) => {
		const finish = () => {
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				const log = gl.getShaderInfoLog(fragment) || gl.getShaderInfoLog(vertex) || gl.getProgramInfoLog(program);
				reject(new Error(log || 'Shader link error'));
				return;
			}
			gl.useProgram(program);

			// One triangle that covers the whole screen.
			gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
			const position = gl.getAttribLocation(program, 'position');
			gl.enableVertexAttribArray(position);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
			const resolution = gl.getUniformLocation(program, 'resolution');

			resolve((width, height) => {
				gl.viewport(0, 0, width, height);
				gl.uniform2f(resolution, width, height);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
			});
		};

		if (!parallel) return finish();
		const poll = () => (gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR) ? finish() : requestAnimationFrame(poll));
		poll();
	});
}

// --- Entry point ---------------------------------------------------------------------------

export function initBackground() {
	const canvas = document.querySelector('canvas.page-background');
	if (!canvas) return;

	let renderer = null; // created lazily: not needed at all when the frame comes from the cache
	let shownSize = '';
	let objectUrl = '';

	const targetSize = () => {
		const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		return [Math.round(canvas.clientWidth * ratio), Math.round(canvas.clientHeight * ratio)];
	};

	const showCachedFrame = (blob) => {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = URL.createObjectURL(blob);
		canvas.style.backgroundImage = `url("${objectUrl}")`;
	};

	const render = async (width, height) => {
		renderer ??= createRenderer(canvas);
		const draw = await renderer;
		canvas.width = width;
		canvas.height = height;
		draw(width, height);
		// The WebGL buffer is only readable in the same task as the draw call.
		canvas.toBlob((blob) => blob && storeFrame(blob, width, height), 'image/webp', 0.9);
	};

	const update = async () => {
		const [width, height] = targetSize();
		const size = `${width}x${height}`;
		// The canvas is sized to 100lvh, so mobile address-bar changes don't resize it.
		if (size === shownSize) return;
		shownSize = size;

		const cached = await readCachedFrame(width, height);
		if (cached) {
			showCachedFrame(cached);
			// Seen before: appear immediately instead of fading in.
			if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-instant');
			if (renderer) canvas.width = canvas.height = 0; // hide an older WebGL frame
		} else {
			await render(width, height);
		}
		canvas.classList.add('is-ready');
	};

	update().catch((error) => console.warn('[background] Using CSS fallback.', error));
	window.addEventListener('resize', debounce(() => update().catch(() => {}), 200));

	// If the GPU drops the context, fall back to the plain CSS background.
	canvas.addEventListener('webglcontextlost', () => canvas.classList.remove('is-ready'));
}

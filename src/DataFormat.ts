/**
 * Enumeration of the supported data formats.
 * @enum {string}
 */
const DataFormat = {
    JPG: 'jpg',
    JSON: 'json',
    MP3: 'mp3',
    PNG: 'png',
    SB2: 'sb2',
    SB3: 'sb3',
    SVG: 'svg',
    WAV: 'wav',
    PYTHON: 'py',
    JAVASCRIPT: 'js',
    GLSL: 'glsl'
};

type DataFormat = (typeof DataFormat)[keyof typeof DataFormat];
export { DataFormat };
export default DataFormat;
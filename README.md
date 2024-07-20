## rollup-plugin-tsc-generator

A Rollup plugin designed to generate TypeScript types using the native tsc program. This plugin aims to improve performance by leveraging TypeScript's built-in type-checking and declaration file generation capabilities.

### Why?
I was frustrated with the slow performance and lack of type-checking in existing plugins that generate TypeScript types. So, I created this plugin, which uses the native ```tsc (TypeScript)``` compiler and includes type-checking functionality.

### Installation

You can install the plugin via npm:

```bash
npm install rollup-plugin-tsc-generator --save-dev
```

### Usage

To use this plugin with Rollup, add it to your Rollup configuration:

```javascript
import {tscGenerator} from 'rollup-plugin-tsc-generator';

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'esm',
    },
    plugins: [
        tscGenerator({
            dist: './dist',
        }),
    ],
};
```

### Plugin Options

The tscGenerator function accepts a configuration object with the following options:

```typescript
type tscGenerator =
    {
        dist?: string; // The folder where TypeScript declaration files will be generated. 
    }
```

# License

[MIT](https://github.com/juandl/rollup-plugin-tsc-generator/blob/main/LICENSE)

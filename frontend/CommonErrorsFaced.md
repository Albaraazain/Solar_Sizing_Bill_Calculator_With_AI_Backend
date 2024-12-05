Here's a comprehensive analysis of the errors encountered and lessons learned:

# Jest ES Modules Configuration Troubleshooting Guide

## Jest Mock Initialization Error - Multiple Solutions Applied

1. Initial Error: `ReferenceError: Cannot access 'mockEventBus' before initialization`
   - Problem: Attempting to use variables in jest.mock() before they were initialized
   - Solution: Define mock implementation inside jest.mock factory function
   ```javascript
   jest.mock('../../core/events/EventBus.js', () => {
       const subscribers = new Map(); // Local to factory
       return {
           eventBus: {
               subscribe: jest.fn((event, callback) => {
                   if (!subscribers.has(event)) {
                       subscribers.set(event, []);
                   }
                   subscribers.get(event).push(callback);
               }),
               // ... other methods
           }
       };
   });

## BillApi Test Errors

```plaintext
CopyError: expect(jest.fn()).toHaveBeenCalledWith(...expected)
- Expected
+ Received
  "/bill/analyze",
  {"referenceNumber": "123456789"},
+ {},
```

The issue was related to endpoint path construction and method parameters. We fixed it by:

### Properly structuring `API_CONFIG` endpoints:

```javascript
ENDPOINTS: {
    BILL: {
        BASE: '/bill',
        ANALYZE: '/analyze',
        // ...
    }
}
```

### Updating test expectations to match the exact method signatures:

```javascript
expect(axiosClient.post).toHaveBeenCalledWith(
    '/bill/analyze',
    { referenceNumber: mockReferenceNumber },
    {}  // Including empty config object
);
```

### Fixing endpoint path construction in `BillApi`:

```javascript
// Before
return this.post(API_CONFIG.ENDPOINTS.BILL.ANALYZE...);

// After - proper path construction
async analyzeBill(referenceNumber) {
    return this.post(API_CONFIG.ENDPOINTS.BILL.ANALYZE, { referenceNumber });
}
```

This resolved all four test errors related to endpoint paths and method parameters.


## Jest Mock Troubleshooting

1. **Mock Order Matters**
    ```javascript
    // Wrong order:
    import { MyThing } from './myThing';
    jest.mock('./dependency');

    // Correct order:
    jest.mock('./dependency');
    import { MyThing } from './myThing';
    ```

2. **Strict Boolean Comparisons**
    ```javascript
    // Unreliable:
    if (ENV.DEBUG) { ... }

    // Reliable:
    if (ENV.DEBUG === true) { ... }
    ```

3. **Async Event Testing**
    ```javascript
    test('async event test', async () => {
        // Setup mock
        mockThing.value = false;
        
        // Clear previous calls
        mockFn.mockClear();
        
        // Wait for event processing
        await new Promise(resolve => {
            eventBus.subscribe('event', () => resolve());
            doSomething();
        });
        
        // Check results
        expect(mockFn).not.toHaveBeenCalled();
    });
    ```


## Jest Async Testing Best Practices

1. **Avoid callback-style tests with `done`**
    - Use async/await instead
    - Wrap event listeners in Promises
   ```javascript
   // Bad
   test('test', done => {
       eventBus.subscribe('event', () => {
           expect(...).toBe(...);
           done();
       });
   });

   // Good
   test('test', async () => {
       const eventPromise = new Promise(resolve => {
           eventBus.subscribe('event', () => {
               expect(...).toBe(...);
               resolve();
           });
       });
       await eventPromise;
   });
    ```
2. Proper Console Mocking
   ```javascript
   const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    afterEach(() => {
    mockConsoleError.mockClear();
    });
   ```
3. **Environment Variables in Tests**
    ```javascript
    const originalEnv = process.env.NODE_ENV;
    try {
        process.env.NODE_ENV = 'test';
        // test code
    } finally {
        process.env.NODE_ENV = originalEnv;
    }
    ```

4. **Event Testing Pattern**
   - Wrap event listeners in Promises
   - Include error handling
   - Clean up subscriptions
    ```javascript
    const eventPromise = new Promise((resolve, reject) => {
        eventBus.subscribe('event', data => {
            try {
                expect(data).toEqual(expected);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
    ```


## Jest Setup Files with ES Modules

When using setup files with ES Modules:
1. Must import Jest globals in setup files
2. Use setupFilesAfterEnv instead of setupFiles
3. Setup files must use ES Module syntax
4. Global utilities should be exported/imported properly

Common Error:
````
ReferenceError: beforeEach is not defined
````
Solution:
1. Import Jest globals in setup file
2. Use proper ES Module syntax
3. Configure jest.config.mjs correctly


## Initial Errors and Solutions

1. **ESM vs CommonJS Conflict**
   ```
   Error: Cannot use import statement outside a module
   ```
    - Initial Attempt: Tried using CommonJS (`require`) - Failed
    - Root Cause: Project was configured as ES Modules (`"type": "module"` in package.json)
    - Solution: Needed to consistently use ES Modules syntax throughout
    - Key Learning: In modern Node.js projects, mixing module systems causes conflicts

2. **Jest Configuration with ES Modules**
   ```
   Error: Module is not defined in ES module scope
   ```
    - Initial Attempt: Used `jest.config.js` - Failed
    - Solution: Renamed to `jest.config.mjs` and used ES Module syntax
    - Key Learning: Jest configuration files must match project's module system

3. **Global Jest Object Access**
   ```
   Error: jest is not defined
   ```
    - Initial Attempt: Tried using jest globals directly - Failed
    - Solution: Explicitly import from '@jest/globals'
    - Code:
   ```javascript
   import { jest, expect, test, describe, beforeEach } from '@jest/globals';
   ```

4. **File Extensions in Imports**
   ```
   Error: Cannot find module
   ```
    - Initial Attempt: Imports without file extensions - Failed
    - Solution: Always include .js extension in imports
    - Example:
   ```javascript
   // Wrong
   import { eventBus } from '../EventBus';
   // Correct
   import { eventBus } from '../EventBus.js';
   ```

5. **ESM Handling in Jest**
   ```
   Error: Option: extensionsToTreatAsEsm: ['.js'] includes '.js' which is always inferred
   ```
    - Initial Attempt: Tried to explicitly set .js as ESM - Failed
    - Solution: Removed .js from extensionsToTreatAsEsm as it's inferred from package.json
    - Key Learning: When "type": "module" is set, .js files are automatically treated as ESM

## Final Working Configuration

### Package.json
```json
{
  "name": "solar-sizing",
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "devDependencies": {
    "@babel/core": "^7.x",
    "@babel/preset-env": "^7.x",
    "babel-jest": "^29.x",
    "jest": "^29.x"
  }
}
```

### Jest Configuration (jest.config.mjs)
```javascript
export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.m?js$': 'babel-jest'
    },
    moduleFileExtensions: ['js', 'mjs'],
    testMatch: ['**/__tests__/**/*.test.js'],
    transformIgnorePatterns: ['/node_modules/']
}
```

## Best Practices Learned

1. **Module System Consistency**
    - Stick to one module system throughout the project
    - Use appropriate file extensions (.mjs for explicit ES modules)
    - Include file extensions in import statements

2. **Jest with ES Modules**
    - Use `--experimental-vm-modules` flag
    - Import Jest globals explicitly
    - Configure babel-jest for transpilation

3. **File Naming and Structure**
    - Use .test.js suffix for test files
    - Maintain consistent directory structure
    - Keep test files close to implementation

4. **Import/Export Pattern**
    - Use named exports for better tree-shaking
    - Keep exports at bottom of file
    - Use consistent import paths

## Common Gotchas

1. **Environment Variables**
    - ES Modules don't have access to `__dirname` and `__filename`
    - Need to use import.meta.url for file paths

2. **Async Operations**
    - ES Modules are async by default
    - Top-level await is supported
    - Tests might need explicit async/await

3. **Module Mocking**
    - Different syntax for ES Modules
    - Need to use jest.mock() with ES Module syntax
    - Mock functions need to be imported from @jest/globals

## Testing Patterns

1. **Setup and Teardown**
```javascript
describe('Module Test', () => {
    beforeEach(() => {
        // Setup code
    });

    afterEach(() => {
        // Cleanup code
    });
});
```

2. **Async Testing**
```javascript
test('async operation', async () => {
    await expect(asyncFunction()).resolves.toBe(expected);
});
```

3. **Event Testing**
```javascript
test('event emission', done => {
    eventEmitter.on('event', data => {
        expect(data).toBe(expected);
        done();
    });
});
```

## Recommendations for Future Development

1. Create a test setup file for common imports and mocks
2. Use TypeScript for better type safety and IDE support
3. Implement proper error boundaries in tests
4. Add test coverage reporting
5. Consider using test fixtures for complex test data

## Documentation References

1. [Jest ES Modules Documentation](https://jestjs.io/docs/ecmascript-modules)
2. [Node.js ES Modules](https://nodejs.org/api/esm.html)
3. [Babel Jest Configuration](https://jestjs.io/docs/getting-started#using-babel)

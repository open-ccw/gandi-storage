module.exports = {
    extends: ['scratch/es6'],
    env: {
        node: true
    },
    globals: {
        'test': 'readonly',
        'expect': 'readonly',
        'vi': 'readonly',
        'beforeEach': 'readonly',
        'afterEach': 'readonly',
        'beforeAll': 'readonly',
        'afterAll': 'readonly',
        'describe': 'readonly',
        'it': 'readonly'
    }
};
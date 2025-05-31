/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./src/contracts",
    artifacts: "./src/artifacts",
    tests: "./test",
  },
  mocha: {
    timeout: 40000
  },
  // Attempt to configure ts-node for ESM, though hardhat-toolbox should handle this.
  // This specific way of setting ts-node options in hardhat.config.js might not be standard.
  // Hardhat's typical way is to rely on hardhat-toolbox or if you don't use toolbox,
  // you might need to configure tasks manually.
  // However, if there's an underlying ts-node issue with ESM module resolution for tests:
  tsnode: { // This key might be hypothetical for Hardhat config direct usage
    esm: true,
    // experimentalSpecifierResolution: 'node', // This might be needed if imports in tests have issues
    // transpileOnly: true, // Can speed up, but skips type checking during tests
  }
};

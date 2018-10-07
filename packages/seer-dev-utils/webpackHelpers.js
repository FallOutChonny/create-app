'use strict';

const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

const isInteractive = process.stdout.isTTY;
let handleCompile;

function printInstructions(appName, urls, useYarn) {
  console.log();
  console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
  console.log();

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
    );
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
    );
  } else {
    console.log(`  ${urls.localUrlForTerminal}`);
  }

  console.log();
  console.log('Note that the development build is not optimized.');
  console.log(
    `To create a production build, use ` +
      `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
  );
  console.log();
}

function compile(webpack, config) {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  let compiler;
  try {
    compiler = webpack(config, handleCompile);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }
  return compiler;
}

function createCompilerPromise(compiler) {
  // Create a compilation Promise that can
  // wait until webpack bundles are ready.
  return new Promise((resolve, reject) => {
    compiler.hooks.done.tap('done', stats => {
      const messages = formatWebpackMessages(stats.toJson({}, true));
      if (messages.errors.length) {
        reject(new Error(messages.errors.join('\n\n')));
        console.log(chalk.red('Failed to compile.\n'));
      }

      resolve({
        stats,
        warnings: messages.warnings,
      });
    });
  });
}

function createClientCompiler(webpack, config) {
  console.log('Compiling client...');
  // Create a client-side webpack compiler.
  return compile(webpack, config);
}

function createServerCompiler(webpack, config, appName, urls, useYarn) {
  console.log('Compiling server...');
  // Create a server-side webpack compiler.
  const compiler = compile(webpack, config);
  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive && !isFirstCompile) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  let isFirstCompile = true;

  compiler.hooks.done.tap('done', stats => {
    if (isInteractive && !isFirstCompile) {
      clearConsole();
    }

    const messages = formatWebpackMessages(stats.toJson({}, true));
    const isSuccessful = !messages.errors.length && !messages.warnings.length;
    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
    }
    if (isSuccessful && (isInteractive || isFirstCompile)) {
      printInstructions(appName, urls, useYarn);
    }
    isFirstCompile = false;

    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));
      return;
    }

    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));

      // Teach some ESLint tricks.
      console.log(
        '\nSearch for the ' +
          chalk.underline(chalk.yellow('keywords')) +
          ' to learn more about each warning.'
      );
      console.log(
        'To ignore, add ' +
          chalk.cyan('// eslint-disable-next-line') +
          ' to the line before.\n'
      );
    }
  });
  return compiler;
}

module.exports = {
  createClientCompiler,
  createServerCompiler,
  createCompilerPromise,
};

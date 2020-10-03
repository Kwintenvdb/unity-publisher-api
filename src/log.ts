import chalk from 'chalk';

// TODO add a proper logging library.

export function logError(msg: string) {
    console.error(chalk.redBright(msg));
}

export function logSuccess(msg: string) {
    console.log(chalk.green(msg));
}

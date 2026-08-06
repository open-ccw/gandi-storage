/* eslint-env worker */

let jobsActive = 0;
const complete = [];
const MAX_MYSQLADMIN_STATUS = 200;
let intervalId = null;

/**
 * A Fetch method that limits the maximum number of concurrent requests
 */
const _fetch = (function () {
    const queue = [];
    let pendingCount = 0;

    return async function (...args) {
        if (pendingCount >= MAX_MYSQLADMIN_STATUS) {
            return new Promise((resolve, reject) => {
                queue.push({args, resolve, reject});
            });
        }
        pendingCount++;
        const res = await fetch(...args);
        pendingCount--;
        if (queue.length) {
            const {args: _args, resolve, reject} = queue.shift();
            _fetch(..._args).then(resolve, reject);
        }
        return res;
    };
}());

/**
 * Register a step function.
 *
 * Step checks if there are completed jobs and if there are sends them to the
 * parent. Then it checks the jobs count. If there are no further jobs, clear
 * the step.
 */
const registerStep = function () {
    intervalId = setInterval(() => {
        if (complete.length) {
            postMessage(
                complete.slice(),
                complete.map(response => response.buffer).filter(Boolean)
            );
            complete.length = 0;
        }
        if (jobsActive === 0) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }, 1);
};

/**
 * Receive a job from the parent and fetch the requested data.
 * @param {object} options.job A job id, url, and options descriptor to perform.
 */
const onMessage = ({data: job}) => {
    if (jobsActive === 0 && !intervalId) {
        registerStep();
    }

    jobsActive++;

    _fetch(job.url, job.options)
        .then(result => {
            if (result.ok) return result.arrayBuffer();
            if (result.status === 404) return null;
            return Promise.reject(result.status);
        })
        .then(buffer => complete.push({id: job.id, buffer: buffer ?? null}))
        .catch(error => complete.push({id: job.id, error: (error && error.message) || `Failed request: ${job.url}`}))
        .then(() => jobsActive--);
};

postMessage({support: {fetch: true}});
self.addEventListener('message', onMessage);

export {};

'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns Promise
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve, reject) => {
        let results = [];
        let numberOfCurrentJobs = 0;
        let jobIndex = 0;
        if (!jobs.length) {
            resolve([]);
        }
        while (numberOfCurrentJobs < parallelNum) {
            numberOfCurrentJobs++;
            runJob(jobIndex);
        }

        function runJob(currentJobIndex) {
            let errorTimeout = new Promise(resolve => {
                setTimeout(resolve, timeout, new Error('Promise timeout'));
            });
            let saveResult = result => processingResult(result, currentJobIndex);
            Promise.race([jobs[currentJobIndex](), errorTimeout])
                .then(saveResult)
                .catch(saveResult);
            jobIndex++;
        }

        function processingResult(result, currentJobIndex) {
            results[currentJobIndex] = result;
            if (jobIndex < jobs.length) {
                runJob(jobIndex);
            }
            if (results.length === jobs.length) {
                resolve(results);
            }
        }
    });
}
